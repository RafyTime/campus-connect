import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import { systemClock } from '$lib/server/clock';
import { discoverPublicEvents, getPublicEvent } from '$lib/server/application/events';
import { getDb } from '$lib/server/db';

export const listPublicEvents = query(async () => {
	return discoverPublicEvents(getDb(), systemClock);
});

export const loadPublicEvent = query('unchecked', async (eventId: string) => {
	if (typeof eventId !== 'string' || eventId.length === 0) {
		error(404, 'Page not found');
	}

	const record = await getPublicEvent(getDb(), systemClock, eventId);

	if (!record) {
		error(404, 'Page not found');
	}

	return record;
});
