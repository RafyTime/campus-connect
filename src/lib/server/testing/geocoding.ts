import type { Database } from '#lib/server/db/client.js';
import { geocodingCache } from '#lib/server/db/schema.js';
import { defaultGeocodingScope } from '#lib/server/application/geocoding.js';

/** Deterministic cached address for disposable acceptance databases only. */
export async function seedGeocodingCache(db: Database) {
	await db
		.insert(geocodingCache)
		.values({
			key: JSON.stringify([defaultGeocodingScope, 'bonn fixture']),
			results: [
				{
					id: 'geocode:bonn-fixture',
					label: 'Bonn fixture address',
					latitude: 50.73,
					longitude: 7.1
				}
			]
		})
		.onConflictDoNothing();
}
