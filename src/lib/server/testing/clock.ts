import type { Clock } from '$lib/server/clock';

export interface TestClock extends Clock {
	set(instant: Date | string | number): void;
}

export function createTestClock(initialInstant: Date | string | number): TestClock {
	let currentInstant = new Date(initialInstant);

	return {
		now: () => new Date(currentInstant),
		set: (instant) => {
			currentInstant = new Date(instant);
		}
	};
}
