import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function campusStartDate(page: Page, title: string) {
	const startsAt = await page
		.getByRole('link', { name: title })
		.locator('time')
		.getAttribute('datetime');
	if (!startsAt) throw new Error(`Missing start time for ${title}`);
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date(startsAt));
}

test('visitor restores combined filters from a shared URL and after refresh, then clears them', async ({
	page
}) => {
	await page.goto('/');
	const date = await campusStartDate(page, 'Campus film night');
	await page.goto(`/?tag=tag-arts&tag=tag-social&group=group-film-society&host=group&date=${date}`);
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await expect(page.getByRole('checkbox', { name: 'Social', exact: true })).toBeChecked();
	await expect(page.getByLabel('Group', { exact: true })).toHaveValue('group-film-society');
	await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('group');
	await expect(page.getByLabel('Date', { exact: true })).toHaveValue(date);
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await page.reload();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await page.getByRole('button', { name: 'Clear all filters', exact: true }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).not.toBeChecked();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
});

test('changing a filter announces loading until the new results arrive', async ({ page }) => {
	await page.goto('/');
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		await held;
		await route.continue();
	});
	await page.getByLabel('Host type', { exact: true }).focus();
	await page.getByLabel('Host type', { exact: true }).selectOption('group');
	await expect(page.getByRole('status', { name: /Loading (page|Events)/ })).toBeVisible();
	release?.();
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
	await expect(page.getByLabel('Host type', { exact: true })).toBeFocused();
});

test('Tag controls use OR semantics, retain selections in history, and remove a selected Tag', async ({
	page
}) => {
	await page.goto('/');
	await page.getByRole('checkbox', { name: 'Study', exact: true }).check();
	await expect(page).toHaveURL(/tag=tag-study/);
	await expect(page.getByRole('link', { name: 'Statistics study group' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
	await page.getByRole('checkbox', { name: 'Arts', exact: true }).focus();
	await page.getByRole('checkbox', { name: 'Arts', exact: true }).press('Space');
	await expect(page).toHaveURL(/tag=tag-study&tag=tag-arts/);
	await expect(page.getByRole('link', { name: 'Statistics study group' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
	await page.goBack();
	await expect(page.getByRole('checkbox', { name: 'Study', exact: true })).toBeChecked();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).not.toBeChecked();
	await page.goForward();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await page.getByRole('checkbox', { name: 'Study', exact: true }).uncheck();
	await expect(page).toHaveURL('/?tag=tag-arts');
	await expect(page.getByRole('link', { name: 'Statistics study group' })).toHaveCount(0);
});

test('filter changes made while a request is pending retain every selected category', async ({
	page
}) => {
	await page.goto('/');
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		await held;
		await route.continue();
	});
	await page.getByLabel('Host type', { exact: true }).selectOption('group');
	await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible();
	await page.getByRole('checkbox', { name: 'Arts', exact: true }).check();
	release?.();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('group');
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
});

test('invalid URL values are ignored while valid selections and results survive', async ({
	page
}) => {
	await page.goto(
		'/?tag=missing&tag=tag-wellness&tag=tag-wellness&date=2026-02-30&group=missing&host=%20PERSONAL%20'
	);
	await expect(page.getByRole('checkbox', { name: 'Wellness', exact: true })).toBeChecked();
	await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
	await expect(page.getByLabel('Group', { exact: true })).toHaveValue('');
	await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('personal');
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await expect(page.getByRole('link', { name: 'Evening run club' })).toBeVisible();
	await page.getByLabel('Host type', { exact: true }).selectOption('group');
	await expect(page).toHaveURL('/?tag=tag-wellness&host=group');
	await expect(page.getByRole('link', { name: 'Sunday campus run' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Evening run club' })).toHaveCount(0);
});

test('signed-in Users restore the same public filter results', async ({ page }) => {
	await page.goto('/sign-in');
	await page.getByLabel('Email').fill('sofia.klein@example.com');
	await page.getByLabel('Password').fill('campus-connect-test');
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();
	await expect(page).toHaveURL('/');
	await page.goto('/?tag=tag-wellness&host=personal');
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await expect(page.getByRole('link', { name: 'Evening run club' })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('checkbox', { name: 'Wellness', exact: true })).toBeChecked();
});

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
]) {
	test(`filters, counts, and no-match recovery are accessible at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/');
		const date = await campusStartDate(page, 'Board game evening');
		await page.getByLabel('Date', { exact: true }).fill(date);
		await expect(page.getByLabel('Date', { exact: true })).toHaveValue(date);
		await page.getByRole('checkbox', { name: 'Social', exact: true }).check();
		await expect(page.getByRole('checkbox', { name: 'Social', exact: true })).toBeChecked();
		await page.getByLabel('Host type', { exact: true }).selectOption('personal');
		await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
		await expect(page.getByRole('list', { name: 'Active filters' })).toContainText('Social');
		await expect(page.getByRole('list', { name: 'Active filters' })).toContainText(`Date: ${date}`);
		await expect(page.getByRole('status', { name: 'Event results' })).toContainText('Event');
		await checkLayoutAndAccessibility(page);
		await page.screenshot({
			path: `test-results/discover-filtered-${viewport.width}.png`,
			fullPage: true
		});
		for (const control of [
			page.getByLabel('Date', { exact: true }),
			page.getByLabel('Group', { exact: true }),
			page.getByLabel('Host type', { exact: true }),
			page.getByRole('button', { name: 'Clear all filters' }),
			page.locator('label[for="filter-tag-social"]')
		]) {
			const box = await control.boundingBox();
			expect(box?.height).toBeGreaterThanOrEqual(44);
			expect(box?.width).toBeGreaterThanOrEqual(44);
		}
		await page.getByLabel('Group', { exact: true }).selectOption('group-film-society');
		await expect(page.getByRole('heading', { name: 'No matching Events' })).toBeVisible();
		await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('0 Events');
		await checkLayoutAndAccessibility(page);
		await page.screenshot({
			path: `test-results/discover-empty-${viewport.width}.png`,
			fullPage: true
		});
		await page.getByRole('button', { name: 'Show all Events' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByLabel('Date', { exact: true })).toHaveValue('');
		await expect(page.getByLabel('Group', { exact: true })).toHaveValue('');
		await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('');
		await expect(page.getByRole('checkbox', { name: 'Social', exact: true })).not.toBeChecked();
		await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
		await page.screenshot({ path: `test-results/discover-${viewport.width}.png`, fullPage: true });
	});
}

async function checkLayoutAndAccessibility(page: Page) {
	const dimensions = await page.evaluate(() => ({
		width: document.documentElement.clientWidth,
		scroll: document.documentElement.scrollWidth
	}));
	expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
	const scan = await new AxeBuilder({ page }).analyze();
	expect(
		scan.violations.filter(
			(violation) => violation.impact === 'critical' || violation.impact === 'serious'
		)
	).toEqual([]);
}
