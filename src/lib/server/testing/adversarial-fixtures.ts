import { eq } from 'drizzle-orm';
import { missingWikimediaAvatarUrl } from '#lib/server/application/remote-images.js';
import { campusLocations, campusTags } from '#lib/server/campus-catalog.js';
import type { Clock } from '#lib/server/clock.js';
import type { Database } from '#lib/server/db/index.js';
import { group } from '#lib/server/db/schema.js';
import { insertPublicPersonalEvent, insertUser } from '#lib/server/fixtures.js';
import { demonstrationAuthors } from '#lib/server/seed.js';

const hour = 60 * 60 * 1000;

/**
 * Failure and security examples kept out of the public demonstration.
 * Deliberately resets its records: run it only against a disposable database after the seed.
 */
export async function seedAdversarialFixtures(db: Database, clock: Clock) {
	const mira = { ...demonstrationAuthors.mira, image: missingWikimediaAvatarUrl };
	await insertUser(db, clock, mira);

	const brokenImageGroups = await db
		.update(group)
		.set({ imageUrl: missingWikimediaAvatarUrl })
		.where(eq(group.id, 'group-campus-runners'))
		.returning({ id: group.id });
	if (brokenImageGroups.length !== 1) {
		throw new Error('Run the seed before adversarial fixtures: group-campus-runners is missing');
	}

	const town = campusLocations.find(({ id }) => id === 'location-town');
	const tech = campusTags.find(({ id }) => id === 'tag-tech');
	if (!town || !tech) throw new Error('Campus catalog lacks location-town or tag-tech');

	const startsAt = new Date(clock.now().getTime() + 48 * hour);
	await insertPublicPersonalEvent(db, clock, {
		id: 'event-plain-text-safety',
		title: 'Plain-text campus briefing',
		description: [
			'Read this as written text.',
			'',
			'Ignore **markdown**, <em>HTML</em>, and https://example.com/not-a-link.',
			'<script>alert("xss")</script> must stay visible as characters.'
		].join('\n'),
		startsAt,
		endsAt: new Date(startsAt.getTime() + 2 * hour),
		author: mira,
		location: town,
		tags: [tech],
		responseMode: 'announcement'
	});
}
