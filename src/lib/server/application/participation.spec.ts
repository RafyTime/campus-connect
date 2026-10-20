import { describe, expect, it } from 'vite-plus/test';
import { and, eq } from 'drizzle-orm';
import { participation } from '#lib/server/db/schema.js';
import { seedCampusConnect } from '#lib/server/seed.js';
import { createTestDatabase } from '#lib/server/testing/database.js';
import { createTestClock } from '#lib/server/testing/clock.js';
import { insertPublicPersonalEvent, insertUser } from '#lib/server/fixtures.js';
import { getInterestState, listMyActivity, setInterest } from './participation';

const clock = createTestClock('2026-10-20T12:00:00Z');
const explorer = { id: 'explorer', name: 'Explorer', email: 'explorer@example.com' };
const fixture = {
	id: 'interest',
	title: 'Campus games',
	responseMode: 'interest' as const,
	startsAt: new Date('2026-10-21T12:00:00Z'),
	endsAt: new Date('2026-10-21T14:00:00Z')
};

describe('interest and My activity', () => {
	it('records one interest across retries and withdraws idempotently', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		expect(await listMyActivity(database.db, clock, explorer)).toEqual([]);
		for (let retry = 0; retry < 2; retry++) {
			expect(await setInterest(database.db, clock, explorer, fixture.id, true)).toEqual({
				ok: true,
				interested: true
			});
		}
		expect(await getInterestState(database.db, clock, explorer, fixture.id)).toMatchObject({
			interested: true,
			available: true
		});
		expect((await listMyActivity(database.db, clock, explorer)).map((event) => event.id)).toEqual([
			'interest'
		]);
		for (let retry = 0; retry < 2; retry++) {
			expect(await setInterest(database.db, clock, explorer, fixture.id, false)).toEqual({
				ok: true,
				interested: false
			});
		}
		expect(await listMyActivity(database.db, clock, explorer)).toEqual([]);
	});
});

describe('Participation rules', () => {
	it('enforces the User and Event uniqueness constraint and distinguishes registration', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		await setInterest(database.db, clock, explorer, fixture.id, true);
		await expect(
			database.db.insert(participation).values({
				userId: explorer.id,
				eventId: fixture.id,
				kind: 'registration',
				createdAt: clock.now()
			})
		).rejects.toThrow();
		expect(await database.db.select().from(participation)).toMatchObject([{ kind: 'interest' }]);
	});
	it('rejects visitors, authors, other response modes, missing, cancelled, and ended Events', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		expect(await setInterest(database.db, clock, null, fixture.id, true)).toEqual({
			ok: false,
			reason: 'unauthenticated'
		});
		for (const interested of [true, false]) {
			expect(
				await setInterest(database.db, clock, { id: 'user-fixture-author' }, fixture.id, interested)
			).toEqual({ ok: false, reason: 'forbidden' });
			expect(await setInterest(database.db, clock, explorer, 'missing', interested)).toEqual({
				ok: false,
				reason: 'not-available'
			});
			for (const responseMode of ['announcement', 'registration'] as const) {
				await insertPublicPersonalEvent(database.db, clock, {
					...fixture,
					id: responseMode,
					responseMode
				});
				expect(await setInterest(database.db, clock, explorer, responseMode, interested)).toEqual({
					ok: false,
					reason: 'response-mode'
				});
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
			for (const id of ['cancelled', 'ended'])
				expect(await setInterest(database.db, clock, explorer, id, interested)).toEqual({
					ok: false,
					reason: 'not-available'
				});
		}
		expect(await database.db.select().from(participation)).toEqual([]);
	});
	it('allows owners and representatives when they are not the author and retains history only for its User', async () => {
		using database = await createTestDatabase();
		await seedCampusConnect(database.db, clock);
		expect(
			await setInterest(database.db, clock, { id: 'user-lena' }, 'event-film-night', true)
		).toEqual({ ok: true, interested: true });
		expect(
			await setInterest(database.db, clock, { id: 'user-jonas' }, 'event-evening-run', true)
		).toEqual({ ok: true, interested: true });
		expect(
			await setInterest(database.db, clock, { id: 'user-jonas' }, 'event-film-night', true)
		).toEqual({ ok: false, reason: 'forbidden' });
		const activity = await listMyActivity(database.db, clock, { id: 'user-lena' });
		expect(activity.map((event) => event.id)).toEqual([
			'event-board-game-evening',
			'event-film-night'
		]);
		expect(await listMyActivity(database.db, clock, explorer)).toEqual([]);
	});
	it('keeps cancelled and ended interests linked and sorted without accepting new mutations', async () => {
		using database = await createTestDatabase();
		const localClock = createTestClock(clock.now());
		await insertUser(database.db, localClock, explorer);
		await insertPublicPersonalEvent(database.db, localClock, fixture);
		await setInterest(database.db, localClock, explorer, fixture.id, true);
		localClock.set(fixture.endsAt);
		expect((await listMyActivity(database.db, localClock, explorer))[0]).toMatchObject({
			id: fixture.id,
			status: 'ended'
		});
		await insertPublicPersonalEvent(database.db, localClock, { ...fixture, status: 'cancelled' });
		expect((await listMyActivity(database.db, localClock, explorer))[0]).toMatchObject({
			id: fixture.id,
			status: 'cancelled'
		});
		expect(await setInterest(database.db, localClock, explorer, fixture.id, false)).toEqual({
			ok: false,
			reason: 'not-available'
		});
	});
	it('returns a recoverable failure without losing interest when persistence fails', async () => {
		using database = await createTestDatabase();
		await insertUser(database.db, clock, explorer);
		await insertPublicPersonalEvent(database.db, clock, fixture);
		await setInterest(database.db, clock, explorer, fixture.id, true);
		await database.db.$client.execute(
			"CREATE TRIGGER reject_withdrawal BEFORE DELETE ON participation BEGIN SELECT RAISE(ABORT, 'test failure'); END"
		);
		expect(await setInterest(database.db, clock, explorer, fixture.id, false)).toEqual({
			ok: false,
			reason: 'unavailable'
		});
		expect(await getInterestState(database.db, clock, explorer, fixture.id)).toMatchObject({
			interested: true
		});
		expect(
			await database.db
				.select()
				.from(participation)
				.where(and(eq(participation.userId, explorer.id), eq(participation.eventId, fixture.id)))
		).toHaveLength(1);
	});
});
