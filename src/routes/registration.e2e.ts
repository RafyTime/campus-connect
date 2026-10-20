import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function createExplorer(page: Page) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Registration Explorer');
	await page.getByLabel('Email').fill(`registration.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}
async function noOverflow(page: Page) {
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
}

for (const width of [360, 768, 1440]) {
	test(`registration, pending protection, failure recovery and cancellation at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: width === 360 ? 800 : width === 768 ? 1024 : 900 });
		await createExplorer(page);
		await page.goto('/events/event-stats-study-group');
		const button = page.getByRole('button', { name: 'Register for Event', exact: true });
		await expect(button).toBeEnabled();
		await page.route('**/_app/remote/**', async (route) => {
			if (route.request().method() === 'POST') await route.abort();
			else await route.continue();
		});
		await button.click();
		await expect(page.getByText('Could not update your registration. Try again.')).toBeVisible();
		await expect(button).toBeEnabled();
		await page.unroute('**/_app/remote/**');
		let release!: () => void;
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
		await expect(page.getByRole('status')).toHaveText('Updating registration…');
		await button.click({ force: true });
		release();
		await expect(page.getByRole('button', { name: 'Cancel registration' })).toBeEnabled();
		expect(mutations).toBe(1);
		await page.unroute('**/_app/remote/**');
		await expect(page.getByText('Capacity: 12', { exact: false })).toContainText('11 remaining');
		await expect(page.getByText('11 places remaining', { exact: true })).toBeVisible();
		await noOverflow(page);
		const scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter((violation) =>
				['critical', 'serious'].includes(violation.impact ?? '')
			)
		).toEqual([]);
		await page.screenshot({ path: `test-results/registration-${width}.png`, fullPage: true });
		await page.reload();
		await expect(page.getByRole('button', { name: 'Cancel registration' })).toBeEnabled();
		await page.goto('/my-activity');
		await expect(page.getByText('Registered', { exact: false })).toBeVisible();
		await expect(page.getByRole('link', { name: /^Statistics study group/ })).toHaveCount(1);
		await noOverflow(page);
		await page.getByRole('link', { name: /^Statistics study group/ }).click();
		await page.getByRole('button', { name: 'Cancel registration' }).click();
		await expect(button).toBeEnabled();
		await expect(page.getByText('12 places remaining', { exact: true })).toBeVisible();
		await page.goto('/my-activity');
		await expect(page.getByText('No activity yet')).toBeVisible();
	});
	test(`visitor, full, and unavailable registration states at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/events/event-stats-study-group');
		await page.getByRole('button', { name: 'Register for Event' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await page.goto('/events/event-full-workshop');
		await expect(page.getByRole('button', { name: 'Full', exact: true })).toBeDisabled();
		await expect(page.getByText('This Event is full.', { exact: true })).toBeVisible();
		await noOverflow(page);
		await page.goto('/events/event-cancelled-workshop');
		await expect(
			page.getByText('This Event is cancelled or no longer available for registration.')
		).toBeVisible();
		await expect(page.getByRole('button', { name: 'Register for Event' })).toHaveCount(0);
	});
}

test('a stale attempt at the final place returns full, preserves the winner, and recovers after cancellation', async ({
	page,
	baseURL,
	browser
}) => {
	await createExplorer(page);
	const otherContext = await browser.newContext({ baseURL });
	try {
		const other = await otherContext.newPage();
		await createExplorer(other);
		await page.goto('/events/event-group-run');
		await other.goto('/events/event-group-run');
		await expect(page.getByRole('button', { name: 'Register for Event' })).toBeEnabled();
		await expect(other.getByRole('button', { name: 'Register for Event' })).toBeEnabled();
		await page.getByRole('button', { name: 'Register for Event' }).click();
		await expect(page.getByRole('button', { name: 'Cancel registration' })).toBeEnabled();
		await other.getByRole('button', { name: 'Register for Event' }).click();
		await expect(
			other.getByText('This Event is full. No place was reserved. Check again later.')
		).toBeVisible();
		await expect(other.getByRole('button', { name: 'Full', exact: true })).toBeDisabled();
		await other.goto('/my-activity');
		await expect(other.getByText('No activity yet')).toBeVisible();
		await page.getByRole('button', { name: 'Cancel registration' }).click();
		await expect(page.getByRole('button', { name: 'Register for Event' })).toBeEnabled();
		await other.goto('/events/event-group-run');
		await other.getByRole('button', { name: 'Register for Event' }).click();
		await expect(other.getByRole('button', { name: 'Cancel registration' })).toBeEnabled();
		await other.getByRole('button', { name: 'Cancel registration' }).click();
		await expect(other.getByRole('button', { name: 'Register for Event' })).toBeEnabled();
	} finally {
		await otherContext.close();
	}
});
