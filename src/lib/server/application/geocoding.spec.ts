import { expect, it } from 'vite-plus/test';
import { createTestDatabase } from '#lib/server/testing/database.js';
import { createTestClock } from '#lib/server/testing/clock.js';
import { searchLocations, defaultGeocodingScope } from './geocoding';

it('normalizes and persistently caches searches before the global limiter', async () => {
	using database = await createTestDatabase();
	const clock = createTestClock('2026-09-01');
	let calls = 0;
	const provider = async () => {
		calls++;
		return [
			{
				display_name: 'Bonn station',
				lat: '50.73',
				lon: '7.1',
				address: { country_code: 'de' },
				secret: 'discard'
			}
		];
	};
	const first = await searchLocations(
		database.db,
		clock,
		{ id: 'creator' },
		'  BONN   station ',
		provider
	);
	expect(first).toMatchObject({
		ok: true,
		results: [{ label: 'Bonn station', latitude: 50.73, longitude: 7.1 }]
	});
	expect(
		await searchLocations(database.db, clock, { id: 'other' }, 'bonn station', provider)
	).toEqual(first);
	expect(calls).toBe(1);
	expect(await searchLocations(database.db, clock, { id: 'other' }, 'Cologne', provider)).toEqual({
		ok: false,
		reason: 'rate-limited'
	});
	clock.set('2026-09-01T00:00:01Z');
	expect(
		(
			await searchLocations(database.db, clock, { id: 'creator' }, 'bonn station', provider, {
				...defaultGeocodingScope,
				version: 'v2'
			})
		).ok
	).toBe(true);
	expect(calls).toBe(2);
});

it('filters malformed and out-of-region results, limits fields and never searches anonymously', async () => {
	using database = await createTestDatabase();
	const clock = createTestClock('2026-09-01');
	const valid = {
		display_name: 'Bonn',
		lat: '50.73',
		lon: '7.1',
		address: { country_code: 'de' },
		secret: 'hidden'
	};
	const provider = async () => [
		{ ...valid, address: { country_code: 'fr' } },
		{ ...valid, lat: '52' },
		{ ...valid, lon: '' },
		...Array.from({ length: 8 }, () => valid)
	];
	expect(await searchLocations(database.db, clock, null, 'Bonn', provider)).toEqual({
		ok: false,
		reason: 'unauthenticated'
	});
	const result = await searchLocations(database.db, clock, { id: 'creator' }, 'Bonn', provider);
	if (!result.ok) throw new Error('Search failed');
	expect(result.results).toHaveLength(5);
	expect(Object.keys(result.results[0]).sort()).toEqual(['id', 'label', 'latitude', 'longitude']);
});

it.each(['error', 'invalid', 'empty'] as const)(
	'handles provider %s and retains the throttle',
	async (kind) => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01');
		const provider = async () => {
			if (kind === 'error') throw new Error('timeout');
			return kind === 'empty' ? [] : {};
		};
		expect(await searchLocations(database.db, clock, { id: 'creator' }, 'Bonn', provider)).toEqual(
			kind === 'empty' ? { ok: true, results: [] } : { ok: false, reason: 'unavailable' }
		);
		expect(
			await searchLocations(database.db, clock, { id: 'creator' }, 'Cologne', provider)
		).toEqual({ ok: false, reason: 'rate-limited' });
	}
);

it('persists selected server coordinates through publication and editing, and allows manual fallback', async () => {
	const { seedEventAuthoringOptions } = await import('#lib/server/seed.js');
	const { insertUser } = await import('#lib/server/fixtures.js');
	const { createEvent, editEvent, getEventForManagement } = await import('./event-authoring');
	const { getPublicEvent } = await import('./events');
	using database = await createTestDatabase();
	const clock = createTestClock('2026-09-01');
	const actor = { id: 'creator', name: 'Creator', email: 'creator@example.com' };
	await insertUser(database.db, clock, actor);
	await seedEventAuthoringOptions(database.db);
	const search = await searchLocations(database.db, clock, actor, 'Bonn', async () => [
		{ display_name: 'Bonn', lat: '50.73', lon: '7.1', address: { country_code: 'de' } }
	]);
	if (!search.ok) throw new Error('Search failed');
	const input = {
		title: 'Coding evening',
		description: 'Bring a laptop and build something together.',
		startsAt: '2026-09-02T18:00',
		endsAt: '2026-09-02T20:00',
		tagIds: ['tag-tech'],
		responseMode: 'announcement',
		capacity: '',
		locationId: search.results[0].id,
		manualLocation: '',
		latitude: 0
	};
	const created = await createEvent(database.db, clock, actor, input);
	if (!created.ok) throw new Error('Publication failed');
	expect(await getPublicEvent(database.db, clock, created.eventId)).toMatchObject({
		location: { label: 'Bonn', latitude: 50.73, longitude: 7.1 }
	});
	expect(await editEvent(database.db, clock, actor, created.eventId, input)).toMatchObject({
		ok: true
	});
	expect(await getEventForManagement(database.db, clock, actor, created.eventId)).toMatchObject({
		ok: true,
		event: { locationId: input.locationId }
	});
	expect(
		await createEvent(database.db, clock, actor, { ...input, locationId: 'geocode:forged' })
	).toMatchObject({ ok: false, reason: 'invalid' });
	const manual = await createEvent(database.db, clock, actor, {
		...input,
		locationId: 'manual',
		manualLocation: 'Courtyard'
	});
	if (!manual.ok) throw new Error('Manual publication failed');
	expect(await getPublicEvent(database.db, clock, manual.eventId)).toMatchObject({
		location: { latitude: null, longitude: null }
	});
});

it('supports idempotent deterministic cache fixtures without provider traffic', async () => {
	const { seedGeocodingCache } = await import('#lib/server/testing/geocoding.js');
	using database = await createTestDatabase();
	await seedGeocodingCache(database.db);
	await seedGeocodingCache(database.db);
	const result = await searchLocations(
		database.db,
		createTestClock('2026-09-01'),
		{ id: 'creator' },
		'Bonn fixture',
		async () => {
			throw new Error('Cache must avoid provider');
		}
	);
	expect(result).toMatchObject({ ok: true, results: [{ id: 'geocode:bonn-fixture' }] });
});
