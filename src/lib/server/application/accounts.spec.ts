import { describe, expect, it } from 'vitest';
import {
	parseDisplayName,
	parseRegistration,
	parseSignIn,
	resolveReturnPath,
	updateUserDisplayName
} from './accounts';

describe('protected-action return paths', () => {
	it('accepts a local Group path', () => {
		expect(resolveReturnPath('/groups/group-film-society')).toBe('/groups/group-film-society');
	});

	it('keeps a local search string', () => {
		expect(resolveReturnPath('/?tag=social')).toBe('/?tag=social');
	});

	it('falls back when the path is missing', () => {
		expect(resolveReturnPath(null)).toBe('/');
		expect(resolveReturnPath(undefined)).toBe('/');
		expect(resolveReturnPath('')).toBe('/');
	});

	it('falls back for an external URL', () => {
		expect(resolveReturnPath('https://evil.example/phish')).toBe('/');
	});

	it('falls back for a protocol-relative URL', () => {
		expect(resolveReturnPath('//evil.example/phish')).toBe('/');
	});

	it('falls back when traversal reaches an authentication page', () => {
		expect(resolveReturnPath('/groups/../../sign-in')).toBe('/');
	});

	it('falls back for sign-in and registration destinations', () => {
		expect(resolveReturnPath('/sign-in')).toBe('/');
		expect(resolveReturnPath('/register?returnTo=/groups')).toBe('/');
	});
});

describe('registration input', () => {
	it('accepts a trimmed display name, normalized email, and password of at least eight characters', () => {
		expect(
			parseRegistration({
				displayName: '  Ada Lovelace  ',
				email: '  Ada@Example.COM ',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: true,
			value: {
				displayName: 'Ada Lovelace',
				email: 'ada@example.com',
				password: 'campus-connect'
			}
		});
	});

	it('rejects a display name shorter than two characters and keeps the other fields', () => {
		expect(
			parseRegistration({
				displayName: 'A',
				email: 'ada@example.com',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: false,
			values: {
				displayName: 'A',
				email: 'ada@example.com'
			},
			fieldErrors: {
				displayName: 'Enter a display name between 2 and 50 characters.'
			}
		});
	});

	it('rejects a display name longer than 50 characters', () => {
		const displayName = 'A'.repeat(51);

		expect(
			parseRegistration({
				displayName,
				email: 'ada@example.com',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: false,
			values: {
				displayName,
				email: 'ada@example.com'
			},
			fieldErrors: {
				displayName: 'Enter a display name between 2 and 50 characters.'
			}
		});
	});

	it('rejects an invalid email without discarding the display name', () => {
		expect(
			parseRegistration({
				displayName: 'Ada Lovelace',
				email: 'not-an-email',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: false,
			values: {
				displayName: 'Ada Lovelace',
				email: 'not-an-email'
			},
			fieldErrors: {
				email: 'Enter a valid email address.'
			}
		});
	});

	it('rejects a password shorter than eight characters', () => {
		expect(
			parseRegistration({
				displayName: 'Ada Lovelace',
				email: 'ada@example.com',
				_password: 'short'
			})
		).toEqual({
			ok: false,
			values: {
				displayName: 'Ada Lovelace',
				email: 'ada@example.com'
			},
			fieldErrors: {
				_password: 'Enter a password of at least 8 characters.'
			}
		});
	});
});

describe('sign-in input', () => {
	it('normalizes the email address', () => {
		expect(
			parseSignIn({
				email: '  Ada@Example.COM ',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: true,
			value: {
				email: 'ada@example.com',
				password: 'campus-connect'
			}
		});
	});

	it('rejects an invalid email without discarding it', () => {
		expect(
			parseSignIn({
				email: 'not-an-email',
				_password: 'campus-connect'
			})
		).toEqual({
			ok: false,
			values: {
				email: 'not-an-email'
			},
			fieldErrors: {
				email: 'Enter a valid email address.'
			}
		});
	});

	it('rejects a missing password', () => {
		expect(
			parseSignIn({
				email: 'ada@example.com',
				_password: ''
			})
		).toEqual({
			ok: false,
			values: {
				email: 'ada@example.com'
			},
			fieldErrors: {
				_password: 'Enter your password.'
			}
		});
	});
});

describe('display name editing', () => {
	it('accepts a trimmed display name', () => {
		expect(parseDisplayName({ displayName: '  Ada King  ' })).toEqual({
			ok: true,
			value: { displayName: 'Ada King' }
		});
	});

	it('rejects an empty display name', () => {
		expect(parseDisplayName({ displayName: ' ' })).toEqual({
			ok: false,
			values: { displayName: ' ' },
			fieldErrors: {
				displayName: 'Enter a display name between 2 and 50 characters.'
			}
		});
	});

	it('rejects display-name editing without a signed-in User', async () => {
		await expect(
			updateUserDisplayName(
				{} as Parameters<typeof updateUserDisplayName>[0],
				new Headers(),
				null,
				'Ada King'
			)
		).resolves.toEqual({ ok: false, reason: 'unauthenticated' });
	});
});
