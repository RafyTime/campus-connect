import { describe, expect, it } from 'vite-plus/test';
import { createTestDatabase } from '#lib/server/testing/database.js';
import { createTestClock } from '#lib/server/testing/clock.js';
import { insertUser } from '#lib/server/fixtures.js';
import { seedEventAuthoringOptions, seedCampusConnect } from '#lib/server/seed.js';
import {
	createEvent,
	editEvent,
	getEventForManagement,
	cancelEvent,
	listMyEvents
} from './event-authoring';
import { getPublicEvent, discoverPublicEvents } from './events';
import {
	setInterest,
	setRegistration,
	listMyActivity,
	getRegistrationState
} from './participation';

const creator = { id: 'creator', name: 'Creator', email: 'creator@example.com' };
const explorer = { id: 'explorer', name: 'Explorer', email: 'explorer@example.com' };
const input = {
	title: 'Campus coding evening',
	description: 'Bring a laptop and build something together.',
	startsAt: '2026-09-02T18:00',
	endsAt: '2026-09-02T20:00',
	tagIds: ['tag-tech'],
	responseMode: 'registration' as const,
	capacity: '3',
	locationId: 'location-library',
	manualLocation: ''
};
async function setup(responseMode: 'registration' | 'interest' = 'registration', manual = false) {
	const database = await createTestDatabase();
	const clock = createTestClock('2026-09-01T08:00:00Z');
	await seedEventAuthoringOptions(database.db);
	await insertUser(database.db, clock, creator);
	await insertUser(database.db, clock, explorer);
	const values = {
		...input,
		responseMode,
		capacity: responseMode === 'registration' ? '3' : '',
		...(manual ? { locationId: 'manual', manualLocation: 'Library garden' } : {})
	};
	const created = await createEvent(database.db, clock, creator, values);
	if (!created.ok) throw new Error('Publication failed');
	return { database, clock, values, id: created.eventId };
}

describe('Event lifecycle', () => {
	it.each(['registration', 'interest'] as const)(
		'locks sensitive fields once %s exists, preserving the complete Event on conflicts',
		async (mode) => {
			const { database, clock, values, id } = await setup(mode);
			using _disposal = database;
			expect(
				await (mode === 'registration'
					? setRegistration(database.db, clock, explorer, id, true)
					: setInterest(database.db, clock, explorer, id, true))
			).toMatchObject({ ok: true });
			const before = await getPublicEvent(database.db, clock, id);
			for (const change of [
				{ startsAt: '2026-09-02T17:00' },
				{ endsAt: '2026-09-02T21:00' },
				{ responseMode: 'announcement', capacity: '' },
				{ locationId: 'location-foyer' },
				{ locationId: 'manual', manualLocation: 'Library garden' }
			]) {
				expect(
					await editEvent(database.db, clock, creator, id, {
						...values,
						...change,
						title: 'Must not be saved'
					})
				).toMatchObject({ ok: false, reason: 'locked-fields' });
				expect(await getPublicEvent(database.db, clock, id)).toEqual(before);
			}
			expect(
				await editEvent(database.db, clock, creator, id, {
					...values,
					title: 'Updated coding evening',
					description: 'The updated description for the coding evening.',
					tagIds: ['tag-social'],
					...(mode === 'registration' ? { capacity: '4' } : {})
				})
			).toMatchObject({ ok: true });
			expect(await getPublicEvent(database.db, clock, id)).toMatchObject({
				title: 'Updated coding evening',
				tags: [{ id: 'tag-social' }]
			});
			expect(await getEventForManagement(database.db, clock, creator, id)).toMatchObject({
				ok: true,
				event: { participationLocked: true }
			});
		}
	);
	it('allows capacity decreases before Participation, then only unchanged or increased capacity', async () => {
		const { database, clock, values, id } = await setup();
		using _disposal = database;
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, capacity: '2' })
		).toMatchObject({ ok: true });
		await setRegistration(database.db, clock, explorer, id, true);
		const other = { id: 'other', name: 'Other', email: 'other@example.com' };
		await insertUser(database.db, clock, other);
		await setRegistration(database.db, clock, other, id, true);
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, capacity: '1' })
		).toMatchObject({ ok: false, reason: 'capacity-conflict' });
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, capacity: '2' })
		).toMatchObject({ ok: true });
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, capacity: '4' })
		).toMatchObject({ ok: true });
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, capacity: '3' })
		).toMatchObject({ ok: false, reason: 'capacity-conflict' });
		expect(await getRegistrationState(database.db, clock, explorer, id)).toMatchObject({
			capacity: 4,
			confirmed: 2,
			remaining: 2
		});
	});
	it('preserves an unchanged plain-text Location after Participation and rejects a changed label', async () => {
		const { database, clock, values, id } = await setup('interest', true);
		using _disposal = database;
		await setInterest(database.db, clock, explorer, id, true);
		expect(
			await editEvent(database.db, clock, creator, id, { ...values, title: 'New garden gathering' })
		).toMatchObject({ ok: true });
		expect(
			await editEvent(database.db, clock, creator, id, {
				...values,
				manualLocation: 'Different garden'
			})
		).toMatchObject({ ok: false, reason: 'locked-fields' });
		expect(await getPublicEvent(database.db, clock, id)).toMatchObject({
			locationLabel: 'Library garden'
		});
	});

	it.each(['interest', 'registration'] as const)(
		'cancellation is final and retains %s history through direct and personal views',
		async (mode) => {
			const { database, clock, values, id } = await setup(mode);
			using _disposal = database;
			await (mode === 'registration'
				? setRegistration(database.db, clock, explorer, id, true)
				: setInterest(database.db, clock, explorer, id, true));
			expect(await cancelEvent(database.db, clock, null, id)).toEqual({
				ok: false,
				reason: 'unauthenticated'
			});
			expect(await cancelEvent(database.db, clock, explorer, id)).toEqual({
				ok: false,
				reason: 'forbidden'
			});
			expect(await cancelEvent(database.db, clock, creator, 'missing')).toEqual({
				ok: false,
				reason: 'not-found'
			});
			expect(await cancelEvent(database.db, clock, creator, id)).toEqual({ ok: true, eventId: id });
			expect(await cancelEvent(database.db, clock, creator, id)).toEqual({
				ok: false,
				reason: 'cancelled'
			});
			expect(await editEvent(database.db, clock, creator, id, values)).toEqual({
				ok: false,
				reason: 'cancelled'
			});
			expect(await getPublicEvent(database.db, clock, id)).toMatchObject({
				title: values.title,
				status: 'cancelled'
			});
			expect(await discoverPublicEvents(database.db, clock)).toEqual([]);
			expect(await listMyActivity(database.db, clock, explorer)).toMatchObject([
				{ id, status: 'cancelled', participationKind: mode }
			]);
			expect(await listMyEvents(database.db, clock, creator)).toMatchObject([
				{ id, status: 'cancelled' }
			]);
			for (const joining of [true, false]) {
				expect(
					await (mode === 'registration'
						? setRegistration(database.db, clock, explorer, id, joining)
						: setInterest(database.db, clock, explorer, id, joining))
				).toEqual({ ok: false, reason: 'not-available' });
			}
			expect(await listMyActivity(database.db, clock, explorer)).toHaveLength(1);
		}
	);
	it('becomes read-only exactly at the end, preserving Participation history', async () => {
		const { database, clock, values, id } = await setup();
		using _disposal = database;
		await setRegistration(database.db, clock, explorer, id, true);
		clock.set('2026-09-02T18:00:00Z');
		expect(await editEvent(database.db, clock, creator, id, values)).toEqual({
			ok: false,
			reason: 'ended'
		});
		expect(await cancelEvent(database.db, clock, creator, id)).toEqual({
			ok: false,
			reason: 'ended'
		});
		expect(await listMyActivity(database.db, clock, explorer)).toMatchObject([
			{ id, status: 'ended' }
		]);
		expect(await listMyEvents(database.db, clock, creator)).toMatchObject([
			{ id, status: 'ended' }
		]);
		expect(await getPublicEvent(database.db, clock, id)).toMatchObject({ status: 'ended' });
		expect(await discoverPublicEvents(database.db, clock)).toEqual([]);
	});
	it.each(['user-lena', 'user-jonas'])(
		'allows a current Group manager %s to cancel, while rejecting other Users and Campus Updates',
		async (id) => {
			using database = await createTestDatabase();
			const clock = createTestClock('2026-09-01T08:00:00Z');
			await seedCampusConnect(database.db, clock);
			for (const actor of ['user-sofia', 'user-mira']) {
				expect(await cancelEvent(database.db, clock, { id: actor }, 'event-film-night')).toEqual({
					ok: false,
					reason: 'forbidden'
				});
			}
			expect(
				await cancelEvent(database.db, clock, { id: 'user-campus-office' }, 'event-campus-briefing')
			).toEqual({ ok: false, reason: 'forbidden' });
			expect(await cancelEvent(database.db, clock, { id }, 'event-film-night')).toMatchObject({
				ok: true
			});
			expect(await listMyActivity(database.db, clock, { id: 'user-lena' })).toHaveLength(1);
		}
	);
	it('serializes cancellation with a new registration so history is either retained or the join is rejected', async () => {
		const { database, clock, id } = await setup();
		using _disposal = database;
		const [joined, cancelled] = await Promise.all([
			setRegistration(database.db, clock, explorer, id, true),
			cancelEvent(database.db, clock, creator, id)
		]);
		expect(cancelled).toMatchObject({ ok: true });
		expect(joined.ok || joined.reason === 'not-available').toBe(true);
		const history = await listMyActivity(database.db, clock, explorer);
		expect(history).toHaveLength(joined.ok ? 1 : 0);
		if (joined.ok) expect(history[0]).toMatchObject({ status: 'cancelled' });
		expect(await setRegistration(database.db, clock, explorer, id, true)).toEqual({
			ok: false,
			reason: 'not-available'
		});
	});
	it('allows descriptive edits of participated Events whose stored schedule includes seconds without changing that schedule', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:30Z');
		await seedCampusConnect(database.db, clock);
		const before = await getPublicEvent(database.db, clock, 'event-board-game-evening');
		const managed = await getEventForManagement(
			database.db,
			clock,
			{ id: 'user-jonas' },
			'event-board-game-evening'
		);
		if (!managed.ok) throw new Error('Management failed');
		expect(
			await editEvent(database.db, clock, { id: 'user-jonas' }, 'event-board-game-evening', {
				...managed.event,
				title: 'Updated board game evening'
			})
		).toMatchObject({ ok: true });
		clock.set('2026-09-01T17:00:15Z');
		expect(
			await editEvent(database.db, clock, { id: 'user-jonas' }, 'event-board-game-evening', {
				...managed.event,
				title: 'Updated board game evening'
			})
		).toMatchObject({ ok: true });
		expect(await getPublicEvent(database.db, clock, 'event-board-game-evening')).toMatchObject({
			title: 'Updated board game evening',
			startsAt: before?.startsAt,
			endsAt: before?.endsAt
		});
	});
});
