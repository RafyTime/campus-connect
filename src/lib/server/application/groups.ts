import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db';
import { group, groupMembership } from '$lib/server/db/schema';
import type { GroupMembershipRole } from '$lib/server/db/domain.schema';
import type { Clock } from '$lib/server/clock';
import type {
	GroupMembershipRecordResult,
	GroupMutationAccess,
	PublicGroupDetail,
	PublicGroupSummary
} from '$lib/public-group';
import { displayInitials, imageAttribution, publicImageUrl } from './remote-images';
import { discoverPublicEventsForGroup } from './events';

export type {
	GroupMembershipRecordResult,
	GroupMutationAccess,
	PublicGroupDetail,
	PublicGroupOwner,
	PublicGroupSummary
} from '$lib/public-group';

const groupWithMemberships = {
	memberships: { with: { user: true } }
} as const;

export async function listPublicGroups(db: Database): Promise<PublicGroupSummary[]> {
	const rows = await db.query.group.findMany({
		with: groupWithMemberships,
		orderBy: [asc(group.name)]
	});

	return rows.map(toSummary);
}

export async function getPublicGroup(
	db: Database,
	clock: Clock,
	groupId: string
): Promise<PublicGroupDetail | null> {
	const row = await db.query.group.findFirst({
		where: eq(group.id, groupId),
		with: groupWithMemberships
	});

	if (!row) return null;

	const upcomingEvents = await discoverPublicEventsForGroup(db, clock, groupId);

	return {
		...toSummary(row),
		upcomingEvents
	};
}

export async function recordGroupMembership(
	db: Database,
	input: { userId: string; groupId: string; role: GroupMembershipRole }
): Promise<GroupMembershipRecordResult> {
	const existing = await db.query.groupMembership.findFirst({
		where: and(eq(groupMembership.userId, input.userId), eq(groupMembership.groupId, input.groupId))
	});

	if (existing) {
		return { ok: false, reason: 'duplicate-membership' };
	}

	if (input.role === 'owner') {
		const owner = await db.query.groupMembership.findFirst({
			where: and(eq(groupMembership.groupId, input.groupId), eq(groupMembership.role, 'owner'))
		});

		if (owner) {
			return { ok: false, reason: 'owner-exists' };
		}
	}

	await db.insert(groupMembership).values(input);
	return { ok: true };
}

export async function assertGroupMutable(
	db: Database,
	groupId: string
): Promise<GroupMutationAccess> {
	const row = await db.query.group.findFirst({
		where: eq(group.id, groupId)
	});

	if (!row) return { ok: false, reason: 'not-found' };
	// Campus Updates stays readable without membership and is not editable by ordinary Users.
	if (row.systemManaged) return { ok: false, reason: 'system-managed' };
	return { ok: true };
}

type LoadedGroup = {
	id: string;
	name: string;
	description: string;
	imageUrl: string | null;
	systemManaged: boolean;
	memberships: {
		role: GroupMembershipRole;
		user: { id: string; name: string };
	}[];
};

function toSummary(row: LoadedGroup): PublicGroupSummary {
	const ownerMembership = row.memberships.find((membership) => membership.role === 'owner');

	if (!ownerMembership) {
		throw new Error(`Group ${row.id} is missing its owner`);
	}

	const imageUrl = publicImageUrl(row.imageUrl);

	return {
		id: row.id,
		name: row.name,
		description: row.description,
		imageUrl,
		imageAttribution: imageAttribution(imageUrl),
		initials: displayInitials(row.name),
		owner: {
			id: ownerMembership.user.id,
			displayName: ownerMembership.user.name
		},
		subscriberCount: row.memberships.filter((membership) => membership.role === 'subscriber')
			.length,
		systemManaged: row.systemManaged
	};
}
