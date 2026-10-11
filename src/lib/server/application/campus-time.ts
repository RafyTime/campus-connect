import { campusTimeZone } from '$lib/event-authoring';

export const CAMPUS_TIME_ZONE = campusTimeZone;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: CAMPUS_TIME_ZONE,
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: CAMPUS_TIME_ZONE,
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

const timeZoneFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: CAMPUS_TIME_ZONE,
	timeZoneName: 'short'
});

export function formatCampusSchedule(startsAt: Date, endsAt: Date): string {
	const endDate =
		dateFormatter.format(startsAt) === dateFormatter.format(endsAt)
			? ''
			: `${dateFormatter.format(endsAt)}, `;
	return `${dateFormatter.format(startsAt)}, ${timeFormatter.format(startsAt)}–${endDate}${timeFormatter.format(endsAt)}`;
}

export function formatCampusExactTime(startsAt: Date, endsAt: Date): string {
	const startZone = timeZoneName(startsAt);
	const endZone = timeZoneName(endsAt);
	if (startZone !== endZone) {
		const endDate =
			dateFormatter.format(startsAt) === dateFormatter.format(endsAt)
				? ''
				: `${dateFormatter.format(endsAt)}, `;
		return `${dateFormatter.format(startsAt)}, ${timeFormatter.format(startsAt)} ${startZone}–${endDate}${timeFormatter.format(endsAt)} ${endZone}`;
	}
	return `${formatCampusSchedule(startsAt, endsAt)} ${startZone}`;
}

function timeZoneName(date: Date): string {
	return (
		timeZoneFormatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ??
		CAMPUS_TIME_ZONE
	);
}
