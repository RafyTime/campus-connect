# SvelteKit 3 and Better Auth migration evidence

Implementation started 16 October 2026. Final verification completed 18 October 2026.

Ticket: `docs/.work/03-toolchain-upgrade/tasks/01-migrate-sveltekit-and-better-auth.md`.

## Scope and versions

Implementation ran only in the managed `toolchain-kit3` worktree on `codex/toolchain-kit3`, confirmed at integration commit `8c6fbec332bd2bc60ca6d6d6946f158b74b52731` before changes. The authoritative spec and ticket were read from the integration checkout's `03-toolchain-upgrade` directory. No production service, live database, Railway setting, or daily build/preview was accessed. The existing complete quality gate and product browser suites are the approved testing boundaries. Standalone built-Node deployment verification belongs to ticket 02.

| Component                                 | Selected version             |
| ----------------------------------------- | ---------------------------- |
| Node                                      | 24.22.0 from `.node-version` |
| Bun                                       | 1.4.3 from `packageManager`  |
| Vite+ and direct/override Vite core alias | 1.0.0                        |
| Bundled Vite                              | 8.3.1                        |
| Vitest and browser-playwright provider    | 5.0.1                        |
| SvelteKit                                 | 3.1.0                        |
| Node adapter                              | 6.0.0                        |
| Svelte                                    | 5.57.2                       |
| Svelte Vite plugin                        | 7.3.1                        |
| Svelte checking                           | 4.7.7                        |
| shadcn-svelte CLI                         | 1.7.0                        |
| Better Auth and auth CLI                  | 1.7.10                       |
| TypeScript                                | 6.0.3                        |
| Existing browser helper                   | vitest-browser-svelte 3.1.0  |

Published registry manifests were inspected on the implementation date. Kit 3.1.0 requires Node >=22.17, Svelte ^5.57.1, TypeScript ^6, Vite ^8.0.12, and plugin ^7. Adapter 6 declares Kit ^3.0.0-next.0, which includes stable 3.1.0. Better Auth 1.7.10 explicitly accepts Kit ^2 or ^3, Svelte ^4 or ^5, the existing Drizzle ^0.45.2, and Vitest ^5. The auth CLI depends on exactly Better Auth 1.7.10 and needs Node >=22.12. Svelte-check 4.7.7 accepts TypeScript ^6 and Svelte ^5. shadcn-svelte 1.7.0 accepts Svelte ^5 and its installed CLI detects the `#lib/*` package mapping. No peer bypass, branch snapshot, unrelated broad dependency upgrade, or Vite+ version change was used.

## Latest Kit 2 baseline

`vp add -D @sveltejs/kit@2.70.3` established the latest compatible stable Kit 2 baseline. Its first two `vp run quality` attempts both passed formatting, linting, typechecking, and all 153 unit/component tests, then passed 64 of 65 browser tests. Different first interactions in Discover failed: the first Study checkbox interaction left the checkbox unchanged, then the first Host type selection caused no pending navigation. Neither run had migration code changes. Account, authoring, Group management, and subscription assertions were retained.

The planned Svelte 5.57.2 upgrade was then applied while still on Kit 2.70.3. Upstream Svelte 5.57.2 fixes production event handlers declared after top-level await, matching Discover's async derived result and handlers. The complete unchanged `vp run quality` then passed with all 153 unit/component tests, all 65 browser tests using the original six workers, and the final production Node-adapter build. The passing latest Kit 2 baseline preceded every Kit 3 migrator change. These results support a framework-related first-interaction failure; they do not prove a single cause for every earlier intermittent failure.

The initial temporary focused configuration incorrectly merged two Playwright web servers and failed on duplicate port 4173. It was removed. That diagnostic establishes no product failure. Later diagnostics replaced the existing web-server property instead of merging it.

## Official migration and manual decisions

Ran `bunx sv@1.1.1 migrate sveltekit-3 --tasks all --no-git-check --confirm --no-install`. All twelve tasks completed successfully. An initial invocation without `--tasks all` only displayed the task picker and made no migration edits. The successful run also invoked the existing formatter and generated `MIGRATION_TASKS.md` plus one environment review marker.

The generated package task replaced the project's Vite core alias with plain Vite ^8.0.12. Before installation, it was restored to `npm:@voidzero-dev/vite-plus-core@1.0.0`, matching the unchanged override and project Vite+. The selected framework and auth packages were installed together with `vp install`.

- Library imports use `#lib` package mappings and explicit file extensions, including directory `index.js` and `.remote.js` imports. The generator aliases now match, including `#lib/utils.js`.
- TypeScript extends `$app/tsconfig` and explicitly includes `src`, Vite configuration, Drizzle configuration, and Playwright configuration. The old generated-config callback was removed. Database tooling retains type coverage.
- Hook types moved to `@sveltejs/kit/hooks`; build detection moved to `$app/env`. Runtime environment variables use `$app/env/private` and declarations in `src/env.ts`. Optional absent values remain empty; database and auth required-value checks run lazily under ADR 0001. No database client or auth instance is created during build analysis.
- Readonly `page.url` exposed one helper signature that unnecessarily required mutable URLSearchParams. `currentReturnPath` now accepts the pathname and search properties it reads.
- Reviewed the four generated paths findings. Static paths use the new path spelling and dynamic route IDs retain their leading slash. Discover's goto destinations stay internal. Its removed focus/scroll options became `reset: false`. No invalidateAll usage remained.
- The legacy demo forms submit named actions on their own page. Their native/enhanced navigation intent needs no change. The application does not require cross-origin development assets, external browser redirects, service workers, or parameter matcher migration. No CORS exception was added.
- Every remote form control was audited. The Group and account forms already use field-generated attributes. Event Tag controls now use `.as('checkbox', tag.id, defaultChecked)`. Bits UI renders a button and hidden checkbox, so the visible control explicitly keeps `type="button"` while retaining the generated name, value, and checked attributes. The edit hidden Event ID and submitted form now share the same scoped edit instance.
- Client Event validation reads decoded `submission.fields.value()` merged with existing defaults instead of parsing literal FormData names. Kit 3 appends the form identity to those names. Conditional capacity is omitted from client validation when response mode is no longer registration, matching native submission of the mounted controls. Query functions continue receiving route/search values as explicit arguments.
- Kit 3 `paths.origin` loads ORIGIN through Vite's mode-aware environment loader. Process values take precedence over env files. Runtime ORIGIN remains Better Auth's explicit baseURL. README, `.env.example`, and deployment instructions explain identical build/runtime origins, a matching local preview example, rebuilds after origin changes, and Railway's HTTPS proxy. CSRF remains enabled with no trusted-origin exceptions.

The generated review marker was resolved and the temporary migration checklist removed after reviewing its applicable findings. No schema, migration, domain rule, or permission changed. ADR 0001 lazy initialization and ADR 0002 Unicode Group-name uniqueness remain intact.

## Auth compatibility

Reviewed the Better Auth 1.7 upgrade guide and installed 1.7.10 core account schema. Releases 1.7.0 through 1.7.2 temporarily required an issuer column, but 1.7.3 reverted that requirement. The installed account schema still uses providerId and accountId, as in 1.6, without issuer. Campus Connect upgrades directly from 1.6.25, uses email/password and the default Drizzle adapter, and does not enable OAuth-provider, SCIM, secondary storage, or cookie-cache features that require additional upgrade steps. No schema-generation or database migration command was run for auth. Existing migration and seeded account suites verify real persisted behavior.

## Product verification

The existing personal Event authoring test was extended to select Tech and Social on creation, assert both persisted, replace Social with Outdoors during editing while retaining Tech, reload, and reopen editing to inspect the persisted selections. The existing validation/request-failure test now checks both selected Tags through semantic validation and transport failure, then confirms them after successful recovery and reload. Existing Group manager flows similarly assert two Tags on creation, replace one while retaining another, reload, and reopen editing. Every original assertion and suite remains present.

The focused personal test failed after the official migration and before the form adaptation. Publication could not reach its expected detail heading. After the generated Tag names, decoded values, and scoped hidden field changes, both the create/edit/reload flow and validation/transport recovery passed. The focused Group recovery case and manager editing flows exercise the same migrated form through actual persisted Events.

A Group repetition exposed an additional first-interaction problem. With an explicit empty Host default, the initial focused run passed two of three cases, a trace-enabled repetition passed nine of ten, and narrow lifecycle probes passed eight of ten. In failures the DOM selection was already empty immediately after selectOption, stayed empty before submission, and both decoded fields and native FormData were empty. Timing probes showed selection attempts beginning before form mount. Removing only the redundant empty fallback from the create-only Host `.as('select')` leaves the existing first Personal option as the default and lets the native binding adopt an early DOM selection. All probes were removed; twenty original manager flows passed with two workers in 41.4 seconds, including persisted multi-Tag replacement and reload. No form was disabled and no test delay was introduced.

After the real clean install, the first Kit 3 complete gate passed all 153 unit/component tests and 64 of 65 browser tests. Discover's first Host type selection again reverted to All hosts and never started its held navigation. These filters have no native form submission fallback. They now remain disabled only until this page mounts and its client handlers are ready. Server-rendered results and URL-based discovery remain available, and controls stay enabled during later pending navigation so additional selections still work. This state is local to Discover; remote forms retain their native submission behavior. Existing tests exercise the exact failing first interaction.

The next complete run exposed four remaining early-hydration failures: Event title/description were empty, Group creation lost name/description, pending Group creation lost its name, and a Visitor's Follow click missed the sign-in dialog. That run passed 57 browser cases, failed four, and skipped four subsequent cases in the existing serial Follow suite. Lint, type checking, and all 153 unit/component tests passed. No server/database error explained these snapshots.

Inspection of Svelte's public binding behavior and installed sources identified the shared form issue. Svelte's native input binding adopts an edit made before hydration by calling its setter. shadcn controls previously held that adopted value locally, while Kit 3's getter-only field attributes and later delegated form listener still exposed empty field state. Real remote text controls now bind directly through public field.value()/field.set() functions. This applies to Group and Event fields, registration, sign-in, and profile editing. Capacity explicitly converts the native number binding back to the existing string field contract. Native forms remain enabled and retain progressive submission behavior. Hidden identifiers remain field-generated immutable controls.

Component attributes are copied before their explicit binding because the Kit 3 generated value getter is nonconfigurable; otherwise Svelte SSR reports Cannot redefine property: value when combining the spread with a component binding. That initial diagnostic failed visibly and was stopped once understood. A copied attribute object preserves generated names/defaults while allowing the binding. No helper abstraction or private framework import was introduced. Native Group textarea binding does not need that component-prop copy. Selects retain an undefined initial bound value so they can adopt the DOM; meaningful response/location edit defaults use native defaultValue separately. The create Host retains its existing first Personal option.

The unchanged Unicode Group create/edit and pending-create flows then passed ten of ten repetitions in 28.1 seconds. Event create/edit/multiple-Tag recovery and Visitor Follow passed fifteen of fifteen in 34.7 seconds. Follow is a JavaScript-only command, so its button now waits only for its own mounted handler, independently of native forms. The focused account/profile, personal Event, and both Group manager persistence flows passed all twelve cases in 25.3 seconds, including invalid/duplicate registration, sessions, sign-out, invalid credentials, safe return paths, keyboard use, and responsive account layouts. No assertions were weakened. The existing unused Button navigation-lint suppression was removed as a comment-only cleanup.

The subsequent full gate passed 64 of 65 browser tests and exposed one remaining native textarea case. The Unicode Group name survived, but its description was empty. A native textarea still received a live value from the generated spread as well as bind:value, so the spread could clear the DOM before binding adoption. It now reads the field-generated name and defaultValue explicitly, with bind:value as its sole live value writer. Its validation/accessibility attributes remain unchanged. Both existing Unicode and pending-create flows passed all ten focused repetitions in 24.9 seconds after this correction. No shared component redesign, native-form disabling, timeout, or test retry policy was introduced.

## Acceptance waiver

On 18 October 2026 Leo explicitly instructed changing only the declaration of `changing a filter announces loading until the new results arrive` in `src/routes/event-filtering.e2e.ts` from `test` to `test.skip`. Its entire body and all assertions remain unchanged. The previous complete run passed all 153 unit/component tests and 64 of 65 end-to-end tests; this case failed its final `toBeFocused()` assertion for Host type after the loading and result assertions had passed. The user waived this test's passing requirement and directed no further diagnosis or changes to it. This leaves its loading/focus coverage inactive; the result is not a claim that all 65 end-to-end cases pass. All other tests remain enabled.

The acceptance waiver and local-commit authorization are recorded on integration commit `7cb7df5`, merged into the migration branch before handoff. No push, pull request, deployment, or live change is authorized.

## Final installation and quality results

The migration's real frozen-lockfile installation, `vp install --frozen-lockfile`, installed 402 packages in 40.64 seconds after removing this isolated checkout's previous dependencies. The normal `svelte-kit sync` prepare lifecycle succeeded. The resulting lockfile SHA256 is `38D9C03904833C0EF00494D21BE47D4A0CCC577C90919224A1B340CA58D424CC`. This was an actual installation, not a dry run or copied dependency directory.

`vp env current` confirmed managed Node 24.22.0 from `.node-version` and Bun 1.4.3 from `packageManager`; `vp env exec node --version` returned `v24.22.0`. This shell's direct `node --version` reports 24.19.0, so verification uses the Vite+ commands that select the declared runtime.

The final `vp run quality` exited 0 on 18 October 2026. Formatting, Oxlint, Svelte-aware ESLint, and Svelte/type checking passed, with zero Svelte errors or warnings. All 153 server/browser-component tests passed across 14 files in 7.43 seconds. The end-to-end suite passed 64 cases in 1.0 minute using the original six workers and skipped only the explicitly waived case. The final production build and Node adapter completed. Vite+ reported all eight task steps with caching disabled. `git diff --check` also passed. No application change followed this gate; only this evidence was completed and formatted.

The final gate emitted the Vitest mock interceptor's ignored Vite-specific `configureServer` hook warning and conflicting `NO_COLOR`/`FORCE_COLOR` terminal settings. Better Auth's invalid-password message and deliberate error/404 paths came from existing failure-path tests. Earlier migration diagnostics also reported dependency circular imports, plugin timing messages, and optional Better Auth `@opentelemetry/api` externalization; they were non-blocking and were not reproduced as warnings in the final gate. No optional telemetry dependency was added to silence them.

GitHub Actions has not executed this branch, and no remote CI result is claimed. The browser suite still uses Vite preview. Standalone built Node server checks, unavailable-build-database verification, and explicit same-origin/cross-origin deployment-contract tests remain ticket 02 work. No schema, migration, database contract, production setting, or daily build/preview channel was changed by final verification.

## Primary references

- [Official Kit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).
- [Kit origin configuration](https://svelte.dev/docs/kit/@sveltejs-kit-vite#paths).
- [Kit remote forms](https://svelte.dev/docs/kit/remote-functions).
- [Svelte 5.57.2 release and async production handler fix](https://github.com/sveltejs/svelte/releases/tag/svelte@5.57.2).
- [Better Auth 1.7 upgrade guidance and reverted account-schema requirement](https://better-auth.com/docs/guides/1-7-upgrade-guide).
- [Native select component API](https://shadcn-svelte.com/docs/components/native-select).
