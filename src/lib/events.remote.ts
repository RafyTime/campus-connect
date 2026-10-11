import { error, invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { systemClock } from '$lib/server/clock';
import { discoverPublicEvents, getPublicEvent } from '$lib/server/application/events';
import { getDb } from '$lib/server/db';
import {
	createPersonalEvent,
	editPersonalEvent,
	getEventAuthoringOptions,
	getPersonalEventForManagement,
	listMyEvents
} from '$lib/server/application/event-authoring';
import type { EventFormValues, EventSaveResult } from '$lib/event-authoring';

export const loadEventAuthoringOptions = query(async () => {
	if (!getRequestEvent().locals.user) error(401, 'Sign in to create Events.');
	return getEventAuthoringOptions(getDb());
});

export const loadMyEvents = query(async () => {
	const user = getRequestEvent().locals.user;
	if (!user) error(401, 'Sign in to manage Events.');
	return listMyEvents(getDb(), systemClock, user);
});

export const loadPersonalEventForManagement = query('unchecked', async (eventId: string) => {
	if (typeof eventId !== 'string' || !eventId) error(404, 'Event not found');
	const result = await getPersonalEventForManagement(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		eventId
	);
	if (!result.ok) {
		if (result.reason === 'unauthenticated') error(401, 'Sign in to manage Events.');
		if (result.reason === 'forbidden') error(403, 'Only the author can edit this personal Event.');
		error(404, 'Event not found');
	}
	return result.event;
});

export const createPersonalEventForm = form('unchecked', async (data: EventFormValues) => {
	const result = await createPersonalEvent(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		data
	);
	if (!result.ok) eventSaveError(result);
	void listPublicEvents().refresh();
	void loadMyEvents().refresh();
	redirect(303, `/events/${result.eventId}`);
});

export const editPersonalEventForm = form(
	'unchecked',
	async (data: EventFormValues & { eventId: string }) => {
		const eventId = typeof data.eventId === 'string' ? data.eventId : '';
		const result = await editPersonalEvent(
			getDb(),
			systemClock,
			getRequestEvent().locals.user ?? null,
			eventId,
			data
		);
		if (!result.ok) eventSaveError(result);
		void listPublicEvents().refresh();
		void loadMyEvents().refresh();
		void loadPublicEvent(eventId).refresh();
		void loadPersonalEventForManagement(eventId).refresh();
		redirect(303, `/events/${result.eventId}`);
	}
);

function eventSaveError(result: Extract<EventSaveResult, { ok: false }>): never {
	if (result.reason === 'invalid')
		invalid(
			...Object.entries(result.fieldErrors ?? {}).map(([field, message]) => ({
				path: [field],
				message
			}))
		);
	const messages = {
		unauthenticated: 'Sign in to manage Events.',
		forbidden: 'Only the author can edit this personal Event.',
		'not-found': 'This Event no longer exists.',
		'read-only': 'Ended and cancelled Events cannot be edited.',
		unavailable: 'Could not save the Event. Try again.'
	} as const;
	invalid(messages[result.reason]);
}

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
