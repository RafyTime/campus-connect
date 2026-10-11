import tailwindcss from '@tailwindcss/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	lint: {
		categories: { correctness: 'error' },
		env: { browser: true, node: true },
		ignorePatterns: ['.svelte-kit', 'build', 'test-results', 'playwright-report', 'blob-report'],
		rules: {
			// TypeScript and svelte-check handle names; Svelte runes are compiler globals.
			'no-undef': 'off',
			'unicorn/no-empty-file': 'off',
			'typescript/no-explicit-any': 'error'
		},
		// Svelte component types require the separate svelte-check quality gate.
		options: { typeAware: false, typeCheck: false }
	},
	fmt: {
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none',
		printWidth: 100,
		sortPackageJson: false,
		sortTailwindcss: {
			stylesheet: './src/routes/layout.css'
		},
		svelte: {},
		ignorePatterns: [
			'package-lock.json',
			'pnpm-lock.yaml',
			'yarn.lock',
			'bun.lock',
			'bun.lockb',
			'/static/',
			'/drizzle/'
		]
	},
	ssr: {
		external: ['@libsql/client']
	},
	plugins: lazyPlugins(() => [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			experimental: {
				remoteFunctions: true
			},
			compilerOptions: {
				experimental: {
					async: true
				},
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	]),
	test: {
		expect: { requireAssertions: true },
		env: {
			DATABASE_URL: 'file::memory:',
			ORIGIN: 'http://127.0.0.1:4173',
			BETTER_AUTH_SECRET: 'test-only-secret-that-is-at-least-32-chars'
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
