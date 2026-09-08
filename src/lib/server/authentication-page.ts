import { redirect } from '@sveltejs/kit';
import { resolveReturnPath } from '$lib/server/application/accounts';

export function loadVisitorAuthenticationPage(
	user: { id: string } | null | undefined,
	returnToCandidate: string | null
) {
	const returnTo = resolveReturnPath(returnToCandidate);

	if (user) {
		redirect(303, returnTo);
	}

	return { returnTo };
}
