import { error, invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import {
	authenticateUser,
	endSession,
	fieldIssues,
	parseDisplayName,
	parseRegistration,
	parseSignIn,
	registerUser,
	resolveReturnPath,
	updateUserDisplayName
} from '$lib/server/application/accounts';
import { getAuth } from '$lib/server/auth';

export const registerAccount = form('unchecked', async (data) => {
	const parsed = parseRegistration(data);
	if (!parsed.ok) {
		invalid(...fieldIssues(parsed.fieldErrors));
	}

	const result = await registerUser(getAuth(), getRequestEvent().request.headers, parsed.value);
	if (!result.ok && result.reason === 'email-taken') {
		invalid({
			message: 'An account already uses this email address.',
			path: ['email']
		});
	}
	if (!result.ok) {
		invalid('Something went wrong. Try again.');
	}

	redirect(303, resolveReturnPath(returnToFrom(data)));
});

export const signInAccount = form('unchecked', async (data) => {
	const parsed = parseSignIn(data);
	if (!parsed.ok) {
		invalid(...fieldIssues(parsed.fieldErrors));
	}

	const result = await authenticateUser(getAuth(), getRequestEvent().request.headers, parsed.value);
	if (!result.ok && result.reason === 'invalid-credentials') {
		invalid({
			message: 'Email or password is incorrect.',
			path: ['_password']
		});
	}
	if (!result.ok) {
		invalid('Something went wrong. Try again.');
	}

	redirect(303, resolveReturnPath(returnToFrom(data)));
});

export const updateDisplayName = form('unchecked', async (data) => {
	const event = getRequestEvent();
	const parsed = parseDisplayName(data);
	if (!parsed.ok) {
		invalid(...fieldIssues(parsed.fieldErrors));
	}

	const result = await updateUserDisplayName(
		getAuth(),
		event.request.headers,
		event.locals.user,
		parsed.value.displayName
	);
	if (!result.ok && result.reason === 'unauthenticated') {
		error(401, 'Sign in to continue');
	}
	if (!result.ok) {
		invalid({
			message: 'Something went wrong. Try again.',
			path: ['displayName']
		});
	}

	redirect(303, '/account');
});

export const signOutAccount = form(async () => {
	await endSession(getAuth(), getRequestEvent().request.headers);
	redirect(303, '/');
});

function returnToFrom(data: unknown): unknown {
	if (typeof data === 'object' && data !== null && 'returnTo' in data) {
		return data.returnTo;
	}

	return undefined;
}
