# 02: Verify the built Node server and document deployment readiness

**What to build:** Reviewable evidence that the upgraded production artifact works as a Node application with persistent sessions, authenticated forms, correct origin protection, and the existing runtime database lifecycle. Provide accurate deployment instructions for a later authorized Railway release without changing the live service.

**Blocked by:** 01: Migrate Campus Connect to SvelteKit 3 and compatible Better Auth.

**Status:** completed

**Category:** enhancement

## Acceptance criteria

- [x] The actual built Node server starts and serves public Event and Group pages using a migrated and seeded disposable database. Verification runs in isolation, beyond Vite preview, and stops its server afterwards.
- [x] Registration or sign-in establishes a session that survives navigation and refresh through the built server. An authenticated remote-form submission succeeds and its result is persisted and observable through the application.
- [x] Origin handling is verified under controlled local proxy headers or explicit origin configuration representing the documented deployment arrangement. Valid same-origin submissions succeed, mismatched-origin submissions are rejected, and authentication cookies and redirects remain consistent with the application's public origin.
- [x] A production build succeeds with a runtime database location unavailable during compilation. Runtime initialization accesses only the disposable verification database after startup, preserving ADR 0001's lazy database/authentication boundary.
- [x] A fresh frozen-lockfile installation with Bun 1.4.3 and the declared Node runtime succeeds on the final dependency set. Formatting, linting, Svelte/type checking, all existing unit/component and end-to-end tests, and the production build pass without skipped suites or weakened checks.
- [x] Final evidence records selected runtime/toolchain/framework/authentication versions, exact validation commands and results, clean-install verification, built-server behavior, manual migration decisions, and explanations of remaining warnings. Earlier Kit 2 results are distinguished from final Kit 3 results.
- [x] Developer and deployment instructions match the verified application: the complete Vite+ workflow, Node startup, Kit 3 origin configuration, Better Auth base URL, and Railway's runtime-only SQLite volume requirements are explained. Required deployment changes and their verification steps are concrete enough to review before a later authorization.
- [x] The live Railway service, production database, and the user's normal build and preview channels remain untouched. No deployment, production migration, commit, push, or pull request occurs as part of this ticket.

## Implementation tasks

- [x] Reuse the existing browser and disposable-database fixtures where practical to verify the built server. Prefer the confirmed application boundary over new testing abstractions, configuration snapshots, or tests that merely inspect version strings.
- [x] Verify public rendering, session persistence, authenticated form behavior, and CSRF/origin handling through the built artifact. Preserve database-enforced Group name uniqueness and current permission rules.
- [x] Exercise the unavailable-build-database case, real clean installation, and final complete quality gate. Address any discovered regression through its existing seam and rerun affected checks before final acceptance.
- [x] Update developer/deployment documentation and record final evidence, including warnings and any verification limits. Clearly identify live release actions that remain separately authorized.

## Comments

Parent: [Campus Connect toolchain upgrade](../spec.md).

Leo approved the existing complete quality gate and end-to-end suites as the primary acceptance boundary, plus local verification of the built Node server for origin/auth handling. The earlier research review passed the Kit 2 quality gate but did not verify a fresh installation, standalone built Node server, remote CI execution, or live Railway behavior.

The local `ready` status represents `ready-for-agent`. Ticket 01 must already preserve product behavior and pass the existing quality gate; this ticket verifies the additional production-artifact boundary and final reproducibility. Deployment documentation is repository work, while applying Railway settings and releasing the application remain outside this ticket. Keep ADR 0001's volume lifecycle and ADR 0002's Unicode Group name uniqueness intact.

18 October 2026 acceptance amendment: apply the parent spec's explicit waiver for the single discovery loading/focus test, retaining its body unchanged and reporting its skipped status. All other checks remain required. Leo also explicitly authorized local gitmoji commits, superseding this ticket's no-commit condition. Production access, deployment, pushes, and pull requests remain unauthorized.

18 October 2026: Completed in local commit 959807f. See [built Node verification](../../../evidence/toolchain-upgrade-02.md) for the fresh frozen install, complete quality gate, real Node server suite, origin/cookie checks, absent build-database parent, unchanged artifact hashes, cleanup, and remaining warnings. Final results were 153 unit/component tests passed and 65 active end-to-end tests passed against both preview and actual Node, with only the explicitly waived discovery test skipped. Local HTTP verification does not establish Railway TLS, HTTPS cookies, remote CI, or live deployment behavior. No production, schema, migration, push, or pull-request action occurred.
