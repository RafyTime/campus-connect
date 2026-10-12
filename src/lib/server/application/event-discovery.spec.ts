import { describe, expect, it } from 'vite-plus/test';
import { searchPublicEvents } from './events';
import { createTestClock } from '$lib/server/testing/clock';
import { createTestDatabase } from '$lib/server/testing/database';
import {
	insertGroup,
	insertPublicGroupEvent,
	insertPublicPersonalEvent
} from '$lib/server/fixtures';

describe('public Event filtering', () => {
	it.each([
		{
			date: '2026-09-02',
			before: '2026-09-01T21:59:59Z',
			first: '2026-09-01T22:00:00Z',
			last: '2026-09-02T21:59:59Z',
			after: '2026-09-02T22:00:00Z'
		},
		{
			date: '2026-03-29',
			before: '2026-03-28T22:59:59Z',
			first: '2026-03-28T23:00:00Z',
			last: '2026-03-29T21:59:59Z',
			after: '2026-03-29T22:00:00Z'
		},
		{
			date: '2026-10-25',
			before: '2026-10-24T21:59:59Z',
			first: '2026-10-24T22:00:00Z',
			last: '2026-10-25T22:59:59Z',
			after: '2026-10-25T23:00:00Z'
		}
	])(
		'uses the Europe/Berlin start date on $date, including DST boundaries',
		async ({ date, before, first, last, after }) => {
			using database = await createTestDatabase();
			const clock = createTestClock('2026-01-01T00:00:00Z');
			for (const [id, startsAt] of Object.entries({ before, first, last, after })) {
				await insertPublicPersonalEvent(database.db, clock, {
					id,
					title: id,
					startsAt: new Date(startsAt),
					endsAt: new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000)
				});
			}
			const result = await searchPublicEvents(database.db, clock, `date=${date}`);
			expect(result.events.map((event) => event.id)).toEqual(['first', 'last']);
			expect(result.count).toBe(2);
		}
	);
	it('combines Tags, Group, and host type with AND semantics', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		const author = { id: 'owner', name: 'Owner', email: 'owner@example.com' };
		for (const id of ['film', 'runners']) {
			await insertGroup(database.db, clock, {
				id,
				name: id,
				description: 'Campus Group',
				owner: author
			});
		}
		const social = { id: 'tag-social', name: 'Social' };
		for (const fixture of [
			{ id: 'film-social', groupId: 'film', tags: [social] },
			{ id: 'film-other-day', groupId: 'film', tags: [social] },
			{ id: 'film-study', groupId: 'film', tags: [{ id: 'tag-study', name: 'Study' }] },
			{ id: 'runners-social', groupId: 'runners', tags: [social] }
		]) {
			await insertPublicGroupEvent(database.db, clock, {
				...fixture,
				author,
				title: fixture.id,
				startsAt: new Date(
					fixture.id === 'film-other-day' ? '2026-09-01T12:00:00Z' : '2026-09-02T12:00:00Z'
				),
				endsAt: new Date('2026-09-02T14:00:00Z')
			});
		}
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'personal-social',
			title: 'Personal social',
			tags: [social],
			startsAt: new Date('2026-09-02T12:00:00Z'),
			endsAt: new Date('2026-09-02T14:00:00Z')
		});
		const combined = await searchPublicEvents(
			database.db,
			clock,
			'tag=tag-social&group=film&host=group&date=2026-09-02'
		);
		expect(combined.events.map((event) => event.id)).toEqual(['film-social']);
		expect(combined.count).toBe(1);
		const personal = await searchPublicEvents(database.db, clock, 'host=personal');
		expect(personal.events.map((event) => event.id)).toEqual(['personal-social']);
		const group = await searchPublicEvents(database.db, clock, 'host=group');
		expect(group.count).toBe(4);
		const conflicting = await searchPublicEvents(database.db, clock, 'group=film&host=personal');
		expect(conflicting.count).toBe(0);
	});
	it('matches any selected Tag once, orders by soonest start, and counts the results', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		const social = { id: 'tag-social', name: 'Social' };
		const study = { id: 'tag-study', name: 'Study' };
		for (const fixture of [
			{ id: 'later', tags: [study], startsAt: '2026-09-02T12:00:00Z' },
			{ id: 'both', tags: [social, study], startsAt: '2026-09-01T12:00:00Z' },
			{
				id: 'other',
				tags: [{ id: 'tag-sports', name: 'Sports' }],
				startsAt: '2026-09-01T10:00:00Z'
			}
		]) {
			await insertPublicPersonalEvent(database.db, clock, {
				...fixture,
				title: fixture.id,
				startsAt: new Date(fixture.startsAt),
				endsAt: new Date('2026-09-03T18:00:00Z')
			});
		}
		const result = await searchPublicEvents(database.db, clock, 'tag=tag-social&tag=tag-study');
		expect(result.events.map((event) => event.id)).toEqual(['both', 'later']);
		expect(result.count).toBe(2);
	});

	it('normalizes duplicate and unknown values, ignores malformed input, and retains scheduled rules', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		for (const fixture of [
			{ id: 'upcoming', startsAt: '2026-09-02T12:00:00Z', endsAt: '2026-09-02T14:00:00Z' },
			{ id: 'ongoing', startsAt: '2026-09-01T07:00:00Z', endsAt: '2026-09-01T09:00:00Z' },
			{ id: 'ended', startsAt: '2026-09-01T06:00:00Z', endsAt: '2026-09-01T08:00:00Z' },
			{
				id: 'cancelled',
				startsAt: '2026-09-02T12:00:00Z',
				endsAt: '2026-09-02T14:00:00Z',
				status: 'cancelled' as const
			}
		]) {
			await insertPublicPersonalEvent(database.db, clock, {
				...fixture,
				title: fixture.id,
				startsAt: new Date(fixture.startsAt),
				endsAt: new Date(fixture.endsAt)
			});
		}
		const result = await searchPublicEvents(
			database.db,
			clock,
			'tag=%20tag-fixture-social%20&tag=tag-fixture-social&tag=missing&group=missing&host=%20PERSONAL%20&date=2026-02-30'
		);
		expect(result.filters).toEqual({
			tagIds: ['tag-fixture-social'],
			date: '',
			groupId: '',
			hostType: 'personal'
		});
		expect(result.events.map((event) => event.id)).toEqual(['ongoing', 'upcoming']);
		expect(result.count).toBe(2);
		for (const input of [
			null,
			{ tag: ['tag-fixture-social'] },
			'tag=missing&date=garbage&host=alien',
			'date=2026-13-01'
		]) {
			const ignored = await searchPublicEvents(database.db, clock, input);
			expect(ignored.filters).toEqual({ tagIds: [], date: '', groupId: '', hostType: '' });
			expect(ignored.count).toBe(2);
		}
	});

	it('returns empty results and available filter options when no Events match', async () => {
		using database = await createTestDatabase();
		const clock = createTestClock('2026-09-01T08:00:00Z');
		await insertPublicPersonalEvent(database.db, clock, {
			id: 'upcoming',
			title: 'Upcoming Event',
			startsAt: new Date('2026-09-02T12:00:00Z'),
			endsAt: new Date('2026-09-02T14:00:00Z')
		});
		const result = await searchPublicEvents(database.db, clock, 'date=2026-09-03');
		expect(result.events).toEqual([]);
		expect(result.count).toBe(0);
		expect(result.options.tags).toEqual([{ id: 'tag-fixture-social', name: 'Social' }]);
	});
});
