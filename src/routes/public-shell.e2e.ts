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

async function assertSharpLauncherIcon(page: Page, size: number) {
	const image = page.locator('img');
	expect(
		await image.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])
	).toEqual([size, size]);
	// Check the downloaded pixels, not just declared dimensions: an enlarged 32px raster is blurry.
	const edgeWidth = await image.evaluate((image: HTMLImageElement) => {
		const canvas = document.createElement('canvas');
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Image sharpness check needs a canvas context');
		context.drawImage(image, 0, 0);
		const pixels = context.getImageData(
			0,
			Math.floor(canvas.height / 2),
			Math.floor(canvas.width / 2),
			1
		).data;
		const red = Array.from({ length: pixels.length / 4 }, (_, x) => pixels[x * 4]);
		const contrast = Math.max(...red) - red[0];
		const low = red.findIndex((value) => value >= red[0] + contrast * 0.1);
		const high = red.findIndex((value) => value >= red[0] + contrast * 0.9);
		if (contrast < 100 || low < 0 || high < 0) throw new Error('Launcher mark is missing');
		return high - low;
	});
	expect(edgeWidth, 'Native-size launcher stroke must have a crisp edge').toBeLessThanOrEqual(2);
}

test.describe('public Campus Connect shell', () => {
	test('home-screen installation has a stable identity, launch URL and usable icons', async ({
		page
	}) => {
		await page.goto('/');
		const manifestLink = page.locator('link[rel="manifest"]');
		await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');
		const response = await page.request.get('/manifest.webmanifest');
		expect(response.ok()).toBe(true);
		const manifest = await response.json();
		expect(manifest).toMatchObject({
			id: '/',
			name: 'Campus Connect',
			short_name: 'Campus Connect',
			start_url: '/',
			scope: '/',
			display: 'standalone'
		});
		for (const { size, purpose } of [
			{ size: 192, purpose: 'any' },
			{ size: 512, purpose: 'any' },
			{ size: 512, purpose: 'maskable' }
		]) {
			const icon = manifest.icons.find(
				(icon: { sizes: string; purpose?: string }) =>
					icon.sizes === `${size}x${size}` && icon.purpose === purpose
			);
			expect(icon).toBeDefined();
			await page.goto(icon.src);
			await assertSharpLauncherIcon(page, size);
		}
		await page.goto('/sign-in');
		await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
			'href',
			'/manifest.webmanifest'
		);
		await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
			'content',
			'yes'
		);
		const touchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
		expect(touchIcon).toBeTruthy();
		await page.goto(touchIcon!);
		await assertSharpLauncherIcon(page, 180);
	});
	for (const preference of ['System', 'Light', 'Dark']) {
		test(`${preference} appearance is correct before client modules load on a later visit`, async ({
			page,
			browser,
			context
		}) => {
			await page.emulateMedia({ colorScheme: 'dark' });
			await page.goto('/');
			const appearance = page.getByRole('banner').getByLabel('Appearance', { exact: true });
			await expect(appearance).toBeEnabled();
			await appearance.focus();
			await assertVisibleFocus(page);
			await page.keyboard.press('Enter');
			await page.getByRole('option', { name: preference, exact: true }).click();
			await expect(appearance).toBeFocused();
			const expectedScheme = preference === 'Light' ? 'light' : 'dark';
			await expect
				.poll(() =>
					page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme)
				)
				.toBe(expectedScheme);
			const expectedBackground = await page
				.locator('body')
				.evaluate((element) => getComputedStyle(element).backgroundColor);
			const laterVisit = await browser.newContext({
				storageState: await context.storageState(),
				colorScheme: preference === 'System' ? 'dark' : 'light'
			});
			try {
				const initialPage = await laterVisit.newPage();
				await initialPage.route('**/_app/immutable/**/*.js', (route) => route.abort());
				await initialPage.goto('/', { waitUntil: 'load' });
				await expect(
					initialPage.getByRole('heading', { name: 'Discover', exact: true })
				).toBeVisible();
				expect(
					await initialPage
						.locator('html')
						.evaluate((element) => getComputedStyle(element).colorScheme)
				).toBe(expectedScheme);
				expect(
					await initialPage
						.locator('body')
						.evaluate((element) => getComputedStyle(element).backgroundColor)
				).toBe(expectedBackground);
			} finally {
				await laterVisit.close();
			}
		});
	}
	test('appearance follows the device and saves an override across navigation and reload', async ({
		page
	}) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto('/');
		const appearance = page.getByRole('banner').getByLabel('Appearance', { exact: true });
		await expect(appearance).toBeEnabled();
		await appearance.hover();
		await expect(page.getByRole('tooltip', { name: 'Appearance' })).toBeVisible();
		await expect(appearance).toContainText('System');
		await expect
			.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme))
			.toBe('dark');
		await appearance.click();
		await page.getByRole('option', { name: 'Light', exact: true }).click();
		await expect
			.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme))
			.toBe('light');
		await page.getByRole('navigation').getByRole('link', { name: 'Groups', exact: true }).click();
		await page.reload();
		await expect(appearance).toContainText('Light');
		await expect
			.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme))
			.toBe('light');
		await appearance.click();
		await page.getByRole('option', { name: 'System', exact: true }).click();
		await expect
			.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme))
			.toBe('dark');
		await page.emulateMedia({ colorScheme: 'light' });
		await expect
			.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme))
			.toBe('light');
	});
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
				page.getByRole('banner').getByLabel('Appearance', { exact: true }),
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

test.describe('mobile home-screen installation', () => {
	test.use({
		viewport: viewports.phone,
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
	});

	test('installation stays on main pages, dismissal persists and Account can reopen instructions', async ({
		page
	}) => {
		await page.goto('/');
		const banner = page.getByRole('complementary', { name: 'Install Campus Connect' });
		await expect(banner).toBeVisible();
		await banner.getByRole('button', { name: 'Install', exact: true }).click();
		const drawer = page.getByRole('dialog', { name: 'Install Campus Connect' });
		await expect(drawer).toContainText('Add to Home Screen');
		await expect(drawer).toContainText('Share');
		await drawer.getByRole('button', { name: 'Done', exact: true }).click();
		await page
			.getByRole('navigation', { name: 'Primary' })
			.getByRole('link', { name: 'Groups', exact: true })
			.click();
		await expect(banner).toBeVisible();
		await page.goto('/register');
		await expect(banner).toHaveCount(0);
		await page.getByLabel('Display name').fill('Mobile Explorer');
		await page.getByLabel('Email').fill(`mobile.${crypto.randomUUID()}@example.com`);
		await page.getByLabel('Password', { exact: true }).fill('campus-connect-test');
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/');
		for (const path of ['/my-activity', '/my-events', '/groups', '/']) {
			await page.goto(path);
			await expect(banner).toBeVisible();
			await assertNoHorizontalPageScroll(page);
		}
		await page.goto('/create');
		await expect(banner).toHaveCount(0);
		await page.goto('/events/event-board-game-evening');
		await expect(banner).toHaveCount(0);
		await page.goto('/');
		await banner.getByRole('button', { name: 'Dismiss installation banner' }).click();
		await expect(banner).toHaveCount(0);
		await page.reload();
		await expect(banner).toHaveCount(0);
		await page.goto('/groups');
		await expect(banner).toHaveCount(0);
		await page.goto('/account');
		await page.getByRole('button', { name: 'Install Campus Connect', exact: true }).click();
		await expect(drawer).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(
			page.getByRole('button', { name: 'Install Campus Connect', exact: true })
		).toBeFocused();
	});
});

test.describe('Android installation capability', () => {
	test.use({
		viewport: viewports.phone,
		userAgent:
			'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'
	});

	for (const outcome of ['accepted', 'dismissed', 'failed'] as const) {
		test(`native installation ${outcome} leaves an honest, usable page`, async ({ page }) => {
			await page.goto('/');
			await page
				.getByRole('complementary', { name: 'Install Campus Connect' })
				.getByRole('button', { name: 'Install', exact: true })
				.click();
			const drawer = page.getByRole('dialog', { name: 'Install Campus Connect' });
			await expect(drawer).toContainText('browser menu');
			let prompted = false;
			await page.exposeFunction('nativeInstallPrompt', () => {
				prompted = true;
			});
			// Supply the browser-owned event at its boundary, without any production test hook.
			await page.evaluate((outcome) => {
				window.dispatchEvent(
					Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
						prompt: async () => {
							if (
								!('nativeInstallPrompt' in window) ||
								typeof window.nativeInstallPrompt !== 'function'
							) {
								throw new Error('Missing browser prompt fixture');
							}
							await window.nativeInstallPrompt();
							if (outcome === 'failed') throw new Error('Native prompt unavailable');
							return { outcome };
						}
					})
				);
			}, outcome);
			await drawer.getByRole('button', { name: 'Install app', exact: true }).click();
			await expect.poll(() => prompted).toBe(true);
			if (outcome === 'accepted') {
				await expect(
					page.getByRole('complementary', { name: 'Install Campus Connect' })
				).toHaveCount(0);
				await page.reload();
				await expect(
					page.getByRole('complementary', { name: 'Install Campus Connect' })
				).toHaveCount(0);
			} else {
				await expect(drawer.getByRole('button', { name: 'Install app', exact: true })).toHaveCount(
					0
				);
				await expect(drawer).toContainText(
					outcome === 'failed' ? 'Installation could not open' : 'browser menu'
				);
				await drawer.getByRole('button', { name: 'Done', exact: true }).click();
				await expect(page.getByRole('heading', { name: 'Discover', exact: true })).toBeVisible();
			}
		});
	}
});

test('ordinary desktop browsing has no installation promotion', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('banner').getByLabel('Appearance', { exact: true })).toBeEnabled();
	await expect(page.getByRole('complementary', { name: 'Install Campus Connect' })).toHaveCount(0);
});

test('standalone mobile launch keeps public and authenticated journeys without installation prompts', async ({
	browser,
	baseURL
}) => {
	const context = await browser.newContext({
		baseURL,
		viewport: viewports.phone,
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
	});
	try {
		await context.addInitScript(() =>
			Object.defineProperty(navigator, 'standalone', { value: true })
		);
		const page = await context.newPage();
		await page.goto('/');
		await expect(page.getByRole('banner').getByLabel('Appearance', { exact: true })).toBeEnabled();
		await expect(page.getByRole('complementary', { name: 'Install Campus Connect' })).toHaveCount(
			0
		);
		await page
			.getByRole('navigation', { name: 'Primary' })
			.getByRole('link', { name: 'Groups', exact: true })
			.click();
		await expect(page.getByRole('heading', { name: 'Groups', exact: true })).toBeVisible();
		await page.goto('/register');
		await page.getByLabel('Display name').fill('Standalone Explorer');
		await page.getByLabel('Email').fill(`standalone.${crypto.randomUUID()}@example.com`);
		await page.getByLabel('Password', { exact: true }).fill('campus-connect-test');
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page).toHaveURL('/');
		await page
			.getByRole('navigation', { name: 'Primary' })
			.getByRole('link', { name: 'My activity', exact: true })
			.click();
		await expect(page).toHaveURL('/my-activity');
		await page
			.getByRole('navigation', { name: 'Account' })
			.getByRole('link', { name: 'Account', exact: true })
			.click();
		await expect(
			page.getByRole('button', { name: 'Install Campus Connect', exact: true })
		).toHaveCount(0);
	} finally {
		await context.close();
	}
});
