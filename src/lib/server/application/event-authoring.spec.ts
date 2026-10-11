import { describe, expect, it } from 'vite-plus/test';
import { createTestDatabase } from '$lib/server/testing/database';
import { createTestClock } from '$lib/server/testing/clock';
import { seedEventAuthoringOptions, seedPublicPersonalEvents } from '$lib/server/seed';
import { insertUser } from '$lib/server/fixtures';
import { discoverPublicEvents, getPublicEvent } from './events';
import {
	createPersonalEvent,
	editPersonalEvent,
	getEventAuthoringOptions,
	getPersonalEventForManagement,
	listMyEvents
} from './event-authoring';

const creator = { id: 'user-creator', name: 'Event Creator', email: 'creator@example.com' };
const validInput = {
	title: '  Campus coding evening  ',
	description: '  Bring a laptop and build something together.  ',
	startsAt: '2026-09-02T18:00',
	endsAt: '2026-09-02T20:00',
	tagIds: ['tag-tech', 'tag-social'],
	responseMode: 'registration',
	capacity: '12',
	locationId: 'location-library',
	manualLocation: ''
};

describe('personal Event authoring', () => {
	it('publishes immediately for public discovery and author management in campus time', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		const result = await createPersonalEvent(database.db, clock, creator, validInput);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('Publication failed');
		await expect(getPublicEvent(database.db, clock, result.eventId)).resolves.toMatchObject({
			title: 'Campus coding evening',
			description: 'Bring a laptop and build something together.',
			startsAt: new Date('2026-09-02T16:00:00Z'),
			endsAt: new Date('2026-09-02T18:00:00Z'),
			status: 'scheduled',
			host: { type: 'personal', id: creator.id },
			locationLabel: 'Campus Library',
			capacityState: '12 places remaining'
		});
		expect((await discoverPublicEvents(database.db, clock)).map((event) => event.id)).toContain(
			result.eventId
		);
		expect((await listMyEvents(database.db, clock, creator)).map((event) => event.id)).toEqual([
			result.eventId
		]);
		await expect(
			getPersonalEventForManagement(database.db, clock, creator, result.eventId)
		).resolves.toMatchObject({
			ok: true,
			event: {
				startsAt: '2026-09-02T18:00',
				endsAt: '2026-09-02T20:00',
				capacity: '12',
				locationId: 'location-library'
			}
		});
	});
	it('rejects unknown Tags and non-curated Locations without publishing partial content', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		const before = await discoverPublicEvents(database.db, clock);
		await expect(
			createPersonalEvent(database.db, clock, creator, { ...validInput, tagIds: ['custom-tag'] })
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { tagIds: expect.any(String) }
		});
		await expect(
			createPersonalEvent(database.db, clock, creator, {
				...validInput,
				locationId: 'custom-place'
			})
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { locationId: expect.any(String) }
		});
		await expect(discoverPublicEvents(database.db, clock)).resolves.toEqual(before);
	});
	it('lets the author edit every exposed field while preserving host and public visibility', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		const created = await createPersonalEvent(database.db, clock, creator, validInput);
		if (!created.ok) throw new Error('Publication failed');
		const edited = {
			...validInput,
			title: 'Garden study morning',
			description: 'Study outdoors with tea and a few friends.',
			startsAt: '2026-09-03T09:00',
			endsAt: '2026-09-03T11:00',
			tagIds: ['tag-study'],
			responseMode: 'interest',
			capacity: '',
			locationId: 'manual',
			manualLocation: '  Garden beside the library  ',
			authorId: 'user-lena',
			groupId: 'group-film-society',
			visibility: 'invitees',
			latitude: 50,
			longitude: 7
		};
		await expect(
			editPersonalEvent(database.db, clock, creator, created.eventId, edited)
		).resolves.toEqual({ ok: true, eventId: created.eventId });
		await expect(getPublicEvent(database.db, clock, created.eventId)).resolves.toMatchObject({
			title: 'Garden study morning',
			description: 'Study outdoors with tea and a few friends.',
			startsAt: new Date('2026-09-03T07:00:00Z'),
			endsAt: new Date('2026-09-03T09:00:00Z'),
			tags: [{ id: 'tag-study', name: 'Study' }],
			responseMode: 'interest',
			host: { id: creator.id, type: 'personal' },
			locationLabel: 'Garden beside the library'
		});
		await expect(
			getPersonalEventForManagement(database.db, clock, creator, created.eventId)
		).resolves.toMatchObject({
			ok: true,
			event: { locationId: 'manual', manualLocation: 'Garden beside the library', capacity: '' }
		});
		await expect(
			editPersonalEvent(database.db, clock, creator, created.eventId, validInput)
		).resolves.toMatchObject({ ok: true });
		await expect(
			getPersonalEventForManagement(database.db, clock, creator, created.eventId)
		).resolves.toMatchObject({
			ok: true,
			event: { locationId: 'location-library', responseMode: 'registration', capacity: '12' }
		});
	});
	it.each([
		['title', 'abcd'],
		['title', 'a'.repeat(101)],
		['description', 'a'.repeat(19)],
		['description', 'a'.repeat(2001)],
		['tagIds', []],
		['tagIds', ['tag-tech', 'tag-arts', 'tag-food', 'tag-social']],
		['tagIds', [42]],
		['startsAt', '2026-09-01T10:00'],
		['startsAt', '2026-09-01T09:59'],
		['startsAt', '2026-02-30T10:00'],
		['startsAt', '2027-03-28T02:30'],
		['startsAt', '2026-10-25T02:30'],
		['startsAt', '2026-09-02T18:00Z'],
		['endsAt', '2026-09-02T18:00'],
		['endsAt', '2026-09-02T17:59'],
		['endsAt', 'invalid'],
		['responseMode', 'unknown'],
		['capacity', '0'],
		['capacity', '-1'],
		['capacity', '1.5'],
		['capacity', ''],
		['capacity', 'Infinity'],
		['capacity', '9007199254740992'],
		['locationId', '']
	] as const)('rejects invalid %s input %s independently on the server', async (field, value) => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		await expect(
			createPersonalEvent(database.db, clock, creator, { ...validInput, [field]: value })
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { [field]: expect.any(String) }
		});
		await expect(listMyEvents(database.db, clock, creator)).resolves.toEqual([]);
	});
	it.each(['announcement', 'interest'] as const)(
		'requires no capacity for %s Events',
		async (responseMode) => {
			using database = await createTestDatabase();
			const clock = createTestClock('2026-09-01T08:00:00Z');
			await seedPublicPersonalEvents(database.db, clock);
			await insertUser(database.db, clock, creator);
			await expect(
				createPersonalEvent(database.db, clock, creator, { ...validInput, responseMode })
			).resolves.toMatchObject({
				ok: false,
				reason: 'invalid',
				fieldErrors: { capacity: expect.any(String) }
			});
			const result = await createPersonalEvent(database.db, clock, creator, {
				...validInput,
				responseMode,
				capacity: ''
			});
			if (!result.ok) throw new Error('Publication failed');
			await expect(
				getPersonalEventForManagement(database.db, clock, creator, result.eventId)
			).resolves.toMatchObject({ ok: true, event: { responseMode, capacity: '' } });
		}
	);
	it('accepts field boundaries, deduplicates Tags, and stores plain-text Locations without coordinates', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		for (const { fields, expectedTags } of [
			{
				fields: {
					title: 'a'.repeat(5),
					description: 'a'.repeat(20),
					tagIds: ['tag-tech', ' tag-tech ']
				},
				expectedTags: ['tag-tech']
			},
			{
				fields: {
					title: 'a'.repeat(100),
					description: 'a'.repeat(2000),
					tagIds: ['tag-tech', 'tag-social', 'tag-study']
				},
				expectedTags: ['tag-social', 'tag-study', 'tag-tech']
			}
		]) {
			const result = await createPersonalEvent(database.db, clock, creator, {
				...validInput,
				...fields,
				capacity: '1',
				locationId: 'manual',
				manualLocation: '  Garden  ',
				latitude: 51,
				longitude: 8,
				visibility: 'invitees',
				groupId: 'group-film-society',
				authorId: 'user-lena'
			});
			if (!result.ok) throw new Error('Publication failed');
			await expect(getPublicEvent(database.db, clock, result.eventId)).resolves.toMatchObject({
				title: fields.title,
				description: fields.description,
				host: { id: creator.id, type: 'personal' },
				locationLabel: 'Garden'
			});
			await expect(
				getPersonalEventForManagement(database.db, clock, creator, result.eventId)
			).resolves.toMatchObject({ ok: true, event: { tagIds: expectedTags, locationId: 'manual' } });
		}
		await expect(
			createPersonalEvent(database.db, clock, creator, {
				...validInput,
				locationId: 'manual',
				manualLocation: '  '
			})
		).resolves.toMatchObject({
			ok: false,
			reason: 'invalid',
			fieldErrors: { manualLocation: expect.any(String) }
		});
	});
	it('enforces sign-in and author authorization for management and mutation', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		await expect(createPersonalEvent(database.db, clock, null, validInput)).resolves.toEqual({
			ok: false,
			reason: 'unauthenticated'
		});
		await expect(
			getPersonalEventForManagement(database.db, clock, null, 'event-campus-welcome-walk')
		).resolves.toEqual({ ok: false, reason: 'unauthenticated' });
		await expect(
			editPersonalEvent(database.db, clock, null, 'event-campus-welcome-walk', validInput)
		).resolves.toEqual({ ok: false, reason: 'unauthenticated' });
		await expect(
			getPersonalEventForManagement(database.db, clock, creator, 'event-campus-welcome-walk')
		).resolves.toEqual({ ok: false, reason: 'forbidden' });
		await expect(
			editPersonalEvent(database.db, clock, creator, 'event-campus-welcome-walk', validInput)
		).resolves.toEqual({ ok: false, reason: 'forbidden' });
		await expect(
			editPersonalEvent(database.db, clock, creator, 'missing', validInput)
		).resolves.toEqual({ ok: false, reason: 'not-found' });
		await expect(listMyEvents(database.db, clock, creator)).resolves.toEqual([]);
	});
	it('keeps ended and cancelled Events in My events and refuses editing', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await expect(
			editPersonalEvent(
				database.db,
				clock,
				{ id: 'user-mira' },
				'event-ended-library-hours',
				validInput
			)
		).resolves.toEqual({ ok: false, reason: 'read-only' });
		await expect(
			editPersonalEvent(
				database.db,
				clock,
				{ id: 'user-jonas' },
				'event-cancelled-picnic',
				validInput
			)
		).resolves.toEqual({ ok: false, reason: 'read-only' });
		expect(
			(await listMyEvents(database.db, clock, { id: 'user-mira' })).find(
				(event) => event.id === 'event-ended-library-hours'
			)?.status
		).toBe('ended');
		expect(
			(await listMyEvents(database.db, clock, { id: 'user-jonas' })).find(
				(event) => event.id === 'event-cancelled-picnic'
			)?.status
		).toBe('cancelled');
	});
	it('stores verified campus coordinates and never accepts coordinates for a manual Location', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await seedPublicPersonalEvents(database.db, clock);
		await insertUser(database.db, clock, creator);
		const curated = await createPersonalEvent(database.db, clock, creator, validInput);
		const manual = await createPersonalEvent(database.db, clock, creator, {
			...validInput,
			locationId: 'manual',
			manualLocation: 'Courtyard table',
			latitude: 50,
			longitude: 7
		});
		if (!curated.ok || !manual.ok) throw new Error('Publication failed');
		await expect(getPublicEvent(database.db, clock, curated.eventId)).resolves.toMatchObject({
			location: { label: 'Campus Library', latitude: 50.6443, longitude: 7.2274 }
		});
		await expect(getPublicEvent(database.db, clock, manual.eventId)).resolves.toMatchObject({
			location: { label: 'Courtyard table', latitude: null, longitude: null }
		});
		expect(
			(await getEventAuthoringOptions(database.db)).locations.map((location) => location.label)
		).not.toContain('Courtyard table');
	});
	it('seeds authoring options idempotently without requiring Events or Users', async () => {
		using database = await createTestDatabase();
		await seedEventAuthoringOptions(database.db);
		await seedEventAuthoringOptions(database.db);
		const options = await getEventAuthoringOptions(database.db);
		expect(options.tags).toHaveLength(10);
		expect(options.locations).toHaveLength(5);
		await expect(
			discoverPublicEvents(database.db, createTestClock('2026-09-01T08:00:00Z'))
		).resolves.toEqual([]);
	});
	it.each([
		{
			start: '2026-12-02T18:00',
			end: '2026-12-02T20:00',
			utcStart: '2026-12-02T17:00:00Z',
			utcEnd: '2026-12-02T19:00:00Z',
			label: 'Wed, 2 Dec 2026, 18:00–20:00 CET'
		},
		{
			start: '2027-03-28T01:30',
			end: '2027-03-28T03:30',
			utcStart: '2027-03-28T00:30:00Z',
			utcEnd: '2027-03-28T01:30:00Z',
			label: 'Sun, 28 Mar 2027, 01:30 CET–03:30 CEST'
		},
		{
			start: '2026-10-25T01:30',
			end: '2026-10-25T03:30',
			utcStart: '2026-10-24T23:30:00Z',
			utcEnd: '2026-10-25T02:30:00Z',
			label: 'Sun, 25 Oct 2026, 01:30 CEST–03:30 CET'
		},
		{
			start: '2026-12-02T23:30',
			end: '2026-12-03T01:00',
			utcStart: '2026-12-02T22:30:00Z',
			utcEnd: '2026-12-03T00:00:00Z',
			label: 'Wed, 2 Dec 2026, 23:30–Thu, 3 Dec 2026, 01:00 CET'
		}
	])(
		'stores and presents Berlin time across $start and $end',
		async ({ start, end, utcStart, utcEnd, label }) => {
			using database = await createTestDatabase();
			const clock = createTestClock('2026-09-01T08:00:00Z');
			await seedEventAuthoringOptions(database.db);
			await insertUser(database.db, clock, creator);
			const result = await createPersonalEvent(database.db, clock, creator, {
				...validInput,
				startsAt: start,
				endsAt: end
			});
			if (!result.ok) throw new Error('Publication failed');
			await expect(getPublicEvent(database.db, clock, result.eventId)).resolves.toMatchObject({
				startsAt: new Date(utcStart),
				endsAt: new Date(utcEnd),
				exactTimeLabel: label
			});
		}
	);
});
