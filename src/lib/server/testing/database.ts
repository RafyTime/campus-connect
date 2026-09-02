import { createDb, type Database } from '$lib/server/db';
import { applyMigrations } from '$lib/server/db/migrate';

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
