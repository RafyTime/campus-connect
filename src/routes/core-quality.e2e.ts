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
			'main input:not([type="hidden"]), main select, main textarea, main button, header button, nav a, [role="dialog"] a, [role="dialog"] button'
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

for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(`${colorScheme} appearance`, () => {
		test.use({ colorScheme });
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
				await expect(
					page.getByText('Enter a display name between 2 and 50 characters.')
				).toBeVisible();
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
	});
}

for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(`mobile installation in ${colorScheme} appearance`, () => {
		test.use({
			colorScheme,
			userAgent:
				'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'
		});
		for (const viewport of [
			{ width: 360, height: 800 },
			{ width: 768, height: 1024 },
			{ width: 1440, height: 900 }
		]) {
			test(`banner and installation drawer fit ${viewport.width}x${viewport.height}`, async ({
				page
			}, testInfo) => {
				await page.setViewportSize(viewport);
				await page.goto('/');
				const banner = page.getByRole('complementary', { name: 'Install Campus Connect' });
				await expect(banner).toBeVisible();
				await auditPage(page);
				if (viewport.width === 360)
					await page.screenshot({ path: testInfo.outputPath('installation-banner.png') });
				for (const button of await banner.getByRole('button').all()) {
					const box = await button.boundingBox();
					expect(box?.height).toBeGreaterThanOrEqual(44);
					expect(box?.width).toBeGreaterThanOrEqual(44);
				}
				await banner.getByRole('button', { name: 'Install', exact: true }).click();
				const drawer = page.getByRole('dialog', { name: 'Install Campus Connect' });
				await expect(drawer).toBeVisible();
				await auditPage(page);
				const box = await drawer.boundingBox();
				expect(box?.y).toBeGreaterThanOrEqual(0);
				expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1);
				if (viewport.width === 360)
					await page.screenshot({ path: testInfo.outputPath('installation-drawer.png') });
				await page.keyboard.press('Escape');
				await expect(banner.getByRole('button', { name: 'Install', exact: true })).toBeFocused();
			});
		}
	});
}

test('forms and filter-sheet actions remain reachable with a reduced mobile viewport', async ({
	page
}) => {
	await page.setViewportSize({ width: 360, height: 400 });
	await page.goto('/sign-in');
	await page.getByLabel('Email', { exact: true }).fill('mobile@example.com');
	await page.getByLabel('Password', { exact: true }).focus();
	const submit = page.getByRole('button', { name: 'Sign in', exact: true });
	await submit.scrollIntoViewIfNeeded();
	let bounds = await submit.boundingBox();
	expect(bounds?.y).toBeGreaterThanOrEqual(0);
	expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(400);
	await page.goto('/');
	await page.getByRole('button', { name: /^Filters/ }).click();
	const sheet = page.getByRole('dialog', { name: 'Filter Events', exact: true });
	await sheet.getByRole('button', { name: /^Date / }).click();
	await sheet.getByRole('radio', { name: 'Choose a date', exact: true }).click();
	await sheet.getByLabel('Choose a date', { exact: true }).focus();
	const done = sheet.getByRole('button', { name: 'Done', exact: true });
	bounds = await done.boundingBox();
	expect(bounds?.y).toBeGreaterThanOrEqual(0);
	expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(400);
	await done.click();
	await expect(sheet).toHaveCount(0);
});
