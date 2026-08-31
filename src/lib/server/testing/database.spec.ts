import { describe, expect, it } from 'vitest';
import { user } from '$lib/server/db/schema';
import { createTestDatabase } from './database';

describe('test database', () => {
	it('creates isolated migrated databases', async () => {
		using populatedDatabase = await createTestDatabase();
		using isolatedDatabase = await createTestDatabase();

		await populatedDatabase.db.insert(user).values({
			id: 'test-user',
			name: 'Test User',
			email: 'test@example.com'
		});

		const isolatedUsers = await isolatedDatabase.db.select().from(user);

		expect(isolatedUsers).toEqual([]);
	});
});
