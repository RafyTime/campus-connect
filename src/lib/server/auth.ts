import { ORIGIN, BETTER_AUTH_SECRET, AUTH_RATE_LIMIT } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.js';

let auth: ReturnType<typeof createAuth> | undefined;

function createAuth() {
	if (!ORIGIN) throw new Error('ORIGIN is not set');
	if (!BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not set');
	return betterAuth({
		baseURL: ORIGIN,
		secret: BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(), { provider: 'sqlite' }),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			requireEmailVerification: false
		},
		user: {
			changeEmail: { enabled: false },
			deleteUser: { enabled: false }
		},
		rateLimit: { enabled: AUTH_RATE_LIMIT !== 'off' },
		plugins: [
			sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
		]
	});
}

export function getAuth() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): creation opens the lazy SQLite dependency.
	return (auth ??= createAuth());
}
