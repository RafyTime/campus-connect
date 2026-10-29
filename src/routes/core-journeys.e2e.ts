import { expect, test, type Page } from '@playwright/test';

// These audits traverse several routes and scan them in the shared release runner.
test.setTimeout(60_000);

// The two publication journeys live in event-authoring and group-event-authoring.
// Keep these journeys at the same desktop Chromium seam, with real server mutations.
test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ page }) => {
	await page.route('https://tiles.openfreemap.org/**', (route) => route.abort());
});

async function register(page: Page, name: string) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill(name);
	await page.getByLabel('Email').fill(`journey.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}

test('public visitor discovers filtered Events, opens details and explores the host Group', async ({
	page
}) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Host', exact: true }).click();
	await page.getByLabel('Host type', { exact: true }).selectOption('group');
	await page.getByLabel('Group', { exact: true }).selectOption('group-film-society');
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL(/group=group-film-society/);
	await page.reload();
	await page.getByRole('link', { name: /^Campus film night/ }).click();
	await expect(page.getByRole('heading', { name: 'Campus film night', level: 1 })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Location map' })).toBeVisible();
	await expect(page.getByText('Campus Cafeteria', { exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Film Society', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Film Society', level: 1 })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Follow', exact: true })).toBeVisible();
});

test('Explorer authenticates from a protected action, follows and joins a public Event, then reviews My activity', async ({
	page,
	browser
}) => {
	// Publish journey-specific content so following cannot race seeded subscriber-count assertions.
	const creator = await browser.newPage();
	let groupUrl: string;
	const title = `Journey campus evening ${crypto.randomUUID().slice(0, 8)}`;
	try {
		await register(creator, 'Journey Creator');
		await creator.goto('/groups/new');
		const groupName = `Journey Group ${crypto.randomUUID().slice(0, 8)}`;
		await creator.getByLabel('Group name').fill(groupName);
		await creator
			.getByLabel('Short description')
			.fill('A welcoming community for campus activities.');
		await creator.getByRole('button', { name: 'Create Group' }).click();
		await expect(creator.getByRole('heading', { name: groupName, level: 1 })).toBeVisible();
		groupUrl = creator.url();
		await creator.goto('/create');
		await creator.getByLabel('Host', { exact: true }).selectOption(groupUrl.split('/').at(-1)!);
		await creator.getByLabel('Title', { exact: true }).fill(title);
		await creator
			.getByLabel('Description', { exact: true })
			.fill('Meet other students and share your campus projects.');
		await creator.getByLabel('Start', { exact: true }).fill('2030-09-02T18:00');
		await creator.getByLabel('End', { exact: true }).fill('2030-09-02T20:00');
		await creator.getByRole('checkbox', { name: 'Social', exact: true }).check();
		await creator.getByLabel('Response mode', { exact: true }).selectOption('interest');
		await creator.getByLabel('Location', { exact: true }).selectOption('manual');
		await creator.getByLabel('Location label', { exact: true }).fill('Library garden');
		await creator.getByRole('button', { name: 'Publish Event' }).click();
		await expect(creator.getByRole('heading', { name: title, level: 1 })).toBeVisible();
	} finally {
		await creator.close();
	}
	await page.goto(groupUrl);
	await page.getByRole('button', { name: 'Follow', exact: true }).click();
	await page.getByRole('dialog').getByRole('link', { name: 'Register', exact: true }).click();
	await page.getByLabel('Display name').fill('Journey Explorer');
	await page.getByLabel('Email').fill(`journey.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL(groupUrl);
	// Authentication returns to the action without silently executing it.
	await page.getByRole('button', { name: 'Follow', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Unfollow', exact: true })).toBeEnabled();
	await page.reload();
	await expect(page.getByRole('button', { name: 'Unfollow', exact: true })).toBeEnabled();
	await page.getByRole('link', { name: new RegExp(`^${title}`) }).click();
	await page.getByRole('button', { name: 'Express interest', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Withdraw interest', exact: true })).toBeEnabled();
	await page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'My activity', exact: true })
		.click();
	await expect(page.getByRole('link', { name: new RegExp(`^${title}`) })).toHaveCount(1);
	await page.reload();
	await page.getByRole('link', { name: new RegExp(`^${title}`) }).click();
	await page.getByRole('button', { name: 'Withdraw interest', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Express interest', exact: true })).toBeEnabled();
	await page.goto(groupUrl);
	await page.getByRole('button', { name: 'Unfollow', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Follow', exact: true })).toBeEnabled();
	await page.goto('/my-activity');
	await expect(page.getByText('No activity yet')).toBeVisible();
});
