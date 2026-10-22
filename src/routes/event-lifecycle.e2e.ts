import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function register(page: Page) {
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Lifecycle User');
	await page.getByLabel('Email').fill(`lifecycle.${crypto.randomUUID()}@example.com`);
	await page.getByLabel('Password').fill('campus-connect');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
}
async function verifyLayout(page: Page) {
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
	const scan = await new AxeBuilder({ page }).analyze();
	expect(
		scan.violations.filter((issue) => ['critical', 'serious'].includes(issue.impact ?? ''))
	).toEqual([]);
}

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1440, height: 900 }
]) {
	test(`Participation locks, safe edits, final cancellation and retained history at ${viewport.width}px`, async ({
		page,
		browser,
		baseURL
	}) => {
		await page.setViewportSize(viewport);
		await register(page);
		await page.goto('/create');
		const title = `Lifecycle workshop ${crypto.randomUUID().slice(0, 8)}`;
		await page.getByLabel('Title', { exact: true }).fill(title);
		await page
			.getByLabel('Description', { exact: true })
			.fill('A workshop to explore campus coding projects together.');
		await page.getByLabel('Start', { exact: true }).fill('2030-09-02T18:00');
		await page.getByLabel('End', { exact: true }).fill('2030-09-02T20:00');
		await page.getByRole('checkbox', { name: 'Tech', exact: true }).check();
		await page.getByLabel('Response mode', { exact: true }).selectOption('registration');
		await page.getByLabel('Capacity', { exact: true }).fill('2');
		await page.getByLabel('Location', { exact: true }).selectOption('manual');
		await page.getByLabel('Location label', { exact: true }).fill('Library garden');
		await page.getByRole('button', { name: 'Publish Event' }).click();
		await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
		const eventUrl = page.url();
		const participantContext = await browser.newContext({ baseURL, viewport });
		const participant = await participantContext.newPage();
		try {
			await register(participant);
			await participant.goto(eventUrl);
			await participant.getByRole('button', { name: 'Register for Event', exact: true }).click();
			await expect(participant.getByRole('button', { name: 'Cancel registration' })).toBeEnabled();
			await page.goto(`${eventUrl}/edit`);
			await expect(page.getByText('Participation protects this Event')).toBeVisible();
			await expect(page.getByLabel('Start', { exact: true })).toHaveAttribute('readonly', '');
			await expect(page.getByLabel('End', { exact: true })).toHaveAttribute('readonly', '');
			await expect(page.getByLabel('Response mode', { exact: true })).toBeDisabled();
			await expect(page.getByLabel('Location', { exact: true })).toBeDisabled();
			await expect(page.getByLabel('Location label', { exact: true })).toHaveAttribute(
				'readonly',
				''
			);
			await page.getByLabel('Title', { exact: true }).fill(`${title} updated`);
			await page.getByLabel('Capacity', { exact: true }).fill('3');
			await verifyLayout(page);
			await page.screenshot({
				path: `test-results/lifecycle-locked-${viewport.width}.png`,
				fullPage: true
			});
			await page.getByRole('button', { name: 'Save changes' }).click();
			await expect(page.getByRole('heading', { name: `${title} updated`, level: 1 })).toBeVisible();
			await expect(page.getByText('2 places remaining', { exact: true })).toBeVisible();
			await page.goto(`${eventUrl}/edit`);
			await page.getByRole('button', { name: 'Cancel Event', exact: true }).click();
			await page.getByRole('button', { name: 'Keep Event', exact: true }).click();
			await expect(page.getByRole('button', { name: 'Cancel Event', exact: true })).toBeVisible();
			await page.getByRole('button', { name: 'Cancel Event', exact: true }).click();
			await page.route('**/_app/remote/**', async (route) => {
				if (route.request().method() === 'POST') await route.abort();
				else await route.continue();
			});
			await page.getByRole('button', { name: 'Confirm cancellation' }).click();
			await expect(
				page.getByText('Could not cancel the Event. Try again.', { exact: true })
			).toBeVisible();
			await page.unroute('**/_app/remote/**');
			await page.getByRole('button', { name: 'Confirm cancellation' }).click();
			await expect(page.getByText('Event is read-only')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Save changes' })).toHaveCount(0);
			await page.goto('/');
			await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);
			await page.goto('/my-events');
			const own = page
				.getByRole('listitem')
				.filter({ has: page.getByRole('heading', { name: `${title} updated` }) });
			await expect(own).toContainText('Cancelled');
			await expect(own.getByRole('link', { name: /Edit/ })).toHaveCount(0);
			await verifyLayout(page);
			await page.goto(eventUrl);
			await expect(page.getByText('Event cancelled', { exact: true })).toBeVisible();
			await expect(page.getByRole('button', { name: 'Register for Event' })).toHaveCount(0);
			await participant.goto('/my-activity');
			const history = participant
				.getByRole('listitem')
				.filter({ has: participant.getByRole('heading', { name: `${title} updated` }) });
			await expect(history).toContainText('Registered · Cancelled');
			await verifyLayout(participant);
			await participant.screenshot({
				path: `test-results/lifecycle-history-${viewport.width}.png`,
				fullPage: true
			});
			await history.getByRole('link').click();
			await expect(participant).toHaveURL(eventUrl);
			await expect(participant.getByRole('button', { name: 'Cancel registration' })).toHaveCount(0);
			await verifyLayout(participant);
		} finally {
			await participantContext.close();
		}
	});
	test(`ended Event is read-only in creator and participant history at ${viewport.width}px`, async ({
		page
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/sign-in');
		await page.getByLabel('Email').fill('jonas.weber@example.com');
		await page.getByLabel('Password').fill('campus-connect-test');
		await page.getByRole('button', { name: 'Sign in', exact: true }).click();
		await expect(page).toHaveURL('/');
		await page.goto('/my-activity');
		const history = page
			.getByRole('listitem')
			.filter({ has: page.getByRole('heading', { name: 'Completed campus workshop' }) });
		await expect(history).toContainText('Registered · Ended');
		await history.getByRole('link').click();
		await expect(page.getByText('Event ended', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Cancel registration' })).toHaveCount(0);
		await page.goto('/my-events');
		const own = page
			.getByRole('listitem')
			.filter({ has: page.getByRole('heading', { name: 'Welcome-week screening' }) });
		await expect(own).toContainText('Ended');
		await expect(own.getByRole('link', { name: /Edit/ })).toHaveCount(0);
		await page.goto('/events/event-ended-film-meetup/edit');
		await expect(page.getByText('Event is read-only')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Cancel Event', exact: true })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Save changes' })).toHaveCount(0);
		await verifyLayout(page);
	});
}
