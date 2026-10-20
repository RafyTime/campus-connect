CREATE TABLE `participation` (
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `event_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "participation_kind" CHECK("participation"."kind" in ('interest', 'registration'))
);
--> statement-breakpoint
CREATE INDEX `participation_event_idx` ON `participation` (`event_id`);