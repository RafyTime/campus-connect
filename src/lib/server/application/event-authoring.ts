import { and, asc, eq, inArray, isNull, or } from 'drizzle-orm';
import type { Clock } from '#lib/server/clock.js';
import type { Database } from '#lib/server/db/index.js';
import {
	event,
	eventTag,
	group,
	groupMembership,
	location,
	post,
	tag
} from '#lib/server/db/schema.js';
import { campusLocations, campusTags } from '#lib/server/campus-catalog.js';
import {
	formatCampusInput,
	parseEventDetails,
	type EventAuthoringOptions,
	type EventSaveResult,
	type ManagedEvent
} from '#lib/event-authoring.js';
import { getPublicEvent } from './events';

export async function getEventAuthoringOptions(
	db: Pick<Database, 'select'>,
	actor: { id: string } | null = null
): Promise<EventAuthoringOptions> {
	const [tags, locations] = await Promise.all([
		db
			.select({ id: tag.id, name: tag.name })
			.from(tag)
			.where(
				inArray(
					tag.id,
					campusTags.map((tag) => tag.id)
				)
			)
			.orderBy(asc(tag.name)),
		db
			.select({ id: location.id, label: location.label })
			.from(location)
			.where(
				inArray(
					location.id,
					campusLocations.map((place) => place.id)
				)
			)
			.orderBy(asc(location.label))
	]);
	return { tags, locations, groups: await authorizedGroupHosts(db, actor) };
}

async function authorizedGroupHosts(db: Pick<Database, 'select'>, actor: { id: string } | null) {
	if (!actor) return [];
	return db
		.select({ id: group.id, name: group.name })
		.from(group)
		.innerJoin(groupMembership, eq(groupMembership.groupId, group.id))
		.where(
			and(
				eq(groupMembership.userId, actor.id),
				inArray(groupMembership.role, ['owner', 'representative']),
				eq(group.systemManaged, false)
			)
		)
		.orderBy(asc(group.name));
}

async function canManageEvent(
	db: Pick<Database, 'select'>,
	actor: { id: string },
	storedPost: { authorId: string; groupId: string | null }
) {
	if (storedPost.groupId === null) return storedPost.authorId === actor.id;
	// Authorship does not retain Group authority after a role is removed or changed.
	const hosts = await authorizedGroupHosts(db, actor);
	return hosts.some((host) => host.id === storedPost.groupId);
}

export async function createEvent(
	db: Database,
	clock: Clock,
	actor: { id: string } | null,
	input: unknown
): Promise<EventSaveResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const data =
				typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
			const hostGroupId = data.hostGroupId === undefined ? '' : data.hostGroupId;
			if (typeof hostGroupId !== 'string')
				return {
					ok: false,
					reason: 'invalid',
					fieldErrors: { hostGroupId: 'Choose yourself or an authorized Group.' }
				};
			if (
				hostGroupId &&
				!(await authorizedGroupHosts(tx, actor)).some((host) => host.id === hostGroupId)
			)
				return { ok: false, reason: 'forbidden' };
			const parsed = parseEventDetails(input, clock.now(), true);
			if (!parsed.ok) return { ok: false, reason: 'invalid', fieldErrors: parsed.fieldErrors };
			const fieldErrors = await validateOptions(tx, parsed.value);
			if (Object.keys(fieldErrors).length) return { ok: false, reason: 'invalid', fieldErrors };
			const { tagIds, locationId, manualLocation, title, ...details } = parsed.value;
			const eventId = crypto.randomUUID();
			const postId = crypto.randomUUID();
			const storedLocationId = await persistEventLocation(tx, { locationId, manualLocation });
			await tx.insert(post).values({
				id: postId,
				title,
				authorId: actor.id,
				groupId: hostGroupId || null,
				createdAt: clock.now(),
				updatedAt: clock.now()
			});
			await tx.insert(event).values({
				id: eventId,
				postId,
				...details,
				visibility: 'public',
				status: 'scheduled',
				locationId: storedLocationId
			});
			await tx.insert(eventTag).values(tagIds.map((tagId) => ({ eventId, tagId })));
			return { ok: true, eventId };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

export async function editEvent(
	db: Database,
	clock: Clock,
	actor: { id: string } | null,
	eventId: string,
	input: unknown
): Promise<EventSaveResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const row = await tx.query.event.findFirst({
				where: eq(event.id, eventId),
				with: { post: true, location: true, participations: true }
			});
			if (!row) return { ok: false, reason: 'not-found' };
			if (!(await canManageEvent(tx, actor, row.post))) return { ok: false, reason: 'forbidden' };
			if (row.status === 'cancelled') return { ok: false, reason: 'cancelled' };
			if (row.endsAt <= clock.now()) return { ok: false, reason: 'ended' };
			const parsed = parseEventDetails(input, clock.now(), false);
			if (!parsed.ok) return { ok: false, reason: 'invalid', fieldErrors: parsed.fieldErrors };
			if (!row.participations.length && parsed.value.endsAt <= clock.now())
				return {
					ok: false,
					reason: 'invalid',
					fieldErrors: { endsAt: 'End must be in the future.' }
				};
			// The write lock also serializes these checks with Participation changes.
			if (row.participations.length) {
				const changed = parsed.value;
				const sameLocation = campusLocations.some((place) => place.id === row.locationId)
					? changed.locationId === row.locationId
					: changed.locationId === 'manual' && changed.manualLocation === row.location.label;
				const lockedFields = {
					...(changed.responseMode !== row.responseMode
						? { responseMode: 'Response mode is locked after Participation.' }
						: {}),
					...(formatCampusInput(changed.startsAt) !== formatCampusInput(row.startsAt)
						? { startsAt: 'Start is locked after Participation.' }
						: {}),
					...(formatCampusInput(changed.endsAt) !== formatCampusInput(row.endsAt)
						? { endsAt: 'End is locked after Participation.' }
						: {}),
					...(!sameLocation ? { locationId: 'Location is locked after Participation.' } : {})
				};
				if (Object.keys(lockedFields).length)
					return { ok: false, reason: 'locked-fields', fieldErrors: lockedFields };
				const confirmed = row.participations.filter(
					(record) => record.kind === 'registration'
				).length;
				if (
					changed.capacity !== null &&
					(changed.capacity < confirmed || changed.capacity < (row.capacity ?? 0))
				)
					return {
						ok: false,
						reason: 'capacity-conflict',
						fieldErrors: {
							capacity:
								'Capacity can only increase after Participation and must cover confirmed registrations.'
						}
					};
			}
			const fieldErrors = await validateOptions(tx, parsed.value);
			if (Object.keys(fieldErrors).length) return { ok: false, reason: 'invalid', fieldErrors };
			const { title, locationId, manualLocation, tagIds, ...details } = parsed.value;
			const storedLocationId = row.participations.length
				? row.locationId
				: await persistEventLocation(tx, { locationId, manualLocation });
			await tx.update(post).set({ title, updatedAt: clock.now() }).where(eq(post.id, row.postId));
			await tx
				.update(event)
				.set({
					...details,
					// Locked forms display minutes; preserve the original seconds and milliseconds.
					...(row.participations.length ? { startsAt: row.startsAt, endsAt: row.endsAt } : {}),
					locationId: storedLocationId
				})
				.where(eq(event.id, eventId));
			await tx.delete(eventTag).where(eq(eventTag.eventId, eventId));
			await tx.insert(eventTag).values(tagIds.map((tagId) => ({ eventId, tagId })));
			return { ok: true, eventId };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

/** Cancellation changes status only: the Post, Event and Participation remain available as history. */
export async function cancelEvent(
	db: Database,
	clock: Clock,
	actor: { id: string } | null,
	eventId: string
): Promise<EventSaveResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const row = await tx.query.event.findFirst({
				where: eq(event.id, eventId),
				with: { post: true }
			});
			if (!row) return { ok: false, reason: 'not-found' };
			if (!(await canManageEvent(tx, actor, row.post))) return { ok: false, reason: 'forbidden' };
			if (row.status === 'cancelled') return { ok: false, reason: 'cancelled' };
			if (row.endsAt <= clock.now()) return { ok: false, reason: 'ended' };
			await tx.update(event).set({ status: 'cancelled' }).where(eq(event.id, eventId));
			await tx.update(post).set({ updatedAt: clock.now() }).where(eq(post.id, row.postId));
			return { ok: true, eventId };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

async function persistEventLocation(
	db: Pick<Database, 'insert'>,
	details: { locationId: string; manualLocation: string }
) {
	if (details.locationId !== 'manual') return details.locationId;
	// A new row keeps shared and curated Locations unchanged for other Events.
	const id = crypto.randomUUID();
	await db
		.insert(location)
		.values({ id, label: details.manualLocation, latitude: null, longitude: null });
	return id;
}

async function validateOptions(
	db: Pick<Database, 'select'>,
	details: { tagIds: string[]; locationId: string }
) {
	const options = await getEventAuthoringOptions(db);
	return {
		...(details.tagIds.some((id) => !options.tags.some((tag) => tag.id === id))
			? { tagIds: 'Choose Tags from the campus list.' }
			: {}),
		...(details.locationId !== 'manual' &&
		!options.locations.some((place) => place.id === details.locationId)
			? { locationId: 'Choose a campus Location or a plain-text Location.' }
			: {})
	};
}

export async function listMyEvents(db: Database, clock: Clock, actor: { id: string } | null) {
	if (!actor) return [];
	const records = await db
		.select({ id: event.id })
		.from(event)
		.innerJoin(post, eq(event.postId, post.id))
		.where(
			or(
				and(eq(post.authorId, actor.id), isNull(post.groupId)),
				inArray(
					post.groupId,
					(await authorizedGroupHosts(db, actor)).map((host) => host.id)
				)
			)
		)
		.orderBy(asc(event.startsAt));
	const events = await Promise.all(records.map((record) => getPublicEvent(db, clock, record.id)));
	return events.filter((event) => event !== null);
}

export async function getEventForManagement(
	db: Database,
	clock: Clock,
	actor: { id: string } | null,
	eventId: string
): Promise<{ ok: true; event: ManagedEvent } | Extract<EventSaveResult, { ok: false }>> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	const row = await db.query.event.findFirst({
		where: eq(event.id, eventId),
		with: {
			post: { with: { author: true, group: true } },
			location: true,
			eventTags: true,
			participations: true
		}
	});
	if (!row) return { ok: false, reason: 'not-found' };
	if (!(await canManageEvent(db, actor, row.post))) return { ok: false, reason: 'forbidden' };
	const curated = campusLocations.some((place) => place.id === row.locationId);
	return {
		ok: true,
		event: {
			id: row.id,
			participationLocked: row.participations.length > 0,
			hostGroupId: row.post.groupId ?? '',
			hostName: row.post.group?.name ?? row.post.author.name,
			author: { id: row.post.authorId, displayName: row.post.author.name },
			title: row.post.title,
			description: row.description,
			startsAt: formatCampusInput(row.startsAt),
			endsAt: formatCampusInput(row.endsAt),
			tagIds: row.eventTags.map((link) => link.tagId),
			responseMode: row.responseMode,
			capacity: row.capacity === null ? '' : String(row.capacity),
			locationId: curated ? row.locationId : 'manual',
			manualLocation: curated ? '' : row.location.label,
			status:
				row.status === 'cancelled' ? 'cancelled' : row.endsAt <= clock.now() ? 'ended' : 'scheduled'
		}
	};
}
