CREATE TABLE `geocoding_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`results` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `geocoding_throttle` (
	`id` text PRIMARY KEY NOT NULL,
	`requested_at` integer NOT NULL
);
