/**
 * Pass a Clock to time-dependent application code so tests can control time without changing the host clock.
 */
export interface Clock {
	now(): Date;
}

export const systemClock: Clock = {
	now: () => new Date()
};
