import { describe, expect, it } from 'vitest';
import {
	assertGroupMutable,
	getPublicGroup,
	listPublicGroups,
	recordGroupMembership
} from './groups';
import { getPublicEvent } from './events';
import { createTestClock } from '$lib/server/testing/clock';
import { createTestDatabase } from '$lib/server/testing/database';
import {
	insertGroup,
	insertPublicGroupEvent,
	insertPublicPersonalEvent,
	insertUser
} from '$lib/server/fixtures';
import { group, groupMembership } from '$lib/server/db/schema';

const campusNow = '2026-09-01T08:00:00.000Z';

function constraintMessage(error: unknown): string {
	if (!(error instanceof Error)) return String(error);

	const cause =
		error.cause instanceof Error ? error.cause.message : error.cause ? String(error.cause) : '';

	return `${error.message}\n${cause}`;
}

async function expectConstraint(work: () => Promise<unknown>, pattern: RegExp) {
	try {
		await work();
		expect.unreachable('expected a database constraint error');
	} catch (error) {
		expect(constraintMessage(error)).toMatch(pattern);
	}
}

const lena = {
	id: 'user-lena',
	name: 'Lena Hartmann',
	email: 'lena.hartmann@example.com'
};

const jonas = {
	id: 'user-jonas',
	name: 'Jonas Weber',
	email: 'jonas.weber@example.com'
};

const sofia = {
	id: 'user-sofia',
	name: 'Sofia Klein',
	email: 'sofia.klein@example.com'
};

const filmSociety = {
	id: 'group-film-society',
	name: 'Film Society',
	description: 'Weekly screenings and discussion for IU Campus Bad Honnef.'
};

describe('Group membership invariants', () => {
	it('rejects a second membership for the same User and Group', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});
		await insertUser(database.db, clock, sofia);

		await expect(
			recordGroupMembership(database.db, {
				userId: sofia.id,
				groupId: filmSociety.id,
				role: 'subscriber'
			})
		).resolves.toEqual({ ok: true });
		await expect(
			recordGroupMembership(database.db, {
				userId: sofia.id,
				groupId: filmSociety.id,
				role: 'representative'
			})
		).resolves.toEqual({ ok: false, reason: 'duplicate-membership' });
	});

	it('rejects a second owner for the same Group', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});
		await insertUser(database.db, clock, jonas);

		await expect(
			recordGroupMembership(database.db, {
				userId: jonas.id,
				groupId: filmSociety.id,
				role: 'owner'
			})
		).resolves.toEqual({ ok: false, reason: 'owner-exists' });
	});

	it('lets the database reject a duplicate membership and a second owner', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});
		await insertUser(database.db, clock, jonas);

		await expectConstraint(
			() =>
				database.db.insert(groupMembership).values({
					userId: lena.id,
					groupId: filmSociety.id,
					role: 'subscriber'
				}),
			/UNIQUE/i
		);

		await expectConstraint(
			() =>
				database.db.insert(groupMembership).values({
					userId: jonas.id,
					groupId: filmSociety.id,
					role: 'owner'
				}),
			/UNIQUE/i
		);
	});

	it('lets the database reject a membership role outside owner, representative, or subscriber', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});
		await insertUser(database.db, clock, sofia);

		await expectConstraint(
			() =>
				database.db.$client.execute({
					sql: 'INSERT INTO group_membership (user_id, group_id, role) VALUES (?, ?, ?)',
					args: [sofia.id, filmSociety.id, 'admin']
				}),
			/CHECK/i
		);
	});

	it('lets the database reject a case-insensitive duplicate Group name', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});

		await expectConstraint(
			() =>
				database.db.insert(group).values({
					id: 'group-film-society-copy',
					name: 'film society',
					description: 'A colliding name.',
					imageUrl: null,
					systemManaged: false,
					createdAt: clock.now(),
					updatedAt: clock.now()
				}),
			/UNIQUE/i
		);
	});
});

describe('public Group directory and details', () => {
	it('lists seeded Groups with owner, description, and subscriber count', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			id: 'group-campus-updates',
			name: 'Campus Updates',
			description: 'Official campus-wide information for IU Campus Bad Honnef.',
			systemManaged: true,
			owner: {
				id: 'user-campus-office',
				name: 'Campus Office',
				email: 'campus.office@example.com'
			}
		});
		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena,
			representative: jonas,
			subscribers: [sofia]
		});

		await expect(listPublicGroups(database.db)).resolves.toEqual([
			{
				id: 'group-campus-updates',
				name: 'Campus Updates',
				description: 'Official campus-wide information for IU Campus Bad Honnef.',
				imageUrl: null,
				imageAttribution: null,
				initials: 'CU',
				owner: { id: 'user-campus-office', displayName: 'Campus Office' },
				subscriberCount: 0,
				systemManaged: true
			},
			{
				id: 'group-film-society',
				name: 'Film Society',
				description: 'Weekly screenings and discussion for IU Campus Bad Honnef.',
				imageUrl: null,
				imageAttribution: null,
				initials: 'FS',
				owner: { id: 'user-lena', displayName: 'Lena Hartmann' },
				subscriberCount: 1,
				systemManaged: false
			}
		]);
	});

	it('counts owners and representatives as members but not subscribers', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena,
			representative: jonas,
			subscribers: [sofia]
		});

		const detail = await getPublicGroup(database.db, clock, filmSociety.id);

		expect(detail).toMatchObject({
			id: filmSociety.id,
			owner: { id: lena.id, displayName: lena.name },
			subscriberCount: 1
		});
	});

	it('shows upcoming public group Events on Group details', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});
		await insertPublicGroupEvent(database.db, clock, {
			id: 'event-film-night',
			title: 'Campus film night',
			startsAt: new Date('2026-09-02T18:00:00.000Z'),
			endsAt: new Date('2026-09-02T20:00:00.000Z'),
			groupId: filmSociety.id,
			author: lena
		});
		await insertPublicGroupEvent(database.db, clock, {
			id: 'event-ended-meetup',
			title: 'Ended film meetup',
			startsAt: new Date('2026-08-31T18:00:00.000Z'),
			endsAt: new Date('2026-08-31T20:00:00.000Z'),
			groupId: filmSociety.id,
			author: lena
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-personal-walk',
			title: 'Campus welcome walk',
			startsAt: new Date('2026-09-02T08:00:00.000Z'),
			endsAt: new Date('2026-09-02T10:00:00.000Z'),
			author: lena
		});

		const detail = await getPublicGroup(database.db, clock, filmSociety.id);

		expect(detail?.upcomingEvents.map((event) => event.id)).toEqual(['event-film-night']);
		expect(detail?.upcomingEvents[0]?.host).toMatchObject({
			type: 'group',
			id: filmSociety.id,
			displayName: filmSociety.name
		});
	});

	it('returns null when the Group does not exist', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await expect(getPublicGroup(database.db, clock, 'group-missing')).resolves.toBeNull();
	});

	it('lets visitors read Campus Updates without a Group membership', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			id: 'group-campus-updates',
			name: 'Campus Updates',
			description: 'Official campus-wide information for IU Campus Bad Honnef.',
			systemManaged: true,
			owner: {
				id: 'user-campus-office',
				name: 'Campus Office',
				email: 'campus.office@example.com'
			}
		});

		await expect(getPublicGroup(database.db, clock, 'group-campus-updates')).resolves.toMatchObject(
			{
				id: 'group-campus-updates',
				systemManaged: true,
				subscriberCount: 0
			}
		);
	});
});

describe('public group Event hosting', () => {
	it('derives host type from the Post Group relationship', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena,
			representative: jonas
		});
		await insertPublicGroupEvent(database.db, clock, {
			id: 'event-rep-screening',
			title: 'Representative screening',
			startsAt: new Date('2026-09-03T18:00:00.000Z'),
			endsAt: new Date('2026-09-03T20:00:00.000Z'),
			groupId: filmSociety.id,
			author: jonas
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-personal-walk',
			title: 'Campus welcome walk',
			startsAt: new Date('2026-09-02T08:00:00.000Z'),
			endsAt: new Date('2026-09-02T10:00:00.000Z'),
			author: lena
		});

		await expect(getPublicEvent(database.db, clock, 'event-rep-screening')).resolves.toMatchObject({
			id: 'event-rep-screening',
			host: {
				type: 'group',
				id: filmSociety.id,
				displayName: 'Film Society',
				imageUrl: null,
				imageAttribution: null,
				initials: 'FS'
			}
		});
		await expect(getPublicEvent(database.db, clock, 'event-personal-walk')).resolves.toMatchObject({
			id: 'event-personal-walk',
			host: {
				type: 'personal',
				id: lena.id,
				displayName: 'Lena Hartmann'
			}
		});
	});
});

describe('Campus Updates protection', () => {
	it('blocks ordinary Users from editing the system-managed Campus Updates Group', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertGroup(database.db, clock, {
			id: 'group-campus-updates',
			name: 'Campus Updates',
			description: 'Official campus-wide information for IU Campus Bad Honnef.',
			systemManaged: true,
			owner: {
				id: 'user-campus-office',
				name: 'Campus Office',
				email: 'campus.office@example.com'
			}
		});
		await insertGroup(database.db, clock, {
			...filmSociety,
			owner: lena
		});

		await expect(assertGroupMutable(database.db, 'group-campus-updates')).resolves.toEqual({
			ok: false,
			reason: 'system-managed'
		});
		await expect(assertGroupMutable(database.db, filmSociety.id)).resolves.toEqual({ ok: true });
		await expect(assertGroupMutable(database.db, 'group-missing')).resolves.toEqual({
			ok: false,
			reason: 'not-found'
		});
	});
});
