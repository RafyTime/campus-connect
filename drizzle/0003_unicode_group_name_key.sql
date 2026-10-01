-- Apply with bun run db:migrate for the Unicode collision check and backfill.
ALTER TABLE `campus_group` ADD `name_key` text NOT NULL DEFAULT '';--> statement-breakpoint
-- backfill-group-name-keys
--> statement-breakpoint
DROP INDEX `group_name_ci_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `group_name_key_unique` ON `campus_group` (`name_key`);
