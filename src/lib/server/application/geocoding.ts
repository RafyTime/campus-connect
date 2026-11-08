import { eq } from 'drizzle-orm';
import type { Database } from '#lib/server/db/index.js';
import type { Clock } from '#lib/server/clock.js';
import { geocodingCache, geocodingThrottle } from '#lib/server/db/schema.js';
import type { GeocodingResult, GeocodingSearch } from '#lib/geocoding.js';

export const defaultGeocodingScope = {
	version: 'bonn-cologne-v1',
	west: 6.7,
	south: 50.5,
	east: 7.5,
	north: 51.1
};
export type GeocodingScope = typeof defaultGeocodingScope;
export type GeocodingProvider = (query: string, scope: GeocodingScope) => Promise<unknown>;

export async function searchLocations(
	db: Database,
	clock: Clock,
	actor: { id: string } | null,
	input: unknown,
	provider: GeocodingProvider,
	scope = defaultGeocodingScope
): Promise<GeocodingSearch> {
	if (!actor) return { ok: false, reason: 'unauthenticated' };
	if (typeof input !== 'string') return { ok: false, reason: 'invalid' };
	const query = input.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('de');
	if (query.length < 3 || query.length > 200) return { ok: false, reason: 'invalid' };
	const key = JSON.stringify([scope, query]);
	try {
		// Reserve the global request slot atomically, then release the database
		// before external I/O so provider failures cannot block Event publication.
		const reservation = await db.withTransaction(async (tx): Promise<GeocodingSearch | null> => {
			const cached = await tx.query.geocodingCache.findFirst({
				where: eq(geocodingCache.key, key)
			});
			if (cached) return { ok: true, results: cached.results };
			const throttle = await tx.query.geocodingThrottle.findFirst({
				where: eq(geocodingThrottle.id, 'global')
			});
			const now = clock.now().getTime();
			if (throttle && now - throttle.requestedAt < 1000)
				return { ok: false, reason: 'rate-limited' };
			await tx
				.insert(geocodingThrottle)
				.values({ id: 'global', requestedAt: now })
				.onConflictDoUpdate({ target: geocodingThrottle.id, set: { requestedAt: now } });
			return null;
		});
		if (reservation) return reservation;
		try {
			const raw = await provider(query, scope);
			if (!Array.isArray(raw)) return { ok: false, reason: 'unavailable' };
			const results: GeocodingResult[] = [];
			for (const value of raw as unknown[]) {
				if (!value || typeof value !== 'object') continue;
				const item = value as Record<string, unknown>;
				const address = item.address;
				if (
					!item ||
					typeof item !== 'object' ||
					typeof item.display_name !== 'string' ||
					!item.display_name.trim() ||
					item.display_name.length > 1000 ||
					!address ||
					typeof address !== 'object' ||
					!('country_code' in address) ||
					address.country_code !== 'de'
				)
					continue;
				const latitude = typeof item.lat === 'string' && item.lat.trim() ? Number(item.lat) : NaN;
				const longitude = typeof item.lon === 'string' && item.lon.trim() ? Number(item.lon) : NaN;
				if (
					!Number.isFinite(latitude) ||
					!Number.isFinite(longitude) ||
					latitude < scope.south ||
					latitude > scope.north ||
					longitude < scope.west ||
					longitude > scope.east
				)
					continue;
				results.push({
					id: 'geocode:' + crypto.randomUUID(),
					label: item.display_name.trim(),
					latitude,
					longitude
				});
				if (results.length === 5) break;
			}
			await db.insert(geocodingCache).values({ key, results }).onConflictDoNothing();
			const stored = await db.query.geocodingCache.findFirst({
				where: eq(geocodingCache.key, key)
			});
			return { ok: true, results: stored?.results ?? results };
		} catch (error) {
			console.error(
				'Address provider request failed',
				error instanceof Error ? error.name : 'Unknown error'
			);
			return { ok: false, reason: 'unavailable' };
		}
	} catch (error) {
		console.error(
			'Address search storage failed',
			error instanceof Error ? error.name : 'Unknown error'
		);
		return { ok: false, reason: 'unavailable' };
	}
}

export async function findGeocodingSelection(db: Pick<Database, 'select'>, id: string) {
	const caches = await db.select().from(geocodingCache);
	return caches.flatMap((cache) => cache.results).find((result) => result.id === id);
}
