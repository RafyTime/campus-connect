import { expect, test, type Page } from '@playwright/test';

const viewports = {
	phone: { width: 360, height: 800 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 }
} as const;

const discoverableTitles = [
	'Board game evening',
	'Campus welcome walk',
	'Plain-text campus briefing',
	'Evening run club',
	'Statistics study group'
] as const;

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

test.describe('public personal Event browsing', () => {
	test('visitor can browse Discover without an account and open Event details', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'Discover', level: 1 })).toBeVisible();

		for (const title of discoverableTitles) {
			await expect(page.getByRole('link', { name: title })).toBeVisible();
		}

		await expect(page.getByRole('link', { name: 'Library orientation' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Rhine picnic' })).toHaveCount(0);

		const firstCard = page.getByRole('link', { name: 'Board game evening' });
		await expect(firstCard.getByText('Jonas Weber')).toBeVisible();
		await expect(firstCard.getByText('Campus Cafeteria')).toBeVisible();
		await expect(firstCard.getByText('Location')).toBeVisible();
		await expect(firstCard.getByText('Interest', { exact: true })).toHaveCount(2);
		await expect(firstCard.getByText('Social')).toBeVisible();
		await expect(firstCard.locator('time')).toBeVisible();

		await firstCard.click();
		await expect(page).toHaveURL('/events/event-board-game-evening');
		await expect(page.getByRole('heading', { name: 'Board game evening', level: 1 })).toBeVisible();
		await expect(page.getByText('Jonas Weber')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Location', level: 2 })).toBeVisible();
		await expect(page.getByText('Campus Cafeteria')).toBeVisible();
		await expect(page.getByText('Interest', { exact: true })).toBeVisible();
		await expect(page.getByText('Scheduled')).toBeVisible();
		await expect(
			page.getByText('Bring a favourite game or join an open table.', { exact: false })
		).toBeVisible();
	});

	test('Event details keep user-authored text as plain text', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/events/event-plain-text-safety');

		const description = page.locator('section', {
			has: page.getByRole('heading', { name: 'Description', level: 2 })
		});
		await expect(
			description.getByText('Ignore **markdown**, <em>HTML</em>', { exact: false })
		).toBeVisible();
		await expect(description.getByText('https://example.com/not-a-link')).toBeVisible();
		await expect(description.getByText('<script>alert("xss")</script>')).toBeVisible();
		await expect(description.locator('a')).toHaveCount(0);
		await expect(description.locator('em')).toHaveCount(0);
		await expect(description.locator('script')).toHaveCount(0);
	});

	test('unknown Event ids use the not-found shell', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/events/event-missing');

		await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to Discover' })).toBeVisible();
	});

	test('empty Discover feed is usable', async ({ page }) => {
		await page.setViewportSize(viewports.phone);
		await page.goto('/preview/empty-feed');

		await expect(page.getByRole('heading', { name: 'Discover', level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'No upcoming Events', level: 2 })).toBeVisible();
		await assertNoHorizontalPageScroll(page);
	});

	test('remote host image failure falls back to initials', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/preview/remote-image-failure');

		await expect(page.getByText('MO', { exact: true })).toBeVisible();
	});

	test('Discover and Event details fit phone, tablet, and desktop layouts', async ({ page }) => {
		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await page.goto('/');
			await expect(page.getByRole('heading', { name: 'Discover', level: 1 })).toBeVisible();
			await assertNoHorizontalPageScroll(page);

			await page.goto('/events/event-stats-study-group');
			await expect(
				page.getByRole('heading', { name: 'Statistics study group', level: 1 })
			).toBeVisible();
			await expect(page.getByText('12 places remaining')).toBeVisible();
			await assertNoHorizontalPageScroll(page);
		}
	});
});
