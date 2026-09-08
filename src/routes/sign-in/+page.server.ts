import { loadVisitorAuthenticationPage } from '$lib/server/authentication-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	return loadVisitorAuthenticationPage(locals.user, url.searchParams.get('returnTo'));
};
