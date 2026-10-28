import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { StyleSpecification } from 'maplibre-gl';

// Resolve the deployed asset to exercise script failure without depending on a build hash.
function mapAssets() {
	const manifest = JSON.parse(
		readFileSync('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
	) as Record<string, { file: string; css?: string[] }>;
	return manifest['src/lib/components/event-map.ts'];
}

// Replace the external style with a small style exercising the real renderer and tile requests.
const testStyle = {
	version: 8,
	sources: {
		campus: {
			type: 'raster',
			tiles: ['https://tiles.openfreemap.org/test-tiles/{z}/{x}/{y}.png'],
			tileSize: 512,
			maxzoom: 19
		},
		building: {
			type: 'geojson',
			data: {
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[7.2268, 50.6444],
							[7.2272, 50.6444],
							[7.2272, 50.6446],
							[7.2268, 50.6446],
							[7.2268, 50.6444]
						]
					]
				}
			}
		}
	},
	layers: [
		{ id: 'campus', type: 'raster', source: 'campus' },
		{
			id: 'building',
			type: 'fill',
			source: 'building',
			paint: { 'fill-color': '#eaeae5', 'fill-outline-color': '#dbdbda' }
		}
	]
} satisfies StyleSpecification;

async function serveMap(page: Page) {
	await page.route('https://tiles.openfreemap.org/**', (route) => {
		if (route.request().url() === 'https://tiles.openfreemap.org/styles/positron') {
			return route.fulfill({ json: testStyle });
		}
		return route.fulfill({
			contentType: 'image/png',
			body: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
				'base64'
			)
		});
	});
}

test('mapped Location shows Positron at zoom 16 with one centered marker and attribution', async ({
	page
}) => {
	const requests: string[] = [];
	page.on('request', (request) => requests.push(request.url()));
	await serveMap(page);
	await page.goto('/events/event-board-game-evening');
	const map = page.getByRole('region', { name: 'Location map' });
	await expect(map).toBeVisible();
	await expect(map.locator('.leaflet-marker-icon')).toHaveCount(1);
	await expect(map.getByRole('img', { name: 'Campus Cafeteria' })).toBeVisible();
	await expect(map.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute(
		'href',
		'https://www.openstreetmap.org/copyright'
	);
	await expect(map.getByRole('link', { name: 'OpenMapTiles', exact: true })).toBeVisible();
	await expect(map.getByRole('link', { name: 'OpenFreeMap', exact: true })).toBeVisible();
	await expect(map.getByText('Loading map…')).toHaveCount(0);
	await expect(map.getByRole('button', { name: 'Retry map' })).toHaveCount(0);
	expect(requests).toContain('https://tiles.openfreemap.org/styles/positron');
	// Independent Web Mercator tile containing the stored 50.6445 N, 7.227 E at zoom 16.
	expect(requests).toContain('https://tiles.openfreemap.org/test-tiles/16/34083/22042.png');
	const marker = await map.locator('.leaflet-marker-icon').boundingBox();
	const bounds = await map.locator('.leaflet-container').boundingBox();
	expect(marker).not.toBeNull();
	expect(bounds).not.toBeNull();
	if (marker && bounds) {
		expect(Math.abs(marker.x + 12 - (bounds.x + bounds.width / 2))).toBeLessThan(2);
		expect(Math.abs(marker.y + 12 - (bounds.y + bounds.height / 2))).toBeLessThan(2);
	}
});

test('plain-text Locations and Discover load neither Leaflet nor tiles; navigation cleans up maps', async ({
	page
}) => {
	const resources: string[] = [];
	page.on('request', (request) => resources.push(request.url()));
	await serveMap(page);
	await page.goto('/');
	await page.getByRole('link', { name: /^Plain-text campus briefing/ }).click();
	await expect(page.getByText('Bad Honnef town centre', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Description', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Location map' })).toHaveCount(0);
	expect(
		resources.filter(
			(url) =>
				url.includes(mapAssets().file) ||
				(mapAssets().css ?? []).some((asset) => url.includes(asset)) ||
				url.includes('maplibre-gl-worker') ||
				url.includes('tiles.openfreemap.org')
		)
	).toEqual([]);
	await page.getByRole('link', { name: 'Back to Discover' }).click();
	await page.getByRole('link', { name: /^Board game evening/ }).click();
	await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
	expect(resources.some((url) => url.includes(mapAssets().file))).toBe(true);
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
		await serveMap(page);
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

for (const failure of ['tiles', 'style', 'script', 'stylesheet', 'worker', 'timeout'] as const) {
	test(`${failure} failure preserves Event content and Participation, and reload recovers`, async ({
		page
	}) => {
		const assets = mapAssets();
		await serveMap(page);
		const pattern =
			failure === 'script'
				? `**/${assets.file}`
				: failure === 'stylesheet'
					? `**/${assets.css?.[0]}`
					: failure === 'worker'
						? '**/*maplibre-gl-worker*.js'
						: failure === 'style'
							? '**/styles/positron'
							: 'https://tiles.openfreemap.org/test-tiles/**';
		if (failure === 'stylesheet') expect(assets.css?.length).toBeGreaterThan(0);
		const needsClock = failure === 'timeout' || failure === 'worker';
		if (needsClock) {
			await page.clock.install();
		}
		let intercepted = 0;
		await page.route(pattern, (route) => {
			intercepted++;
			if (failure !== 'timeout') return route.abort();
		});
		await page.goto('/events/event-board-game-evening');
		if (needsClock) {
			await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
			await expect.poll(() => intercepted).toBeGreaterThan(0);
			await page.clock.fastForward(12_000);
		}
		await expect(
			page.getByRole('region', { name: 'Location map' }).getByRole('status')
		).toContainText('The map is unavailable');
		expect(intercepted).toBeGreaterThan(0);
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
		await serveMap(page);
		await page.getByRole('button', { name: 'Retry map' }).click();
		await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
		await expect(page.getByText('Loading map…', { exact: true })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Retry map' })).toHaveCount(0);
	});
}
