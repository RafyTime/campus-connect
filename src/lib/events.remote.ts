import { error, invalid, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { systemClock } from '#lib/server/clock.js';
import { searchPublicEvents, getPublicEvent } from '#lib/server/application/events.js';
import { getDb } from '#lib/server/db/index.js';
import {
	createEvent,
	editEvent,
	getEventAuthoringOptions,
	getEventForManagement,
	listMyEvents
} from '#lib/server/application/event-authoring.js';
import type { EventFormValues, EventSaveResult } from '#lib/event-authoring.js';
import { loadPublicGroup } from '#lib/groups.remote.js';

export const loadEventAuthoringOptions = query(async () => {
	const user = getRequestEvent().locals.user;
	if (!user) error(401, 'Sign in to create Events.');
	return getEventAuthoringOptions(getDb(), user);
});

export const loadMyEvents = query(async () => {
	const user = getRequestEvent().locals.user;
	if (!user) error(401, 'Sign in to manage Events.');
	return listMyEvents(getDb(), systemClock, user);
});

export const loadEventForManagement = query('unchecked', async (eventId: string) => {
	if (typeof eventId !== 'string' || !eventId) error(404, 'Event not found');
	const result = await getEventForManagement(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		eventId
	);
	if (!result.ok) {
		if (result.reason === 'unauthenticated') error(401, 'Sign in to manage Events.');
		if (result.reason === 'forbidden')
			error(403, 'You do not have permission to manage this Event.');
		error(404, 'Event not found');
	}
	return result.event;
});

export const createEventForm = form('unchecked', async (data: EventFormValues) => {
	const result = await createEvent(
		getDb(),
		systemClock,
		getRequestEvent().locals.user ?? null,
		data
	);
	if (!result.ok) eventSaveError(result);
	void listPublicEvents('').refresh();
	void loadMyEvents().refresh();
	if (data.hostGroupId) void loadPublicGroup(data.hostGroupId).refresh();
	redirect(303, `/events/${result.eventId}`);
});

export const editEventForm = form(
	'unchecked',
	async (data: EventFormValues & { eventId: string }) => {
		const eventId = typeof data.eventId === 'string' ? data.eventId : '';
		const result = await editEvent(
			getDb(),
			systemClock,
			getRequestEvent().locals.user ?? null,
			eventId,
			data
		);
		if (!result.ok) eventSaveError(result);
		void listPublicEvents('').refresh();
		void loadMyEvents().refresh();
		void loadPublicEvent(eventId).refresh();
		void loadEventForManagement(eventId).refresh();
		const updatedEvent = await getPublicEvent(getDb(), systemClock, eventId);
		if (updatedEvent?.host.type === 'group') void loadPublicGroup(updatedEvent.host.id).refresh();
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
		forbidden: 'You do not have permission to publish or manage Events for this host.',
		'not-found': 'This Event no longer exists.',
		'read-only': 'Ended and cancelled Events cannot be edited.',
		unavailable: 'Could not save the Event. Try again.'
	} as const;
	invalid(messages[result.reason]);
}

export const listPublicEvents = query('unchecked', async (search: string) => {
	return searchPublicEvents(getDb(), systemClock, search);
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
