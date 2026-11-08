// Local-only external provider replacement for browser acceptance tests.
Bun.serve({
	port: 4197,
	fetch(request) {
		const query = new URL(request.url).searchParams.get('q') ?? '';
		if (query.includes('failure')) return new Response('Unavailable', { status: 503 });
		if (query.includes('empty')) return Response.json([]);
		return Response.json([
			{
				display_name: 'Bonn test address',
				lat: '50.73',
				lon: '7.1',
				address: { country_code: 'de' }
			}
		]);
	}
});
