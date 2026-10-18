import { defineEnvVars } from '@sveltejs/kit/env';

// Keep optional runtime settings empty. Database and auth validate required values lazily under ADR 0001.
export const variables = defineEnvVars({
	ORIGIN: { schema: (input) => input ?? '' },
	BETTER_AUTH_SECRET: { schema: (input) => input ?? '' },
	AUTH_RATE_LIMIT: { schema: (input) => input ?? '' },
	DATABASE_URL: { schema: (input) => input ?? '' }
});
