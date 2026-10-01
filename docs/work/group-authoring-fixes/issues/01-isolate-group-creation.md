# 01: Isolate Group creation from concurrent requests

**What to build:** Let visitors and Users browse Groups while another User creates one without seeing incomplete ownership or receiving a server error. Group creation and its sole owner membership must remain atomic, with each request's transaction isolated from other requests.

**Parent:** [07: Create and edit Groups](../../phase-2-campus-connect/issues/07-create-and-edit-groups.md)

**Blocked by:** None (can start immediately). The Group creation implementation already exists; completing the parent ticket is not a prerequisite for this fix.

**Status:** completed

## Acceptance criteria

- [x] A deterministic regression test pauses creation between the Group insert and owner membership insert, performs a concurrent public directory read through the application, and reproduces the existing failure before the fix.
- [x] Concurrent directory and Group-detail reads observe consistent committed data and never expose an ownerless Group or throw because ownership is incomplete.
- [x] Failed owner membership insertion rolls back the Group, leaving neither a public Group nor a partial membership.
- [x] Overlapping Group creation, editing, and follow/unfollow mutations cannot commit or roll back another request's work. Valid overlapping requests complete without failures caused by sharing transaction state, and one failed request does not discard another request's successful changes.
- [x] Transaction isolation works with both disposable in-memory test databases and file-backed SQLite. Database and authentication initialization remain lazy, as required by ADR 0001.
- [x] Relevant Group server and browser tests pass, including the create/edit journey and rollback, ownership, authorization, and follow/unfollow regressions.
- [x] The parent ticket's acceptance-to-evidence matrix row records the new regression tests and distinguishes completed automated checks from pending production evidence.

## Implementation tasks

- [x] Turn the public-read reproduction into a failing regression test before changing transaction handling.
- [x] Give mutations an isolated transaction boundary and ensure every operation within it uses the same transaction context. Review the shared Group mutation helper and its callers together.
- [x] Add overlap and rollback coverage at the application/database boundary, including a file-backed database check representative of runtime use.
- [x] Run the relevant checks and update the evidence references with the verified results.

## Comments

Review of the ticket 07 implementation at commit `55b704d` reproduced this failure using the actual application operations. Creation was paused immediately before inserting the owner membership. A public directory read on the shared database instance then threw `Group <id> is missing its owner`. Releasing the insertion allowed creation to succeed and the next directory read to return the Group normally.

The existing helper opens a manual transaction on the shared client, so another request using that client can read intermediate state. Preserve the ownership and rollback invariants while isolating requests. The helper's current design was motivated by disposable in-memory databases not seeing migrated tables through a separate transaction connection; account for that test setup when choosing the fix.

- 2026-10-01: Implemented a database-scoped queue that holds exclusive access from BEGIN IMMEDIATE through COMMIT or ROLLBACK. Ordinary statements wait for the active transaction; Group creation, editing, follow and unfollow use the scoped transaction context. This preserves private in-memory schemas and the lazy database/authentication initialization from ADR 0001.
- Regression evidence: src/lib/server/application/group-transactions.spec.ts reproduced the original missing-owner directory failure before the fix. Its nine checks cover concurrent directory/detail reads, overlapping mutations with failed creation or editing, complete rollback, private in-memory and file-backed SQLite, and committed ownership visibility from a second file-backed connection. Existing groups.spec.ts covers sole ownership, authorization and follow/unfollow behavior.
- Validation: lint, typechecking, the full server test suite, production builds, and all 40 browser tests passed locally. The initial six-worker browser run had startup timeouts; the rerun used two workers and a 60-second timeout. The Windows preview server required explicit shutdown after the test assertions finished. CORE-07 now records completed local checks separately from pending Railway and screenshot/screencast evidence.
