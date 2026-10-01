# 01: Isolate Group creation from concurrent requests

**What to build:** Let visitors and Users browse Groups while another User creates one without seeing incomplete ownership or receiving a server error. Group creation and its sole owner membership must remain atomic, with each request's transaction isolated from other requests.

**Parent:** [07: Create and edit Groups](../../phase-2-campus-connect/issues/07-create-and-edit-groups.md)

**Blocked by:** None (can start immediately). The Group creation implementation already exists; completing the parent ticket is not a prerequisite for this fix.

**Status:** ready

## Acceptance criteria

- [ ] A deterministic regression test pauses creation between the Group insert and owner membership insert, performs a concurrent public directory read through the application, and reproduces the existing failure before the fix.
- [ ] Concurrent directory and Group-detail reads observe consistent committed data and never expose an ownerless Group or throw because ownership is incomplete.
- [ ] Failed owner membership insertion rolls back the Group, leaving neither a public Group nor a partial membership.
- [ ] Overlapping Group creation, editing, and follow/unfollow mutations cannot commit or roll back another request's work. Valid overlapping requests complete without failures caused by sharing transaction state, and one failed request does not discard another request's successful changes.
- [ ] Transaction isolation works with both disposable in-memory test databases and file-backed SQLite. Database and authentication initialization remain lazy, as required by ADR 0001.
- [ ] Relevant Group server and browser tests pass, including the create/edit journey and rollback, ownership, authorization, and follow/unfollow regressions.
- [ ] The parent ticket's acceptance-to-evidence matrix row records the new regression tests and distinguishes completed automated checks from pending production evidence.

## Implementation tasks

- [ ] Turn the public-read reproduction into a failing regression test before changing transaction handling.
- [ ] Give mutations an isolated transaction boundary and ensure every operation within it uses the same transaction context. Review the shared Group mutation helper and its callers together.
- [ ] Add overlap and rollback coverage at the application/database boundary, including a file-backed database check representative of runtime use.
- [ ] Run the relevant checks and update the evidence references with the verified results.

## Comments

Review of the ticket 07 implementation at commit `55b704d` reproduced this failure using the actual application operations. Creation was paused immediately before inserting the owner membership. A public directory read on the shared database instance then threw `Group <id> is missing its owner`. Releasing the insertion allowed creation to succeed and the next directory read to return the Group normally.

The existing helper opens a manual transaction on the shared client, so another request using that client can read intermediate state. Preserve the ownership and rollback invariants while isolating requests. The helper's current design was motivated by disposable in-memory databases not seeing migrated tables through a separate transaction connection; account for that test setup when choosing the fix.
