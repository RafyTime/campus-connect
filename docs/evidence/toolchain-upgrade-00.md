# Toolchain workflow verification

Date: 16 October 2026.

Ticket: `docs/.work/03-toolchain-upgrade/tasks/00-standardize-bun-and-vite-plus-workflow.md`.

## Scope and baseline

Work ran in the managed `toolchain-workflow` worktree on `codex/toolchain-workflow`, starting at integration commit `798f9b165f74f1671ac80da6f9ff59d162957264`. The application stayed on Kit 2. No production service, production database, Railway settings, or daily development build/preview was accessed. The complete existing quality task and browser suites are the approved acceptance boundaries. This workflow change adds no configuration-string tests or application test abstraction.

The initial checkout had no `node_modules`. Existing package scripts already retained Oxfmt Svelte formatting, Oxlint, Svelte-aware ESLint, `svelte-check`, Vitest server/browser tests, Playwright end-to-end tests, and the production build. Those commands, assertions, and database contracts were retained. No task-result caching was added.

Before the pin, the global CLI selected Node 24.22.0 through its LTS fallback while the shell's direct `node` selected 24.19.0. CI declared 24.19.0. `vp env pin node@24.22.0 --target node-version` created the project declaration. CI now reads that file using the exact official `voidzero-dev/setup-vp@v1.21.2` action, obtains the Vite+ version from the project's existing exact dependency, and uses its managed Bun from `packageManager`.

## Selected versions

| Component                              | Version                                  |
| -------------------------------------- | ---------------------------------------- |
| Node                                   | 24.22.0                                  |
| Bun                                    | 1.4.3                                    |
| Project Vite+                          | 1.0.0                                    |
| Direct Vite alias and override         | `npm:@voidzero-dev/vite-plus-core@1.0.0` |
| Bundled Vite                           | 8.3.1                                    |
| Vitest and Playwright browser provider | 5.0.1                                    |
| SvelteKit                              | 2.70.1                                   |
| Svelte                                 | 5.56.8                                   |
| Svelte Vite plugin                     | 7.2.0                                    |
| Node adapter                           | 5.5.7                                    |
| TypeScript                             | 6.0.3                                    |
| Better Auth                            | 1.6.25                                   |
| Playwright                             | 1.62.0                                   |

The installed Vite+ 1.0.0 manifest requires Node `^22.18.0 || ^24.11.0 || >=26.0.0`; its core alias requires `^20.19.0 || ^22.18.0 || >=24.11.0`. Node 24.22.0 satisfies both and Kit 3's Node >=22.17 minimum. Vite+ declares Vitest and its browser-playwright peer at 5.0.1, matching the project. No dependency or lockfile change was needed. The existing global CLI is 1.1.0 and delegates project tools to local 1.0.0; a newer global CLI did not trigger a project upgrade.

## Installation and commands

- `vp env current --json` confirmed Node 24.22.0 from `.node-version` and Bun 1.4.3 from `packageManager`.
- `vp env exec node --version` returned `v24.22.0`; `vp env exec bun --version` returned `1.4.3`.
- A real `vp install --frozen-lockfile` installed 428 packages in 55.24 seconds, including the normal `svelte-kit sync` prepare lifecycle. It used the empty checkout, not copied dependencies or an install dry run.
- `bun.lock` SHA256 before and after installation was `DE8A55378CF871C13FDF1B9AA96F33A1B9184EBA87A2D0FD110EF403BF73A0B8`.
- `vp run test:install --with-deps` passed. This is CI's Chromium setup command; existing local browser binaries could be reused.
- The acceptance command is `vp run quality`, with `DATABASE_URL=file::memory:`, `ORIGIN=http://127.0.0.1:4173`, and a test-only authentication secret. The existing Playwright configuration creates and removes its own temporary SQLite directory and starts preview from this isolated worktree.

The README documents Vite+ dependency operations, dev/build/preview/format/lint/test built-ins, and custom project tasks. `vp run lint` preserves Svelte-aware rules, `vp run check` preserves Svelte/type checking, and `vp run test` includes end-to-end tests. Direct Bun execution inside existing database utility scripts and Node application startup remain intact.

## Results and warnings

The first complete quality run passed formatting, linting, Svelte/type checking with zero errors and warnings, and all 153 unit/component tests across 14 files in 7.39 seconds. Its end-to-end run finished with 63 passing and two failing tests in 1.6 minutes. The final standalone build was not reached in that failed run.

The Unicode Group case failed its first creation because its description was empty in the captured browser snapshot. A focused unchanged rerun passed both failures in 9.7 seconds. Repeating each five times with two workers passed every Unicode case and four sign-in cases, but reproduced the sign-in failure once in a 43.5-second run. The failed sign-in page was anonymous Discover after the test clicked Sign out and immediately navigated to Sign in. The remote sign-out function redirects to Discover, so that pending redirect could overtake the test's next navigation.

The existing sign-in test now observes the documented sign-out redirect with `await expect(page).toHaveURL('/')` before navigating again. Its existing session and persistence assertions remain intact. With this assertion, the same focused command passed all 10 repetitions in 16.0 seconds. The unchanged Unicode fixture contains the correct single-backslash combining-mark escape and needed no modification. Its initial input-loss failure did not recur in these bounded diagnostics.

The diagnostic command was `vp run test:e2e --config playwright.diagnostic.config.ts --grep 'Unicode name conflicts|sign-in establishes a session' --workers 2 --repeat-each 5`. The temporary config imported the existing Playwright config and replaced only its web-server command to migrate and seed a fresh disposable database and reuse this worktree's existing build with `vp preview`. The config was removed before the final complete gate and commit.

The final `vp run quality` passed with exit code 0 in 120.53 seconds. Formatting, Oxlint, Svelte-aware ESLint, and Svelte/type checking all passed, with zero Svelte errors or warnings. All 153 server/browser-component tests passed across 14 files in 3.32 seconds. All 65 end-to-end tests passed with the original six workers in 1.0 minute, including the two initially failing cases. The final production build and Node adapter completed. Vite+ reported all eight task steps with caching disabled.

Remaining warnings observed so far are dependency circular imports in Zod and `@internationalized/date`, the Vitest mock interceptor's Vite-specific server hook, and optional Better Auth `@opentelemetry/api` externalization. Existing plugin timing diagnostics and the terminal's conflicting color environment variables also emit messages. No optional telemetry dependency was added and no assertions were weakened. Better Auth's invalid-password warning and the deliberate missing-route 404 come from the failure-path tests.

`vp env doctor` confirms the project runtime and package manager resolve correctly. It notes that this machine's direct `node`, `npm`, and `npx` paths precede the Vite+ shims; Vite+ commands and `vp env exec node --version` use the declared Node 24.22.0. The README instructs a fresh terminal with environment management enabled. No global shell profile was changed.

Only the workflow's commands are verified locally. GitHub Actions itself has not run, and this evidence claims no remote CI result. Workflow triggers, job identity, permissions, concurrency, and deployment gating were retained. The standalone built Node server and migration to Kit 3 belong to later tickets.

## Primary references checked

- [Node 24.22.0 LTS release](https://nodejs.org/en/blog/release/v24.22.0).
- [Vite+ runtime selection and pinning](https://viteplus.dev/guide/env).
- [Vite+ dependency alignment](https://viteplus.dev/guide/upgrade-project).
- [Vite+ package management](https://viteplus.dev/guide/package-management).
- [Official CI integration](https://viteplus.dev/guide/ci).
- [setup-vp v1.21.2 release](https://github.com/voidzero-dev/setup-vp/releases/tag/v1.21.2), its [action inputs](https://github.com/voidzero-dev/setup-vp/blob/v1.21.2/action.yml), and [version-file documentation](https://github.com/voidzero-dev/setup-vp/tree/v1.21.2#with-nodejs-version-file).
