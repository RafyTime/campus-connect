import { env } from '$env/dynamic/private';
import { createDb, type Database } from './client';

export { createDb, type Database };

let db: Database | undefined;

export function getDb() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): Railway's volume is runtime-only.
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	return (db ??= createDb(env.DATABASE_URL));
}
