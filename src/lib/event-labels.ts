export function responseModeLabel(
	responseMode: 'announcement' | 'interest' | 'registration'
): string {
	if (responseMode === 'announcement') return 'Announcement';
	if (responseMode === 'interest') return 'Interest';
	return 'Registration';
}

export function eventStatusLabel(status: 'scheduled' | 'cancelled' | 'ended'): string {
	if (status === 'cancelled') return 'Cancelled';
	if (status === 'ended') return 'Ended';
	return 'Scheduled';
}
