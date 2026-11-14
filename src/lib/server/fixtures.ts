import { eq } from 'drizzle-orm';
import type { Clock } from './clock';
import type { Database } from './db/client';
import type { GroupMembershipRole } from './db/domain.schema';
import {
	event,
	eventTag,
	group,
	groupMembership,
	location,
	participation,
	post,
	tag,
	user
} from './db/schema';
import { groupNameKey } from './group-name';

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
	/** Users with interest or registration, matching the response mode. */
	participants?: AuthorFixture[];
};

export type PublicGroupEventFixture = PublicPersonalEventFixture & {
	groupId: string;
	author: AuthorFixture;
};

/**
 * `reset` (the default for disposable test fixtures) overwrites existing records with fixture values;
 * it replaces Group memberships but only adds fixture Participation, keeping other Participation.
 * `preserve` (routine public seeding) only creates missing records and leaves existing ones untouched.
 */
export type ExistingRecords = 'reset' | 'preserve';

export type FixtureOptions = { existing?: ExistingRecords };

/** Statement-level access shared by the database and an open transaction. */
type FixtureWriter = Omit<Database, 'withTransaction'>;

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

export async function insertUser(
	db: FixtureWriter,
	clock: Clock,
	fixture: AuthorFixture,
	{ existing = 'reset' }: FixtureOptions = {}
) {
	const values = {
		name: fixture.name,
		email: fixture.email,
		image: fixture.image ?? null
	};
	const insert = db.insert(user).values({ id: fixture.id, ...values });
	await (existing === 'preserve'
		? insert.onConflictDoNothing({ target: user.id })
		: insert.onConflictDoUpdate({
				target: user.id,
				set: { ...values, updatedAt: clock.now() }
			}));
}

export async function insertTag(
	db: FixtureWriter,
	fixture: TagFixture,
	{ existing = 'reset' }: FixtureOptions = {}
) {
	const insert = db.insert(tag).values(fixture);
	await (existing === 'preserve'
		? insert.onConflictDoNothing({ target: tag.id })
		: insert.onConflictDoUpdate({ target: tag.id, set: { name: fixture.name } }));
}

export async function insertLocation(
	db: FixtureWriter,
	fixture: LocationFixture,
	{ existing = 'reset' }: FixtureOptions = {}
) {
	const values = {
		label: fixture.label,
		latitude: fixture.latitude ?? null,
		longitude: fixture.longitude ?? null
	};
	const insert = db.insert(location).values({ id: fixture.id, ...values });
	await (existing === 'preserve'
		? insert.onConflictDoNothing({ target: location.id })
		: insert.onConflictDoUpdate({ target: location.id, set: values }));
}

/** Memberships belong to the Group fixture: `preserve` establishes them only with a new Group. */
export async function insertGroup(
	db: Database,
	clock: Clock,
	fixture: GroupFixture,
	options: FixtureOptions = {}
) {
	// One transaction keeps a Group and its memberships together if setup stops partway.
	await db.withTransaction((tx) => writeGroup(tx, clock, fixture, options));
}

async function writeGroup(
	db: FixtureWriter,
	clock: Clock,
	fixture: GroupFixture,
	options: FixtureOptions
) {
	if (options.existing === 'preserve' && (await groupExists(db, fixture.id))) return;

	const now = clock.now();
	const subscribers = fixture.subscribers ?? [];

	await insertUser(db, clock, fixture.owner, options);
	if (fixture.representative) {
		await insertUser(db, clock, fixture.representative, options);
	}
	for (const subscriber of subscribers) {
		await insertUser(db, clock, subscriber, options);
	}

	await db
		.insert(group)
		.values({
			id: fixture.id,
			name: fixture.name.trim(),
			nameKey: groupNameKey(fixture.name),
			description: fixture.description,
			imageUrl: fixture.imageUrl ?? null,
			systemManaged: fixture.systemManaged ?? false,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoUpdate({
			target: group.id,
			set: {
				name: fixture.name.trim(),
				nameKey: groupNameKey(fixture.name),
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
	fixture: PublicPersonalEventFixture,
	options?: FixtureOptions
) {
	await insertPublicEvent(db, clock, fixture, options);
}

export async function insertPublicGroupEvent(
	db: Database,
	clock: Clock,
	fixture: PublicGroupEventFixture,
	options?: FixtureOptions
) {
	await insertPublicEvent(db, clock, fixture, options);
}

async function insertPublicEvent(
	db: Database,
	clock: Clock,
	fixture: PublicPersonalEventFixture & { groupId?: string },
	options: FixtureOptions = {}
) {
	// One transaction keeps an Event, its Tags and Participation together if setup stops partway.
	await db.withTransaction((tx) => writePublicEvent(tx, clock, fixture, options));
}

async function writePublicEvent(
	db: FixtureWriter,
	clock: Clock,
	fixture: PublicPersonalEventFixture & { groupId?: string },
	options: FixtureOptions
) {
	// Preserving an existing Event also preserves its Participation, schedule and content.
	if (options.existing === 'preserve' && (await eventExists(db, fixture.id))) return;

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

	await insertUser(db, clock, author, options);

	await insertLocation(db, eventLocation, options);

	for (const tagValue of tags) {
		await insertTag(db, tagValue, options);
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

	const participants = fixture.participants ?? [];
	if (participants.length === 0) return;
	if (responseMode === 'announcement') {
		throw new Error(`Announcement Event fixture ${fixture.id} cannot have participants`);
	}
	for (const participant of participants) {
		await insertUser(db, clock, participant, options);
	}
	await db
		.insert(participation)
		.values(
			participants.map((participant) => ({
				userId: participant.id,
				eventId: fixture.id,
				kind: responseMode,
				createdAt: now
			}))
		)
		.onConflictDoNothing();
}

async function eventExists(db: FixtureWriter, eventId: string) {
	const stored = await db.query.event.findFirst({
		where: eq(event.id, eventId),
		columns: { id: true }
	});
	return stored !== undefined;
}

async function groupExists(db: FixtureWriter, groupId: string) {
	const stored = await db.query.group.findFirst({
		where: eq(group.id, groupId),
		columns: { id: true }
	});
	return stored !== undefined;
}
