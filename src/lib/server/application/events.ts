import { and, asc, eq, gt } from 'drizzle-orm';
import type { Clock } from '$lib/server/clock';
import type { Database } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { responseModeLabel } from '$lib/event-labels';
import type {
	PublicEventDetail,
	PublicEventStatus,
	PublicEventSummary,
	PublicResponseMode
} from '$lib/public-event';
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
} from '$lib/public-event';

const discoverWith = {
	post: { with: { author: true, group: true } },
	location: true,
	eventTags: { with: { tag: true } }
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
	location: { label: string };
	eventTags: { tag: { id: string; name: string } }[];
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
		capacityState: capacityState(row.responseMode, row.capacity),
		status: publicStatus(row.status, row.endsAt, now)
	};
}

function toDetail(row: LoadedEvent, now: Date): PublicEventDetail {
	return {
		...toSummary(row, now),
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
