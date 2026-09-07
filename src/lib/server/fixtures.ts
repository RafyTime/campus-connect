import { eq } from 'drizzle-orm';
import type { Clock } from './clock';
import type { Database } from './db/client';
import type { GroupMembershipRole } from './db/domain.schema';
import { event, eventTag, group, groupMembership, location, post, tag, user } from './db/schema';

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

export type GroupFixture = {
	id: string;
	name: string;
	description: string;
	imageUrl?: string | null;
	systemManaged?: boolean;
	owner: AuthorFixture;
	representative?: AuthorFixture;
	subscribers?: AuthorFixture[];
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

export type PublicGroupEventFixture = PublicPersonalEventFixture & {
	groupId: string;
	author: AuthorFixture;
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

export async function insertUser(db: Database, clock: Clock, fixture: AuthorFixture) {
	const now = clock.now();

	await db
		.insert(user)
		.values({
			id: fixture.id,
			name: fixture.name,
			email: fixture.email,
			image: fixture.image ?? null
		})
		.onConflictDoUpdate({
			target: user.id,
			set: {
				name: fixture.name,
				email: fixture.email,
				image: fixture.image ?? null,
				updatedAt: now
			}
		});
}

export async function insertGroup(db: Database, clock: Clock, fixture: GroupFixture) {
	const now = clock.now();
	const subscribers = fixture.subscribers ?? [];

	await insertUser(db, clock, fixture.owner);
	if (fixture.representative) {
		await insertUser(db, clock, fixture.representative);
	}
	for (const subscriber of subscribers) {
		await insertUser(db, clock, subscriber);
	}

	await db
		.insert(group)
		.values({
			id: fixture.id,
			name: fixture.name,
			description: fixture.description,
			imageUrl: fixture.imageUrl ?? null,
			systemManaged: fixture.systemManaged ?? false,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoUpdate({
			target: group.id,
			set: {
				name: fixture.name,
				description: fixture.description,
				imageUrl: fixture.imageUrl ?? null,
				systemManaged: fixture.systemManaged ?? false,
				updatedAt: now
			}
		});

	await db.delete(groupMembership).where(eq(groupMembership.groupId, fixture.id));

	const memberships: {
		userId: string;
		groupId: string;
		role: GroupMembershipRole;
	}[] = [{ userId: fixture.owner.id, groupId: fixture.id, role: 'owner' }];

	if (fixture.representative) {
		memberships.push({
			userId: fixture.representative.id,
			groupId: fixture.id,
			role: 'representative'
		});
	}

	for (const subscriber of subscribers) {
		memberships.push({
			userId: subscriber.id,
			groupId: fixture.id,
			role: 'subscriber'
		});
	}

	await db.insert(groupMembership).values(memberships);
}

export async function insertPublicPersonalEvent(
	db: Database,
	clock: Clock,
	fixture: PublicPersonalEventFixture
) {
	await insertPublicEvent(db, clock, fixture);
}

export async function insertPublicGroupEvent(
	db: Database,
	clock: Clock,
	fixture: PublicGroupEventFixture
) {
	await insertPublicEvent(db, clock, fixture);
}

async function insertPublicEvent(
	db: Database,
	clock: Clock,
	fixture: PublicPersonalEventFixture & { groupId?: string }
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
	const groupId = fixture.groupId ?? null;

	await insertUser(db, clock, author);

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
			groupId,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoUpdate({
			target: post.id,
			set: {
				title: fixture.title,
				authorId: author.id,
				groupId,
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
