export type GeocodingResult = { id: string; label: string; latitude: number; longitude: number };
export type GeocodingSearch =
	| { ok: true; results: GeocodingResult[] }
	| { ok: false; reason: 'unauthenticated' | 'invalid' | 'rate-limited' | 'unavailable' };
