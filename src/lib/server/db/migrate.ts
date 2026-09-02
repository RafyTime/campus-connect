import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { Database } from './client';

export async function applyMigrations(db: Database) {
	await migrate(db, { migrationsFolder: resolve('drizzle') });
}

export function describeMigrationFailure(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);

	if (!/already exists/i.test(message)) {
		return message;
	}

	return [
		message,
		'',
		'This database already has tables but no recorded Drizzle migration history.',
		'For local SQLite, delete or rename local.db and run bun run db:migrate again.'
	].join('\n');
}
