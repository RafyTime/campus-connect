# 02: Verify the built Node server and document deployment readiness

**What to build:** Reviewable evidence that the upgraded production artifact works as a Node application with persistent sessions, authenticated forms, correct origin protection, and the existing runtime database lifecycle. Provide accurate deployment instructions for a later authorized Railway release without changing the live service.

**Blocked by:** 01: Migrate Campus Connect to SvelteKit 3 and compatible Better Auth.

**Status:** ready

**Category:** enhancement

## Acceptance criteria

- [ ] The actual built Node server starts and serves public Event and Group pages using a migrated and seeded disposable database. Verification runs in isolation, beyond Vite preview, and stops its server afterwards.
- [ ] Registration or sign-in establishes a session that survives navigation and refresh through the built server. An authenticated remote-form submission succeeds and its result is persisted and observable through the application.
- [ ] Origin handling is verified under controlled local proxy headers or explicit origin configuration representing the documented deployment arrangement. Valid same-origin submissions succeed, mismatched-origin submissions are rejected, and authentication cookies and redirects remain consistent with the application's public origin.
- [ ] A production build succeeds with a runtime database location unavailable during compilation. Runtime initialization accesses only the disposable verification database after startup, preserving ADR 0001's lazy database/authentication boundary.
- [ ] A fresh frozen-lockfile installation with Bun 1.4.3 and the declared Node runtime succeeds on the final dependency set. Formatting, linting, Svelte/type checking, all existing unit/component and end-to-end tests, and the production build pass without skipped suites or weakened checks.
- [ ] Final evidence records selected runtime/toolchain/framework/authentication versions, exact validation commands and results, clean-install verification, built-server behavior, manual migration decisions, and explanations of remaining warnings. Earlier Kit 2 results are distinguished from final Kit 3 results.
- [ ] Developer and deployment instructions match the verified application: the complete Vite+ workflow, Node startup, Kit 3 origin configuration, Better Auth base URL, and Railway's runtime-only SQLite volume requirements are explained. Required deployment changes and their verification steps are concrete enough to review before a later authorization.
- [ ] The live Railway service, production database, and the user's normal build and preview channels remain untouched. No deployment, production migration, commit, push, or pull request occurs as part of this ticket.

## Implementation tasks

- [ ] Reuse the existing browser and disposable-database fixtures where practical to verify the built server. Prefer the confirmed application boundary over new testing abstractions, configuration snapshots, or tests that merely inspect version strings.
- [ ] Verify public rendering, session persistence, authenticated form behavior, and CSRF/origin handling through the built artifact. Preserve database-enforced Group name uniqueness and current permission rules.
- [ ] Exercise the unavailable-build-database case, real clean installation, and final complete quality gate. Address any discovered regression through its existing seam and rerun affected checks before final acceptance.
- [ ] Update developer/deployment documentation and record final evidence, including warnings and any verification limits. Clearly identify live release actions that remain separately authorized.

## Comments

Parent: [Campus Connect toolchain upgrade](../spec.md).

Leo approved the existing complete quality gate and end-to-end suites as the primary acceptance boundary, plus local verification of the built Node server for origin/auth handling. The earlier research review passed the Kit 2 quality gate but did not verify a fresh installation, standalone built Node server, remote CI execution, or live Railway behavior.

The local `ready` status represents `ready-for-agent`. Ticket 01 must already preserve product behavior and pass the existing quality gate; this ticket verifies the additional production-artifact boundary and final reproducibility. Deployment documentation is repository work, while applying Railway settings and releasing the application remain outside this ticket. Keep ADR 0001's volume lifecycle and ADR 0002's Unicode Group name uniqueness intact.
