import { expect, test, type Page } from '@playwright/test';

const viewports = {
	phone: { width: 360, height: 800 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 }
} as const;

const directoryNames = ['Campus Updates', 'Film Society', 'Campus Runners'] as const;

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

test.describe('public Group browsing', () => {
	test('visitor can browse the Group directory and open Group details', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/groups');

		await expect(page.getByRole('heading', { name: 'Groups', level: 1 })).toBeVisible();

		for (const name of directoryNames) {
			await expect(page.getByRole('link', { name })).toBeVisible();
		}

		const filmSociety = page.getByRole('link', { name: 'Film Society' });
		await expect(filmSociety.getByText('1 subscriber')).toBeVisible();
		await expect(filmSociety.getByText('Lena Hartmann')).toBeVisible();

		await filmSociety.click();
		await expect(page).toHaveURL('/groups/group-film-society');
		await expect(page.getByRole('heading', { name: 'Film Society', level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Owner', level: 2 })).toBeVisible();
		await expect(page.getByText('Lena Hartmann')).toBeVisible();
		await expect(page.getByText('1 subscriber')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Welcome-week screening' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Outdoor Rhine screening' })).toHaveCount(0);
	});

	test('Campus Updates is readable without a Group membership', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/groups/group-campus-updates');

		await expect(page.getByRole('heading', { name: 'Campus Updates', level: 1 })).toBeVisible();
		await expect(page.getByText('Campus-wide', { exact: true })).toBeVisible();
		await expect(
			page.getByText('Readable without a Group membership', { exact: false })
		).toBeVisible();
		await expect(page.getByRole('link', { name: 'Campus week briefing' })).toBeVisible();
	});

	test('public group Events show the Group as host', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		const filmNight = page.getByRole('link', { name: 'Campus film night' });
		await expect(filmNight.getByText('Film Society')).toBeVisible();
		await expect(filmNight.getByText('Group', { exact: true })).toBeVisible();

		await filmNight.click();
		await expect(page).toHaveURL('/events/event-film-night');
		await expect(page.getByRole('heading', { name: 'Campus film night', level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Film Society' })).toBeVisible();
		await expect(page.getByText('Group', { exact: true })).toBeVisible();

		await page.getByRole('link', { name: 'Film Society' }).click();
		await expect(page).toHaveURL('/groups/group-film-society');
	});

	test('unknown Group ids use the not-found shell', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/groups/group-missing');

		await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to Discover' })).toBeVisible();
	});

	test('empty Group directory is usable', async ({ page }) => {
		await page.setViewportSize(viewports.phone);
		await page.goto('/preview/empty-groups');

		await expect(page.getByRole('heading', { name: 'Groups', level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'No Groups yet', level: 2 })).toBeVisible();
		await assertNoHorizontalPageScroll(page);
	});

	test('remote Group image failure falls back to initials', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/groups');

		const campusRunners = page.getByRole('link', { name: 'Campus Runners' });
		await expect(campusRunners.getByText('CR', { exact: true })).toBeVisible();

		await campusRunners.click();
		await expect(page).toHaveURL('/groups/group-campus-runners');
		await expect(page.getByRole('heading', { name: 'Campus Runners', level: 1 })).toBeVisible();
		await expect(page.locator('article header').getByText('CR', { exact: true })).toBeVisible();
	});

	test('Group directory and details fit phone, tablet, and desktop layouts', async ({ page }) => {
		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await page.goto('/groups');
			await expect(page.getByRole('heading', { name: 'Groups', level: 1 })).toBeVisible();
			await assertNoHorizontalPageScroll(page);

			await page.goto('/groups/group-film-society');
			await expect(page.getByRole('heading', { name: 'Film Society', level: 1 })).toBeVisible();
			await expect(page.getByRole('link', { name: 'Campus film night' })).toBeVisible();
			await assertNoHorizontalPageScroll(page);
		}
	});
});
