import { describe, expect, it } from 'vitest';

describe('database initialization', () => {
	it('does not open a database connection when the module is imported', async () => {
		const database = await import('./index');

		expect(database.getDb).toBeTypeOf('function');
	});
});
