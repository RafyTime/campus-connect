import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export default function setup() {
	const directory = mkdtempSync(join(tmpdir(), 'campus-connect-updates-'));
	const cleanup = () => {
		if (dirname(directory) !== resolve(tmpdir())) throw new Error('Unexpected candidate directory');
		rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
	};
	process.env.PWA_CANDIDATES = directory;
	process.env.DATABASE_URL = pathToFileURL(join(directory, 'test.db')).href;
	process.env.ORIGIN = 'http://127.0.0.1:4193';
	process.env.BETTER_AUTH_SECRET = 'isolated-update-test-secret-at-least-32-characters';
	process.env.AUTH_RATE_LIMIT = 'off';
	const bun = process.platform === 'win32' ? 'bun.exe' : 'bun';
	const run = (args: string[]) => execFileSync(bun, args, { stdio: 'pipe', env: process.env });
	try {
		// Adapter output keeps runtime dependencies external. Both candidates use this checkout's dependencies.
		symlinkSync(resolve('node_modules'), join(directory, 'node_modules'), 'junction');
		run(['run', 'db:migrate']);
		run(['src/lib/server/seed/cli.ts']);
		for (const candidate of ['a', 'b']) {
			console.log(`Building isolated PWA candidate ${candidate}`);
			run(['run', 'build']);
			cpSync('build', join(directory, candidate), { recursive: true });
		}
	} catch (error) {
		cleanup();
		throw error;
	}
	return cleanup;
}
