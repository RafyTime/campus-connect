import { DATABASE_URL } from '$app/env/private';
import { createDb, type Database } from './client';

export { createDb, type Database };

let db: Database | undefined;

export function getDb() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): Railway's volume is runtime-only.
	if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

	return (db ??= createDb(DATABASE_URL));
}
