import { expect, test, type Page } from '@playwright/test';

const viewports = {
	phone: { width: 360, height: 800 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 }
} as const;

function uniqueEmail(label: string): string {
	return `qa.follow.${label}.${crypto.randomUUID()}@example.com`;
}

async function assertNoHorizontalPageScroll(page: Page) {
	const overflow = await page.evaluate(() => {
		const root = document.documentElement;
		return {
			clientWidth: root.clientWidth,
			scrollWidth: root.scrollWidth
		};
	});

	expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

async function registerExplorer(page: Page, label: string) {
	const email = uniqueEmail(label);

	await page.goto('/register');
	await page.getByLabel('Display name').fill('Ada Lovelace');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}

async function openGroupDetails(page: Page, groupId: string) {
	await page.goto(`/groups/${groupId}`);
	await expect(page.locator('#main-content')).not.toHaveAttribute('aria-busy', 'true');
	await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
}

function isRemoteCommandPost(request: { method: () => string; url: () => string }): boolean {
	return request.method() === 'POST' && request.url().includes('/_app/remote/');
}

test.describe('follow and unfollow Groups', () => {
	test.describe.configure({ mode: 'serial' });
	test('a visitor sees the protected-action dialog and the subscriber count stays unchanged', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await openGroupDetails(page, 'group-film-society');

		await expect(page.getByText('1 subscriber')).toBeVisible();
		await page.getByRole('button', { name: 'Follow' }).click();

		await expect(page.getByRole('dialog', { name: 'Sign in to continue' })).toBeVisible();
		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
	});

	test('a User can follow and unfollow a Group with a persisted subscriber count', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await registerExplorer(page, 'persist');
		await openGroupDetails(page, 'group-campus-runners');

		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sunday campus run' })).toBeVisible();
		await page.getByRole('button', { name: 'Follow' }).click();

		await expect(page.getByText('2 subscribers')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Unfollow' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sunday campus run' })).toBeVisible();

		await page.reload();
		await expect(page.getByText('2 subscribers')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Unfollow' })).toBeVisible();

		await page.getByRole('button', { name: 'Unfollow' }).click();
		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();

		await page.reload();
		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
	});

	test('repeated follow clicks stay pending once and do not create duplicate memberships', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await registerExplorer(page, 'idempotent');
		await openGroupDetails(page, 'group-campus-runners');
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();

		let release: (() => void) | undefined;
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});

		await page.route('**/_app/remote/**', async (route) => {
			if (isRemoteCommandPost(route.request())) {
				await held;
			}
			await route.continue();
		});

		const follow = page.getByRole('button', { name: 'Follow' });
		await follow.click();
		await follow.click({ force: true }).catch(() => undefined);

		await expect(follow).toBeDisabled();
		await expect(follow).toHaveAttribute('aria-busy', 'true');

		release?.();
		await expect(page.getByText('2 subscribers')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Unfollow' })).toBeVisible();
		await page.unroute('**/_app/remote/**');
		await page.getByRole('button', { name: 'Unfollow' }).click();
		await expect(page.getByText('1 subscriber')).toBeVisible();
	});

	test('a server failure keeps the current follow state and shows a recoverable message', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await registerExplorer(page, 'failure');
		await openGroupDetails(page, 'group-campus-runners');
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();

		await page.route('**/_app/remote/**', async (route) => {
			if (isRemoteCommandPost(route.request())) {
				await route.fulfill({
					status: 500,
					contentType: 'text/plain',
					body: 'unavailable'
				});
				return;
			}

			await route.continue();
		});

		await page.getByRole('button', { name: 'Follow' }).click();
		await expect(page.getByText('Something went wrong. Try again.')).toBeVisible();
		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
	});

	test('follow controls fit phone, tablet, and desktop layouts', async ({ page }) => {
		await registerExplorer(page, 'viewport');

		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await openGroupDetails(page, 'group-campus-runners');
			await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible();
			await assertNoHorizontalPageScroll(page);
		}
	});
});
