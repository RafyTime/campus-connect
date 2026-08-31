import { describe, expect, it } from 'vitest';
import { createTestClock } from './clock';

describe('test clock', () => {
	it('returns the instant selected by the test', () => {
		const clock = createTestClock('2026-09-01T08:00:00.000Z');

		expect(clock.now()).toEqual(new Date('2026-09-01T08:00:00.000Z'));

		clock.set('2026-09-02T14:30:00.000Z');

		expect(clock.now()).toEqual(new Date('2026-09-02T14:30:00.000Z'));
	});
});
