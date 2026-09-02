import { count } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { discoverPublicEvents } from '$lib/server/application/events';
import { event, location, tag, user } from '$lib/server/db/schema';
import { createTestClock } from '$lib/server/testing/clock';
import { createTestDatabase } from '$lib/server/testing/database';
import { seedPublicPersonalEvents } from './seed';

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
