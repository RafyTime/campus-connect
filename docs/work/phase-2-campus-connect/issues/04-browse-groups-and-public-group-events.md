# 04: Browse Groups and public group Events

**What to build:** Let visitors discover seeded Groups, inspect their public details, and browse their public group Events. Seeded owner and representative memberships establish the authorization context needed by later creator tickets.

**Blocked by:** 03: Browse public personal Events.

**Status:** ready

## Acceptance criteria

- [ ] Group and Group membership records support exactly one role per User and Group: owner, representative, or subscriber.
- [ ] Database constraints and application rules preserve at most one membership per User and Group and exactly one owner per Group.
- [ ] The public Group directory shows realistic seeded Groups and degrades cleanly when a remote Group image fails.
- [ ] Group details show the name, description, owner, subscriber count, and upcoming public group Events.
- [ ] Owners and representatives count as members but not subscribers.
- [ ] Campus Updates is seeded, public, system-managed, and readable without membership; ordinary Users cannot edit it.
- [ ] Public group Event cards and details derive host type from the Post's Group relationship rather than a second stored host-type value.
- [ ] Generated migrations work against a fresh database.
- [ ] This ticket adds deterministic fixtures and idempotent seed helpers for Groups, memberships, Campus Updates, and public group Events, including seeded owner and representative authorization contexts.
- [ ] Automated tests cover the directory, Group details, counts, membership invariants, public access, group Event hosting, Campus Updates protection, responsive layouts, and failure states.
- [ ] The acceptance-to-evidence matrix records the tests and planned Group evidence.

## Implementation tasks

- [ ] Add Group and membership persistence and connect Posts to Groups, together with generated migrations.
- [ ] Add public Group directory and detail operations and keep route handlers thin.
- [ ] Build responsive Group cards and details, including upcoming public group Events and image fallbacks.
- [ ] Add deterministic fixtures and idempotent seed helpers for every introduced table and authorization role.
- [ ] Add server and browser tests for membership invariants, public Group browsing, Group Event hosting, and failure behavior.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
