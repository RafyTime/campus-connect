import type { PublicEventSummary } from './public-event';

export type PublicGroupOwner = {
	id: string;
	displayName: string;
};

export type PublicGroupSummary = {
	id: string;
	name: string;
	description: string;
	imageUrl: string | null;
	imageAttribution: string | null;
	initials: string;
	owner: PublicGroupOwner;
	subscriberCount: number;
	systemManaged: boolean;
};

export type PublicGroupDetail = PublicGroupSummary & {
	upcomingEvents: PublicEventSummary[];
};

export type GroupMutationAccess =
	{ ok: true } | { ok: false; reason: 'not-found' | 'system-managed' };

export type GroupMembershipRecordResult =
	{ ok: true } | { ok: false; reason: 'duplicate-membership' | 'owner-exists' };
