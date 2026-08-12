import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';

let auth: ReturnType<typeof createAuth> | undefined;

function createAuth() {
	return betterAuth({
		baseURL: env.ORIGIN,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(), { provider: 'sqlite' }),
		emailAndPassword: { enabled: true },
		plugins: [
			sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
		]
	});
}

export function getAuth() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): creation opens the lazy SQLite dependency.
	return (auth ??= createAuth());
}
