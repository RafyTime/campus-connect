import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createDb, type Database } from '$lib/server/db';

export interface TestDatabase extends Disposable {
	db: Database;
}

export async function createTestDatabase(): Promise<TestDatabase> {
	const db = createDb('file::memory:');

	await migrate(db, { migrationsFolder: resolve('drizzle') });

	return {
		db,
		[Symbol.dispose]() {
			db.$client.close();
		}
	};
}
