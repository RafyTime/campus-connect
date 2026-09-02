import { createDb } from '../client';
import { applyMigrations, describeMigrationFailure } from '../migrate';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const db = createDb(databaseUrl);

try {
	await applyMigrations(db);
	console.info('Applied database migrations.');
} catch (error) {
	console.error(describeMigrationFailure(error));
	process.exitCode = 1;
} finally {
	db.$client.close();
}
