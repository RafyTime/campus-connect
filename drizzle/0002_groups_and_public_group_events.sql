CREATE TABLE `campus_group` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_url` text,
	`system_managed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_name_ci_unique` ON `campus_group` (lower("name"));--> statement-breakpoint
CREATE TABLE `group_membership` (
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`user_id`, `group_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `campus_group`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "group_membership_role" CHECK("group_membership"."role" in ('owner', 'representative', 'subscriber'))
);
--> statement-breakpoint
CREATE INDEX `group_membership_groupId_idx` ON `group_membership` (`group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_membership_one_owner` ON `group_membership` (`group_id`) WHERE "group_membership"."role" = 'owner';--> statement-breakpoint
ALTER TABLE `post` ADD `group_id` text REFERENCES `campus_group`(`id`);--> statement-breakpoint
CREATE INDEX `post_groupId_idx` ON `post` (`group_id`);
