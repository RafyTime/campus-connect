# 06: Follow and unfollow Groups

**What to build:** Let an authenticated User follow and unfollow a Group. Following persists a subscriber membership and updates the public subscriber count, but it does not unlock restricted content in the committed core.

**Blocked by:** 04: Browse Groups and public group Events; 05: Complete accounts, profiles, and protected actions.

**Status:** completed

## Acceptance criteria

- [x] Following creates one subscriber membership for the acting User and Group.
- [x] Unfollowing removes that subscriber membership without deleting unrelated Group or User data.
- [x] Repeated follow or unfollow requests return the resulting state and never create duplicate memberships or generic errors.
- [x] Subscriber counts update after each successful change and exclude owners and representatives.
- [x] Owners and representatives cannot follow or unfollow their own Group.
- [x] Visitors receive the protected-action dialog instead of a membership mutation.
- [x] A subscriber membership changes follow state and counts only; no restricted Event access exists in this ticket.
- [x] Follow controls expose pending, success, conflict, unauthenticated, and server-failure states without layout shifts or duplicate submissions.
- [x] Automated tests cover persistence, counts, role restrictions, idempotency, authorization, responsive controls, and failure states.
- [x] The acceptance-to-evidence matrix records the tests and planned follow and subscriber-count evidence.

## Implementation tasks

- [x] Add server application operations for follow and unfollow with transaction-backed membership and count rules.
- [x] Add responsive follow controls to Group details and connect visitor actions to the protected-action dialog.
- [x] Add tests for membership persistence, idempotency, counts, owner and representative restrictions, and failures.
- [x] Update the acceptance-to-evidence matrix with test references and planned production and screencast checks.

## Comments

- 2026-09-09: Follow and unfollow land on Group details through `followGroup` and `unfollowGroup` application operations and remote commands. Visitor Follow still opens the protected-action dialog and does not mutate membership. Owners and representatives see a role-restricted message instead of a follow control. Server coverage is `src/lib/server/application/groups.spec.ts`. Browser coverage is `src/routes/group-follow.e2e.ts`. CORE-06 is `verified-local`. Railway checks, Group details annotation, and the follow screencast scene stay for later capture tickets.
