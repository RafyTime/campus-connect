import { expect, it, vi } from 'vite-plus/test';
import { createAuth } from '#lib/server/auth.js';
import { createTestDatabase } from '#lib/server/testing/database.js';
import { hashPassword } from 'better-auth/crypto';
import { user, account } from '#lib/server/db/schema.js';

it('authentication database failures report a safe category without SQL parameters or credentials', async () => {
	using fixture = await createTestDatabase();
	await fixture.db
		.insert(user)
		.values({ id: 'logging-user', name: 'Logging User', email: 'logging@example.com' });
	await fixture.db.insert(account).values({
		id: 'logging-account',
		accountId: 'logging-user',
		userId: 'logging-user',
		providerId: 'credential',
		password: await hashPassword('logging-test-password')
	});
	const auth = createAuth(fixture.db);
	// A real failed session write includes generated session data in the database error chain.
	await fixture.db.$client.execute('DROP TABLE session');
	const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
	const warnLog = vi.spyOn(console, 'warn').mockImplementation(() => {});
	const outputLog = vi.spyOn(console, 'log').mockImplementation(() => {});
	try {
		const response = await auth.handler(
			new Request('http://127.0.0.1:4173/api/auth/sign-in/email', {
				method: 'POST',
				headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:4173' },
				body: JSON.stringify({ email: 'logging@example.com', password: 'logging-test-password' })
			})
		);
		expect(response.status).toBe(500);
		const messages = [...errorLog.mock.calls, ...warnLog.mock.calls, ...outputLog.mock.calls];
		expect(messages.length).toBeGreaterThan(0);
		for (const message of messages) {
			expect(message).toEqual(['Authentication error']);
		}
	} finally {
		vi.restoreAllMocks();
	}
});
