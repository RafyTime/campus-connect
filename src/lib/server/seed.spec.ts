import { count } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import {
	getInterestState,
	getRegistrationState,
	listMyActivity,
	setInterest,
	setRegistration
} from '#lib/server/application/participation.js';
import { discoverPublicEvents, getPublicEvent } from '#lib/server/application/events.js';
import {
	createGroup,
	editGroup,
	followGroup,
	getPublicGroup,
	listPublicGroups,
	unfollowGroup
} from '#lib/server/application/groups.js';
import { event, group, groupMembership, location, tag, user } from '#lib/server/db/schema.js';
import { createTestClock } from '#lib/server/testing/clock.js';
import { createTestDatabase } from '#lib/server/testing/database.js';
import {
	createEvent,
	editEvent,
	getEventForManagement
} from '#lib/server/application/event-authoring.js';
import { missingWikimediaAvatarUrl } from '#lib/server/application/remote-images.js';
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
			'event-evening-run',
			'event-stats-study-group'
		]);
		expect(events.map((record) => record.responseMode).sort()).toEqual([
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

		expect(users.value).toBe(4);
		expect(tags.value).toBe(10);
		expect(locations.value).toBe(5);
		expect(events.value).toBe(6);
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
			'event-evening-run',
			'event-group-run',
			'event-stats-study-group',
			'event-full-workshop'
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
		expect(events.value).toBe(14);
	});
});

describe('Participation seed', () => {
	it('seeds stable upcoming and cancelled interests, author exclusion, and an empty activity', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		await seedCampusConnect(database.db, clock);
		expect(
			(await listMyActivity(database.db, clock, { id: 'user-lena' })).map((event) => event.id)
		).toEqual(['event-board-game-evening']);
		expect(
			(await listMyActivity(database.db, clock, { id: 'user-sofia' })).map((event) => ({
				id: event.id,
				status: event.status
			}))
		).toEqual([{ id: 'event-cancelled-picnic', status: 'cancelled' }]);
		expect(await listMyActivity(database.db, clock, { id: 'user-mira' })).toEqual([]);
		expect(
			await getInterestState(database.db, clock, { id: 'user-jonas' }, 'event-film-night')
		).toMatchObject({ author: true, interested: false });
	});
	it('seeds ended Participation history idempotently', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		await seedCampusConnect(database.db, clock);
		const history = (await listMyActivity(database.db, clock, { id: 'user-jonas' })).filter(
			(event) => event.id === 'event-ended-workshop'
		);
		expect(history).toMatchObject([{ status: 'ended', participationKind: 'registration' }]);
	});
});

describe('routine re-seeding', () => {
	it('keeps manually created Events and Groups', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		const sofia = { id: 'user-sofia' };
		const createdGroup = await createGroup(database.db, clock, sofia, {
			name: 'Language Café',
			description: 'Practise languages over coffee every week.'
		});
		const createdEvent = await createEvent(database.db, clock, sofia, {
			title: 'Spanish conversation hour',
			description: 'Practise Spanish with other students.',
			startsAt: '2026-09-04T16:00',
			endsAt: '2026-09-04T17:00',
			tagIds: ['tag-language'],
			responseMode: 'announcement',
			capacity: '',
			locationId: 'location-cafeteria',
			manualLocation: ''
		});
		if (!createdGroup.ok || !createdEvent.ok) throw new Error('Manual content failed');

		await seedCampusConnect(database.db, clock);

		expect(await getPublicGroup(database.db, clock, createdGroup.groupId)).toMatchObject({
			name: 'Language Café'
		});
		expect(await getPublicEvent(database.db, clock, createdEvent.eventId)).toMatchObject({
			title: 'Spanish conversation hour'
		});
	});

	it('keeps manual edits and dates of seeded Events', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		const lena = { id: 'user-lena' };
		const managed = await getEventForManagement(
			database.db,
			clock,
			lena,
			'event-stats-study-group'
		);
		if (!managed.ok) throw new Error('Management failed');
		expect(
			await editEvent(database.db, clock, lena, 'event-stats-study-group', {
				...managed.event,
				title: 'Probability study group',
				description: 'Moved to the seminar room after a vote.',
				startsAt: '2026-09-06T10:00',
				endsAt: '2026-09-06T12:00',
				tagIds: ['tag-study']
			})
		).toMatchObject({ ok: true });

		clock.set('2026-09-20T08:00:00.000Z');
		await seedCampusConnect(database.db, clock);

		expect(await getPublicEvent(database.db, clock, 'event-stats-study-group')).toMatchObject({
			title: 'Probability study group',
			description: 'Moved to the seminar room after a vote.',
			startsAt: new Date('2026-09-06T08:00:00.000Z'),
			tags: [{ id: 'tag-study', name: 'Study' }]
		});
	});

	it('keeps manual Group edits, follows, and unfollows', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		const filmSociety = 'group-film-society';
		expect(
			await editGroup(database.db, clock, { id: 'user-lena' }, filmSociety, {
				name: 'Cinema Club',
				description: 'Screenings and discussion, now on Thursdays.'
			})
		).toMatchObject({ ok: true });
		expect(await unfollowGroup(database.db, { id: 'user-sofia' }, filmSociety)).toMatchObject({
			ok: true
		});
		expect(await followGroup(database.db, { id: 'user-mira' }, filmSociety)).toMatchObject({
			ok: true
		});

		await seedCampusConnect(database.db, clock);

		expect(await getPublicGroup(database.db, clock, filmSociety, 'user-sofia')).toMatchObject({
			name: 'Cinema Club',
			description: 'Screenings and discussion, now on Thursdays.',
			subscriberCount: 1,
			viewerRole: null
		});
		expect(await getPublicGroup(database.db, clock, filmSociety, 'user-mira')).toMatchObject({
			viewerRole: 'subscriber'
		});
	});

	it('keeps withdrawn and new interest and registration', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);
		const [lena, jonas, sofia] = [{ id: 'user-lena' }, { id: 'user-jonas' }, { id: 'user-sofia' }];
		await setInterest(database.db, clock, lena, 'event-board-game-evening', false);
		await setInterest(database.db, clock, sofia, 'event-evening-run', true);
		await setRegistration(database.db, clock, jonas, 'event-group-run', false);
		await setRegistration(database.db, clock, sofia, 'event-stats-study-group', true);

		await seedCampusConnect(database.db, clock);

		expect(
			await getInterestState(database.db, clock, lena, 'event-board-game-evening')
		).toMatchObject({ interested: false });
		expect(await getInterestState(database.db, clock, sofia, 'event-evening-run')).toMatchObject({
			interested: true
		});
		expect(await getRegistrationState(database.db, clock, jonas, 'event-group-run')).toMatchObject({
			registered: false,
			confirmed: 0
		});
		expect(
			await getRegistrationState(database.db, clock, sofia, 'event-stats-study-group')
		).toMatchObject({ registered: true, confirmed: 1 });
	});
});

describe('public demonstration content', () => {
	it('excludes deliberately missing images and literal HTML/script examples', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		await seedCampusConnect(database.db, clock);

		const events = await discoverPublicEvents(database.db, clock);
		expect(events.map((record) => record.title).join('\n')).not.toMatch(/<|script/i);
		expect(events.map((record) => record.host.imageUrl)).not.toContain(missingWikimediaAvatarUrl);
		expect((await listPublicGroups(database.db)).map((record) => record.imageUrl)).not.toContain(
			missingWikimediaAvatarUrl
		);
		for (const { id } of events) {
			expect((await getPublicEvent(database.db, clock, id))?.description).not.toMatch(/<|script/i);
		}
	});
});
