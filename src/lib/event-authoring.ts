import { fromDate, parseDateTime, toCalendarDateTime, toZoned } from '@internationalized/date';
import type { PublicEventSummary, PublicResponseMode } from './public-event';

export const campusTimeZone = 'Europe/Berlin';
export const responseModes = ['announcement', 'interest', 'registration'] as const;

export type EventFormValues = {
	hostGroupId: string;
	title: string;
	description: string;
	startsAt: string;
	endsAt: string;
	tagIds: string[];
	responseMode: PublicResponseMode;
	capacity: string;
	locationId: string;
	manualLocation: string;
};
export type EventFieldErrors = Partial<Record<keyof EventFormValues, string>>;
export type EventSaveResult =
	| { ok: true; eventId: string }
	| {
			ok: false;
			reason:
				| 'unauthenticated'
				| 'invalid'
				| 'forbidden'
				| 'not-found'
				| 'read-only'
				| 'unavailable';
			fieldErrors?: EventFieldErrors;
	  };
export type EventAuthoringOptions = {
	groups: { id: string; name: string }[];
	tags: { id: string; name: string }[];
	locations: { id: string; label: string }[];
};
export type ManagedEvent = EventFormValues & {
	id: string;
	hostName: string;
	author: { id: string; displayName: string };
	status: PublicEventSummary['status'];
};

export function formatCampusInput(date: Date): string {
	return toCalendarDateTime(fromDate(date, campusTimeZone)).toString().slice(0, 16);
}

function parseCampusInput(value: unknown): Date | null {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
	try {
		// Reject skipped and repeated clock times rather than silently shifting an Event.
		return toZoned(parseDateTime(value), campusTimeZone, 'reject').toDate();
	} catch {
		return null;
	}
}

/** Shared input validation helps the form; application operations always call it again. */
export function parseEventDetails(input: unknown, now: Date, requireFutureStart: boolean) {
	const data =
		typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
	const title = typeof data.title === 'string' ? data.title.trim() : '';
	const description = typeof data.description === 'string' ? data.description.trim() : '';
	const startsAt = parseCampusInput(data.startsAt);
	const endsAt = parseCampusInput(data.endsAt);
	const responseMode = responseModes.find((mode) => mode === data.responseMode);
	const tagIds =
		Array.isArray(data.tagIds) && data.tagIds.every((id) => typeof id === 'string')
			? [...new Set(data.tagIds.map((id: string) => id.trim()))]
			: [];
	const capacity =
		(typeof data.capacity === 'string' && /^\d+$/.test(data.capacity.trim())) ||
		typeof data.capacity === 'number'
			? Number(data.capacity)
			: null;
	const locationId = typeof data.locationId === 'string' ? data.locationId.trim() : '';
	const manualLocation = typeof data.manualLocation === 'string' ? data.manualLocation.trim() : '';
	const fieldErrors: EventFieldErrors = {};
	if (title.length < 5 || title.length > 100)
		fieldErrors.title = 'Enter a title between 5 and 100 characters.';
	if (description.length < 20 || description.length > 2000)
		fieldErrors.description = 'Enter a description between 20 and 2,000 characters.';
	if (tagIds.length < 1 || tagIds.length > 3 || tagIds.some((id) => !id))
		fieldErrors.tagIds = 'Choose one to three Tags.';
	if (!startsAt) fieldErrors.startsAt = 'Choose an unambiguous date and time in Europe/Berlin.';
	else if (requireFutureStart && startsAt <= now)
		fieldErrors.startsAt = 'Start must be in the future.';
	if (!endsAt) fieldErrors.endsAt = 'Choose an unambiguous date and time in Europe/Berlin.';
	else if (startsAt && endsAt <= startsAt) fieldErrors.endsAt = 'End must be after start.';
	if (!responseMode) fieldErrors.responseMode = 'Choose a response mode.';
	if (responseMode === 'registration') {
		if (!Number.isSafeInteger(capacity) || capacity === null || capacity <= 0)
			fieldErrors.capacity = 'Enter a positive whole-number capacity.';
	} else if (data.capacity !== undefined && data.capacity !== null && data.capacity !== '') {
		fieldErrors.capacity = 'Only registration Events have capacity.';
	}
	if (!locationId) fieldErrors.locationId = 'Choose a campus Location or a plain-text Location.';
	if (locationId === 'manual' && !manualLocation)
		fieldErrors.manualLocation = 'Enter a Location label.';
	if (Object.keys(fieldErrors).length || !startsAt || !endsAt || !responseMode)
		return { ok: false as const, fieldErrors };
	return {
		ok: true as const,
		value: {
			title,
			description,
			startsAt,
			endsAt,
			tagIds,
			responseMode,
			capacity: responseMode === 'registration' ? capacity : null,
			locationId,
			manualLocation
		}
	};
}
