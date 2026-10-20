import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const viewports = [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
];
async function register(page: Page) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Interest Explorer');
	await page.getByLabel('Email').fill(`interest.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}
async function signIn(page: Page, email: string) {
	await page.goto('/sign-in');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('campus-connect-test');
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();
	await expect(page).toHaveURL('/');
}
async function noOverflow(page: Page) {
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
}

for (const viewport of viewports) {
	test(`interest and My activity work at ${viewport.width}px`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await register(page);
		await page.goto('/my-activity');
		await expect(page.getByText('No interests yet')).toBeVisible();
		await page.goto('/events/event-board-game-evening');
		const button = page.getByRole('button', { name: 'Express interest', exact: true });
		await expect(button).toBeEnabled();
		let release: (() => void) | undefined;
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});
		let mutations = 0;
		await page.route('**/_app/remote/**', async (route) => {
			if (route.request().method() === 'POST') {
				mutations++;
				await held;
			}
			await route.continue();
		});
		await button.click();
		await expect(button).toBeDisabled();
		await expect(button).toHaveAttribute('aria-busy', 'true');
		await button.click({ force: true });
		await noOverflow(page);
		release?.();
		await expect(page.getByRole('button', { name: 'Withdraw interest' })).toBeEnabled();
		expect(mutations).toBe(1);
		await page.unroute('**/_app/remote/**');
		await page.reload();
		await expect(page.getByRole('button', { name: 'Withdraw interest' })).toBeEnabled();
		await page
			.getByRole('link', { name: 'My activity', exact: true })
			.filter({ visible: true })
			.click();
		await expect(page.getByRole('link', { name: /^Board game evening/ })).toHaveCount(1);
		await noOverflow(page);
		const scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter((violation) =>
				['critical', 'serious'].includes(violation.impact ?? '')
			)
		).toEqual([]);
		await page.getByRole('link', { name: /^Board game evening/ }).click();
		await page.getByRole('button', { name: 'Withdraw interest' }).click();
		await expect(page.getByRole('button', { name: 'Express interest', exact: true })).toBeEnabled();
		await page.goto('/my-activity');
		await expect(page.getByText('No interests yet')).toBeVisible();
	});
	test(`visitor, unavailable and server failure states fit ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/my-activity');
		await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fmy-activity/);
		await page.goto('/events/event-board-game-evening');
		let mutations = 0;
		page.on('request', (request) => {
			if (request.method() === 'POST' && request.url().includes('/_app/remote/')) mutations++;
		});
		await page.getByRole('button', { name: 'Express interest', exact: true }).click();
		const dialog = page.getByRole('dialog', { name: 'Sign in to continue' });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('link', { name: 'Register' })).toHaveAttribute(
			'href',
			'/register?returnTo=%2Fevents%2Fevent-board-game-evening'
		);
		expect(mutations).toBe(0);
		await noOverflow(page);
		await page.keyboard.press('Escape');
		await page.goto('/events/event-campus-welcome-walk');
		await expect(page.getByRole('button', { name: /interest/i })).toHaveCount(0);
		await page.goto('/events/event-cancelled-picnic');
		await expect(
			page.getByText('This Event is cancelled or no longer available for interest.')
		).toBeVisible();
		await noOverflow(page);
		await register(page);
		await page.goto('/events/event-board-game-evening');
		await page.route('**/_app/remote/**', async (route) => {
			if (route.request().method() === 'POST')
				await route.fulfill({ status: 500, body: 'unavailable' });
			else await route.continue();
		});
		await page.getByRole('button', { name: 'Express interest', exact: true }).click();
		await expect(page.getByText('Could not update your interest. Try again.')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Express interest', exact: true })).toBeEnabled();
		await noOverflow(page);
		await page.unroute('**/_app/remote/**');
		await page.goto('/my-activity');
		await expect(page.getByText('No interests yet')).toBeVisible();
	});
}

test('authors are excluded and seeded cancelled interests remain accessible', async ({ page }) => {
	await signIn(page, 'jonas.weber@example.com');
	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		await page.goto('/events/event-film-night');
		await expect(
			page.getByText('You authored this Event, so you cannot participate.')
		).toBeVisible();
		await expect(page.getByRole('button', { name: /interest/i })).toHaveCount(0);
		await noOverflow(page);
	}
	await page.context().clearCookies();
	await signIn(page, 'sofia.klein@example.com');
	await page.goto('/my-activity');
	await expect(page.getByText('Interest · Cancelled')).toBeVisible();
	await page.getByRole('link', { name: /^Rhine picnic/ }).click();
	await expect(page.getByRole('heading', { name: 'Rhine picnic' })).toBeVisible();
});

test('My activity presents loading and recoverable read failure', async ({ page }) => {
	await register(page);
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		await held;
		await route.fulfill({ status: 500, body: 'unavailable' });
	});
	await page
		.getByRole('link', { name: 'My activity', exact: true })
		.filter({ visible: true })
		.click();
	await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible();
	release?.();
	await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
	await page.unroute('**/_app/remote/**');
	await page.reload();
	await expect(page.getByText('No interests yet')).toBeVisible();
});
