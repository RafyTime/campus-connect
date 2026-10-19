import { expect, test, type Page, type Locator } from '@playwright/test';
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

async function openSection(page: Page, section: 'Date' | 'Tags' | 'Type' | 'Host') {
	if ((page.viewportSize()?.width ?? 1280) < 768) {
		const sheet = page.getByRole('dialog', { name: 'Filter Events', exact: true });
		if (!(await sheet.isVisible())) await page.getByRole('button', { name: /^Filters/ }).click();
		const trigger = sheet.getByRole('button', { name: new RegExp(`^${section} `) });
		if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
	} else {
		const trigger = page.getByRole('button', { name: section, exact: true });
		if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
			await page.keyboard.press('Escape');
			await trigger.click();
		}
	}
}

async function closeFilters(page: Page) {
	const sheet = page.getByRole('dialog', { name: 'Filter Events', exact: true });
	if (await sheet.isVisible())
		await sheet.getByRole('button', { name: 'Done', exact: true }).click();
	else await page.keyboard.press('Escape');
	await expect(
		page.locator('[data-slot="sheet-content"], [data-slot="popover-content"]')
	).toHaveCount(0);
}

async function expectTouchTarget(control: Locator) {
	await expect.poll(async () => (await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
	await expect.poll(async () => (await control.boundingBox())?.width).toBeGreaterThanOrEqual(44);
}

test('visitor restores combined filters from a shared URL and after refresh, then clears them', async ({
	page
}) => {
	await page.goto('/');
	const date = await campusStartDate(page, 'Campus film night');
	await page.goto(
		`/?tag=tag-arts&tag=tag-social&group=group-film-society&host=group&date=${date}&type=interest`
	);
	await openSection(page, 'Tags');
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await expect(page.getByRole('checkbox', { name: 'Social', exact: true })).toBeChecked();
	await openSection(page, 'Host');
	await expect(page.getByLabel('Group', { exact: true })).toHaveValue('group-film-society');
	await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('group');
	await openSection(page, 'Date');
	await expect(page.getByLabel('Choose a date', { exact: true })).toHaveValue(date);
	await closeFilters(page);
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await page.reload();
	await expect(page.getByRole('button', { name: 'Remove Interest', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove Arts', exact: true })).toBeVisible();
	await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('1 Event');
	await page.getByRole('button', { name: 'Clear all', exact: true }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('list', { name: 'Active filters' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
});

test('changing a filter announces loading until the new results arrive and preserves focus', async ({
	page
}) => {
	await page.goto('/');
	await openSection(page, 'Host');
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		await held;
		await route.continue();
	});
	const host = page.getByLabel('Host type', { exact: true });
	await expect(host).toBeEnabled();
	await host.focus();
	await expect(host).toBeFocused();
	await host.selectOption('group');
	await expect(page.getByRole('status', { name: /Loading (page|Events)/ })).toBeVisible();
	release?.();
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
	await expect(host).toBeFocused();
	await closeFilters(page);
	await expect(page.getByRole('button', { name: 'Host', exact: true })).toBeFocused();
});

test('Tag controls use OR semantics, retain selections in history, and remove a selected Tag', async ({
	page
}) => {
	await page.goto('/');
	await openSection(page, 'Tags');
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
	await openSection(page, 'Tags');
	await expect(page.getByRole('checkbox', { name: 'Study', exact: true })).toBeChecked();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).not.toBeChecked();
	await page.goForward();
	await openSection(page, 'Tags');
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await closeFilters(page);
	await page.getByRole('button', { name: 'Remove Study', exact: true }).click();
	await expect(page).toHaveURL('/?tag=tag-arts');
	await expect(page.getByRole('link', { name: 'Statistics study group' })).toHaveCount(0);
});

test('filter changes while a request is pending retain every selected category and Type', async ({
	page
}) => {
	await page.goto('/');
	await openSection(page, 'Host');
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
	await openSection(page, 'Tags');
	await page.getByRole('checkbox', { name: 'Arts', exact: true }).check();
	await openSection(page, 'Type');
	await page.getByRole('button', { name: 'Interest', exact: true }).click();
	await page.getByRole('button', { name: 'Registration', exact: true }).click();
	release?.();
	await expect(page).toHaveURL(/type=interest&type=registration/);
	await expect(page.getByRole('button', { name: 'Interest', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.getByRole('button', { name: 'Registration', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await closeFilters(page);
	await expect(page.getByRole('button', { name: 'Remove Arts', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove Group hosts', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Board game evening' })).toHaveCount(0);
});

test('relative dates and multiple Types survive refresh, history, and chip removal', async ({
	page
}) => {
	await page.goto('/');
	await openSection(page, 'Date');
	await page.getByRole('radio', { name: 'Next week', exact: true }).check();
	await expect(page).toHaveURL('/?date=next-week');
	await openSection(page, 'Type');
	await page.getByRole('button', { name: 'Interest', exact: true }).click();
	await expect(page).toHaveURL('/?date=next-week&type=interest');
	await page.getByRole('button', { name: 'Registration', exact: true }).click();
	await expect(page).toHaveURL('/?date=next-week&type=interest&type=registration');
	await closeFilters(page);
	await page.reload();
	await expect(page.getByRole('button', { name: 'Remove Next week', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove Interest', exact: true })).toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Remove Registration', exact: true })
	).toBeVisible();
	await page.getByRole('button', { name: 'Remove Interest', exact: true }).click();
	await expect(page).toHaveURL('/?date=next-week&type=registration');
	await page.goBack();
	await expect(page.getByRole('button', { name: 'Remove Interest', exact: true })).toBeVisible();
	await openSection(page, 'Date');
	await expect(page.getByRole('radio', { name: 'Next week', exact: true })).toBeChecked();
	await page.getByRole('radio', { name: 'Any date', exact: true }).check();
	await expect(page).toHaveURL('/?type=interest&type=registration');
	await page.getByRole('radio', { name: 'Choose a date', exact: true }).check();
	await expect(page.getByLabel('Choose a date', { exact: true })).toBeVisible();
});

test('invalid URL values are ignored while valid selections and results survive', async ({
	page
}) => {
	await page.goto(
		'/?tag=missing&tag=tag-wellness&tag=tag-wellness&date=2026-02-30&group=missing&host=%20PERSONAL%20&type=unknown'
	);
	await openSection(page, 'Date');
	await expect(page.getByRole('radio', { name: 'Any date', exact: true })).toBeChecked();
	await openSection(page, 'Tags');
	await expect(page.getByRole('checkbox', { name: 'Wellness', exact: true })).toBeChecked();
	await openSection(page, 'Host');
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
	await expect(page.getByRole('button', { name: 'Remove Wellness', exact: true })).toBeVisible();
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
		await expect(page.getByLabel('Host type', { exact: true })).toHaveCount(0);
		await openSection(page, 'Date');
		await page.getByRole('radio', { name: 'Choose a date', exact: true }).check();
		await page.getByLabel('Choose a date', { exact: true }).fill(date);
		await expect(page.getByLabel('Choose a date', { exact: true })).toHaveValue(date);
		await expectTouchTarget(page.getByLabel('Choose a date', { exact: true }));
		await openSection(page, 'Tags');
		await expect(page.getByLabel('Choose a date', { exact: true })).not.toBeVisible();
		await page.getByRole('checkbox', { name: 'Social', exact: true }).check();
		await expect(page.getByRole('checkbox', { name: 'Social', exact: true })).toBeChecked();
		await expectTouchTarget(
			page
				.locator('label')
				.filter({ has: page.getByRole('checkbox', { name: 'Social', exact: true }) })
		);
		await openSection(page, 'Type');
		await page.getByRole('button', { name: 'Interest', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Interest', exact: true })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expectTouchTarget(page.getByRole('button', { name: 'Interest', exact: true }));
		await openSection(page, 'Host');
		await page.getByLabel('Host type', { exact: true }).selectOption('personal');
		await expect(page.getByLabel('Host type', { exact: true })).toHaveValue('personal');
		await expectTouchTarget(page.getByLabel('Host type', { exact: true }));
		await checkLayoutAndAccessibility(page);
		if (viewport.width < 768) {
			await expect(page.getByRole('button', { name: /^Date / })).toHaveAttribute(
				'aria-expanded',
				'false'
			);
			await expect(page.getByRole('status', { name: 'Filtered results' })).toHaveText(
				/Events? match/
			);
			await expectTouchTarget(page.getByRole('button', { name: 'Done', exact: true }));
			await expectTouchTarget(page.getByRole('button', { name: 'Close', exact: true }));
		}
		await closeFilters(page);
		await expect(page.getByRole('link', { name: 'Board game evening' })).toBeVisible();
		await expect(page.getByRole('list', { name: 'Active filters' })).toContainText('Social');
		await expect(page.getByRole('list', { name: 'Active filters' })).toContainText(date);
		await expect(page.getByRole('status', { name: 'Event results' })).toContainText('Event');
		await checkLayoutAndAccessibility(page);
		await page.screenshot({
			path: `test-results/discover-filtered-${viewport.width}.png`,
			fullPage: true
		});
		await openSection(page, 'Host');
		await page.getByLabel('Group', { exact: true }).selectOption('group-film-society');
		await expect(page.getByLabel('Group', { exact: true })).toHaveValue('group-film-society');
		await closeFilters(page);
		await expect(page.getByRole('heading', { name: 'No matching Events' })).toBeVisible();
		await expect(page.getByRole('status', { name: 'Event results' })).toHaveText('0 Events');
		await checkLayoutAndAccessibility(page);
		await page.screenshot({
			path: `test-results/discover-empty-${viewport.width}.png`,
			fullPage: true
		});
		await page.getByRole('button', { name: 'Show all Events' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('list', { name: 'Active filters' })).toHaveCount(0);
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
