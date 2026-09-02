import { eq } from 'drizzle-orm';
import type { Clock } from './clock';
import type { Database } from './db/client';
import { event, eventTag, location, post, tag, user } from './db/schema';

export type ResponseMode = 'announcement' | 'interest' | 'registration';
export type EventStatus = 'scheduled' | 'cancelled';

export type AuthorFixture = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
};

export type LocationFixture = {
	id: string;
	label: string;
	latitude?: number | null;
	longitude?: number | null;
};

export type TagFixture = {
	id: string;
	name: string;
};

export type PublicPersonalEventFixture = {
	id: string;
	title: string;
	startsAt: Date;
	endsAt: Date;
	description?: string;
	author?: AuthorFixture;
	location?: LocationFixture;
	tags?: TagFixture[];
	responseMode?: ResponseMode;
	capacity?: number | null;
	status?: EventStatus;
};

const defaultAuthor: AuthorFixture = {
	id: 'user-fixture-author',
	name: 'Fixture Author',
	email: 'fixture.author@example.com'
};

const defaultLocation: LocationFixture = {
	id: 'location-fixture-campus',
	label: 'Campus foyer'
};

const defaultTags: TagFixture[] = [{ id: 'tag-fixture-social', name: 'Social' }];

const defaultDescription = 'A campus Event for students and teachers at IU Campus Bad Honnef.';

export async function insertPublicPersonalEvent(
	db: Database,
	clock: Clock,
	fixture: PublicPersonalEventFixture
) {
	const now = clock.now();
	const author = fixture.author ?? defaultAuthor;
	const eventLocation = fixture.location ?? defaultLocation;
	const tags = fixture.tags ?? defaultTags;
	const responseMode = fixture.responseMode ?? 'announcement';
	const description = fixture.description ?? defaultDescription;
	const capacity = responseMode === 'registration' ? (fixture.capacity ?? 12) : null;
	const status = fixture.status ?? 'scheduled';
	const postId = `post-${fixture.id}`;

	await db
		.insert(user)
		.values({
			id: author.id,
			name: author.name,
			email: author.email,
			image: author.image ?? null
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				name: author.name,
				email: author.email,
				image: author.image ?? null,
				updatedAt: now
			}
		});

	await db
		.insert(location)
		.values({
			id: eventLocation.id,
			label: eventLocation.label,
			latitude: eventLocation.latitude ?? null,
			longitude: eventLocation.longitude ?? null
		})
		.onConflictDoUpdate({
			target: location.id,
			set: {
				label: eventLocation.label,
				latitude: eventLocation.latitude ?? null,
				longitude: eventLocation.longitude ?? null
			}
		});

	for (const tagValue of tags) {
		await db
			.insert(tag)
			.values({
				id: tagValue.id,
				name: tagValue.name
			})
			.onConflictDoUpdate({
				target: tag.id,
				set: { name: tagValue.name }
			});
	}

	await db
		.insert(post)
		.values({
			id: postId,
			title: fixture.title,
			authorId: author.id,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoUpdate({
			target: post.id,
			set: {
				title: fixture.title,
				authorId: author.id,
				updatedAt: now
			}
		});

	await db
		.insert(event)
		.values({
			id: fixture.id,
			postId,
			description,
			startsAt: fixture.startsAt,
			endsAt: fixture.endsAt,
			visibility: 'public',
			responseMode,
			capacity,
			status,
			locationId: eventLocation.id
		})
		.onConflictDoUpdate({
			target: event.id,
			set: {
				postId,
				description,
				startsAt: fixture.startsAt,
				endsAt: fixture.endsAt,
				visibility: 'public',
				responseMode,
				capacity,
				status,
				locationId: eventLocation.id
			}
		});

	await db.delete(eventTag).where(eq(eventTag.eventId, fixture.id));

	if (tags.length > 0) {
		await db.insert(eventTag).values(
			tags.map((tagValue) => ({
				eventId: fixture.id,
				tagId: tagValue.id
			}))
		);
	}
}
