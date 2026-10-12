import { describe, expect, it } from 'vite-plus/test';
import { createTestDatabase } from '$lib/server/testing/database';
import { createTestClock } from '$lib/server/testing/clock';
import { seedCampusConnect } from '$lib/server/seed';
import { and, eq } from 'drizzle-orm';
import { groupMembership } from '$lib/server/db/schema';
import { discoverPublicEventsForGroup, getPublicEvent } from './events';
import {
	createEvent,
	editEvent,
	getEventAuthoringOptions,
	getEventForManagement,
	listMyEvents
} from './event-authoring';

const clock = createTestClock('2026-09-01T08:00:00Z');
const validInput = {
	hostGroupId: 'group-film-society',
	title: 'Campus film discussion',
	description: 'Watch and discuss a campus favourite together.',
	startsAt: '2026-09-02T18:00',
	endsAt: '2026-09-02T20:00',
	tagIds: ['tag-arts', 'tag-social'],
	responseMode: 'registration',
	capacity: '12',
	locationId: 'location-library',
	manualLocation: ''
};

describe('public group Event authoring', () => {
	it.each(['user-lena', 'user-jonas'])(
		'publishes for the seeded owner or representative %s',
		async (id) => {
			using database = await createTestDatabase();
			await seedCampusConnect(database.db, clock);
			const result = await createEvent(
				database.db,
				clock,
				{ id },
				{
					...validInput,
					authorId: 'user-sofia',
					hostType: 'personal',
					visibility: 'subscribers'
				}
			);
			if (!result.ok) throw new Error(`Publication failed: ${result.reason}`);
			await expect(getPublicEvent(database.db, clock, result.eventId)).resolves.toMatchObject({
				host: { type: 'group', id: 'group-film-society', displayName: 'Film Society' },
				startsAt: new Date('2026-09-02T16:00:00Z'),
				capacityState: '12 places remaining',
				location: { label: 'Campus Library', latitude: 50.6443, longitude: 7.2274 }
			});
			expect(
				(await discoverPublicEventsForGroup(database.db, clock, 'group-film-society')).map(
					(event) => event.id
				)
			).toContain(result.eventId);
			for (const manager of ['user-lena', 'user-jonas']) {
				expect(
					(await listMyEvents(database.db, clock, { id: manager })).map((event) => event.id)
				).toContain(result.eventId);
				await expect(
					getEventForManagement(database.db, clock, { id: manager }, result.eventId)
				).resolves.toMatchObject({
					ok: true,
					event: { hostGroupId: 'group-film-society', author: { id }, startsAt: '2026-09-02T18:00' }
				});
			}
		}
	);
	it.each([
		{ actor: { id: 'user-sofia' }, reason: 'forbidden' },
		{ actor: { id: 'user-mira' }, reason: 'forbidden' },
		{ actor: null, reason: 'unauthenticated' }
	])('rejects publication and management for $actor with $reason', async ({ actor, reason }) => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		const before = await discoverPublicEventsForGroup(database.db, clock, 'group-film-society');
		await expect(createEvent(database.db, clock, actor, validInput)).resolves.toEqual({
			ok: false,
			reason
		});
		await expect(
			getEventForManagement(database.db, clock, actor, 'event-film-night')
		).resolves.toEqual({ ok: false, reason });
		await expect(
			editEvent(database.db, clock, actor, 'event-film-night', validInput)
		).resolves.toEqual({ ok: false, reason });
		expect((await listMyEvents(database.db, clock, actor)).map((event) => event.id)).not.toContain(
			'event-film-night'
		);
		await expect(
			discoverPublicEventsForGroup(database.db, clock, 'group-film-society')
		).resolves.toEqual(before);
	});
	it('offers only current authorized Groups and keeps Campus Updates system-managed', async () => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		for (const id of ['user-lena', 'user-jonas']) {
			expect((await getEventAuthoringOptions(database.db, { id })).groups).toEqual([
				{ id: 'group-film-society', name: 'Film Society' }
			]);
		}
		for (const actor of [{ id: 'user-sofia' }, { id: 'user-campus-office' }, null]) {
			expect((await getEventAuthoringOptions(database.db, actor)).groups).toEqual([]);
		}
		for (const hostGroupId of ['group-campus-updates', 'missing-group']) {
			await expect(
				createEvent(
					database.db,
					clock,
					{ id: 'user-campus-office' },
					{ ...validInput, hostGroupId }
				)
			).resolves.toEqual({ ok: false, reason: 'forbidden' });
		}
		await expect(
			editEvent(
				database.db,
				clock,
				{ id: 'user-campus-office' },
				'event-campus-briefing',
				validInput
			)
		).resolves.toEqual({ ok: false, reason: 'forbidden' });
	});
	it.each([null, 42, ['group-film-society']])(
		'rejects malformed host selection %s',
		async (hostGroupId) => {
			using database = await createTestDatabase();
			await seedCampusConnect(database.db, clock);
			await expect(
				createEvent(database.db, clock, { id: 'user-jonas' }, { ...validInput, hostGroupId })
			).resolves.toMatchObject({
				ok: false,
				reason: 'invalid',
				fieldErrors: { hostGroupId: expect.any(String) }
			});
		}
	);
	it('allows other current managers to edit without changing the Group host or acting author', async () => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		for (const id of ['user-lena', 'user-jonas']) {
			await expect(
				editEvent(database.db, clock, { id }, 'event-film-night', {
					...validInput,
					title: 'Updated film discussion',
					hostGroupId: 'group-campus-runners',
					groupId: null,
					authorId: id,
					visibility: 'invitees',
					responseMode: 'interest',
					capacity: '',
					locationId: 'manual',
					manualLocation: 'Library garden',
					latitude: 50,
					longitude: 7
				})
			).resolves.toEqual({ ok: true, eventId: 'event-film-night' });
			await expect(
				getEventForManagement(database.db, clock, { id }, 'event-film-night')
			).resolves.toMatchObject({
				ok: true,
				event: {
					hostGroupId: 'group-film-society',
					hostName: 'Film Society',
					author: { id: 'user-jonas' },
					title: 'Updated film discussion'
				}
			});
		}
		await expect(getPublicEvent(database.db, clock, 'event-film-night')).resolves.toMatchObject({
			host: { type: 'group', id: 'group-film-society' },
			location: { label: 'Library garden', latitude: null, longitude: null },
			responseMode: 'interest'
		});
	});
	it.each(['subscriber', 'removed'] as const)(
		'withdraws author authority when their representative role is %s',
		async (role) => {
			using database = await createTestDatabase();
			await seedCampusConnect(database.db, clock);
			const membership = and(
				eq(groupMembership.groupId, 'group-film-society'),
				eq(groupMembership.userId, 'user-jonas')
			);
			if (role === 'removed') await database.db.delete(groupMembership).where(membership);
			else await database.db.update(groupMembership).set({ role }).where(membership);
			expect((await getEventAuthoringOptions(database.db, { id: 'user-jonas' })).groups).toEqual(
				[]
			);
			expect(
				(await listMyEvents(database.db, clock, { id: 'user-jonas' })).map((event) => event.id)
			).not.toContain('event-film-night');
			await expect(
				getEventForManagement(database.db, clock, { id: 'user-jonas' }, 'event-film-night')
			).resolves.toEqual({ ok: false, reason: 'forbidden' });
			await expect(
				editEvent(database.db, clock, { id: 'user-jonas' }, 'event-film-night', validInput)
			).resolves.toEqual({ ok: false, reason: 'forbidden' });
			await expect(
				createEvent(database.db, clock, { id: 'user-jonas' }, validInput)
			).resolves.toEqual({ ok: false, reason: 'forbidden' });
			await expect(
				getEventForManagement(database.db, clock, { id: 'user-lena' }, 'event-film-night')
			).resolves.toMatchObject({ ok: true });
		}
	);
	it('includes ended and cancelled Group history for both managers and refuses its mutation', async () => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		for (const id of ['user-lena', 'user-jonas']) {
			const managed = await listMyEvents(database.db, clock, { id });
			expect(managed.find((event) => event.id === 'event-ended-film-meetup')?.status).toBe('ended');
			expect(managed.find((event) => event.id === 'event-cancelled-group-screening')?.status).toBe(
				'cancelled'
			);
			for (const eventId of ['event-ended-film-meetup', 'event-cancelled-group-screening']) {
				await expect(editEvent(database.db, clock, { id }, eventId, validInput)).resolves.toEqual({
					ok: false,
					reason: 'read-only'
				});
			}
		}
	});
	it.each([
		['title', 'tiny'],
		['description', 'short'],
		['tagIds', []],
		['tagIds', ['unknown']],
		['startsAt', '2027-03-28T02:30'],
		['startsAt', '2026-10-25T02:30'],
		['endsAt', '2026-09-02T17:00'],
		['responseMode', 'unknown'],
		['capacity', '0'],
		['locationId', 'unknown']
	] as const)('enforces shared %s validation on Group publication', async (field, value) => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		const before = await discoverPublicEventsForGroup(database.db, clock, 'group-film-society');
		await expect(
			createEvent(database.db, clock, { id: 'user-jonas' }, { ...validInput, [field]: value })
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { [field]: expect.any(String) }
		});
		await expect(
			editEvent(database.db, clock, { id: 'user-jonas' }, 'event-film-night', {
				...validInput,
				[field]: value
			})
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { [field]: expect.any(String) }
		});
		await expect(
			discoverPublicEventsForGroup(database.db, clock, 'group-film-society')
		).resolves.toEqual(before);
	});
	it.each(['announcement', 'interest'] as const)(
		'publishes %s with normalized Tags and a manual Location',
		async (responseMode) => {
			using database = await createTestDatabase();
			await seedCampusConnect(database.db, clock);
			const result = await createEvent(
				database.db,
				clock,
				{ id: 'user-lena' },
				{
					...validInput,
					responseMode,
					capacity: '',
					tagIds: ['tag-arts', ' tag-arts '],
					locationId: 'manual',
					manualLocation: '  Courtyard table  ',
					latitude: 50,
					longitude: 7
				}
			);
			if (!result.ok) throw new Error('Publication failed');
			await expect(getPublicEvent(database.db, clock, result.eventId)).resolves.toMatchObject({
				responseMode,
				tags: [{ id: 'tag-arts', name: 'Arts' }],
				location: { label: 'Courtyard table', latitude: null, longitude: null }
			});
			await expect(
				createEvent(database.db, clock, { id: 'user-lena' }, { ...validInput, responseMode })
			).resolves.toMatchObject({
				ok: false,
				reason: 'invalid',
				fieldErrors: { capacity: expect.any(String) }
			});
		}
	);
});
