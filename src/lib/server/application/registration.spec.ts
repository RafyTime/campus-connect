import { describe, expect, it } from 'vite-plus/test';
import { createTestDatabase } from '#lib/server/testing/database.js';
import { createTestClock } from '#lib/server/testing/clock.js';
import { insertPublicPersonalEvent, insertUser } from '#lib/server/fixtures.js';
import { discoverPublicEvents, getPublicEvent } from './events';
import { seedCampusConnect } from '#lib/server/seed.js';
import {
	getRegistrationState,
	listMyActivity,
	setInterest,
	setRegistration
} from './participation';

const clock = createTestClock('2026-10-20T12:00:00Z');
const explorer = { id: 'explorer', name: 'Explorer', email: 'explorer@example.com' };
const fixture = {
	id: 'registration',
	title: 'Campus workshop',
	responseMode: 'registration' as const,
	capacity: 1,
	tags: [],
	startsAt: new Date('2026-10-21T12:00:00Z'),
	endsAt: new Date('2026-10-21T14:00:00Z')
};

describe('limited Event registration', () => {
	it('registers once across retries, lists My activity, and frees capacity on repeated cancellation', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		for (let retry = 0; retry < 2; retry++)
			expect(await setRegistration(database.db, clock, explorer, fixture.id, true)).toEqual({
				ok: true,
				registered: true
			});
		expect(await getRegistrationState(database.db, clock, explorer, fixture.id)).toMatchObject({
			registered: true,
			capacity: 1,
			confirmed: 1,
			remaining: 0
		});
		expect((await listMyActivity(database.db, clock, explorer)).map((event) => event.id)).toEqual([
			fixture.id
		]);
		for (let retry = 0; retry < 2; retry++)
			expect(await setRegistration(database.db, clock, explorer, fixture.id, false)).toEqual({
				ok: true,
				registered: false
			});
		expect(await getRegistrationState(database.db, clock, explorer, fixture.id)).toMatchObject({
			registered: false,
			confirmed: 0,
			remaining: 1
		});
		expect(await listMyActivity(database.db, clock, explorer)).toEqual([]);
	});
	it('returns full for concurrent final-place attempts without changing the winner, then allows another User after cancellation', async () => {
		using database = await createTestDatabase();
		const other = { id: 'other', name: 'Other', email: 'other@example.com' };
		await insertUser(database.db, clock, explorer);
		await insertUser(database.db, clock, other);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		const actors = [explorer, other];
		const results = await Promise.all(
			actors.map((actor) => setRegistration(database.db, clock, actor, fixture.id, true))
		);
		expect(results.filter((result) => result.ok)).toHaveLength(1);
		expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, reason: 'full' }]);
		const winner = actors[results.findIndex((result) => result.ok)];
		const loser = actors[results.findIndex((result) => !result.ok)];
		expect(await getRegistrationState(database.db, clock, winner, fixture.id)).toMatchObject({
			registered: true,
			confirmed: 1,
			remaining: 0
		});
		expect(await listMyActivity(database.db, clock, loser)).toEqual([]);
		expect(await setRegistration(database.db, clock, winner, fixture.id, false)).toEqual({
			ok: true,
			registered: false
		});
		expect(await setRegistration(database.db, clock, loser, fixture.id, true)).toEqual({
			ok: true,
			registered: true
		});
	});
	it('rejects visitors, authors, wrong response modes, missing, cancelled, and ended Events for both operations', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		expect(await setRegistration(database.db, clock, null, fixture.id, true)).toEqual({
			ok: false,
			reason: 'unauthenticated'
		});
		for (const registered of [true, false]) {
			expect(
				await setRegistration(
					database.db,
					clock,
					{ id: 'user-fixture-author' },
					fixture.id,
					registered
				)
			).toEqual({ ok: false, reason: 'forbidden' });
			for (const responseMode of ['announcement', 'interest'] as const) {
				await insertPublicPersonalEvent(database.db, clock, {
					...fixture,
					id: responseMode,
					responseMode,
					capacity: null
				});
				expect(
					await setRegistration(database.db, clock, explorer, responseMode, registered)
				).toEqual({ ok: false, reason: 'response-mode' });
			}
			await insertPublicPersonalEvent(database.db, clock, {
				...fixture,
				id: 'cancelled',
				status: 'cancelled'
			});
			await insertPublicPersonalEvent(database.db, clock, {
				...fixture,
				id: 'ended',
				startsAt: new Date('2026-10-19T10:00:00Z'),
				endsAt: clock.now()
			});
			for (const id of ['missing', 'cancelled', 'ended'])
				expect(await setRegistration(database.db, clock, explorer, id, registered)).toEqual({
					ok: false,
					reason: 'not-available'
				});
		}
		expect(await listMyActivity(database.db, clock, explorer)).toEqual([]);
	});
	it('preserves registration and returns a recoverable result when persistence fails', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		await setRegistration(database.db, clock, explorer, fixture.id, true);
		await database.db.$client.execute(
			"CREATE TRIGGER reject_cancellation BEFORE DELETE ON participation BEGIN SELECT RAISE(ABORT, 'test failure'); END"
		);
		expect(await setRegistration(database.db, clock, explorer, fixture.id, false)).toEqual({
			ok: false,
			reason: 'unavailable'
		});
		expect(await getRegistrationState(database.db, clock, explorer, fixture.id)).toMatchObject({
			registered: true,
			confirmed: 1
		});
	});
	it('updates public capacity labels and combines interests with retained registration history in My activity', async () => {
		using database = await createTestDatabase();
		const localClock = createTestClock(clock.now());
		await insertUser(database.db, localClock, explorer);
		await insertPublicPersonalEvent(database.db, localClock, fixture);
		await setRegistration(database.db, localClock, explorer, fixture.id, true);
		expect(await getPublicEvent(database.db, localClock, fixture.id)).toMatchObject({
			capacityState: 'Full'
		});
		expect((await discoverPublicEvents(database.db, localClock))[0]).toMatchObject({
			capacityState: 'Full'
		});
		localClock.set(fixture.endsAt);
		expect((await listMyActivity(database.db, localClock, explorer))[0]).toMatchObject({
			participationKind: 'registration',
			status: 'ended'
		});
		await insertPublicPersonalEvent(database.db, localClock, { ...fixture, status: 'cancelled' });
		expect((await listMyActivity(database.db, localClock, explorer))[0]).toMatchObject({
			participationKind: 'registration',
			status: 'cancelled'
		});
		expect(await listMyActivity(database.db, localClock, { id: 'another-user' })).toEqual([]);
		await insertPublicPersonalEvent(database.db, localClock, {
			...fixture,
			id: 'interest',
			responseMode: 'interest',
			capacity: null,
			startsAt: new Date('2026-10-22T12:00:00Z'),
			endsAt: new Date('2026-10-22T14:00:00Z')
		});
		await setInterest(database.db, localClock, explorer, 'interest', true);
		expect(
			(await listMyActivity(database.db, localClock, explorer)).map(
				(event) => event.participationKind
			)
		).toEqual(['registration', 'interest']);
	});
	it('allows a Group member who is not the author and seeds capacity states idempotently', async () => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		await seedCampusConnect(database.db, clock);
		expect(
			await getRegistrationState(database.db, clock, { id: 'user-jonas' }, 'event-group-run')
		).toMatchObject({ capacity: 2, remaining: 1, registered: true });
		expect(
			await getRegistrationState(database.db, clock, null, 'event-full-workshop')
		).toMatchObject({ remaining: 0, confirmed: 1 });
		expect(
			await getRegistrationState(database.db, clock, null, 'event-stats-study-group')
		).toMatchObject({ remaining: 12, confirmed: 0 });
		expect(
			await setRegistration(database.db, clock, { id: 'user-lena' }, 'event-group-run', true)
		).toEqual({ ok: true, registered: true });
		expect(
			await setRegistration(database.db, clock, { id: 'user-mira' }, 'event-group-run', true)
		).toEqual({ ok: false, reason: 'forbidden' });
	});
});
