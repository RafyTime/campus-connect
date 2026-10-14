# Campus Connect toolchain upgrade

Status: ready

## Problem Statement

Before continuing Campus Connect development, Leo needs a reproducible, verified development toolchain using Bun 1.4.3, Vite+, and SvelteKit 3. Bun and Vite+ have already been introduced, but their runtime declarations, commands, dependency alignment, and CI workflow need to be reviewed and standardized. SvelteKit is still on version 2.

The application already includes accounts, public Event discovery and filtering, personal and Group Event authoring, Group management, and subscriptions. A dependency upgrade that builds successfully but breaks sessions, form submissions, authorization, or the deployed application's origin handling is not acceptable. The migration must preserve existing product behavior and database integrity while giving future development one clear tooling workflow.

## Solution

Complete the existing Bun and Vite+ setup and migrate Campus Connect to a compatible stable SvelteKit 3 toolchain. Developers use Vite+ as the documented entry point for package management, development, formatting, linting, testing, and builds, with Bun 1.4.3 as the package manager and script runtime where already used. The application continues to run through the Node adapter.

Local development and CI use a declared, compatible Node 24 runtime and the same complete project quality gate. Framework-specific Svelte checks remain part of that gate. A clean installation from the committed lockfile, passing existing product tests, and verification of the built Node server establish readiness. Repository deployment documentation describes the required origin changes; applying changes to Railway is a separate authorization step.

## User Stories

1. As a developer, I want Bun 1.4.3 declared consistently, so that installation and existing Bun scripts use the intended version.
2. As a developer, I want a project-level Node runtime declaration aligned with CI, so that Vite+ and the Node adapter behave consistently across environments.
3. As a developer, I want a frozen-lockfile installation to succeed from a clean checkout, so that another contributor can reproduce the toolchain.
4. As a developer, I want one Vite+ workflow for installing and maintaining dependencies, so that I do not have to choose between conflicting package-manager instructions.
5. As a developer, I want Vite+ development, build, and local preview commands documented, so that I can run the application without learning separate tool entry points.
6. As a developer, I want custom tasks clearly distinguished from Vite+ built-ins, so that I run the full intended checks rather than a command with a similar name.
7. As a developer, I want Vite+, its Vite alias, and its test dependencies aligned, so that framework integrations and tests share compatible tool internals.
8. As a developer, I want Svelte formatting, template linting, and type checking retained, so that consolidating tooling does not reduce useful feedback.
9. As a maintainer, I want CI to use the documented Vite+ workflow, so that the automated acceptance gate matches local development.
10. As a maintainer, I want stable compatible framework and authentication dependencies, so that the upgrade does not rely on unsupported peer combinations.
11. As a developer, I want framework configuration, imports, and generated types migrated together, so that application code and editor tooling agree.
12. As a developer, I want component generation configured for the migrated library imports, so that newly generated components follow the same conventions as existing ones.
13. As a Visitor, I want public Events and Groups to remain readable without an account, so that the upgrade preserves public discovery.
14. As an Explorer, I want Event filters to preserve their results and URL state across navigation and refresh, so that the upgrade does not interrupt discovery.
15. As a User, I want registration and sign-in to establish a persistent session, so that I can continue using protected features after the upgrade.
16. As a User, I want profile editing and sign-out to retain their current behavior, so that account management stays reliable.
17. As a Visitor, I want authentication prompts and safe return paths to keep working, so that protected actions still guide me back to the right page.
18. As a Creator, I want to create and edit personal Events with all selected Tags preserved, so that the new remote-form requirements do not corrupt submissions.
19. As an Owner or Representative, I want existing Group Event authoring permissions preserved, so that the upgrade does not change who may publish or edit content.
20. As an Owner, I want Group creation and editing to preserve name validation and uniqueness, so that existing Group relationships remain consistent.
21. As a User, I want subscribing to and unsubscribing from Groups to retain their pending, failure, and persistence behavior, so that the upgrade does not cause duplicate or lost changes.
22. As a User, I want validation failures and request failures to retain useful input and recovery controls, so that I can correct a submission without restarting it.
23. As a Visitor or User, I want keyboard access, responsive layouts, loading states, and error pages preserved, so that the application remains usable on supported devices.
24. As a maintainer, I want the built Node server tested with a disposable database and realistic origin handling, so that a passing development preview does not conceal a deployment regression.
25. As a maintainer, I want builds to succeed without opening the runtime database, so that the Railway volume lifecycle remains supported.
26. As a maintainer, I want clear upgrade evidence and deployment instructions, so that the eventual release can be reviewed and applied deliberately.

## Implementation Decisions

- **Preserve the established architecture.** Keep the Node adapter, SQLite/libSQL, Drizzle, Better Auth, Svelte runes, and the existing remote-function design. Preserve lazy database and authentication initialization under ADR 0001 and database-enforced Unicode Group name uniqueness under ADR 0002.
- **Treat prior work as the baseline.** Bun 1.4.3 and Vite+ are already configured. Review and complete their setup rather than recreate the application or blindly rerun a full tooling migration.
- **Declare runtimes explicitly.** Retain the exact Bun 1.4.3 package-manager pin. Choose one supported stable Node 24 patch version and declare it for both local development and CI. Verify it satisfies the selected Vite+ release's requirements as well as Kit 3's minimum; Bun does not replace Vite+'s Node runtime.
- **Keep Vite+ dependencies aligned.** Retain matching exact versions for the project Vite+ package and its Vite core alias, including Bun's direct alias and override. Match Vitest and its browser provider to the selected toolchain. The current project Vite+ version is 1.0.0; a newer global CLI is not, by itself, a reason to bump the project. Any necessary Vite+ update must align the entire toolchain and be recorded.
- **Standardize commands without reducing checks.** Use Vite+ built-ins for their supported tooling operations and its task runner for project scripts. Preserve explicit Svelte checking and Svelte-aware ESLint template rules alongside Oxlint and Oxfmt. Keep the complete quality task as the acceptance command; a built-in check or test command alone does not replace it. Existing Bun invocations for database utilities and Node application startup remain valid.
- **Align CI with the same workflow.** Use the official Vite+ setup integration with an exact release or commit reference, the selected Node version, and Bun 1.4.3. Require frozen-lockfile installation and retain Chromium setup and the complete quality gate. Preserve the existing workflow triggers and deployment gate semantics. Do not introduce task caching for stateful database operations or browser suites as part of this work.
- **Upgrade framework dependencies together.** Establish a passing baseline on the most recent compatible Kit 2 release before applying the official Kit 3 migrator. Use a stable Kit 3 release, a compatible Node adapter, Svelte at least 5.57.1, TypeScript at least 6, Vite at least 8.0.12, and Svelte's Vite plugin at least 7. Select compatible published releases for framework-dependent tools, including Svelte checking, component generation, browser test helpers, and Better Auth. Verify release metadata at implementation time rather than installing a branch snapshot or bypassing peer incompatibilities.
- **Review automated migration output.** Keep the established framework configuration in the Vite plugin. Migrate library imports to Node subpath imports, including the component generator's aliases. Adopt the new framework TypeScript base and explicit source inclusion, preserving type coverage of database tooling. Update moved hook types, renamed environment imports, and any affected scripts or generated-type assumptions. Resolve every applicable migrator TODO before acceptance.
- **Preserve remote-function behavior.** Keep the existing experimental remote-function and async compiler flags. Use field-generated attributes for all remote form controls, including the Tag checkbox collection. Preserve submitted values, validation messages, pending controls, query refreshes, and redirects. Continue passing route and search values explicitly to queries rather than reading request URL, route, or params inside them.
- **Coordinate application and authentication origins.** Configure Kit 3's origin handling for the Node adapter and Railway proxy using the supported origin configuration. The adapter no longer consumes its old origin environment setting, while Better Auth still needs an explicit, consistent base URL. Preserve that application-level configuration as needed rather than deleting it merely because the adapter changed. Local tests, CI, and documented deployment settings must agree on the intended origin and retain CSRF protection.
- **Preserve product and persistence contracts.** The upgrade introduces no new domain schema or feature behavior. Do not regenerate auth tables or modify application migrations solely to satisfy a package upgrade. If a required compatible authentication release mandates a schema change, report the incompatibility and obtain an explicit scope decision before introducing it.
- **Finish with reproducible evidence.** Record selected versions, clean-install results, quality results, manual migration decisions, remaining non-blocking warnings, and the built-server verification. Update developer and deployment instructions to match the resulting behavior. Leave implementation ticket breakdown to the user's next workflow.

## Testing Decisions

- **Primary acceptance boundary:** use the existing complete project quality gate and product end-to-end suites. Leo confirmed these boundaries, plus a local verification of the built Node server, on 14 October 2026. No new application testing abstraction is required.
- Good tests assert visible behavior, authorization, persisted results, or executable workflow contracts. Avoid tests that merely search for version strings, snapshot configuration files, or mirror migration implementation details.
- Run formatting, linting, Svelte/type checking, the existing server and browser-component tests, all existing end-to-end tests, and a production build. Preserve assertions and coverage; do not skip failing suites or weaken checks to make the upgrade pass.
- Verify clean dependency installation with Bun 1.4.3 and the frozen lockfile using the declared Node runtime. This must be a real installation, not only the dry run completed during research.
- Reuse the existing account, Event discovery/filtering, personal and Group Event authoring, Group management, Group subscription, and public-shell browser suites as prior art. Their observable flows cover sessions, safe returns, permission failures, field validation, request recovery, loading, keyboard use, accessibility, and responsive layouts.
- Extend existing form tests only where needed to prove migrated remote-form behavior, especially selection and persistence of multiple Tags during Event creation and editing. Reuse existing application and migration tests for database contracts and Unicode Group name conflicts.
- Verify the actual built Node server locally, beyond Vite preview, with a migrated and seeded disposable database. Check public rendering, session establishment and persistence, an authenticated form submission, and origin/CSRF behavior using controlled local proxy headers or configured origin values. Confirm valid same-origin submissions work and mismatched-origin submissions remain rejected. Start and stop only the isolated verification server.
- Build with a runtime database location that is unavailable during compilation to confirm that lazy initialization still respects ADR 0001. Local server verification may access only its disposable test database after startup.
- Run checks in an isolated checkout or temporary copy when they would overwrite the user's normal build or preview output. Production, its database, and the daily development preview are outside the test boundary.
- Acceptance requires all applicable checks to pass and remaining warnings to be explained. A warning about an optional integration is not automatically a reason to add a new dependency. Revalidate affected suites after any warning cleanup that changes behavior.

## Out of Scope

- New Campus Connect features, visual redesign, or changes to existing product permissions and business rules.
- Switching the application runtime or adapter from Node to Bun, replacing SQLite/libSQL or Better Auth, or rewriting remote functions into another communication model.
- Replacing Svelte-aware checking with Bun's new TypeScript checker, enabling unrelated experimental features, or broadly upgrading unrelated dependencies.
- Performance tuning, benchmarking, new observability infrastructure, and task-cache adoption.
- Database schema changes, production migrations, production data access, Railway configuration changes, live deployment, and alteration of the user's daily build or preview channels.
- Commits, pushes, pull requests, and implementation tickets. Ticket breakdown will follow the separate workflow supplied by Leo.

## Further Notes

### Verified baseline — 14 October 2026

The research review found Bun 1.4.3 installed and pinned in the project and CI; project Vite+ 1.0.0 with matching Vite core alias and Vitest 5.0.1; Kit 2.70.1; Svelte 5.56.8; TypeScript 6.0.3; Vite 8.3.1; Svelte's Vite plugin 7.2.0; Node adapter 5.5.7; and Better Auth 1.6.25. Local Node selected 24.21.0, while CI declared 24.19.0. These are observations, not a permanent inventory of target versions.

Bun and Vite+ setup was completed before this spec. In an isolated temporary copy, the frozen-lockfile installation dry run passed, as did formatting, linting, Svelte/type checking, 153 unit/component tests, 65 end-to-end tests, and the production build. Non-blocking warnings included a stale ESLint suppression, framework/dependency plugin and circular-import warnings, and an unresolved optional telemetry integration. That review did not verify a fresh installation, the standalone built Node server, CI execution, or live Railway behavior.

The installed Better Auth release declares Kit 2 support only. Upstream now declares Kit 3 support, but the implementation must select and verify an actual compatible published release. The existing Event Tag checkbox collection uses manually named inputs and requires adaptation to Kit 3's remote-form contract. Remote functions remain experimental after the framework upgrade.

### References

- [Bun 1.4.3 release notes](https://bun.sh/blog/bun-v1.4.3)
- [Vite+ project upgrades and dependency alignment](https://viteplus.dev/guide/upgrade-project)
- [Vite+ migration rules](https://viteplus.dev/guide/migrate-rules)
- [Vite+ runtime selection](https://viteplus.dev/guide/env)
- [Vite+ CI integration](https://viteplus.dev/guide/ci)
- [SvelteKit 3 announcement](https://svelte.dev/blog/sveltekit-3-is-here)
- [Official SvelteKit 3 migration process and breaking changes](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Framework origin configuration](https://svelte.dev/docs/kit/@sveltejs-kit-vite#paths)
- [Better Auth upstream dependency declarations](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/package.json)
- [ADR 0001: lazy database and authentication initialization](../../adr/0001-lazy-runtime-initialization.md)
- [ADR 0002: Unicode Group name uniqueness](../../adr/0002-unicode-group-name-uniqueness.md)

## Comments

Published from the agreed upgrade review using the to-spec workflow. The local `ready` status represents the `ready-for-agent` triage label. Implementation and ticket breakdown have not started.
