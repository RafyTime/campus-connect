import { redirect } from '@sveltejs/kit';
import { authenticationHref } from '$lib/auth-paths';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, authenticationHref('/sign-in', '/groups/new'));
};
