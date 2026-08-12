import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let db: ReturnType<typeof createDb> | undefined;

function createDb() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const client = createClient({ url: env.DATABASE_URL });

	return drizzle(client, { schema });
}

export function getDb() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): Railway's volume is runtime-only.
	return (db ??= createDb());
}
