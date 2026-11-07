import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e/updates',
	testMatch: '*.spec.ts',
	globalSetup: './e2e/updates/setup.ts',
	workers: 1,
	timeout: 60_000,
	use: { baseURL: 'http://127.0.0.1:4193', serviceWorkers: 'allow' }
});
