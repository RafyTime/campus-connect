export const CAMPUS_TIME_ZONE = 'Europe/Berlin';

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
	return `${dateFormatter.format(startsAt)}, ${timeFormatter.format(startsAt)}–${timeFormatter.format(endsAt)}`;
}

export function formatCampusExactTime(startsAt: Date, endsAt: Date): string {
	const timeZoneName =
		timeZoneFormatter.formatToParts(startsAt).find((part) => part.type === 'timeZoneName')?.value ??
		CAMPUS_TIME_ZONE;

	return `${formatCampusSchedule(startsAt, endsAt)} ${timeZoneName}`;
}
