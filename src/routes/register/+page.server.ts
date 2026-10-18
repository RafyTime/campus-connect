import { loadVisitorAuthenticationPage } from '#lib/server/authentication-page.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	return loadVisitorAuthenticationPage(locals.user, url.searchParams.get('returnTo'));
};
