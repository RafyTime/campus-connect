# 01: Migrate Campus Connect to SvelteKit 3 and compatible Better Auth

**What to build:** The existing Campus Connect application running on stable SvelteKit 3 and an explicitly compatible published Better Auth release, with public discovery, accounts, Event authoring, Group management, and subscriptions preserving their current behavior. Deliver the dependency upgrade and application migration together as one working slice.

**Blocked by:** 00: Standardize the Bun and Vite+ workflow.

**Status:** ready

**Category:** enhancement

## Acceptance criteria

- [ ] A passing baseline is established on the most recent compatible Kit 2 release before the official Kit 3 migrator is applied. The migration's applicable TODOs are resolved and manual decisions recorded.
- [ ] The application uses a stable Kit 3 release, a compatible Node adapter, Svelte at least 5.57.1, TypeScript at least 6, Vite at least 8.0.12, and Svelte's Vite plugin at least 7. Framework-dependent checking, component-generation, and test tools are compatible. Bun and Vite+ alignment from ticket 00 is preserved.
- [ ] Better Auth is explicitly upgraded to a compatible published release whose dependency declarations support Kit 3. The associated auth CLI is reviewed for compatibility with that release. Published metadata and release guidance are checked; peer conflicts are not bypassed and branch snapshots are not installed.
- [ ] Registration, duplicate-account validation, sign-in, invalid-credential messages, cookie handling, session persistence across navigation and refresh, profile editing, sign-out, protected-action prompts, and safe return paths pass the existing account suites without weakened assertions.
- [ ] Framework configuration remains in the Vite plugin. Library imports and the component generator use the migrated subpath aliases; TypeScript adopts the new framework base with explicit source coverage, including database tooling. Moved hook types, renamed environment imports, and affected scripts or generated-type assumptions are migrated and checked.
- [ ] Remote functions and async Svelte remain enabled using their existing experimental design. All remote form controls use field-generated attributes, including the Event Tag checkbox collection. Personal and Group Event creation and editing retain submitted Tags and other values, field-level errors, pending controls, query refreshes, and redirects.
- [ ] Public Event and Group browsing, URL-based filters, Group creation and editing, Unicode Group name conflicts, subscriptions, permission failures, and request recovery pass their existing suites. Keyboard access, responsive layouts, loading states, and error pages remain covered.
- [ ] Kit 3's Node adapter origin configuration agrees with Better Auth's base URL in local development, browser tests, and CI. The removed adapter origin setting is not relied on, application-level auth configuration is retained as needed, and CSRF protection remains enabled. Origin instructions are updated with the implementation.
- [ ] Lazy database/authentication initialization and database-enforced Unicode Group name uniqueness remain intact. Existing domain and auth schemas, migrations, and persisted contracts are preserved. If the required auth upgrade mandates a schema change, its incompatibility is reported for an explicit scope decision before that change is introduced.
- [ ] Frozen-lockfile installation and the complete quality gate pass after migration, including all existing unit/component and end-to-end suites and the production build. Remaining warnings are explained, and the selected dependency versions and compatibility decisions are recorded.

## Implementation tasks

- [ ] Review current published framework, adapter, Better Auth, and supporting-tool releases against the parent spec. Select a compatible stable set and inspect relevant release notes for authentication and cookie changes.
- [ ] Upgrade the Kit 2 baseline and verify it before proceeding. Apply the official migration and review every relevant generated change and TODO.
- [ ] Adapt imports, configuration, types, generator aliases, origin handling, and remote forms as one coordinated migration. Pass route and search values explicitly to remote queries.
- [ ] Reuse existing product tests. Add or extend focused form coverage only where needed to prove multiple Tag selections survive Event creation and editing and preserve validation/recovery behavior.
- [ ] Run all applicable quality checks in isolation and update developer instructions and migration evidence. Leave standalone built-server deployment-contract verification to ticket 02.

## Comments

Parent: [Campus Connect toolchain upgrade](../spec.md).

The 14 October 2026 review observed Kit 2.70.1, Svelte 5.56.8, Node adapter 5.5.7, and Better Auth 1.6.25. The installed Better Auth release declares Kit 2 compatibility only; upstream now declares Kit 3 support, but an actual compatible published release must be selected during implementation. Better Auth is a required part of this ticket, not an optional cleanup. The existing Event Tag controls use manually named inputs that need adaptation to Kit 3's remote-form contract.

Dependency changes and their application adaptations belong together because splitting them would leave an incompatible intermediate application. This ticket must finish with the complete existing quality gate passing; it does not defer broken product flows to final verification.

The local `ready` status represents `ready-for-agent`. Preserve ADR 0001 and ADR 0002, the Node runtime/adapter architecture, SQLite/libSQL, Drizzle, and existing product permissions. No new feature work, unrelated broad dependency upgrades, production access or deployment, daily-preview changes, commits, pushes, or pull requests are authorized.
