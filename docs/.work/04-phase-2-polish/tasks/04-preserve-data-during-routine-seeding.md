# 04: Make routine seeding safe and separate public test fixtures

**What to build:** Make repeated routine setup preserve manual content, edits, subscriptions and Participation while establishing missing demonstration records. Keep adversarial examples in isolated tests instead of the public demonstration, independently of choosing the final campus catalog.

**Blocked by:** None (can start immediately).

**Status:** completed

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [x] Fresh setup establishes the required public demonstration records, and repeated routine seed runs do not duplicate them.
- [x] Routine seeding preserves manually created content, manual edits to seeded records, Group subscriptions and Participation rather than replacing them with fixture values.
- [x] Routine setup does not silently shift existing Event dates/content or reset memberships and demonstration state.
- [x] Deliberately missing images and literal HTML/script safety examples remain available in disposable automated fixtures but are excluded from public demonstration seeding.
- [x] Existing failure, security, lifecycle and capacity tests retain their required examples; test fixture resets remain deliberate and isolated from public seed semantics.
- [x] Real disposable-database tests prove preservation after manual edits, follows/unfollows, interest and registration, including edits to stable-ID records and repeated seed runs.
- [x] The existing seed command and its safe behavior are documented. Broad architecture changes and unrelated cleanup are not bundled into this functional correction.
- [x] The complete repository quality command passes. No production seed or data refresh is performed under this ticket.

## Implementation tasks

- [x] Inspect public seed/fixture sharing and implement the agreed preservation behavior using existing application/testing boundaries.
- [x] Separate adversarial test content from the public demonstration without selecting a new final campus catalog.
- [x] Extend seed and integration tests and document the difference between routine setup and deliberate fixture reset.

## Comments

Can start without the catalog-grilling session or a UI prototype. This is a specified functional correction, not permission to bypass the required architecture workflow for unrelated refactoring. The explicit final-demo refresh/reset operation is delivered in ticket 09.

Implemented with a `preserve` mode on the shared fixture helpers: routine seeding creates only missing records, and a seeded Event's demonstration Participation and a seeded Group's memberships are created together with it in one transaction. Disposable test fixtures keep the default `reset` mode. The plain-text/script Event and the deliberately missing images moved to `src/lib/server/testing/adversarial-fixtures.ts`, which only the browser test setup runs. A database seeded before this change keeps those earlier records because routine seeding no longer removes or rewrites anything; cleaning it is the explicit operation in ticket 09.
