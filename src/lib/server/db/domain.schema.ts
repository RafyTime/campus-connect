import { relations, sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text
} from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const location = sqliteTable('location', {
	id: text('id').primaryKey(),
	label: text('label').notNull(),
	latitude: real('latitude'),
	longitude: real('longitude')
});

export const post = sqliteTable(
	'post',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		authorId: text('author_id')
			.notNull()
			.references(() => user.id),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [index('post_authorId_idx').on(table.authorId)]
);

export const event = sqliteTable(
	'event',
	{
		id: text('id').primaryKey(),
		postId: text('post_id')
			.notNull()
			.unique()
			.references(() => post.id),
		description: text('description').notNull(),
		startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
		endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
		visibility: text('visibility', { enum: ['public'] })
			.notNull()
			.default('public'),
		responseMode: text('response_mode', {
			enum: ['announcement', 'interest', 'registration']
		}).notNull(),
		capacity: integer('capacity'),
		status: text('status', { enum: ['scheduled', 'cancelled'] })
			.notNull()
			.default('scheduled'),
		locationId: text('location_id')
			.notNull()
			.references(() => location.id)
	},
	(table) => [
		index('event_discover_idx').on(table.visibility, table.status, table.endsAt, table.startsAt),
		check('event_end_after_start', sql`${table.endsAt} > ${table.startsAt}`),
		check('event_visibility_public', sql`${table.visibility} = 'public'`),
		check(
			'event_registration_capacity',
			sql`(
				(${table.responseMode} = 'registration' AND ${table.capacity} > 0)
				OR (${table.responseMode} != 'registration' AND ${table.capacity} IS NULL)
			)`
		)
	]
);

export const eventTag = sqliteTable(
	'event_tag',
	{
		eventId: text('event_id')
			.notNull()
			.references(() => event.id),
		tagId: text('tag_id')
			.notNull()
			.references(() => tag.id)
	},
	(table) => [
		primaryKey({ columns: [table.eventId, table.tagId] }),
		index('event_tag_tagId_idx').on(table.tagId)
	]
);

export const postRelations = relations(post, ({ one }) => ({
	author: one(user, {
		fields: [post.authorId],
		references: [user.id]
	}),
	event: one(event)
}));

export const eventRelations = relations(event, ({ one, many }) => ({
	post: one(post, {
		fields: [event.postId],
		references: [post.id]
	}),
	location: one(location, {
		fields: [event.locationId],
		references: [location.id]
	}),
	eventTags: many(eventTag)
}));

export const eventTagRelations = relations(eventTag, ({ one }) => ({
	event: one(event, {
		fields: [eventTag.eventId],
		references: [event.id]
	}),
	tag: one(tag, {
		fields: [eventTag.tagId],
		references: [tag.id]
	})
}));

export const tagRelations = relations(tag, ({ many }) => ({
	eventTags: many(eventTag)
}));

export const locationRelations = relations(location, ({ many }) => ({
	events: many(event)
}));
