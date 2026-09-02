import { describe, expect, it } from 'vitest';
import { discoverPublicEvents, getPublicEvent } from './events';
import { createTestClock } from '$lib/server/testing/clock';
import { createTestDatabase } from '$lib/server/testing/database';
import { insertPublicPersonalEvent } from '$lib/server/fixtures';

const campusNow = '2026-09-01T08:00:00.000Z';

describe('public Event discovery', () => {
	it('returns no Events when the feed is empty', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await expect(discoverPublicEvents(database.db, clock)).resolves.toEqual([]);
	});

	it('lists scheduled public personal Events by soonest start', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-later',
			title: 'Campus choir rehearsal',
			startsAt: new Date('2026-09-03T16:00:00.000Z'),
			endsAt: new Date('2026-09-03T18:00:00.000Z')
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-sooner',
			title: 'Board game evening',
			startsAt: new Date('2026-09-01T17:00:00.000Z'),
			endsAt: new Date('2026-09-01T20:00:00.000Z')
		});

		const events = await discoverPublicEvents(database.db, clock);

		expect(events.map((event) => event.id)).toEqual(['event-sooner', 'event-later']);
	});

	it('summarizes time, host, Location, Tags, response mode, and capacity state', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-stats-group',
			title: 'Statistics study group',
			startsAt: new Date('2026-09-01T12:00:00.000Z'),
			endsAt: new Date('2026-09-01T14:00:00.000Z'),
			author: {
				id: 'user-lena',
				name: 'Lena Hartmann',
				email: 'lena.hartmann@example.com'
			},
			location: {
				id: 'location-library',
				label: 'Campus Library'
			},
			tags: [
				{ id: 'tag-study', name: 'Study' },
				{ id: 'tag-social', name: 'Social' }
			],
			responseMode: 'registration',
			capacity: 12
		});

		await expect(discoverPublicEvents(database.db, clock)).resolves.toEqual([
			{
				id: 'event-stats-group',
				title: 'Statistics study group',
				startsAt: new Date('2026-09-01T12:00:00.000Z'),
				endsAt: new Date('2026-09-01T14:00:00.000Z'),
				scheduleLabel: 'Tue, 1 Sept 2026, 14:00–16:00',
				host: {
					id: 'user-lena',
					displayName: 'Lena Hartmann',
					imageUrl: null,
					imageAttribution: null,
					initials: 'LH'
				},
				locationLabel: 'Campus Library',
				tags: [
					{ id: 'tag-social', name: 'Social' },
					{ id: 'tag-study', name: 'Study' }
				],
				responseMode: 'registration',
				capacityState: '12 places remaining',
				status: 'scheduled'
			}
		]);
	});

	it('omits ended and cancelled Events from Discover', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-upcoming',
			title: 'Campus welcome walk',
			startsAt: new Date('2026-09-02T08:00:00.000Z'),
			endsAt: new Date('2026-09-02T10:00:00.000Z')
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-ended',
			title: 'Yesterday library hours',
			startsAt: new Date('2026-08-31T08:00:00.000Z'),
			endsAt: new Date('2026-08-31T10:00:00.000Z')
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-cancelled',
			title: 'Cancelled picnic',
			startsAt: new Date('2026-09-04T10:00:00.000Z'),
			endsAt: new Date('2026-09-04T13:00:00.000Z'),
			status: 'cancelled'
		});

		const events = await discoverPublicEvents(database.db, clock);

		expect(events.map((event) => event.id)).toEqual(['event-upcoming']);
	});
});

describe('public Event detail', () => {
	it('returns the full Event for a public personal record', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		const description = [
			'Meet at the foyer.',
			'',
			'Bring **notes**, visit https://example.com/plan, and ignore <em>markup</em>.'
		].join('\n');

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-welcome-walk',
			title: 'Campus welcome walk',
			description,
			startsAt: new Date('2026-09-01T12:00:00.000Z'),
			endsAt: new Date('2026-09-01T14:00:00.000Z'),
			author: {
				id: 'user-lena',
				name: 'Lena Hartmann',
				email: 'lena.hartmann@example.com'
			},
			location: {
				id: 'location-foyer',
				label: 'Main building foyer'
			},
			tags: [{ id: 'tag-outdoors', name: 'Outdoors' }],
			responseMode: 'announcement'
		});

		await expect(getPublicEvent(database.db, clock, 'event-welcome-walk')).resolves.toEqual({
			id: 'event-welcome-walk',
			title: 'Campus welcome walk',
			startsAt: new Date('2026-09-01T12:00:00.000Z'),
			endsAt: new Date('2026-09-01T14:00:00.000Z'),
			scheduleLabel: 'Tue, 1 Sept 2026, 14:00–16:00',
			exactTimeLabel: 'Tue, 1 Sept 2026, 14:00–16:00 CEST',
			description,
			host: {
				id: 'user-lena',
				displayName: 'Lena Hartmann',
				imageUrl: null,
				imageAttribution: null,
				initials: 'LH'
			},
			locationLabel: 'Main building foyer',
			tags: [{ id: 'tag-outdoors', name: 'Outdoors' }],
			responseMode: 'announcement',
			capacityState: 'Announcement',
			status: 'scheduled'
		});
	});

	it('returns null when the Event does not exist', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await expect(getPublicEvent(database.db, clock, 'event-missing')).resolves.toBeNull();
	});

	it('still returns ended and cancelled Events with their current status', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-ended',
			title: 'Yesterday library hours',
			startsAt: new Date('2026-08-31T08:00:00.000Z'),
			endsAt: new Date('2026-08-31T10:00:00.000Z')
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-cancelled',
			title: 'Cancelled picnic',
			startsAt: new Date('2026-09-04T10:00:00.000Z'),
			endsAt: new Date('2026-09-04T13:00:00.000Z'),
			status: 'cancelled'
		});

		await expect(getPublicEvent(database.db, clock, 'event-ended')).resolves.toMatchObject({
			id: 'event-ended',
			status: 'ended'
		});
		await expect(getPublicEvent(database.db, clock, 'event-cancelled')).resolves.toMatchObject({
			id: 'event-cancelled',
			status: 'cancelled'
		});
	});

	it('keeps only constrained remote host images and attaches required attribution', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock(campusNow);
		const wikimediaPortrait =
			'https://upload.wikimedia.org/wikipedia/commons/5/57/Man_silhouette.svg';

		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-attributed-host',
			title: 'Attributed host Event',
			startsAt: new Date('2026-09-02T08:00:00.000Z'),
			endsAt: new Date('2026-09-02T10:00:00.000Z'),
			author: {
				id: 'user-mira',
				name: 'Mira Okonkwo',
				email: 'mira.okonkwo@example.com',
				image: wikimediaPortrait
			}
		});
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'event-blocked-host',
			title: 'Blocked host Event',
			startsAt: new Date('2026-09-03T08:00:00.000Z'),
			endsAt: new Date('2026-09-03T10:00:00.000Z'),
			author: {
				id: 'user-jonas',
				name: 'Jonas Weber',
				email: 'jonas.weber@example.com',
				image: 'https://example.com/jonas.png'
			}
		});

		await expect(
			getPublicEvent(database.db, clock, 'event-attributed-host')
		).resolves.toMatchObject({
			host: {
				displayName: 'Mira Okonkwo',
				imageUrl: wikimediaPortrait,
				imageAttribution: 'Man silhouette by Liftarn, CC BY-SA 2.5, via Wikimedia Commons',
				initials: 'MO'
			}
		});
		await expect(getPublicEvent(database.db, clock, 'event-blocked-host')).resolves.toMatchObject({
			host: {
				displayName: 'Jonas Weber',
				imageUrl: null,
				imageAttribution: null,
				initials: 'JW'
			}
		});
	});
});
