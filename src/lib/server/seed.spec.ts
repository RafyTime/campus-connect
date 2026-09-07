import { count } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { discoverPublicEvents } from '$lib/server/application/events';
import { getPublicGroup, listPublicGroups } from '$lib/server/application/groups';
import { event, group, groupMembership, location, tag, user } from '$lib/server/db/schema';
import { createTestClock } from '$lib/server/testing/clock';
import { createTestDatabase } from '$lib/server/testing/database';
import { seedCampusConnect, seedPublicPersonalEvents } from './seed';

const campusNow = '2026-09-01T08:00:00.000Z';

describe('public personal Event seed', () => {
	it('creates a stable Tag taxonomy and representative personal Events', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await seedPublicPersonalEvents(database.db, clock);

		const tags = await database.db.select({ id: tag.id, name: tag.name }).from(tag);
		expect(tags).toHaveLength(10);
		expect(tags.map((record) => record.id).sort()).toEqual([
			'tag-arts',
			'tag-food',
			'tag-language',
			'tag-music',
			'tag-outdoors',
			'tag-social',
			'tag-sports',
			'tag-study',
			'tag-tech',
			'tag-wellness'
		]);

		const events = await discoverPublicEvents(database.db, clock);
		expect(events.map((record) => record.id)).toEqual([
			'event-board-game-evening',
			'event-campus-welcome-walk',
			'event-plain-text-safety',
			'event-evening-run',
			'event-stats-study-group'
		]);
		expect(events.map((record) => record.responseMode).sort()).toEqual([
			'announcement',
			'announcement',
			'interest',
			'interest',
			'registration'
		]);
	});

	it('is idempotent for Users, Tags, Locations, Posts, and Events', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await seedPublicPersonalEvents(database.db, clock);
		await seedPublicPersonalEvents(database.db, clock);

		const [users] = await database.db.select({ value: count() }).from(user);
		const [tags] = await database.db.select({ value: count() }).from(tag);
		const [locations] = await database.db.select({ value: count() }).from(location);
		const [events] = await database.db.select({ value: count() }).from(event);

		expect(users.value).toBe(3);
		expect(tags.value).toBe(10);
		expect(locations.value).toBe(5);
		expect(events.value).toBe(7);
	});
});

describe('Group and public group Event seed', () => {
	it('creates Campus Updates, role contexts, and public group Events', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await seedCampusConnect(database.db, clock);

		const groups = await listPublicGroups(database.db);
		expect(groups.map((record) => record.id)).toEqual([
			'group-campus-runners',
			'group-campus-updates',
			'group-film-society'
		]);
		expect(groups.find((record) => record.id === 'group-campus-updates')).toMatchObject({
			systemManaged: true,
			subscriberCount: 2
		});
		expect(groups.find((record) => record.id === 'group-film-society')).toMatchObject({
			owner: { displayName: 'Lena Hartmann' },
			subscriberCount: 1
		});
		expect(groups.find((record) => record.id === 'group-campus-runners')).toMatchObject({
			owner: { displayName: 'Mira Okonkwo' },
			subscriberCount: 1
		});

		const filmSociety = await getPublicGroup(database.db, clock, 'group-film-society');
		expect(filmSociety?.upcomingEvents.map((record) => record.id)).toEqual(['event-film-night']);
		expect(filmSociety?.upcomingEvents[0]?.host.type).toBe('group');

		const memberships = await database.db.select().from(groupMembership);
		expect(memberships).toEqual(
			expect.arrayContaining([
				{
					userId: 'user-jonas',
					groupId: 'group-film-society',
					role: 'representative'
				},
				{
					userId: 'user-lena',
					groupId: 'group-film-society',
					role: 'owner'
				},
				{
					userId: 'user-mira',
					groupId: 'group-campus-runners',
					role: 'owner'
				}
			])
		);

		const events = await discoverPublicEvents(database.db, clock);
		expect(events.map((record) => record.id)).toEqual([
			'event-board-game-evening',
			'event-campus-briefing',
			'event-campus-welcome-walk',
			'event-film-night',
			'event-plain-text-safety',
			'event-evening-run',
			'event-group-run',
			'event-stats-study-group'
		]);
		expect(events.find((record) => record.id === 'event-film-night')?.host).toMatchObject({
			type: 'group',
			displayName: 'Film Society'
		});
	});

	it('is idempotent for Groups, memberships, and group Events', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await seedCampusConnect(database.db, clock);
		await seedCampusConnect(database.db, clock);

		const [users] = await database.db.select({ value: count() }).from(user);
		const [groups] = await database.db.select({ value: count() }).from(group);
		const [memberships] = await database.db.select({ value: count() }).from(groupMembership);
		const [events] = await database.db.select({ value: count() }).from(event);

		expect(users.value).toBe(5);
		expect(groups.value).toBe(3);
		expect(memberships.value).toBe(8);
		expect(events.value).toBe(12);
	});
});
