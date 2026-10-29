import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// These audits traverse several routes and scan them in the shared release runner.
test.setTimeout(60_000);

async function auditPage(page: Page) {
	await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
	// Check actual control bounds as well as page overflow: overflow-hidden can conceal clipping.
	for (const control of await page
		.locator(
			'main input:not([type="hidden"]), main select, main textarea, main button, nav a, [role="dialog"] a, [role="dialog"] button'
		)
		.all()) {
		if (!(await control.isVisible()) || (await control.getAttribute('aria-hidden')) === 'true')
			continue;
		const bounds = await control.boundingBox();
		expect(bounds).not.toBeNull();
		if (!bounds) continue;
		expect(bounds.x, await control.evaluate((element) => element.outerHTML)).toBeGreaterThanOrEqual(
			0
		);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
	}
	const scan = await new AxeBuilder({ page }).analyze();
	expect(
		scan.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious')
	).toEqual([]);
}

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
]) {
	test(`core routes, validation and authentication dialog are accessible and fit ${viewport.width}x${viewport.height}`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.route('https://tiles.openfreemap.org/**', (route) => route.abort());
		await page.route('https://upload.wikimedia.org/**', (route) => route.abort());
		for (const path of [
			'/',
			'/events/event-board-game-evening',
			'/groups/group-film-society',
			'/sign-in',
			'/register'
		]) {
			await page.goto(path);
			await auditPage(page);
		}
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByText('Enter a display name between 2 and 50 characters.')).toBeVisible();
		await auditPage(page);
		await page.goto('/groups/group-film-society');
		const follow = page.getByRole('button', { name: 'Follow', exact: true });
		await expect(follow).toBeEnabled();
		await follow.focus();
		await page.keyboard.press('Enter');
		const dialog = page.getByRole('dialog', { name: 'Sign in to continue' });
		await expect(dialog).toBeVisible();
		await auditPage(page);
		await page.keyboard.press('Escape');
		await expect(follow).toBeFocused();
		await page.goto('/register');
		await page.getByLabel('Display name').fill('Quality Explorer');
		await page.getByLabel('Email').fill(`quality.${crypto.randomUUID()}@example.com`);
		await page.getByLabel('Password').fill('campus-connect');
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/');
		for (const path of ['/create', '/my-activity', '/my-events']) {
			await page.goto(path);
			await auditPage(page);
		}
	});
}
