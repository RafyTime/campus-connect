import { expect, test, type Page } from '@playwright/test';

const viewports = [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
];

async function register(page: Page, label: string) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill(label);
	await page.getByLabel('Email').fill(`qa.groups.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}

async function fillDetails(page: Page, name: string, description: string) {
	await page.getByLabel('Group name').fill(name);
	await page.getByLabel('Short description').fill(description);
}

test('Unicode name conflicts preserve create and edit values and allow correction', async ({
	page
}) => {
	await register(page, 'Unicode Group Owner');
	const suffix = crypto.randomUUID().slice(0, 8);
	const name = `München Club ${suffix}`;
	const uppercase = `MÜNCHEN Club ${suffix}`;
	const decomposed = `MU\u0308NCHEN Club ${suffix}`;
	const description = 'Students exploring Munich together from campus.';
	await page.goto('/groups/new');
	await fillDetails(page, `  ${name}  `, description);
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
	for (const editName of [name, uppercase]) {
		await page.getByRole('link', { name: 'Edit Group' }).click();
		await fillDetails(page, editName, description);
		await page.getByRole('button', { name: 'Save changes' }).click();
		await expect(page.getByRole('heading', { name: editName, level: 1 })).toBeVisible();
	}
	await page.goto('/groups/new');
	await fillDetails(page, decomposed, description);
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByText('A Group already uses this name.')).toBeVisible();
	await expect(page.getByLabel('Group name')).toHaveValue(decomposed);
	await expect(page.getByLabel('Short description')).toHaveValue(description);
	await expect(page.getByRole('button', { name: 'Create Group' })).toBeEnabled();
	const otherName = `Writers Club ${suffix}`;
	await page.getByLabel('Group name').fill(otherName);
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByRole('heading', { name: otherName, level: 1 })).toBeVisible();
	await page.getByRole('link', { name: 'Edit Group' }).click();
	await fillDetails(page, name, description);
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByText('A Group already uses this name.')).toBeVisible();
	await expect(page.getByLabel('Group name')).toHaveValue(name);
	await expect(page.getByLabel('Short description')).toHaveValue(description);
	await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
	const corrected = `Poetry Club ${suffix}`;
	await page.getByLabel('Group name').fill(corrected);
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByRole('heading', { name: corrected, level: 1 })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('heading', { name: corrected, level: 1 })).toBeVisible();
});

test('a User creates a Group, becomes its owner, and edits only public details', async ({
	page
}) => {
	await register(page, 'Group Owner');
	await page.goto('/groups');
	await page.getByRole('link', { name: 'Create a Group' }).click();
	const name = `Campus Makers ${crypto.randomUUID().slice(0, 8)}`;
	await fillDetails(page, name, 'Students sharing things they build on campus.');
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
	await expect(page.getByText('Group Owner')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Edit Group' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Follow' })).toHaveCount(0);

	await page.getByRole('link', { name: 'Edit Group' }).click();
	await fillDetails(page, 'Film Society', 'A competing description for the existing Group.');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByText('A Group already uses this name.')).toBeVisible();
	const editedName = `${name} Club`;
	await fillDetails(page, editedName, 'A welcoming campus workshop for students.');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByRole('heading', { name: editedName, level: 1 })).toBeVisible();
	await expect(page.getByText('A welcoming campus workshop for students.')).toBeVisible();
	await page.reload();
	await expect(page.getByRole('heading', { name: editedName, level: 1 })).toBeVisible();
});

test('validation, duplicate names, and server failure keep the form usable', async ({ page }) => {
	await register(page, 'Group Creator');
	await page.goto('/groups/new');
	await fillDetails(page, 'A', 'short');
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByText('Enter a Group name between 2 and 80 characters.')).toBeVisible();
	await expect(page.getByText('Enter a description between 10 and 300 characters.')).toBeVisible();
	await expect(page.getByLabel('Group name')).toHaveValue('A');

	await fillDetails(page, 'fIlM sOcIeTy', 'Another campus film community.');
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByText('A Group already uses this name.')).toBeVisible();
	await expect(page.getByLabel('Group name')).toHaveValue('fIlM sOcIeTy');

	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({ status: 500, contentType: 'text/plain', body: 'unavailable' });
			return;
		}
		await route.continue();
	});
	await fillDetails(
		page,
		`Campus Design ${crypto.randomUUID().slice(0, 8)}`,
		'A group for students who enjoy making things.'
	);
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByText('The request failed. Try again.')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Create Group' })).toBeEnabled();
	await expect(page.getByRole('heading', { name: 'Create a Group' })).toBeVisible();
});

test('visitors and other Users cannot open the edit form', async ({ browser, page }) => {
	await page.goto('/groups/group-film-society');
	await expect(page.getByRole('link', { name: 'Edit Group' })).toHaveCount(0);
	await page.goto('/groups/group-film-society/edit');
	await expect(page).toHaveURL(/\/sign-in\?returnTo=/);

	const other = await browser.newPage();
	await register(other, 'Unrelated User');
	await other.goto('/groups/group-film-society/edit');
	await expect(other.getByText('Only the Group owner can edit its details.')).toBeVisible();
	await other.close();
});

test('the create form shows pending state and prevents another submission', async ({ page }) => {
	await register(page, 'Pending Owner');
	await page.goto('/groups/new');
	await fillDetails(
		page,
		`Pending Group ${crypto.randomUUID().slice(0, 8)}`,
		'Students meeting to try new campus projects.'
	);
	let release: (() => void) | undefined;
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() === 'POST') await held;
		await route.continue();
	});
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByRole('button', { name: 'Create Group' })).toBeDisabled();
	await expect(page.locator('form[aria-busy]')).toHaveAttribute('aria-busy', 'true');
	release?.();
	await expect(page.getByRole('link', { name: 'Edit Group' })).toBeVisible();
});

test('create and edit forms fit phone, tablet, and desktop sizes', async ({ page }) => {
	await register(page, 'Responsive Owner');
	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		await page.goto('/groups/new');
		await expect(page.getByLabel('Group name')).toBeVisible();
		await expect(page.getByLabel('Short description')).toBeVisible();
		const width = await page.evaluate(() => ({
			client: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(width.scroll).toBeLessThanOrEqual(width.client);
	}
	await fillDetails(
		page,
		`Responsive Group ${crypto.randomUUID().slice(0, 8)}`,
		'Students testing campus activities together.'
	);
	await page.getByRole('button', { name: 'Create Group' }).click();
	await page.getByRole('link', { name: 'Edit Group' }).click();
	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		await expect(page.getByLabel('Group name')).toBeVisible();
		const width = await page.evaluate(() => ({
			client: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(width.scroll).toBeLessThanOrEqual(width.client);
	}
});

test('Group creation rejects a mismatched Origin and accepts the public origin behind an internal Host', async ({
	page,
	context,
	baseURL
}) => {
	await register(page, 'Origin Group Owner');
	if (!baseURL) throw new Error('The browser suite requires its public base URL');
	const publicOrigin = new URL(baseURL).origin;
	const session = (await context.cookies()).find((cookie) => cookie.name.endsWith('session_token'));
	expect(session).toMatchObject({
		domain: '127.0.0.1',
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: false
	});
	expect(session?.expires).toBeGreaterThan(Date.now() / 1000);

	await page.goto('/groups/new');
	const name = `Origin Group ${crypto.randomUUID().slice(0, 8)}`;
	const description = 'Students verifying public-origin Group publication.';
	await fillDetails(page, name, description);
	let checkedOrigin = false;
	await page.route('**/_app/remote/**', async (route) => {
		if (route.request().method() !== 'POST') return route.continue();
		const headers = {
			...route.request().headers(),
			host: 'internal.localhost:3000'
		};
		const rejected = await route.fetch({
			headers: { ...headers, origin: 'https://untrusted.example' },
			maxRedirects: 0
		});
		expect(rejected.status()).toBe(403);
		expect(await rejected.json()).toEqual({ message: 'Cross-site remote requests are forbidden' });
		expect(rejected.headers()['set-cookie']).toBeUndefined();
		const directory = await context.request.get('/groups');
		expect(await directory.text()).not.toContain(name);

		const accepted = await route.fetch({
			headers: { ...headers, origin: publicOrigin },
			maxRedirects: 0
		});
		expect(accepted.ok()).toBe(true);
		checkedOrigin = true;
		await route.fulfill({ response: accepted });
	});
	await page.getByRole('button', { name: 'Create Group' }).click();
	await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
	expect(checkedOrigin).toBe(true);
	expect(new URL(page.url()).origin).toBe(publicOrigin);
	await page.reload();
	await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
	await expect(page.getByText(description)).toBeVisible();
	await expect(page.getByRole('link', { name: 'Edit Group' })).toBeVisible();
});
