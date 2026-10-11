import tailwindcss from '@tailwindcss/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	lint: {
		plugins: ['oxc', 'typescript', 'unicorn'],
		jsPlugins: [
			{
				name: 'vite-plus',
				specifier: 'vite-plus/oxlint-plugin'
			}
		],
		categories: {
			correctness: 'off'
		},
		env: {
			builtin: true,
			browser: true,
			node: true
		},
		ignorePatterns: [
			'**/node_modules',
			'**/.output',
			'**/.vercel',
			'**/.netlify',
			'**/.wrangler',
			'.svelte-kit',
			'build',
			'**/.DS_Store',
			'**/Thumbs.db',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'!**/.env.test',
			'**/vite.config.js.timestamp-*',
			'**/vite.config.ts.timestamp-*',
			'**/test-results',
			'**/playwright-report',
			'**/blob-report',
			'**/*.db'
		],
		rules: {
			'constructor-super': 'error',
			'for-direction': 'error',
			'getter-return': 'error',
			'no-async-promise-executor': 'error',
			'no-case-declarations': 'error',
			'no-class-assign': 'error',
			'no-compare-neg-zero': 'error',
			'no-cond-assign': 'error',
			'no-const-assign': 'error',
			'no-constant-binary-expression': 'error',
			'no-constant-condition': 'error',
			'no-control-regex': 'error',
			'no-debugger': 'error',
			'no-delete-var': 'error',
			'no-dupe-class-members': 'error',
			'no-dupe-else-if': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-empty': 'error',
			'no-empty-character-class': 'error',
			'no-empty-pattern': 'error',
			'no-empty-static-block': 'error',
			'no-ex-assign': 'error',
			'no-extra-boolean-cast': 'error',
			'no-fallthrough': 'error',
			'no-func-assign': 'error',
			'no-global-assign': 'error',
			'no-import-assign': 'error',
			'no-invalid-regexp': 'error',
			'no-irregular-whitespace': 'error',
			'no-loss-of-precision': 'error',
			'no-misleading-character-class': 'error',
			'no-new-native-nonconstructor': 'error',
			'no-nonoctal-decimal-escape': 'error',
			'no-obj-calls': 'error',
			'no-prototype-builtins': 'error',
			'no-redeclare': 'error',
			'no-regex-spaces': 'error',
			'no-self-assign': 'error',
			'no-setter-return': 'error',
			'no-shadow-restricted-names': 'error',
			'no-sparse-arrays': 'error',
			'no-this-before-super': 'error',
			'no-unassigned-vars': 'error',
			'no-undef': 'off',
			'no-unexpected-multiline': 'error',
			'no-unreachable': 'error',
			'no-unsafe-finally': 'error',
			'no-unsafe-negation': 'error',
			'no-unsafe-optional-chaining': 'error',
			'no-unused-labels': 'error',
			'no-unused-private-class-members': 'error',
			'no-unused-vars': 'error',
			'no-useless-assignment': 'error',
			'no-useless-backreference': 'error',
			'no-useless-catch': 'error',
			'no-useless-escape': 'error',
			'no-with': 'error',
			'preserve-caught-error': 'error',
			'require-yield': 'error',
			'use-isnan': 'error',
			'valid-typeof': 'error',
			'no-array-constructor': 'error',
			'no-unused-expressions': 'error',
			'typescript/ban-ts-comment': 'error',
			'typescript/no-duplicate-enum-values': 'error',
			'typescript/no-empty-object-type': 'error',
			'typescript/no-explicit-any': 'error',
			'typescript/no-extra-non-null-assertion': 'error',
			'typescript/no-misused-new': 'error',
			'typescript/no-namespace': 'error',
			'typescript/no-non-null-asserted-optional-chain': 'error',
			'typescript/no-require-imports': 'error',
			'typescript/no-this-alias': 'error',
			'typescript/no-unnecessary-type-constraint': 'error',
			'typescript/no-unsafe-declaration-merging': 'error',
			'typescript/no-unsafe-function-type': 'error',
			'typescript/no-wrapper-object-types': 'error',
			'typescript/prefer-as-const': 'error',
			'typescript/prefer-namespace-keyword': 'error',
			'typescript/triple-slash-reference': 'error',
			'vite-plus/prefer-vite-plus-imports': 'error'
		},
		overrides: [
			{
				files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
				rules: {
					'constructor-super': 'off',
					'getter-return': 'off',
					'no-class-assign': 'off',
					'no-const-assign': 'off',
					'no-dupe-class-members': 'off',
					'no-dupe-keys': 'off',
					'no-func-assign': 'off',
					'no-import-assign': 'off',
					'no-new-native-nonconstructor': 'off',
					'no-obj-calls': 'off',
					'no-redeclare': 'off',
					'no-setter-return': 'off',
					'no-this-before-super': 'off',
					'no-undef': 'off',
					'no-unreachable': 'off',
					'no-unsafe-negation': 'off',
					'no-var': 'error',
					'no-with': 'off',
					'prefer-const': 'error',
					'prefer-rest-params': 'error',
					'prefer-spread': 'error'
				}
			}
		],
		options: {
			// Svelte component types require svelte-check, which runs in the quality command.
			typeAware: false,
			typeCheck: false
		}
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
