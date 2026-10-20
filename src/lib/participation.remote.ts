import { loadPublicEvent, listPublicEvents } from '#lib/events.remote.js';
import { error } from '@sveltejs/kit';
import { command, getRequestEvent, query } from '$app/server';
import { getDb } from '#lib/server/db/index.js';
import { systemClock } from '#lib/server/clock.js';
import {
	getInterestState,
	listMyActivity,
	setInterest,
	getRegistrationState,
	setRegistration
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

export const loadRegistrationState = query('unchecked', async (eventId: string) => {
	if (typeof eventId !== 'string' || !eventId) error(400, 'Invalid Event');
	return getRegistrationState(getDb(), systemClock, getRequestEvent().locals.user ?? null, eventId);
});

export const changeRegistration = command(
	'unchecked',
	async (input: { eventId: string; registered: boolean }) => {
		if (
			!input ||
			typeof input.eventId !== 'string' ||
			!input.eventId ||
			typeof input.registered !== 'boolean'
		)
			error(400, 'Invalid registration request');
		const result = await setRegistration(
			getDb(),
			systemClock,
			getRequestEvent().locals.user ?? null,
			input.eventId,
			input.registered
		);
		if (result.ok || result.reason === 'full' || result.reason === 'not-available') {
			await loadRegistrationState(input.eventId).refresh();
			await loadPublicEvent(input.eventId).refresh();
			await listPublicEvents('').refresh();
			if (result.ok) await loadMyActivity().refresh();
		}
		return result;
	}
);
