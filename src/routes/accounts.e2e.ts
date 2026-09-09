import { expect, test, type Page } from '@playwright/test';

const viewports = {
	phone: { width: 360, height: 800 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 }
} as const;

function uniqueEmail(label: string): string {
	return `qa.accounts.${label}.${crypto.randomUUID()}@example.com`;
}

async function assertNoHorizontalPageScroll(page: Page) {
	const overflow = await page.evaluate(() => {
		const root = document.documentElement;
		return {
			clientWidth: root.clientWidth,
			scrollWidth: root.scrollWidth
		};
	});

	expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

async function fillRegistration(
	page: Page,
	input: { displayName: string; email: string; password: string }
) {
	await page.getByLabel('Display name').fill(input.displayName);
	await page.getByLabel('Email').fill(input.email);
	await page.getByLabel('Password').fill(input.password);
}

test.describe('Campus Connect accounts and profiles', () => {
	test('invalid registration keeps valid input and shows field-level messages', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/register');

		await fillRegistration(page, {
			displayName: 'A',
			email: 'not-an-email',
			password: 'short'
		});
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page.getByText('Enter a display name between 2 and 50 characters.')).toBeVisible();
		await expect(page.getByText('Enter a valid email address.')).toBeVisible();
		await expect(page.getByText('Enter a password of at least 8 characters.')).toBeVisible();
		await expect(page.getByLabel('Display name')).toHaveValue('A');
		await expect(page.getByLabel('Email')).toHaveValue('not-an-email');
	});

	test('duplicate registration keeps the display name and email and shows a field-level message', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('taken');

		await page.goto('/register');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/');
		await page
			.getByRole('navigation', { name: 'Account' })
			.getByRole('link', { name: 'Account' })
			.click();
		await page.getByRole('button', { name: 'Sign out' }).click();
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Sign in' })
		).toBeVisible();

		await page.goto('/register');
		await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible();
		await fillRegistration(page, {
			displayName: 'Ada King',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page.getByText('An account already uses this email address.')).toBeVisible();
		await expect(page.getByLabel('Display name')).toHaveValue('Ada King');
		await expect(page.getByLabel('Email')).toHaveValue(email);
	});

	test('registration establishes a session that persists across navigation and refresh', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('session');

		await page.goto('/register');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page).toHaveURL('/');
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Sign in' })
		).toHaveCount(0);
		await expect(
			page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Discover' })
		).toBeVisible();
		await expect(
			page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Groups' })
		).toBeVisible();

		await page
			.getByRole('navigation', { name: 'Primary' })
			.getByRole('link', { name: 'Groups' })
			.click();
		await expect(page).toHaveURL('/groups');
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();

		await page.reload();
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();
	});

	test('users can edit their display name and sign out', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('profile');

		await page.goto('/register');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await page
			.getByRole('navigation', { name: 'Account' })
			.getByRole('link', { name: 'Account' })
			.click();

		await expect(page.getByRole('heading', { name: 'Account', level: 1 })).toBeVisible();
		await expect(page.getByLabel('Display name')).toHaveValue('Ada Lovelace');
		await expect(page.getByLabel('Email')).toHaveCount(0);
		await expect(page.getByRole('button', { name: /password/i })).toHaveCount(0);
		await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);

		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await assertNoHorizontalPageScroll(page);
		}
		await page.setViewportSize(viewports.desktop);

		await page.getByLabel('Display name').fill('A');
		await page.getByRole('button', { name: 'Save display name' }).click();
		await expect(page.getByText('Enter a display name between 2 and 50 characters.')).toBeVisible();
		await expect(page.getByLabel('Display name')).toHaveValue('A');

		await page.getByLabel('Display name').fill('Ada King');
		await page.getByRole('button', { name: 'Save display name' }).click();
		await expect(page.getByLabel('Display name')).toHaveValue('Ada King');

		await page.reload();
		await expect(page.getByLabel('Display name')).toHaveValue('Ada King');

		await page.getByRole('button', { name: 'Sign out' }).click();
		await expect(page).toHaveURL('/');
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Sign in' })
		).toBeVisible();
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Register' })
		).toBeVisible();
	});

	test('invalid sign-in keeps the email and shows a field-level message', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('signin');

		await page.goto('/register');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await page
			.getByRole('navigation', { name: 'Account' })
			.getByRole('link', { name: 'Account' })
			.click();
		await page.getByRole('button', { name: 'Sign out' }).click();

		await page.goto('/sign-in');
		await page.getByLabel('Email').fill(email);
		await page.getByLabel('Password').fill('wrong-password');
		await page.getByRole('button', { name: 'Sign in', exact: true }).click();

		await expect(page.getByText('Email or password is incorrect.')).toBeVisible();
		await expect(page.getByLabel('Email')).toHaveValue(email);
	});

	test('sign-in establishes a session that persists across refresh', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('signin-ok');

		await page.goto('/register');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();
		await page
			.getByRole('navigation', { name: 'Account' })
			.getByRole('link', { name: 'Account' })
			.click();
		await page.getByRole('button', { name: 'Sign out' }).click();

		await page.goto('/sign-in');
		await page.getByLabel('Email').fill(email);
		await page.getByLabel('Password').fill('campus-connect');
		await page.getByRole('button', { name: 'Sign in', exact: true }).click();

		await expect(page).toHaveURL('/');
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();

		await page.reload();
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();
	});

	test('a protected action opens a dialog and returns without replaying the mutation', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('return');

		await page.goto('/groups/group-film-society');
		await page.getByRole('button', { name: 'Follow' }).click();

		const dialog = page.getByRole('dialog', { name: 'Sign in to continue' });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('link', { name: 'Sign in' })).toBeVisible();
		await dialog.getByRole('link', { name: 'Register' }).click();

		await expect(page).toHaveURL(/\/register\?returnTo=/);
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page).toHaveURL('/groups/group-film-society');
		await expect(
			page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Account' })
		).toBeVisible();
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Unfollow' })).toHaveCount(0);
	});

	test('an external return path falls back to Discover', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		const email = uniqueEmail('fallback');

		await page.goto('/register?returnTo=https://evil.example/phish');
		await fillRegistration(page, {
			displayName: 'Ada Lovelace',
			email,
			password: 'campus-connect'
		});
		await page.getByRole('button', { name: 'Create account' }).click();

		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { name: 'Discover', level: 1 })).toBeVisible();
	});

	test('account forms and the protected-action dialog work by keyboard and fit viewports', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/groups/group-film-society');
		await page.getByRole('button', { name: 'Follow' }).focus();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('dialog', { name: 'Sign in to continue' })).toBeVisible();

		const signInLink = page.getByRole('dialog').getByRole('link', { name: 'Sign in' });
		for (let presses = 0; presses < 8; presses += 1) {
			if (await signInLink.evaluate((element) => element === document.activeElement)) {
				break;
			}
			await page.keyboard.press('Tab');
		}
		await expect(signInLink).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);

		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await page.goto('/register');
			await assertNoHorizontalPageScroll(page);
			await page.goto('/sign-in');
			await assertNoHorizontalPageScroll(page);
			await page.goto('/groups/group-film-society');
			await page.getByRole('button', { name: 'Follow' }).click();
			await expect(page.getByRole('dialog', { name: 'Sign in to continue' })).toBeVisible();
			await assertNoHorizontalPageScroll(page);
			await page.keyboard.press('Escape');
		}
	});
});
