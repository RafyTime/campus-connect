import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from '@playwright/test';

const testDatabaseDirectory = mkdtempSync(join(tmpdir(), 'campus-connect-e2e-'));
const testDatabaseUrl = pathToFileURL(join(testDatabaseDirectory, 'test.db')).href;

process.once('exit', () => {
	rmSync(testDatabaseDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
});

export default defineConfig({
	webServer: {
		command:
			'bun run db:migrate && bun src/lib/server/seed/cli.ts && bun run build && bun run preview',
		port: 4173,
		timeout: 300_000,
		env: {
			...(process.env as Record<string, string>),
			DATABASE_URL: testDatabaseUrl,
			ORIGIN: 'http://127.0.0.1:4173',
			BETTER_AUTH_SECRET: 'test-only-secret-that-is-at-least-32-chars'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
