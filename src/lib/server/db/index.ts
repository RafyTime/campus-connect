import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let db: ReturnType<typeof createDb> | undefined;

export function createDb(url: string) {
	const client = createClient({ url });

	return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

export function getDb() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): Railway's volume is runtime-only.
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	return (db ??= createDb(env.DATABASE_URL));
}
