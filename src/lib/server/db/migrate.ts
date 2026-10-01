import { resolve } from 'node:path';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import type { Database } from './client';
import { groupNameKey } from '../group-name';

const groupNameBackfill = '-- backfill-group-name-keys';

export async function applyMigrations(db: Database) {
	const migrations = readMigrationFiles({ migrationsFolder: resolve('drizzle') });
	// Preserve Drizzle's journal hashes and timestamps while allowing a Unicode data migration.
	// One write transaction holds the collision check, backfill, constraint and journal entry.
	await db.withTransaction(async (tx) => {
		await tx.$client.execute(`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
			id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric
		)`);
		const recorded = await tx.$client.execute(
			'SELECT created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1'
		);
		const lastApplied = Number(recorded.rows[0]?.created_at ?? 0);
		for (const migration of migrations) {
			if (migration.folderMillis <= lastApplied) continue;
			const needsGroupKeys = migration.sql.some(
				(statement) => statement.trim() === groupNameBackfill
			);
			const groups = needsGroupKeys
				? (await tx.$client.execute('SELECT id, name FROM campus_group ORDER BY id')).rows.map(
						(row) => ({ id: String(row.id), name: String(row.name) })
					)
				: [];
			if (needsGroupKeys) assertDistinctGroupNames(groups);
			for (const statement of migration.sql) {
				if (statement.trim() === groupNameBackfill) {
					for (const row of groups) {
						await tx.$client.execute({
							sql: 'UPDATE campus_group SET name_key = ? WHERE id = ?',
							args: [groupNameKey(row.name), row.id]
						});
					}
				} else {
					await tx.$client.execute(statement);
				}
			}
			await tx.$client.execute({
				sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
				args: [migration.hash, migration.folderMillis]
			});
		}
	});
}

function assertDistinctGroupNames(groups: { id: string; name: string }[]) {
	const byKey = new Map<string, { id: string; name: string }[]>();
	for (const row of groups) {
		const key = groupNameKey(row.name);
		const matches = byKey.get(key) ?? [];
		matches.push(row);
		byKey.set(key, matches);
	}
	const collisions = [...byKey].filter(([, rows]) => rows.length > 1);
	if (!collisions.length) return;
	throw new Error(
		[
			'Group name migration stopped: Unicode-equivalent names conflict.',
			...collisions.map(
				([key, rows]) =>
					`${JSON.stringify(key)}: ${rows.map((row) => `${row.id} (${JSON.stringify(row.name)})`).join(', ')}`
			),
			'Rename the conflicting Groups by ID in the existing database, preserving their memberships and posts, then rerun bun run db:migrate. No migration changes were committed.'
		].join('\n')
	);
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
