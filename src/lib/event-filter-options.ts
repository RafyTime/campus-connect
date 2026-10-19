import type { PublicResponseMode } from '#lib/public-event.js';

export const discoveryDatePresets = [
	{ value: '', label: 'Any date' },
	{ value: 'today', label: 'Today' },
	{ value: 'tomorrow', label: 'Tomorrow' },
	{ value: 'week', label: 'This week' },
	{ value: 'next-week', label: 'Next week' }
] as const;

export type DiscoveryFilterKey = 'tag' | 'date' | 'type' | 'group' | 'host';

export const discoveryResponseModes = [
	'announcement',
	'interest',
	'registration'
] as const satisfies readonly PublicResponseMode[];
