import { and, asc, count, eq } from 'drizzle-orm';
import type { Database } from '#lib/server/db/index.js';
import type { Clock } from '#lib/server/clock.js';
import { event, participation } from '#lib/server/db/schema.js';
import { getPublicEvent } from './events';

type Actor = { id: string } | null;
export type InterestResult =
	| { ok: true; interested: boolean }
	| {
			ok: false;
			reason: 'unauthenticated' | 'forbidden' | 'not-available' | 'response-mode' | 'unavailable';
	  };

export async function getInterestState(db: Database, clock: Clock, actor: Actor, eventId: string) {
	const row = await db.query.event.findFirst({
		where: eq(event.id, eventId),
		with: { post: true }
	});
	const record = actor
		? await db
				.select()
				.from(participation)
				.where(and(eq(participation.eventId, eventId), eq(participation.userId, actor.id)))
				.get()
		: undefined;
	return {
		interested: record?.kind === 'interest',
		author: Boolean(actor && row?.post.authorId === actor.id),
		available: Boolean(
			row && row.visibility === 'public' && row.status === 'scheduled' && row.endsAt > clock.now()
		)
	};
}

/** A write transaction keeps response-mode and status checks consistent with the mutation. */
export async function setInterest(
	db: Database,
	clock: Clock,
	actor: Actor,
	eventId: string,
	interested: boolean
): Promise<InterestResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const row = await tx.query.event.findFirst({
				where: eq(event.id, eventId),
				with: { post: true }
			});
			if (
				!row ||
				row.visibility !== 'public' ||
				row.status !== 'scheduled' ||
				row.endsAt <= clock.now()
			)
				return { ok: false, reason: 'not-available' };
			if (row.post.authorId === actor.id) return { ok: false, reason: 'forbidden' };
			if (row.responseMode !== 'interest') return { ok: false, reason: 'response-mode' };
			if (interested) {
				await tx
					.insert(participation)
					.values({ userId: actor.id, eventId, kind: 'interest', createdAt: clock.now() })
					.onConflictDoNothing();
			} else {
				await tx
					.delete(participation)
					.where(
						and(
							eq(participation.userId, actor.id),
							eq(participation.eventId, eventId),
							eq(participation.kind, 'interest')
						)
					);
			}
			return { ok: true, interested };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

export async function listMyActivity(db: Database, clock: Clock, actor: Actor) {
	if (!actor) return [];
	const records = await db
		.select({ eventId: participation.eventId, kind: participation.kind })
		.from(participation)
		.innerJoin(event, eq(event.id, participation.eventId))
		.where(eq(participation.userId, actor.id))
		.orderBy(asc(event.startsAt));
	const events = await Promise.all(
		records.map(async (record) => {
			const event = await getPublicEvent(db, clock, record.eventId);
			return event ? { ...event, participationKind: record.kind } : null;
		})
	);
	return events.filter((event) => event !== null);
}

export type RegistrationResult =
	| { ok: true; registered: boolean }
	| {
			ok: false;
			reason:
				| 'unauthenticated'
				| 'forbidden'
				| 'not-available'
				| 'response-mode'
				| 'full'
				| 'unavailable';
	  };

export async function getRegistrationState(
	db: Database,
	clock: Clock,
	actor: Actor,
	eventId: string
) {
	const row = await db.query.event.findFirst({
		where: and(eq(event.id, eventId), eq(event.visibility, 'public')),
		with: { post: true }
	});
	const records = row
		? await db
				.select({ userId: participation.userId })
				.from(participation)
				.where(and(eq(participation.eventId, eventId), eq(participation.kind, 'registration')))
		: [];
	const capacity = row?.capacity ?? 0;
	return {
		author: Boolean(actor && row?.post.authorId === actor.id),
		available: Boolean(
			row &&
			row.status === 'scheduled' &&
			row.endsAt > clock.now() &&
			row.responseMode === 'registration'
		),
		registered: records.some((record) => record.userId === actor?.id),
		capacity,
		confirmed: records.length,
		remaining: Math.max(0, capacity - records.length)
	};
}

/** BEGIN IMMEDIATE holds SQLite's write lock from the capacity check through insertion.
 * A retry checks existing Participation before capacity, so a confirmed User also succeeds when full.
 */
export async function setRegistration(
	db: Database,
	clock: Clock,
	actor: Actor,
	eventId: string,
	registered: boolean
): Promise<RegistrationResult> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	try {
		return await db.withTransaction(async (tx) => {
			const row = await tx.query.event.findFirst({
				where: eq(event.id, eventId),
				with: { post: true }
			});
			if (
				!row ||
				row.visibility !== 'public' ||
				row.status !== 'scheduled' ||
				row.endsAt <= clock.now()
			)
				return { ok: false, reason: 'not-available' };
			if (row.post.authorId === actor.id) return { ok: false, reason: 'forbidden' };
			if (row.responseMode !== 'registration') return { ok: false, reason: 'response-mode' };
			const ownRecord = and(
				eq(participation.eventId, eventId),
				eq(participation.userId, actor.id),
				eq(participation.kind, 'registration')
			);
			if (registered) {
				const existing = await tx.select().from(participation).where(ownRecord).get();
				if (existing) return { ok: true, registered: true };
				const totals = await tx
					.select({ confirmed: count() })
					.from(participation)
					.where(and(eq(participation.eventId, eventId), eq(participation.kind, 'registration')))
					.get();
				if ((totals?.confirmed ?? 0) >= (row.capacity ?? 0)) return { ok: false, reason: 'full' };
				await tx
					.insert(participation)
					.values({ userId: actor.id, eventId, kind: 'registration', createdAt: clock.now() });
			} else {
				await tx.delete(participation).where(ownRecord);
			}
			return { ok: true, registered };
		});
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}
