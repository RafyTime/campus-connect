import { and, asc, eq, gt } from 'drizzle-orm';
import { fromDate, parseDate, startOfWeek, toCalendarDate } from '@internationalized/date';
import { campusTimeZone } from '#lib/event-authoring.js';
import { discoveryDatePresets, discoveryResponseModes } from '#lib/event-filter-options.js';
import type { Clock } from '#lib/server/clock.js';
import type { Database } from '#lib/server/db/index.js';
import { event, group, tag } from '#lib/server/db/schema.js';
import { responseModeLabel } from '#lib/event-labels.js';
import type {
	PublicEventDetail,
	PublicEventStatus,
	PublicEventSummary,
	PublicResponseMode
} from '#lib/public-event.js';
import { formatCampusExactTime, formatCampusSchedule } from './campus-time';
import { displayInitials, imageAttribution, publicImageUrl } from './remote-images';

export type {
	PublicEventDetail,
	PublicEventHost,
	PublicEventStatus,
	PublicEventSummary,
	PublicEventTag,
	PublicHostType,
	PublicResponseMode
} from '#lib/public-event.js';

const discoverWith = {
	post: { with: { author: true, group: true } },
	location: true,
	eventTags: { with: { tag: true } },
	participations: { columns: { kind: true } }
} as const;

export async function discoverPublicEvents(
	db: Database,
	clock: Clock
): Promise<PublicEventSummary[]> {
	const now = clock.now();
	const rows = await db.query.event.findMany({
		where: and(
			eq(event.visibility, 'public'),
			eq(event.status, 'scheduled'),
			gt(event.endsAt, now)
		),
		orderBy: [asc(event.startsAt)],
		with: discoverWith
	});

	return rows.map((row) => toSummary(row, now));
}

export async function searchPublicEvents(db: Database, clock: Clock, input: unknown = '') {
	const tags = await db.select({ id: tag.id, name: tag.name }).from(tag).orderBy(asc(tag.name));
	const groups = await db
		.select({ id: group.id, name: group.name })
		.from(group)
		.orderBy(asc(group.name));
	const params = new URLSearchParams(typeof input === 'string' ? input : '');
	const tagIds = [...new Set(params.getAll('tag').map((id) => id.trim()))].filter((id) =>
		tags.some((tag) => tag.id === id)
	);
	const requestedGroup = params.get('group')?.trim();
	const groupId = groups.find((group) => group.id === requestedGroup)?.id ?? '';
	const requestedHost = params.get('host')?.trim().toLowerCase();
	const hostType = requestedHost === 'personal' || requestedHost === 'group' ? requestedHost : '';
	const date = normalizeDiscoveryDate(params.get('date'));
	const responseModes = [
		...new Set(params.getAll('type').map((mode) => mode.trim().toLowerCase()))
	].filter((mode): mode is PublicResponseMode =>
		discoveryResponseModes.some((known) => known === mode)
	);
	const current = toCalendarDate(fromDate(clock.now(), campusTimeZone));
	const week = startOfWeek(current, 'de-DE');
	const start =
		date === 'today'
			? current
			: date === 'tomorrow'
				? current.add({ days: 1 })
				: date === 'week'
					? week
					: date === 'next-week'
						? week.add({ days: 7 })
						: date
							? parseDate(date)
							: null;
	const end = start?.add({ days: date === 'week' || date === 'next-week' ? 7 : 1 });
	const events = (await discoverPublicEvents(db, clock)).filter((event) => {
		const campusDate = toCalendarDate(fromDate(event.startsAt, campusTimeZone));
		return (
			(!tagIds.length || event.tags.some((tag) => tagIds.includes(tag.id))) &&
			(!groupId || (event.host.type === 'group' && event.host.id === groupId)) &&
			(!hostType || event.host.type === hostType) &&
			(!responseModes.length || responseModes.includes(event.responseMode)) &&
			(!start || !end || (campusDate.compare(start) >= 0 && campusDate.compare(end) < 0))
		);
	});
	return {
		events,
		count: events.length,
		filters: { tagIds, groupId, hostType, date, responseModes },
		options: { tags, groups }
	};
}

function normalizeDiscoveryDate(value: string | null): string {
	const date = value?.trim() ?? '';
	if (discoveryDatePresets.some((preset) => preset.value === date)) return date;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
	try {
		return parseDate(date).toString();
	} catch {
		return '';
	}
}

export async function getPublicEvent(
	db: Database,
	clock: Clock,
	eventId: string
): Promise<PublicEventDetail | null> {
	const row = await db.query.event.findFirst({
		where: and(eq(event.id, eventId), eq(event.visibility, 'public')),
		with: discoverWith
	});

	if (!row) return null;

	return toDetail(row, clock.now());
}

export async function discoverPublicEventsForGroup(
	db: Database,
	clock: Clock,
	groupId: string
): Promise<PublicEventSummary[]> {
	const events = await discoverPublicEvents(db, clock);
	return events.filter((event) => event.host.type === 'group' && event.host.id === groupId);
}

type LoadedEvent = {
	id: string;
	startsAt: Date;
	endsAt: Date;
	description: string;
	responseMode: PublicResponseMode;
	capacity: number | null;
	status: 'scheduled' | 'cancelled';
	post: {
		title: string;
		author: { id: string; name: string; image: string | null };
		group: { id: string; name: string; imageUrl: string | null } | null;
	};
	location: PublicEventDetail['location'];
	eventTags: { tag: { id: string; name: string } }[];
	participations: { kind: 'interest' | 'registration' }[];
};

function toHost(row: LoadedEvent): PublicEventSummary['host'] {
	if (row.post.group) {
		const imageUrl = publicImageUrl(row.post.group.imageUrl);

		return {
			type: 'group',
			id: row.post.group.id,
			displayName: row.post.group.name,
			imageUrl,
			imageAttribution: imageAttribution(imageUrl),
			initials: displayInitials(row.post.group.name)
		};
	}

	const imageUrl = publicImageUrl(row.post.author.image);

	return {
		type: 'personal',
		id: row.post.author.id,
		displayName: row.post.author.name,
		imageUrl,
		imageAttribution: imageAttribution(imageUrl),
		initials: displayInitials(row.post.author.name)
	};
}

function toSummary(row: LoadedEvent, now: Date): PublicEventSummary {
	return {
		id: row.id,
		title: row.post.title,
		startsAt: row.startsAt,
		endsAt: row.endsAt,
		scheduleLabel: formatCampusSchedule(row.startsAt, row.endsAt),
		host: toHost(row),
		locationLabel: row.location.label,
		tags: row.eventTags
			.map((eventTag) => ({ id: eventTag.tag.id, name: eventTag.tag.name }))
			.sort((left, right) => left.name.localeCompare(right.name)),
		responseMode: row.responseMode,
		capacityState: capacityState(
			row.responseMode,
			row.capacity === null
				? null
				: row.capacity -
						row.participations.filter((record) => record.kind === 'registration').length
		),
		status: publicStatus(row.status, row.endsAt, now)
	};
}

function toDetail(row: LoadedEvent, now: Date): PublicEventDetail {
	return {
		...toSummary(row, now),
		location: {
			label: row.location.label,
			latitude: row.location.latitude,
			longitude: row.location.longitude
		},
		description: row.description,
		exactTimeLabel: formatCampusExactTime(row.startsAt, row.endsAt)
	};
}

function publicStatus(
	storedStatus: 'scheduled' | 'cancelled',
	endsAt: Date,
	now: Date
): PublicEventStatus {
	if (storedStatus === 'cancelled') return 'cancelled';
	if (endsAt.getTime() <= now.getTime()) return 'ended';
	return 'scheduled';
}

function capacityState(responseMode: PublicResponseMode, capacity: number | null): string {
	if (responseMode !== 'registration') return responseModeLabel(responseMode);
	if (capacity === null || capacity <= 0) return 'Full';
	return capacity === 1 ? '1 place remaining' : `${capacity} places remaining`;
}
