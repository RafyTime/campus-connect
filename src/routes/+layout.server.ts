import { toSessionUser } from '$lib/session-user';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		user: locals.user ? toSessionUser(locals.user) : null
	};
};
