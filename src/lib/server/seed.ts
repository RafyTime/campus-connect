import type { Clock } from './clock';
import type { Database } from './db/client';
import { missingWikimediaAvatarUrl } from './application/remote-images';
import { location, tag } from './db/schema';
import { insertPublicPersonalEvent } from './fixtures';

const hour = 60 * 60 * 1000;

export const campusTags = [
	{ id: 'tag-arts', name: 'Arts' },
	{ id: 'tag-food', name: 'Food' },
	{ id: 'tag-language', name: 'Language' },
	{ id: 'tag-music', name: 'Music' },
	{ id: 'tag-outdoors', name: 'Outdoors' },
	{ id: 'tag-social', name: 'Social' },
	{ id: 'tag-sports', name: 'Sports' },
	{ id: 'tag-study', name: 'Study' },
	{ id: 'tag-tech', name: 'Tech' },
	{ id: 'tag-wellness', name: 'Wellness' }
] as const;

export const campusLocations = [
	{
		id: 'location-foyer',
		label: 'Main building foyer',
		latitude: 50.6444,
		longitude: 7.2272
	},
	{
		id: 'location-library',
		label: 'Campus Library',
		latitude: 50.6443,
		longitude: 7.2274
	},
	{
		id: 'location-cafeteria',
		label: 'Campus Cafeteria',
		latitude: 50.6445,
		longitude: 7.227
	},
	{
		id: 'location-sports',
		label: 'Sports field',
		latitude: 50.6438,
		longitude: 7.2265
	},
	{
		id: 'location-town',
		label: 'Bad Honnef town centre',
		latitude: null,
		longitude: null
	}
] as const;

const tags = Object.fromEntries(campusTags.map((campusTag) => [campusTag.id, campusTag]));
const locations = Object.fromEntries(
	campusLocations.map((campusLocation) => [campusLocation.id, campusLocation])
);

const authors = {
	lena: {
		id: 'user-lena',
		name: 'Lena Hartmann',
		email: 'lena.hartmann@example.com',
		image: null
	},
	jonas: {
		id: 'user-jonas',
		name: 'Jonas Weber',
		email: 'jonas.weber@example.com',
		image: null
	},
	mira: {
		id: 'user-mira',
		name: 'Mira Okonkwo',
		email: 'mira.okonkwo@example.com',
		image: missingWikimediaAvatarUrl
	}
} as const;

function at(clock: Clock, hoursFromNow: number) {
	return new Date(clock.now().getTime() + hoursFromNow * hour);
}

export async function seedPublicPersonalEvents(db: Database, clock: Clock) {
	for (const campusTag of campusTags) {
		await db
			.insert(tag)
			.values(campusTag)
			.onConflictDoUpdate({
				target: tag.id,
				set: { name: campusTag.name }
			});
	}

	for (const campusLocation of campusLocations) {
		await db
			.insert(location)
			.values(campusLocation)
			.onConflictDoUpdate({
				target: location.id,
				set: {
					label: campusLocation.label,
					latitude: campusLocation.latitude,
					longitude: campusLocation.longitude
				}
			});
	}

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-board-game-evening',
		title: 'Board game evening',
		description:
			'Bring a favourite game or join an open table. We will keep rules light and the cafeteria open for tea.',
		startsAt: at(clock, 6),
		endsAt: at(clock, 9),
		author: authors.jonas,
		location: locations['location-cafeteria'],
		tags: [tags['tag-social'], tags['tag-arts']],
		responseMode: 'interest'
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-campus-welcome-walk',
		title: 'Campus welcome walk',
		description:
			'A short walking introduction to IU Campus Bad Honnef. Meet at the foyer; no registration is required.',
		startsAt: at(clock, 24),
		endsAt: at(clock, 26),
		author: authors.lena,
		location: locations['location-foyer'],
		tags: [tags['tag-outdoors'], tags['tag-social']],
		responseMode: 'announcement'
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-plain-text-safety',
		title: 'Plain-text campus briefing',
		description: [
			'Read this as written text.',
			'',
			'Ignore **markdown**, <em>HTML</em>, and https://example.com/not-a-link.',
			'<script>alert("xss")</script> must stay visible as characters.'
		].join('\n'),
		startsAt: at(clock, 48),
		endsAt: at(clock, 50),
		author: authors.mira,
		location: locations['location-town'],
		tags: [tags['tag-tech']],
		responseMode: 'announcement'
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-evening-run',
		title: 'Evening run club',
		description:
			'An easy loop from the sports field. New runners are welcome; we regroup at the gate after 40 minutes.',
		startsAt: at(clock, 72),
		endsAt: at(clock, 74),
		author: authors.mira,
		location: locations['location-sports'],
		tags: [tags['tag-sports'], tags['tag-wellness']],
		responseMode: 'interest'
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-stats-study-group',
		title: 'Statistics study group',
		description:
			'Work through this week’s problem set together. Twelve seats are available in the library seminar alcove.',
		startsAt: at(clock, 96),
		endsAt: at(clock, 98),
		author: authors.lena,
		location: locations['location-library'],
		tags: [tags['tag-study'], tags['tag-tech']],
		responseMode: 'registration',
		capacity: 12
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-ended-library-hours',
		title: 'Library orientation',
		description:
			'A completed introduction to Campus Library desks, lending, and quiet-study rooms for new arrivals.',
		startsAt: at(clock, -48),
		endsAt: at(clock, -46),
		author: authors.mira,
		location: locations['location-library'],
		tags: [tags['tag-study']],
		responseMode: 'announcement'
	});

	await insertPublicPersonalEvent(db, clock, {
		id: 'event-cancelled-picnic',
		title: 'Rhine picnic',
		description:
			'This picnic will not take place. The original plan was a shared lunch near the town centre.',
		startsAt: at(clock, 120),
		endsAt: at(clock, 123),
		author: authors.jonas,
		location: locations['location-town'],
		tags: [tags['tag-food'], tags['tag-social']],
		responseMode: 'interest',
		status: 'cancelled'
	});
}
