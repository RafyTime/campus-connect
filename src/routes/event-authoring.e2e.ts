import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function register(page: Page) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Personal Creator');
	await page.getByLabel('Email').fill(`qa.events.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}

async function fillEvent(page: Page, title: string) {
	await page.getByLabel('Title', { exact: true }).fill(title);
	await page
		.getByLabel('Description', { exact: true })
		.fill('Bring your laptop and work through campus projects together.');
	await page.getByLabel('Start', { exact: true }).fill('2030-09-02T18:00');
	await page.getByLabel('End', { exact: true }).fill('2030-09-02T20:00');
	await page.getByRole('checkbox', { name: 'Tech', exact: true }).check();
	await page.getByLabel('Response mode', { exact: true }).selectOption('registration');
	await page.getByLabel('Capacity', { exact: true }).fill('12');
	await page.getByLabel('Location', { exact: true }).selectOption('location-library');
}

test('a Creator publishes, discovers, and manages a public personal Event', async ({
	page,
	browser
}) => {
	await register(page);
	await page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'Create', exact: true })
		.click();
	const title = `Coding evening ${crypto.randomUUID().slice(0, 8)}`;
	await fillEvent(page, title);
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
	await expect(page.getByText('Personal Creator', { exact: true })).toBeVisible();
	await expect(page.getByText('Campus Library', { exact: true })).toBeVisible();
	await expect(page.getByText('12 places remaining', { exact: true })).toBeVisible();
	const eventUrl = page.url();
	const visitor = await browser.newPage();
	await visitor.goto('/');
	await visitor.getByRole('link', { name: new RegExp(title) }).click();
	await expect(visitor).toHaveURL(eventUrl);
	await visitor.close();
	await page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'My events', exact: true })
		.click();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await page.getByRole('link', { name: `Edit ${title}` }).click();
	await expect(page.getByLabel('Start', { exact: true })).toHaveValue('2030-09-02T18:00');
	await expect(page.getByRole('checkbox', { name: 'Tech', exact: true })).toBeChecked();
	await page.getByLabel('Title', { exact: true }).fill(`${title} outdoors`);
	await page.getByLabel('Response mode', { exact: true }).selectOption('interest');
	await page.getByLabel('Location', { exact: true }).selectOption('manual');
	await page.getByLabel('Location label', { exact: true }).fill('Garden beside the library');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByRole('heading', { name: `${title} outdoors`, level: 1 })).toBeVisible();
	await page.reload();
	await expect(page.getByText('Garden beside the library', { exact: true })).toBeVisible();
	await expect(page.getByText('Interest', { exact: true })).toBeVisible();
});

test('validation and request failures preserve input and allow correction', async ({ page }) => {
	await register(page);
	await page.goto('/create');
	await page.getByLabel('Title', { exact: true }).fill('short');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(
		page.getByText('Enter a description between 20 and 2,000 characters.')
	).toBeVisible();
	await expect(page.getByText('Choose one to three Tags.')).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('short');
	await fillEvent(page, 'Failed request campus Event');
	await page.getByLabel('Start', { exact: true }).fill('2030-03-31T02:30');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(
		page.getByText('Choose an unambiguous date and time in Europe/Berlin.')
	).toBeVisible();
	await page.getByLabel('Start', { exact: true }).fill('2030-09-02T18:00');
	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() === 'POST')
			await route.fulfill({ status: 500, contentType: 'text/plain', body: 'unavailable' });
		else await route.continue();
	});
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByText('The request failed. Try again.')).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
		'Failed request campus Event'
	);
	await expect(page.getByRole('button', { name: 'Publish Event' })).toBeEnabled();
	await page.unroute('**/_app/remote/**');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(
		page.getByRole('heading', { name: 'Failed request campus Event', level: 1 })
	).toBeVisible();
});

test('visitors return through sign-in and other Users cannot manage someone else’s Event', async ({
	page
}) => {
	for (const path of ['/create', '/my-events', '/events/event-campus-welcome-walk/edit']) {
		await page.goto(path);
		await expect(page).toHaveURL(new RegExp(`/sign-in\\?returnTo=${encodeURIComponent(path)}`));
	}
	await register(page);
	await page.goto('/events/event-campus-welcome-walk/edit');
	await expect(page.getByText('Only the author can edit this personal Event.')).toBeVisible();
	await page.goto('/my-events');
	await expect(page.getByText('No Events yet')).toBeVisible();
});

test('pending publication disables submission and announces the busy form', async ({ page }) => {
	await register(page);
	await page.goto('/create');
	await fillEvent(page, 'Pending campus Event');
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() === 'POST') await held;
		await route.continue();
	});
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByRole('button', { name: 'Publish Event' })).toBeDisabled();
	await expect(page.locator('form[aria-busy]')).toHaveAttribute('aria-busy', 'true');
	release?.();
	await expect(page.getByRole('heading', { name: 'Pending campus Event', level: 1 })).toBeVisible();
});

test('Create, edit, and My events fit phone, tablet, and desktop and keep controls usable', async ({
	page
}) => {
	await register(page);
	await page.goto('/my-events');
	await expect(page.getByText('No Events yet')).toBeVisible();
	await page.goto('/create');
	for (const viewport of [
		{ width: 360, height: 800 },
		{ width: 768, height: 1024 },
		{ width: 1440, height: 900 }
	]) {
		await page.setViewportSize(viewport);
		await expect(page.getByLabel('Title', { exact: true })).toBeVisible();
		const dimensions = await page.evaluate(() => ({
			width: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
		for (const control of [
			page.getByLabel('Start', { exact: true }),
			page.getByLabel('Response mode', { exact: true }),
			page.getByLabel('Location', { exact: true }),
			page.getByRole('button', { name: 'Publish Event' })
		]) {
			expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
		}
	}
	const title = `Responsive personal Event ${crypto.randomUUID().slice(0, 8)}`;
	await fillEvent(page, title);
	await page.getByLabel('Location', { exact: true }).selectOption('manual');
	await page.getByLabel('Location label', { exact: true }).fill('Library garden');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
	for (const viewport of [
		{ width: 360, height: 800 },
		{ width: 768, height: 1024 },
		{ width: 1440, height: 900 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/my-events');
		await expect(page.getByRole('heading', { name: title })).toBeVisible();
		const listDimensions = await page.evaluate(() => ({
			width: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(listDimensions.scroll).toBeLessThanOrEqual(listDimensions.width);
		await page.getByRole('link', { name: `Edit ${title}` }).click();
		await expect(page.getByLabel('Location label', { exact: true })).toHaveValue('Library garden');
		const dimensions = await page.evaluate(() => ({
			width: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
	}
});

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 1440, height: 900 }
]) {
	test(`Event authoring and My events have no serious accessibility violations at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await register(page);
		await page.goto('/create');
		const title = `Accessible campus Event ${crypto.randomUUID().slice(0, 8)}`;
		await fillEvent(page, title);
		await page.getByLabel('Location', { exact: true }).selectOption('manual');
		await page.getByLabel('Location label', { exact: true }).fill('Library garden');
		let scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter(
				(violation) => violation.impact === 'critical' || violation.impact === 'serious'
			)
		).toEqual([]);
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.screenshot({
			path: `test-results/event-create-${viewport.width}.png`,
			fullPage: true
		});
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
		await page.goto('/my-events');
		await expect(page.getByRole('heading', { name: title })).toBeVisible();
		scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter(
				(violation) => violation.impact === 'critical' || violation.impact === 'serious'
			)
		).toEqual([]);
		await page.getByRole('link', { name: `Edit ${title}` }).click();
		await expect(page.getByLabel('Location label', { exact: true })).toHaveValue('Library garden');
		scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter(
				(violation) => violation.impact === 'critical' || violation.impact === 'serious'
			)
		).toEqual([]);
	});
}
