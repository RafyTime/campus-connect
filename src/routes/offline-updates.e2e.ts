import { expect, test } from '@playwright/test';

for (const participation of [
	{
		path: '/events/event-stats-study-group',
		action: 'Register for Event',
		changed: 'Cancel registration',
		label: 'registration'
	},
	{
		path: '/events/event-board-game-evening',
		action: 'Express interest',
		changed: 'Withdraw interest',
		label: 'interest'
	}
]) {
	test(`a lost ${participation.label} response is checked before another mutation`, async ({
		page,
		context
	}) => {
		await page.goto('/register');
		await page.getByLabel('Display name').fill('Recovery Explorer');
		await page.getByLabel('Email').fill(`recovery.${crypto.randomUUID()}@example.com`);
		await page.getByLabel('Password', { exact: true }).fill('campus-connect-test');
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/');
		await page.goto(participation.path);
		await expect(
			page.getByRole('button', { name: participation.action, exact: true })
		).toBeEnabled();
		await context.setOffline(true);
		await expect(page.getByRole('status', { name: 'Connection' })).toContainText("You're offline");
		await page.getByRole('button', { name: participation.action, exact: true }).click();
		await expect(page.getByRole('alert')).toContainText('Nothing was submitted');
		await context.setOffline(false);
		let mutations = 0;
		let failCheck = true;
		await page.route('**/_app/remote/**', async (route) => {
			if (route.request().method() === 'POST') {
				mutations++;
				await route.fetch();
				await route.abort('failed');
			} else if (failCheck) await route.fulfill({ status: 503, body: 'unavailable' });
			else await route.continue();
		});
		await page.getByRole('button', { name: participation.action, exact: true }).click();
		await expect(page.getByRole('alert')).toContainText("couldn't confirm");
		await expect(
			page.getByRole('button', { name: participation.action, exact: true })
		).toBeDisabled();
		await page.getByRole('button', { name: 'Check current state', exact: true }).click();
		await expect(page.getByRole('alert')).toContainText('Could not check the current state');
		failCheck = false;
		await page.getByRole('button', { name: 'Check current state', exact: true }).click();
		await expect(
			page.getByRole('button', { name: participation.changed, exact: true })
		).toBeEnabled();
		expect(mutations).toBe(1);
		await page.unroute('**/_app/remote/**');
		await page.getByRole('button', { name: participation.changed, exact: true }).click();
		await expect(
			page.getByRole('button', { name: participation.action, exact: true })
		).toBeEnabled();
	});
}

test('offline form entry survives reconnection without a reload or submission', async ({
	page,
	context
}) => {
	await page.goto('/register');
	await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled();
	await page.getByLabel('Display name').fill('Offline Explorer');
	await context.setOffline(true);
	await expect(page.getByRole('status', { name: 'Connection' })).toContainText("You're offline");
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByRole('alert')).toContainText('Nothing was submitted');
	await context.setOffline(false);
	await expect(page.getByRole('status', { name: 'Connection' })).toContainText('Back online');
	await expect(page.getByLabel('Display name')).toHaveValue('Offline Explorer');
	await expect(page).toHaveURL('/register');
	await expect(page.getByRole('status', { name: 'Connection' })).toBeEmpty({ timeout: 7000 });
});

test('offline client navigation offers Retry for the destination', async ({ page, context }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	await expect(page.getByLabel('Appearance', { exact: true })).toBeEnabled();
	await context.setOffline(true);
	await page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'Groups', exact: true })
		.click();
	await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
	await context.setOffline(false);
	await page.getByRole('button', { name: 'Retry', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Groups', exact: true })).toBeVisible();
});

test('an installed browser gets an offline fallback and retries the original address', async ({
	page,
	context
}) => {
	await page.goto('/');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await context.setOffline(true);
	await page.goto('/events/event-board-game-evening?from=offline');
	await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
	await page.getByRole('button', { name: 'Retry', exact: true }).click();
	await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
	await context.setOffline(false);
	await expect(page.getByRole('status')).toContainText('Back online');
	await page.getByRole('button', { name: 'Retry', exact: true }).click();
	await expect(
		page.getByRole('heading', { name: 'Board game evening', exact: true })
	).toBeVisible();
	await expect(page).toHaveURL('/events/event-board-game-evening?from=offline');
});
