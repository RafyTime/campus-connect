import { command, getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.js';
import { systemClock } from '#lib/server/clock.js';
import { searchLocations } from '#lib/server/application/geocoding.js';
import { geocodingScope, nominatimProvider } from '#lib/server/geocoding-provider.js';
import type { GeocodingSearch } from '#lib/geocoding.js';

export const searchEventLocations = command(
	'unchecked',
	async (query: string): Promise<GeocodingSearch> => {
		try {
			return await searchLocations(
				getDb(),
				systemClock,
				getRequestEvent().locals.user ?? null,
				query,
				nominatimProvider,
				geocodingScope()
			);
		} catch (error) {
			console.error(
				'Address search configuration failed',
				error instanceof Error ? error.name : 'Unknown error'
			);
			return { ok: false, reason: 'unavailable' };
		}
	}
);
