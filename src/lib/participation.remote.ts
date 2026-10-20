import { error } from '@sveltejs/kit';
import { command, getRequestEvent, query } from '$app/server';
import { getDb } from '#lib/server/db/index.js';
import { systemClock } from '#lib/server/clock.js';
import {
	getInterestState,
	listMyActivity,
	setInterest
} from '#lib/server/application/participation.js';

export const loadInterestState = query('unchecked', async (eventId: string) => {
	if (typeof eventId !== 'string' || !eventId) error(400, 'Invalid Event');
	return getInterestState(getDb(), systemClock, getRequestEvent().locals.user ?? null, eventId);
});

export const loadMyActivity = query(async () => {
	const user = getRequestEvent().locals.user;
	if (!user) error(401, 'Sign in to view My activity.');
	return listMyActivity(getDb(), systemClock, user);
});

export const changeInterest = command(
	'unchecked',
	async (input: { eventId: string; interested: boolean }) => {
		if (
			!input ||
			typeof input.eventId !== 'string' ||
			!input.eventId ||
			typeof input.interested !== 'boolean'
		)
			error(400, 'Invalid interest request');
		const result = await setInterest(
			getDb(),
			systemClock,
			getRequestEvent().locals.user ?? null,
			input.eventId,
			input.interested
		);
		if (result.ok) {
			await loadInterestState(input.eventId).refresh();
			await loadMyActivity().refresh();
		}
		return result;
	}
);
