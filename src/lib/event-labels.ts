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

/** `remaining` is open places for Registration and ignored otherwise. */
export function capacityStateLabel(
	responseMode: 'announcement' | 'interest' | 'registration',
	remaining: number | null
): string {
	if (responseMode !== 'registration') return responseModeLabel(responseMode);
	if (remaining === null || remaining <= 0) return 'Full';
	return remaining === 1 ? '1 place remaining' : `${remaining} places remaining`;
}
