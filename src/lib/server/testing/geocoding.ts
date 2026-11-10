import type { Database } from '#lib/server/db/client.js';
import { geocodingCache } from '#lib/server/db/schema.js';
import { defaultGeocodingScope, geocodingCacheKey } from '#lib/server/application/geocoding.js';

/** Deterministic cached address for disposable acceptance databases only. */
export async function seedGeocodingCache(db: Database) {
	const key = geocodingCacheKey(defaultGeocodingScope, 'bonn fixture');
	await db
		.insert(geocodingCache)
		.values({
			key,
			results: [
				{
					id: `geocode:${key}:0`,
					label: 'Bonn fixture address',
					latitude: 50.73,
					longitude: 7.1
				}
			]
		})
		.onConflictDoNothing();
}
