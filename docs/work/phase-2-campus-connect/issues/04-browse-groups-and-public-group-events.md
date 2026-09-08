# 04: Browse Groups and public group Events

**What to build:** Let visitors discover seeded Groups, inspect their public details, and browse their public group Events. Seeded owner and representative memberships establish the authorization context needed by later creator tickets.

**Blocked by:** 03: Browse public personal Events.

**Status:** completed

## Acceptance criteria

- [x] Group and Group membership records support exactly one role per User and Group: owner, representative, or subscriber.
- [x] Database constraints and application rules preserve at most one membership per User and Group and exactly one owner per Group.
- [x] The public Group directory shows realistic seeded Groups and degrades cleanly when a remote Group image fails.
- [x] Group details show the name, description, owner, subscriber count, and upcoming public group Events.
- [x] Owners and representatives count as members but not subscribers.
- [x] Campus Updates is seeded, public, system-managed, and readable without membership; ordinary Users cannot edit it.
- [x] Public group Event cards and details derive host type from the Post's Group relationship rather than a second stored host-type value.
- [x] Generated migrations work against a fresh database.
- [x] This ticket adds deterministic fixtures and idempotent seed helpers for Groups, memberships, Campus Updates, and public group Events, including seeded owner and representative authorization contexts.
- [x] Automated tests cover the directory, Group details, counts, membership invariants, public access, group Event hosting, Campus Updates protection, responsive layouts, and failure states.
- [x] The acceptance-to-evidence matrix records the tests and planned Group evidence.

## Implementation tasks

- [x] Add Group and membership persistence and connect Posts to Groups, together with generated migrations.
- [x] Add public Group directory and detail operations and keep route handlers thin.
- [x] Build responsive Group cards and details, including upcoming public group Events and image fallbacks.
- [x] Add deterministic fixtures and idempotent seed helpers for every introduced table and authorization role.
- [x] Add server and browser tests for membership invariants, public Group browsing, Group Event hosting, and failure behavior.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

- 2026-09-07: Public Group browsing landed on `/groups` and `/groups/[groupId]`. Seeded Groups cover Campus Updates, Film Society (owner plus representative), and Campus Runners, with public group Events whose host type is derived from the Post Group relationship. Server coverage is `src/lib/server/application/groups.spec.ts` and `src/lib/server/seed.spec.ts`. Browser coverage is `src/routes/public-groups.e2e.ts`. Empty-directory preview is at `/preview/empty-groups`. CORE-04 is `verified-local`. Railway checks and screenshots stay for later capture tickets.
