import { createDb, type Database } from '#lib/server/db/index.js';
import { applyMigrations } from '#lib/server/db/migrate.js';

export interface TestDatabase extends Disposable {
	db: Database;
}

export async function createTestDatabase(): Promise<TestDatabase> {
	const db = createDb('file::memory:');

	await applyMigrations(db);

	return {
		db,
		[Symbol.dispose]() {
			db.$client.close();
		}
	};
}
