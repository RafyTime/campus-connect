import { expect, test } from '@playwright/test';

test('rendered routes disclose no authentication credentials or session tokens', async ({
	page,
	context
}) => {
	const email = `security.${crypto.randomUUID()}@example.com`;
	const password = `Audit-${crypto.randomUUID()}`;
	await page.goto('/register');
	await page.getByLabel('Display name').fill('Security Explorer');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill(password);
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL('/');
	const cookies = await context.cookies();
	const session = cookies.find(({ name }) => name.includes('session_token'));
	expect(session).toBeDefined();
	expect(session?.httpOnly).toBe(true);
	for (const path of [
		'/',
		'/groups/group-film-society',
		'/create',
		'/my-activity',
		'/my-events',
		'/account'
	]) {
		const response = await page.goto(path);
		expect(response?.ok()).toBe(true);
		const body = await response!.text();
		for (const secret of [email, password, session!.value]) {
			expect(body).not.toContain(secret);
		}
	}
});
