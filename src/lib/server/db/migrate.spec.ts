import { describe, expect, it } from 'vitest';
import { createDb } from './client';
import { applyMigrations } from './migrate';
import { event } from './schema';

describe('applyMigrations', () => {
	it('applies committed migrations to an empty database', async () => {
		const db = createDb('file::memory:');

		try {
			await applyMigrations(db);
			expect(await db.select({ id: event.id }).from(event)).toEqual([]);
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
