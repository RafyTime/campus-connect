import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Resolve the deployed asset to exercise script failure without depending on a build hash.
function mapAsset() {
	const manifest = JSON.parse(
		readFileSync('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
	) as Record<string, { file: string }>;
	return manifest['src/lib/components/event-map.ts'].file;
}

async function serveTiles(page: Page) {
	await page.route('https://tile.openstreetmap.org/**', (route) =>
		route.fulfill({
			contentType: 'image/png',
			body: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
				'base64'
			)
		})
	);
}

test('mapped Location shows one marker at the stored campus coordinates and attribution', async ({
	page
}) => {
	await serveTiles(page);
	await page.goto('/events/event-board-game-evening');
	const map = page.getByRole('region', { name: 'Location map' });
	await expect(map).toBeVisible();
	await expect(map.locator('.leaflet-marker-icon')).toHaveCount(1);
	await expect(map.getByRole('img', { name: 'Campus Cafeteria' })).toBeVisible();
	await expect(map.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute(
		'href',
		'https://www.openstreetmap.org/copyright'
	);
	// At zoom 16, these independently calculated tiles surround 50.6445 N, 7.227 E.
	const tile = map.locator('img.leaflet-tile[src$="/16/34083/22042.png"]');
	await expect(tile).toBeVisible();
	const tileBounds = await tile.boundingBox();
	const marker = await map.locator('.leaflet-marker-icon').boundingBox();
	const bounds = await map.locator('.leaflet-container').boundingBox();
	expect(tileBounds).not.toBeNull();
	expect(marker).not.toBeNull();
	expect(bounds).not.toBeNull();
	if (marker && bounds && tileBounds) {
		expect(Math.abs(marker.x + 12 - (bounds.x + bounds.width / 2))).toBeLessThan(2);
		expect(Math.abs(marker.y + 41 - (bounds.y + bounds.height / 2))).toBeLessThan(2);
		// Independent Web Mercator projection of 50.6445 N, 7.227 E within this tile.
		expect(Math.abs(marker.x + 12 - tileBounds.x - 162.6112)).toBeLessThan(1);
		expect(Math.abs(marker.y + 41 - tileBounds.y - 108.57416)).toBeLessThan(1);
	}
});

test('plain-text Locations and Discover load neither Leaflet nor tiles; navigation cleans up maps', async ({
	page
}) => {
	const resources: string[] = [];
	page.on('request', (request) => resources.push(request.url()));
	await serveTiles(page);
	await page.goto('/');
	await page.getByRole('link', { name: /^Plain-text campus briefing/ }).click();
	await expect(page.getByText('Bad Honnef town centre', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Description', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Location map' })).toHaveCount(0);
	expect(
		resources.filter(
			(url) =>
				url.includes(mapAsset()) ||
				url.includes('event-map.') ||
				url.includes('tile.openstreetmap.org')
		)
	).toEqual([]);
	await page.getByRole('link', { name: 'Back to Discover' }).click();
	await page.getByRole('link', { name: /^Board game evening/ }).click();
	await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
	expect(resources.some((url) => url.includes(mapAsset()))).toBe(true);
	await page.getByRole('link', { name: 'Back to Discover' }).click();
	await page.getByRole('link', { name: /^Campus welcome walk/ }).click();
	await expect(page.getByRole('img', { name: 'Main building foyer', exact: true })).toBeVisible();
	await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
});

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
]) {
	test(`map, attribution and keyboard access fit ${viewport.width}px`, async ({ page }) => {
		await serveTiles(page);
		await page.setViewportSize(viewport);
		await page.goto('/events/event-board-game-evening');
		await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
		const attribution = page.getByRole('link', { name: 'OpenStreetMap', exact: true });
		await attribution.scrollIntoViewIfNeeded();
		await expect(attribution).toBeInViewport();
		const bounds = await attribution.boundingBox();
		expect(bounds).not.toBeNull();
		if (bounds) {
			expect(bounds.x).toBeGreaterThanOrEqual(0);
			expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
		}
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
			)
		).toBe(true);
		await attribution.focus();
		await expect(attribution).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(attribution).not.toBeFocused();
		await page.keyboard.press('Shift+Tab');
		await expect(attribution).toBeFocused();
		const scan = await new AxeBuilder({ page }).analyze();
		expect(
			scan.violations.filter((violation) =>
				['serious', 'critical'].includes(violation.impact ?? '')
			)
		).toEqual([]);
	});
}

for (const failure of ['tiles', 'script', 'stylesheet', 'timeout'] as const) {
	test(`${failure} failure preserves Event content and Participation, and reload recovers`, async ({
		page
	}) => {
		const asset = mapAsset();
		await serveTiles(page);
		const pattern =
			failure === 'script'
				? `**/${asset}`
				: failure === 'stylesheet'
					? '**/event-map.*.css'
					: 'https://tile.openstreetmap.org/**';
		if (failure === 'timeout') {
			await page.clock.install();
			await page.route(pattern, () => {});
		} else {
			await page.route(pattern, (route) => route.abort());
		}
		await page.goto('/events/event-board-game-evening');
		if (failure === 'timeout') {
			await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
			await page.clock.fastForward(12_000);
		}
		await expect(
			page.getByRole('region', { name: 'Location map' }).getByRole('status')
		).toContainText('The map is unavailable');
		await expect(page.getByText('Campus Cafeteria', { exact: true })).toBeVisible();
		await expect(page.getByText('Jonas Weber', { exact: true })).toBeVisible();
		await expect(page.locator('article time')).toBeVisible();
		await expect(page.getByText('Social', { exact: true })).toBeVisible();
		await expect(page.getByText('Bring a favourite game', { exact: false })).toBeVisible();
		await expect(page.getByRole('link', { name: 'OpenStreetMap', exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'Express interest', exact: true }).click();
		await expect(page.getByRole('dialog', { name: 'Sign in to continue' })).toBeVisible();
		await page.keyboard.press('Escape');
		await page.unroute(pattern);
		await serveTiles(page);
		await page.getByRole('button', { name: 'Retry map' }).click();
		await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
		await expect(page.getByText('Loading map…', { exact: true })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Retry map' })).toHaveCount(0);
	});
}
