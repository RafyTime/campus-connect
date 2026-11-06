import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer, request, type Server } from 'node:http';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

let proxy: Server;
let active = 4194;
const candidates: ChildProcess[] = [];
let directory: string;

test.beforeAll(async () => {
	directory = process.env.PWA_CANDIDATES ?? '';
	if (!directory) throw new Error('Candidate builds were not prepared');
	proxy = createServer((incoming, outgoing) => {
		const upstream = request(
			{
				hostname: '127.0.0.1',
				port: active,
				path: incoming.url,
				method: incoming.method,
				headers: incoming.headers
			},
			(response) => {
				outgoing.writeHead(response.statusCode ?? 502, response.headers);
				response.pipe(outgoing);
			}
		);
		upstream.on('error', () => {
			outgoing.writeHead(502);
			outgoing.end();
		});
		incoming.pipe(upstream);
	});
	await new Promise<void>((resolve, reject) => {
		proxy.once('error', reject);
		proxy.listen(4193, '127.0.0.1', resolve);
	});
	for (const [name, port] of [
		['a', 4194],
		['b', 4195]
	] as const) {
		const child = spawn(process.execPath, [join(directory, name, 'index.js')], {
			env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
			stdio: 'ignore',
			windowsHide: true
		});
		candidates.push(child);
		const deadline = Date.now() + 20_000;
		while (true) {
			try {
				if ((await fetch(`http://127.0.0.1:${port}/manifest.webmanifest`)).ok) break;
			} catch {
				/* Child is still starting. */
			}
			if (child.exitCode !== null || Date.now() > deadline)
				throw new Error(`Candidate ${name} did not start`);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}
});

test.afterAll(async () => {
	proxy?.closeAllConnections();
	await new Promise<void>((resolve) => (proxy ? proxy.close(() => resolve()) : resolve()));
	await Promise.all(
		candidates.map(
			(child) =>
				new Promise<void>((resolve) => {
					if (child.exitCode !== null) return resolve();
					child.once('exit', () => resolve());
					child.kill();
				})
		)
	);
});

test('a Tags-only Event form edit is protected during an update', async ({ page }) => {
	active = 4194;
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Tags Creator');
	await page.getByLabel('Email').fill(`tags.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password', { exact: true }).fill('campus-connect-test');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
	await page.goto('/create');
	await page.getByRole('checkbox', { name: 'Tech', exact: true }).check();
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	active = 4195;
	await page.evaluate(async () => {
		await (await navigator.serviceWorker.getRegistration())?.update();
	});
	const banner = page.getByRole('complementary', { name: 'Update available' });
	await expect(banner).toBeVisible({ timeout: 20_000 });
	await banner.getByRole('button', { name: 'Refresh', exact: true }).click();
	const confirmation = page.getByRole('dialog', { name: 'Refresh and discard changes?' });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Keep editing' }).click();
	await expect(page.getByRole('checkbox', { name: 'Tech', exact: true })).toBeChecked();
});

test('an existing installation updates between two builds without losing another tab or a postponed form', async ({
	page,
	context
}) => {
	active = 4194;
	const versions = ['a', 'b'].map(
		(candidate) =>
			JSON.parse(readFileSync(join(directory, candidate, 'client/_app/version.json'), 'utf8'))
				.version as string
	);
	expect(versions[0]).not.toBe(versions[1]);
	await page.goto('/register');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await page.getByLabel('Display name').fill('First tab draft');
	const other = await context.newPage();
	await other.goto('/register');
	await other.getByLabel('Display name').fill('Other tab draft');
	let otherLoads = 0;
	other.on('domcontentloaded', () => otherLoads++);
	active = 4195;
	await page.evaluate(async () => {
		await (await navigator.serviceWorker.getRegistration())?.update();
	});
	const banner = page.getByRole('complementary', { name: 'Update available' });
	await expect(banner).toBeVisible({ timeout: 20_000 });
	for (const colorScheme of ['light', 'dark'] as const) {
		await page.emulateMedia({ colorScheme });
		for (const viewport of [
			{ width: 360, height: 800 },
			{ width: 768, height: 1024 },
			{ width: 1440, height: 900 }
		]) {
			await page.setViewportSize(viewport);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
				)
			).toBe(true);
			for (const button of await banner.getByRole('button').all()) {
				const bounds = await button.boundingBox();
				expect(bounds).not.toBeNull();
				if (bounds) {
					expect(bounds.x).toBeGreaterThanOrEqual(0);
					expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
				}
			}
			const scan = await new AxeBuilder({ page }).analyze();
			expect(
				scan.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious')
			).toEqual([]);
		}
	}
	await expect(page.getByLabel('Display name')).toHaveValue('First tab draft');
	await expect(banner.getByRole('button', { name: 'Later', exact: true })).toHaveCount(0);
	await banner.getByRole('button', { name: 'Dismiss update banner' }).click();
	await expect(banner).toHaveCount(0);
	await expect(page.getByLabel('Display name')).toHaveValue('First tab draft');
	// A new app session exposes the still-waiting release without reinstalling.
	const next = await context.newPage();
	await next.goto('/register');
	await next.getByLabel('Display name').fill('New session draft');
	const nextBanner = next.getByRole('complementary', { name: 'Update available' });
	await expect(nextBanner).toBeVisible();
	await context.setOffline(true);
	await nextBanner.getByRole('button', { name: 'Refresh', exact: true }).click();
	await next.getByRole('dialog').getByRole('button', { name: 'Discard and refresh' }).click();
	await expect(next.getByRole('alert')).toContainText('Reconnect before refreshing');
	await expect(next.getByLabel('Display name')).toHaveValue('New session draft');
	await context.setOffline(false);
	await nextBanner.getByRole('button', { name: 'Refresh', exact: true }).click();
	const confirmation = next.getByRole('dialog', { name: 'Refresh and discard changes?' });
	await expect(confirmation).toBeVisible();
	await confirmation.getByRole('button', { name: 'Keep editing' }).click();
	await expect(next.getByLabel('Display name')).toHaveValue('New session draft');
	await nextBanner.getByRole('button', { name: 'Refresh', exact: true }).click();
	const newBundle = next.waitForResponse(
		(response) => response.url().includes('/_app/immutable/entry/app.') && response.ok()
	);
	await confirmation.getByRole('button', { name: 'Discard and refresh' }).click();
	await newBundle;
	await expect(next.getByLabel('Display name')).toHaveValue('');
	await expect(nextBanner).toHaveCount(0);
	await expect(other.getByLabel('Display name')).toHaveValue('Other tab draft');
	expect(otherLoads).toBe(0);
	await expect(other.getByRole('complementary', { name: 'Update available' })).toBeVisible();
	await expect(page.getByLabel('Display name')).toHaveValue('First tab draft');
});
