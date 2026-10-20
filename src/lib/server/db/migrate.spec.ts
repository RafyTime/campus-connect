import { describe, expect, it } from 'vite-plus/test';
import { createDb } from './client';
import { applyMigrations } from './migrate';
import { event, group } from './schema';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import type { Database } from './client';
import { createTestClock } from '../testing/clock';
import { insertUser, insertPublicGroupEvent } from '../fixtures';

async function legacyDatabase() {
	const db = createDb('file::memory:');
	const migrations = readMigrationFiles({ migrationsFolder: 'drizzle' }).slice(0, 3);
	await db.$client.migrate([
		'CREATE TABLE __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)',
		...migrations.flatMap((migration) => [
			...migration.sql,
			{
				sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
				args: [migration.hash, migration.folderMillis]
			}
		])
	]);
	return db;
}

async function insertLegacyGroup(db: Database, id: string, name: string) {
	await db.$client.execute({
		sql: 'INSERT INTO campus_group (id, name, description, image_url, system_managed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
		args: [id, name, 'An existing campus community.', 'https://example.com/group.jpg', 0, 123, 456]
	});
}

describe('applyMigrations', () => {
	it.each([
		['München Club', 'MÜNCHEN Club'],
		['München Club', 'Mu\u0308nchen Club'],
		['München Club', '  München Club  ']
	])(
		'reports collisions between %s and %s before changing existing data',
		async (first, second) => {
			const db = await legacyDatabase();
			try {
				await insertLegacyGroup(db, 'first', first);
				await insertLegacyGroup(db, 'second', second);
				const groupsBefore = await db.$client.execute('SELECT * FROM campus_group ORDER BY id');
				const schemaBefore = await db.$client.execute(
					"SELECT name, sql FROM sqlite_master WHERE tbl_name = 'campus_group' ORDER BY name"
				);
				const historyBefore = await db.$client.execute('SELECT * FROM __drizzle_migrations');
				await expect(applyMigrations(db)).rejects.toThrow(
					/Unicode-equivalent names conflict[\s\S]*first[\s\S]*second[\s\S]*Rename[\s\S]*rerun bun run db:migrate/
				);
				expect((await db.$client.execute('SELECT * FROM campus_group ORDER BY id')).rows).toEqual(
					groupsBefore.rows
				);
				expect(
					(
						await db.$client.execute(
							"SELECT name, sql FROM sqlite_master WHERE tbl_name = 'campus_group' ORDER BY name"
						)
					).rows
				).toEqual(schemaBefore.rows);
				expect((await db.$client.execute('SELECT * FROM __drizzle_migrations')).rows).toEqual(
					historyBefore.rows
				);
				await db.$client.execute(
					"UPDATE campus_group SET name = 'Writers Club' WHERE id = 'second'"
				);
				await applyMigrations(db);
				expect((await db.select().from(group)).map((row) => row.nameKey)).toEqual([
					'münchen club',
					'writers club'
				]);
			} finally {
				db.$client.close();
			}
		}
	);

	it('backfills collision-free names without changing display data, ownership or Events and reruns safely', async () => {
		const db = await legacyDatabase();
		try {
			await insertLegacyGroup(db, 'munich', '  Mu\u0308nchen Club  ');
			await insertLegacyGroup(db, 'cologne', 'KÖLN Club');
			const clock = createTestClock('2026-09-01T08:00:00Z');
			const owner = { id: 'owner', name: 'Owner', email: 'owner@example.com' };
			await insertUser(db, clock, owner);
			await db.$client.execute("INSERT INTO group_membership VALUES ('owner', 'munich', 'owner')");
			await insertPublicGroupEvent(db, clock, {
				id: 'existing-event',
				title: 'Existing Event',
				groupId: 'munich',
				author: owner,
				startsAt: new Date('2026-09-02T08:00:00Z'),
				endsAt: new Date('2026-09-02T10:00:00Z')
			});
			const groupsBefore = (await db.$client.execute('SELECT * FROM campus_group ORDER BY id'))
				.rows;
			const tables = ['user', 'group_membership', 'post', 'event', 'location', 'tag', 'event_tag'];
			const relationsBefore = await Promise.all(
				tables.map((table) => db.$client.execute(`SELECT * FROM ${table}`))
			);
			await applyMigrations(db);
			await applyMigrations(db);
			const rows = (await db.$client.execute('SELECT * FROM campus_group ORDER BY id')).rows;
			expect(
				rows.map(({ name_key, ...row }) => {
					expect(name_key).toEqual(row.id === 'munich' ? 'münchen club' : 'köln club');
					return row;
				})
			).toEqual(groupsBefore);
			for (const [index, table] of tables.entries()) {
				expect((await db.$client.execute(`SELECT * FROM ${table}`)).rows).toEqual(
					relationsBefore[index].rows
				);
			}
			await expect(
				db.$client.execute({
					sql: 'INSERT INTO campus_group (id, name, name_key, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
					args: ['duplicate', 'MÜNCHEN Club', 'münchen club', 'Duplicate', 0, 0]
				})
			).rejects.toThrow(/UNIQUE/);
			expect((await db.$client.execute('SELECT * FROM __drizzle_migrations')).rows).toHaveLength(
				readMigrationFiles({ migrationsFolder: 'drizzle' }).length
			);
		} finally {
			db.$client.close();
		}
	});

	it('applies committed migrations to an empty database', async () => {
		const db = createDb('file::memory:');

		try {
			await applyMigrations(db);
			expect(await db.select({ id: event.id }).from(event)).toEqual([]);
			expect(await db.select({ id: group.id }).from(group)).toEqual([]);
		} finally {
			db.$client.close();
		}
	});

	it('fails when tables exist without migration history', async () => {
		const db = createDb('file::memory:');

		try {
			await db.$client.execute('CREATE TABLE account (id text primary key)');
			await expect(applyMigrations(db)).rejects.toThrow(/already exists/);
		} finally {
			db.$client.close();
		}
	});
});
