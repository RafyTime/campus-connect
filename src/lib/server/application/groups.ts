import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db';
import { group, groupMembership } from '$lib/server/db/schema';
import type { GroupMembershipRole } from '$lib/server/db/domain.schema';
import type { Clock } from '$lib/server/clock';
import type {
	GroupFollowResult,
	GroupMembershipRecordResult,
	GroupMutationAccess,
	PublicGroupDetail,
	PublicGroupSummary
} from '$lib/public-group';
import { displayInitials, imageAttribution, publicImageUrl } from './remote-images';
import { discoverPublicEventsForGroup } from './events';

export type {
	GroupFollowResult,
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
	groupId: string,
	actorUserId?: string | null
): Promise<PublicGroupDetail | null> {
	const row = await db.query.group.findFirst({
		where: eq(group.id, groupId),
		with: groupWithMemberships
	});

	if (!row) return null;

	const upcomingEvents = await discoverPublicEventsForGroup(db, clock, groupId);
	const viewerMembership = actorUserId
		? row.memberships.find((membership) => membership.user.id === actorUserId)
		: undefined;

	return {
		...toSummary(row),
		upcomingEvents,
		viewerRole: viewerMembership?.role ?? null
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

export async function followGroup(
	db: Database,
	actor: { id: string } | null,
	groupId: string
): Promise<GroupFollowResult> {
	return applyGroupFollow(db, actor, groupId, 'follow');
}

export async function unfollowGroup(
	db: Database,
	actor: { id: string } | null,
	groupId: string
): Promise<GroupFollowResult> {
	return applyGroupFollow(db, actor, groupId, 'unfollow');
}

async function applyGroupFollow(
	db: Database,
	actor: { id: string } | null,
	groupId: string,
	intent: 'follow' | 'unfollow'
): Promise<GroupFollowResult> {
	if (!actor) {
		return { ok: false, reason: 'unauthenticated' };
	}

	try {
		return await runInTransaction(db, async () => {
			const row = await db.query.group.findFirst({
				where: eq(group.id, groupId),
				with: { memberships: true }
			});

			if (!row) {
				return { ok: false, reason: 'not-found' };
			}

			const existing = row.memberships.find((membership) => membership.userId === actor.id);

			if (existing?.role === 'owner' || existing?.role === 'representative') {
				return { ok: false, reason: 'role-restricted' };
			}

			const subscriberCount = row.memberships.filter(
				(membership) => membership.role === 'subscriber'
			).length;

			if (intent === 'follow') {
				if (!existing) {
					await db.insert(groupMembership).values({
						userId: actor.id,
						groupId,
						role: 'subscriber'
					});
				}

				return {
					ok: true,
					following: true,
					subscriberCount: existing ? subscriberCount : subscriberCount + 1
				};
			}

			if (existing?.role === 'subscriber') {
				await db
					.delete(groupMembership)
					.where(
						and(
							eq(groupMembership.userId, actor.id),
							eq(groupMembership.groupId, groupId),
							eq(groupMembership.role, 'subscriber')
						)
					);
			}

			return {
				ok: true,
				following: false,
				subscriberCount: existing?.role === 'subscriber' ? subscriberCount - 1 : subscriberCount
			};
		});
	} catch (error) {
		if (isUniqueConstraint(error)) {
			return readFollowState(db, actor.id, groupId);
		}

		return { ok: false, reason: 'unavailable' };
	}
}

async function readFollowState(
	db: Database,
	userId: string,
	groupId: string
): Promise<GroupFollowResult> {
	const row = await db.query.group.findFirst({
		where: eq(group.id, groupId),
		with: { memberships: true }
	});

	if (!row) {
		return { ok: false, reason: 'not-found' };
	}

	const existing = row.memberships.find((membership) => membership.userId === userId);

	if (existing?.role === 'owner' || existing?.role === 'representative') {
		return { ok: false, reason: 'role-restricted' };
	}

	return {
		ok: true,
		following: existing?.role === 'subscriber',
		subscriberCount: row.memberships.filter((membership) => membership.role === 'subscriber').length
	};
}

function isUniqueConstraint(error: unknown): boolean {
	const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
	const message = error instanceof Error ? `${error.message}\n${cause}` : String(error);
	return /UNIQUE/i.test(message);
}

async function runInTransaction<T>(db: Database, work: () => Promise<T>): Promise<T> {
	// libsql's client.transaction() uses a separate in-memory connection, so Drizzle
	// transactions cannot see the migrated schema in disposable test databases.
	await db.$client.execute('BEGIN IMMEDIATE');
	try {
		const result = await work();
		await db.$client.execute('COMMIT');
		return result;
	} catch (error) {
		try {
			await db.$client.execute('ROLLBACK');
		} catch {
			// The original error is the useful one if rollback also fails.
		}
		throw error;
	}
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
