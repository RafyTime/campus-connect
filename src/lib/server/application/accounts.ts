import { APIError } from 'better-auth/api';
import type { getAuth } from '$lib/server/auth';

const fallbackReturnPath = '/';
const displayNameMinLength = 2;
const displayNameMaxLength = 50;
const passwordMinLength = 8;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegistrationInput = {
	displayName: string;
	email: string;
	password: string;
};

export type SignInInput = {
	email: string;
	password: string;
};

export type DisplayNameInput = {
	displayName: string;
};

export type FieldErrors = Partial<Record<'displayName' | 'email' | '_password', string>>;

export type ParseFailure = {
	ok: false;
	values: { displayName?: string; email?: string };
	fieldErrors: FieldErrors;
};

export type ParseResult<T> = { ok: true; value: T } | ParseFailure;

export function parseRegistration(input: unknown): ParseResult<RegistrationInput> {
	const record = isRecord(input) ? input : {};
	const displayName = readString(record.displayName);
	const email = readString(record.email);
	const password = readString(record._password ?? record.password);
	const trimmedName = displayName.trim();
	const normalizedEmail = email.trim().toLowerCase();
	const fieldErrors: FieldErrors = {};

	if (trimmedName.length < displayNameMinLength || trimmedName.length > displayNameMaxLength) {
		fieldErrors.displayName = 'Enter a display name between 2 and 50 characters.';
	}

	if (!emailPattern.test(normalizedEmail)) {
		fieldErrors.email = 'Enter a valid email address.';
	}

	if (password.length < passwordMinLength) {
		fieldErrors._password = 'Enter a password of at least 8 characters.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return {
			ok: false,
			values: { displayName, email },
			fieldErrors
		};
	}

	return {
		ok: true,
		value: {
			displayName: trimmedName,
			email: normalizedEmail,
			password
		}
	};
}

export function parseSignIn(input: unknown): ParseResult<SignInInput> {
	const record = isRecord(input) ? input : {};
	const email = readString(record.email);
	const password = readString(record._password ?? record.password);
	const normalizedEmail = email.trim().toLowerCase();
	const fieldErrors: FieldErrors = {};

	if (!emailPattern.test(normalizedEmail)) {
		fieldErrors.email = 'Enter a valid email address.';
	}

	if (password.length === 0) {
		fieldErrors._password = 'Enter your password.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return {
			ok: false,
			values: { email },
			fieldErrors
		};
	}

	return {
		ok: true,
		value: {
			email: normalizedEmail,
			password
		}
	};
}

export function parseDisplayName(input: unknown): ParseResult<DisplayNameInput> {
	const record = isRecord(input) ? input : {};
	const displayName = readString(record.displayName);
	const trimmedName = displayName.trim();

	if (trimmedName.length < displayNameMinLength || trimmedName.length > displayNameMaxLength) {
		return {
			ok: false,
			values: { displayName },
			fieldErrors: {
				displayName: 'Enter a display name between 2 and 50 characters.'
			}
		};
	}

	return {
		ok: true,
		value: { displayName: trimmedName }
	};
}

export function resolveReturnPath(candidate: unknown): string {
	if (typeof candidate !== 'string') return fallbackReturnPath;

	const trimmed = candidate.trim();
	if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallbackReturnPath;

	try {
		const url = new URL(trimmed, 'http://campus.local');
		if (url.origin !== 'http://campus.local') return fallbackReturnPath;
		if (isAuthenticationPath(url.pathname)) return fallbackReturnPath;
		return `${url.pathname}${url.search}`;
	} catch {
		return fallbackReturnPath;
	}
}

function isAuthenticationPath(pathname: string): boolean {
	return (
		pathname === '/sign-in' ||
		pathname === '/register' ||
		pathname.startsWith('/sign-in/') ||
		pathname.startsWith('/register/')
	);
}

export type AccountMutationResult =
	| { ok: true }
	| {
			ok: false;
			reason: 'email-taken' | 'invalid-credentials' | 'unauthenticated' | 'unavailable';
	  };

type Auth = ReturnType<typeof getAuth>;

export async function registerUser(
	auth: Auth,
	headers: Headers,
	input: RegistrationInput
): Promise<AccountMutationResult> {
	try {
		await auth.api.signUpEmail({
			body: {
				email: input.email,
				password: input.password,
				name: input.displayName
			},
			headers
		});
		return { ok: true };
	} catch (caught) {
		if (isApiStatus(caught, 'UNPROCESSABLE_ENTITY')) {
			return { ok: false, reason: 'email-taken' };
		}

		return { ok: false, reason: 'unavailable' };
	}
}

export async function authenticateUser(
	auth: Auth,
	headers: Headers,
	input: SignInInput
): Promise<AccountMutationResult> {
	try {
		await auth.api.signInEmail({
			body: {
				email: input.email,
				password: input.password
			},
			headers
		});
		return { ok: true };
	} catch (caught) {
		if (isApiStatus(caught, 'UNAUTHORIZED')) {
			return { ok: false, reason: 'invalid-credentials' };
		}

		return { ok: false, reason: 'unavailable' };
	}
}

export async function updateUserDisplayName(
	auth: Auth,
	headers: Headers,
	user: { id: string } | null | undefined,
	displayName: string
): Promise<AccountMutationResult> {
	if (!user) {
		return { ok: false, reason: 'unauthenticated' };
	}

	try {
		await auth.api.updateUser({
			body: { name: displayName },
			headers
		});
		return { ok: true };
	} catch {
		return { ok: false, reason: 'unavailable' };
	}
}

export async function endSession(auth: Auth, headers: Headers): Promise<void> {
	await auth.api.signOut({ headers });
}

function isApiStatus(error: unknown, status: string): boolean {
	return error instanceof APIError && String(error.status) === status;
}

export function fieldIssues(fieldErrors: FieldErrors) {
	return Object.entries(fieldErrors)
		.filter((entry): entry is [keyof FieldErrors & string, string] => typeof entry[1] === 'string')
		.map(([path, message]) => ({ message, path: [path] }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}
