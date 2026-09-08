import { redirect } from '@sveltejs/kit';
import { authenticationHref } from '$lib/auth-paths';
import { toSessionUser } from '$lib/session-user';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) {
		redirect(303, authenticationHref('/sign-in', '/account'));
	}

	return {
		displayName: toSessionUser(locals.user).displayName
	};
};
