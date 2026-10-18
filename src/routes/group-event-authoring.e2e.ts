import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function signIn(page: Page, name: 'lena' | 'jonas' | 'sofia' | 'mira') {
	const emails = {
		lena: 'lena.hartmann@example.com',
		jonas: 'jonas.weber@example.com',
		sofia: 'sofia.klein@example.com',
		mira: 'mira.okonkwo@example.com'
	};
	await page.goto('/sign-in');
	await page.getByLabel('Email').fill(emails[name]);
	await page.getByLabel('Password').fill('campus-connect-test');
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();
	await expect(page).toHaveURL('/');
}

test('visitors, subscribers, and unrelated Users cannot publish or manage for the Film Society', async ({
	page
}) => {
	await page.goto('/create');
	await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fcreate/);
	await page.goto('/events/event-film-night/edit');
	await expect(page).toHaveURL(/\/sign-in\?returnTo=/);
	for (const actor of ['sofia', 'mira'] as const) {
		await signIn(page, actor);
		await page.goto('/create');
		await expect(
			page.getByLabel('Host', { exact: true }).locator('option[value="group-film-society"]')
		).toHaveCount(0);
		if (actor === 'sofia') {
			await expect(
				page.getByText('You do not own or represent any Groups. You can publish a personal Event.')
			).toBeVisible();
			await page.goto('/my-events');
			await expect(page.getByText('No Events yet')).toBeVisible();
			await page.goto('/create');
		}
		// A forged browser choice must still be rejected by the application operation.
		await page.getByLabel('Host', { exact: true }).evaluate((select) => {
			const option = document.createElement('option');
			option.value = 'group-film-society';
			option.textContent = 'Film Society';
			select.append(option);
		});
		await fillEvent(page, `Forbidden Group Event ${actor}`);
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(
			page.getByText('You do not have permission to publish or manage Events for this host.')
		).toBeVisible();
		await expect(page.getByLabel('Host', { exact: true })).toHaveValue('group-film-society');
		await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
			`Forbidden Group Event ${actor}`
		);
		await page.goto('/my-events');
		await expect(
			page.getByRole('link', { name: 'Edit Campus film night', exact: true })
		).toHaveCount(0);
		await page.goto('/events/event-film-night/edit');
		await expect(page.getByText('You do not have permission to manage this Event.')).toBeVisible();
		await page.context().clearCookies();
	}
});

test('Group validation and request failure preserve host and input for recovery', async ({
	page
}) => {
	await signIn(page, 'jonas');
	await page.goto('/create');
	await page.getByLabel('Host', { exact: true }).selectOption('group-film-society');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByText('Enter a title between 5 and 100 characters.')).toBeVisible();
	await expect(page.getByLabel('Host', { exact: true })).toHaveValue('group-film-society');
	const title = `Recoverable film night ${crypto.randomUUID().slice(0, 8)}`;
	await fillEvent(page, title);
	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() === 'POST')
			await route.fulfill({ status: 500, contentType: 'text/plain', body: 'unavailable' });
		else await route.continue();
	});
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByText('The request failed. Try again.')).toBeVisible();
	await expect(page.getByLabel('Host', { exact: true })).toHaveValue('group-film-society');
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue(title);
	await expect(page.getByRole('button', { name: 'Publish Event' })).toBeEnabled();
	await expect(page.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
	await expect(page.getByRole('checkbox', { name: 'Tech', exact: true })).toBeChecked();
	await page.unroute('**/_app/remote/**');
	await page.getByRole('button', { name: 'Publish Event' }).click();
	await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
});

test('Group publication shows pending state and prevents repeat submissions', async ({ page }) => {
	await signIn(page, 'lena');
	await page.goto('/create');
	const title = `Pending film night ${crypto.randomUUID().slice(0, 8)}`;
	await fillEvent(page, title);
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
	await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
});

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
]) {
	test(`Group creation, management, and form states fit ${viewport.width}px without serious accessibility violations`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await signIn(page, 'jonas');
		await page.goto('/create');
		const title = `Responsive film night ${crypto.randomUUID().slice(0, 8)}`;
		await fillEvent(page, title);
		for (const control of [
			page.getByLabel('Host', { exact: true }),
			page.getByRole('button', { name: 'Publish Event' })
		]) {
			expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
		}
		await page.getByLabel('Description', { exact: true }).fill('short');
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(
			page.getByText('Enter a description between 20 and 2,000 characters.')
		).toBeVisible();
		await checkLayoutAndAccessibility(page);
		await page
			.getByLabel('Description', { exact: true })
			.fill('Watch and discuss a campus favourite together.');
		await page.route('**/_app/remote/**', async (route) => {
			if (route.request().method() === 'POST')
				await route.fulfill({ status: 500, contentType: 'text/plain', body: 'unavailable' });
			else await route.continue();
		});
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(page.getByText('The request failed. Try again.')).toBeVisible();
		await checkLayoutAndAccessibility(page);
		await page.unroute('**/_app/remote/**');
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
		await page.goto('/my-events');
		await checkLayoutAndAccessibility(page);
		await page.getByRole('link', { name: `Edit ${title}` }).click();
		await expect(page.getByText('Host: Film Society.', { exact: false })).toBeVisible();
		await checkLayoutAndAccessibility(page);
		await page.screenshot({
			path: `test-results/group-event-edit-${viewport.width}.png`,
			fullPage: true
		});
		await page.goto('/events/event-ended-film-meetup/edit');
		await expect(page.getByText('Event is read-only')).toBeVisible();
		await page.context().clearCookies();
		await signIn(page, 'sofia');
		await page.goto('/create');
		await expect(
			page.getByText('You do not own or represent any Groups. You can publish a personal Event.')
		).toBeVisible();
		await checkLayoutAndAccessibility(page);
		await page.goto('/my-events');
		await expect(page.getByText('No Events yet')).toBeVisible();
		await checkLayoutAndAccessibility(page);
		await page.goto('/events/event-film-night/edit');
		await expect(page.getByText('You do not have permission to manage this Event.')).toBeVisible();
		await checkLayoutAndAccessibility(page);
	});
}

async function checkLayoutAndAccessibility(page: Page) {
	const dimensions = await page.evaluate(() => ({
		client: document.documentElement.clientWidth,
		scroll: document.documentElement.scrollWidth
	}));
	expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
	const scan = await new AxeBuilder({ page }).analyze();
	expect(
		scan.violations.filter(
			(violation) => violation.impact === 'critical' || violation.impact === 'serious'
		)
	).toEqual([]);
}

async function fillEvent(page: Page, title: string) {
	await page.getByLabel('Host', { exact: true }).selectOption('group-film-society');
	await page.getByLabel('Title', { exact: true }).fill(title);
	await page
		.getByLabel('Description', { exact: true })
		.fill('Watch and discuss a campus favourite together.');
	await page.getByLabel('Start', { exact: true }).fill('2030-09-02T18:00');
	await page.getByLabel('End', { exact: true }).fill('2030-09-02T20:00');
	await page.getByRole('checkbox', { name: 'Arts', exact: true }).check();
	await page.getByRole('checkbox', { name: 'Tech', exact: true }).check();
	await page.getByLabel('Response mode', { exact: true }).selectOption('registration');
	await page.getByLabel('Capacity', { exact: true }).fill('12');
	await page.getByLabel('Location', { exact: true }).selectOption('location-library');
}

for (const actor of ['lena', 'jonas'] as const) {
	test(`seeded ${actor} publishes a public Group Event that the other manager can edit`, async ({
		page,
		browser
	}) => {
		await signIn(page, actor);
		await page.goto('/create');
		const title = `Group film evening ${crypto.randomUUID().slice(0, 8)}`;
		await fillEvent(page, title);
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Film Society', exact: true })).toBeVisible();
		await expect(page.getByText('Arts', { exact: true })).toBeVisible();
		await expect(page.getByText('Tech', { exact: true })).toBeVisible();
		const eventUrl = page.url();
		const visitor = await browser.newPage();
		await visitor.goto('/');
		await visitor.getByRole('link', { name: new RegExp(title) }).click();
		await expect(visitor).toHaveURL(eventUrl);
		await visitor.goto('/groups/group-film-society');
		await expect(visitor.getByRole('heading', { name: title })).toBeVisible();
		await visitor.close();
		await page.goto('/my-events');
		await expect(page.getByRole('link', { name: `Edit ${title}` })).toBeVisible();
		const other = await browser.newPage();
		await signIn(other, actor === 'lena' ? 'jonas' : 'lena');
		await other.goto('/my-events');
		await other.getByRole('link', { name: `Edit ${title}` }).click();
		await expect(
			other.getByText(
				`Host: Film Society. Published by ${actor === 'lena' ? 'Lena Hartmann' : 'Jonas Weber'}. The host cannot change.`
			)
		).toBeVisible();
		await expect(other.getByLabel('Host', { exact: true })).toHaveCount(0);
		await expect(other.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
		await expect(other.getByRole('checkbox', { name: 'Tech', exact: true })).toBeChecked();
		await other.getByRole('checkbox', { name: 'Tech', exact: true }).uncheck();
		await other.getByRole('checkbox', { name: 'Social', exact: true }).check();
		await other.getByLabel('Title', { exact: true }).fill(`${title} outdoors`);
		await other.getByLabel('Response mode', { exact: true }).selectOption('interest');
		await other.getByLabel('Location', { exact: true }).selectOption('manual');
		await other.getByLabel('Location label', { exact: true }).fill('Library garden');
		await other.getByRole('button', { name: 'Save changes' }).click();
		await expect(other.getByRole('heading', { name: `${title} outdoors`, level: 1 })).toBeVisible();
		await other.reload();
		await expect(other.getByRole('link', { name: 'Film Society', exact: true })).toBeVisible();
		await expect(other.getByText('Library garden', { exact: true })).toBeVisible();
		await expect(other.getByText('Arts', { exact: true })).toBeVisible();
		await expect(other.getByText('Social', { exact: true })).toBeVisible();
		await expect(other.getByText('Tech', { exact: true })).toHaveCount(0);
		await other.goto(`${eventUrl}/edit`);
		await expect(other.getByRole('checkbox', { name: 'Arts', exact: true })).toBeChecked();
		await expect(other.getByRole('checkbox', { name: 'Social', exact: true })).toBeChecked();
		await expect(other.getByRole('checkbox', { name: 'Tech', exact: true })).not.toBeChecked();
		await other.close();
	});
}
