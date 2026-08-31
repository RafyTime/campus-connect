import { describe, expect, it, vi } from 'vitest';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock('@libsql/client', () => ({ createClient }));

import { getDb } from './index';

describe('database initialization', () => {
	it('does not open a database connection when the module is imported', () => {
		expect(createClient).not.toHaveBeenCalled();
		expect(getDb).toBeTypeOf('function');
	});
});
