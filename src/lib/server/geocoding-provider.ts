const env = process.env;
import { defaultGeocodingScope, type GeocodingProvider } from './application/geocoding';

export function geocodingScope() {
	const bounds = (env.GEOCODING_BOUNDS ?? '6.7,50.5,7.5,51.1').split(',').map(Number);
	const [west, south, east, north] = bounds;
	if (
		bounds.length !== 4 ||
		!bounds.every(Number.isFinite) ||
		west >= east ||
		south >= north ||
		west < -180 ||
		east > 180 ||
		south < -90 ||
		north > 90
	)
		throw new Error('Invalid GEOCODING_BOUNDS');
	return {
		...defaultGeocodingScope,
		version: env.GEOCODING_SCOPE_VERSION ?? defaultGeocodingScope.version,
		west,
		south,
		east,
		north
	};
}
export const nominatimProvider: GeocodingProvider = async (query, scope) => {
	const url = new URL(env.NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org/search');
	url.search = new URLSearchParams({
		q: query,
		format: 'jsonv2',
		addressdetails: '1',
		countrycodes: 'de',
		bounded: '1',
		viewbox: [scope.west, scope.north, scope.east, scope.south].join(','),
		limit: '5'
	}).toString();
	const response = await fetch(url, {
		headers: { 'User-Agent': 'CampusConnect/1.0 (https://github.com/RafyTime/campus-connect)' },
		signal: AbortSignal.timeout(5000)
	});
	if (!response.ok) throw new Error('Geocoding provider unavailable');
	return response.json();
};
