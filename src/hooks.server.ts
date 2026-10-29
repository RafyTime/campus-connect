import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { getAuth } from '#lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// ADR 0001 (docs/adr/0001-lazy-runtime-initialization.md): build analysis must not access the runtime-only volume.
	if (building) return resolve(event);

	const auth = getAuth();
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;

// Unexpected database errors may include query parameters; keep request diagnostics payload-free.
export const handleError: HandleServerError = ({ kind, event }) => {
	if (kind !== 'unknown') return;
	console.error('Request failed', { route: event.route.id });
	return { message: 'Campus Connect could not complete this request.' };
};
