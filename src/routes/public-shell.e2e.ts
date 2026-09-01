import { expect, test, type Page } from '@playwright/test';

const viewports = {
	phone: { width: 360, height: 800 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1440, height: 900 }
} as const;

const publicDestinations = [
	{ path: '/', name: 'Discover', heading: 'Discover' },
	{ path: '/groups', name: 'Groups', heading: 'Groups' },
	{ path: '/sign-in', name: 'Sign in', heading: 'Sign in' },
	{ path: '/register', name: 'Register', heading: 'Register' }
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

async function assertNavigationFitsViewport(page: Page) {
	const viewport = page.viewportSize();
	expect(viewport).not.toBeNull();
	if (!viewport) return;

	for (const navigation of await page.getByRole('navigation').all()) {
		if (!(await navigation.isVisible())) continue;

		const box = await navigation.boundingBox();
		expect(box).not.toBeNull();
		if (!box) continue;

		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.y).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
		expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
	}
}

async function assertVisibleFocus(page: Page) {
	const focused = page.locator(':focus');
	await expect(focused).toBeVisible();

	const hasVisibleFocus = await focused.evaluate((element) => {
		const styles = getComputedStyle(element);
		return styles.outlineStyle !== 'none' || styles.boxShadow !== 'none';
	});

	expect(hasVisibleFocus).toBe(true);
}

test.describe('public Campus Connect shell', () => {
	test('visitor can move between Discover, Groups, Sign in, and Register', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		await expect(page.getByRole('link', { name: 'Campus Connect' }).first()).toBeVisible();

		for (const destination of publicDestinations) {
			await page.getByRole('navigation').getByRole('link', { name: destination.name }).click();
			await expect(page).toHaveURL(destination.path);
			await expect(
				page.getByRole('heading', { name: destination.heading, level: 1 })
			).toBeVisible();
			await expect(
				page.getByRole('navigation').getByRole('link', { name: destination.name })
			).toHaveAttribute('aria-current', 'page');
		}
	});

	test('desktop and tablet keep a persistent header, while phone uses compact header with bottom destinations', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		const header = page.getByRole('banner');
		await expect(header.getByRole('navigation', { name: 'Primary' })).toBeVisible();
		await expect(header.getByRole('navigation', { name: 'Account' })).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);

		await page.setViewportSize(viewports.tablet);
		await expect(header.getByRole('navigation', { name: 'Primary' })).toBeVisible();
		await expect(header.getByRole('navigation', { name: 'Account' })).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);

		await page.setViewportSize(viewports.phone);
		await expect(header.getByRole('navigation', { name: 'Account' })).toBeVisible();
		await expect(header.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
		await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
	});

	test('navigation exposes landmarks, works by keyboard, and keeps visible focus', async ({
		page
	}) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		await expect(page.getByRole('banner')).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Account' })).toBeVisible();
		await expect(page.getByRole('main')).toBeVisible();

		await page.keyboard.press('Tab');
		await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
		await assertVisibleFocus(page);

		await page.keyboard.press('Enter');
		await expect(page.getByRole('main')).toBeFocused();
		await assertVisibleFocus(page);

		await page.goto('/');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await expect(page.getByRole('link', { name: 'Campus Connect' }).first()).toBeFocused();
		await assertVisibleFocus(page);

		await page.keyboard.press('Tab');
		await expect(
			page.getByRole('navigation', { name: 'Primary' }).getByRole('link').first()
		).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL('/');
	});

	test('representative layouts do not scroll horizontally or clip navigation', async ({ page }) => {
		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await page.goto('/');
			await assertNoHorizontalPageScroll(page);
			await assertNavigationFitsViewport(page);

			await page.goto('/groups');
			await assertNoHorizontalPageScroll(page);
			await assertNavigationFitsViewport(page);
		}
	});

	test('interactive navigation targets are at least 44 CSS pixels', async ({ page }) => {
		for (const viewport of Object.values(viewports)) {
			await page.setViewportSize(viewport);
			await page.goto('/');

			const targets = [
				...(await page.getByRole('navigation', { name: 'Primary' }).getByRole('link').all()),
				...(await page.getByRole('navigation', { name: 'Account' }).getByRole('link').all())
			];

			expect(targets.length).toBeGreaterThan(0);

			for (const target of targets) {
				const box = await target.boundingBox();
				expect(box).not.toBeNull();
				if (!box) continue;
				expect(box.width).toBeGreaterThanOrEqual(44);
				expect(box.height).toBeGreaterThanOrEqual(44);
			}
		}
	});

	test('unknown routes show the not-found shell', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/this-destination-does-not-exist');

		await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to Discover' })).toBeVisible();
		await expect(page.getByRole('banner')).toBeVisible();
	});

	test('server failure uses the general-server-failure shell', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/preview/server-failure');

		await expect(
			page.getByRole('heading', { name: 'Something went wrong', level: 1 })
		).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to Discover' })).toBeVisible();
		await expect(page.getByRole('banner')).toBeVisible();
	});

	test('client navigation shows route-level loading', async ({ page }) => {
		await page.setViewportSize(viewports.desktop);
		await page.goto('/');

		await page.evaluate(() => {
			const previewLink = document.createElement('a');
			previewLink.href = '/preview/loading';
			previewLink.id = 'delayed-preview';
			previewLink.setAttribute('data-sveltekit-preload-data', 'false');
			previewLink.textContent = 'Delayed preview';
			document.body.appendChild(previewLink);
		});

		await page.locator('#delayed-preview').click();
		await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Loading preview', level: 1 })).toBeVisible({
			timeout: 10_000
		});
	});
});
