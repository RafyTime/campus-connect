import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from '@playwright/test';

// Node mode uses the existing artifact so verification can preserve the build-time database boundary.
const builtNode = process.env.PLAYWRIGHT_SERVER === 'node';
const port = builtNode ? '4183' : '4173';
const publicOrigin = `http://127.0.0.1:${port}`;
const serverCommand = builtNode ? 'node build/index.js' : 'vp build && vp preview --host 127.0.0.1';

const testDatabaseDirectory = mkdtempSync(join(tmpdir(), 'campus-connect-e2e-'));
const testDatabaseUrl = pathToFileURL(join(testDatabaseDirectory, 'test.db')).href;

process.once('exit', () => {
	rmSync(testDatabaseDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
});

export default defineConfig({
	use: { baseURL: publicOrigin },
	webServer: {
		command: `vp run db:migrate && bun src/lib/server/seed/cli.ts && bun src/lib/server/testing/seed-accounts/cli.ts && ${serverCommand}`,
		url: publicOrigin,
		timeout: 300_000,
		env: {
			...(process.env as Record<string, string>),
			DATABASE_URL: testDatabaseUrl,
			HOST: '127.0.0.1',
			PORT: port,
			ORIGIN: publicOrigin,
			BETTER_AUTH_SECRET: 'test-only-secret-that-is-at-least-32-chars',
			AUTH_RATE_LIMIT: 'off'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
