import { hashPassword } from 'better-auth/crypto';
import type { Database } from '#lib/server/db/index.js';
import { account } from '#lib/server/db/schema.js';

/** Password accounts for the existing role fixtures, used only by the disposable browser database. */
export async function seedGroupEventTestAccounts(db: Database) {
	const password = await hashPassword('campus-connect-test');
	for (const userId of ['user-lena', 'user-jonas', 'user-sofia', 'user-mira']) {
		await db
			.insert(account)
			.values({
				id: `test-account-${userId}`,
				accountId: userId,
				providerId: 'credential',
				userId,
				password
			})
			.onConflictDoNothing({ target: account.id });
	}
}
