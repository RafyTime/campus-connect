CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`description` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`response_mode` text NOT NULL,
	`capacity` integer,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`location_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "event_end_after_start" CHECK("event"."ends_at" > "event"."starts_at"),
	CONSTRAINT "event_visibility_public" CHECK("event"."visibility" = 'public'),
	CONSTRAINT "event_registration_capacity" CHECK((
				("event"."response_mode" = 'registration' AND "event"."capacity" > 0)
				OR ("event"."response_mode" != 'registration' AND "event"."capacity" IS NULL)
			))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_post_id_unique` ON `event` (`post_id`);--> statement-breakpoint
CREATE INDEX `event_discover_idx` ON `event` (`visibility`,`status`,`ends_at`,`starts_at`);--> statement-breakpoint
CREATE TABLE `event_tag` (
	`event_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `tag_id`),
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `event_tag_tagId_idx` ON `event_tag` (`tag_id`);--> statement-breakpoint
CREATE TABLE `location` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `post_authorId_idx` ON `post` (`author_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_unique` ON `tag` (`name`);