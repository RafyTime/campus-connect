import { ORIGIN, BETTER_AUTH_SECRET, AUTH_RATE_LIMIT } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb, type Database } from '#lib/server/db/index.js';

let auth: ReturnType<typeof createAuth> | undefined;

export function createAuth(db: Database) {
	if (!ORIGIN) throw new Error('ORIGIN is not set');
	if (!BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not set');
	const instance = betterAuth({
		baseURL: ORIGIN,
		secret: BETTER_AUTH_SECRET,
		// Dependency errors can contain SQL parameters, including generated session tokens.
		logger: {
			level: 'warn',
			log(level) {
				if (level === 'error') console.error('Authentication error');
				else if (level === 'warn') console.warn('Authentication warning');
			}
		},
		// Let our handler catch unexpected errors before the underlying router prints them.
		onAPIError: { throw: true },
		database: drizzleAdapter(db, { provider: 'sqlite' }),
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
	return {
		...instance,
		async handler(request: Request) {
			try {
				return await instance.handler(request);
			} catch {
				console.error('Authentication error');
				return new Response(null, { status: 500 });
			}
		}
	};
}

export function getAuth() {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): creation opens the lazy SQLite dependency.
	return (auth ??= createAuth(getDb()));
}
