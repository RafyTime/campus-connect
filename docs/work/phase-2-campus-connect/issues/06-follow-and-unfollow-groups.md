# 06: Follow and unfollow Groups

**What to build:** Let an authenticated User follow and unfollow a Group. Following persists a subscriber membership and updates the public subscriber count, but it does not unlock restricted content in the committed core.

**Blocked by:** 04: Browse Groups and public group Events; 05: Complete accounts, profiles, and protected actions.

**Status:** ready

## Acceptance criteria

- [ ] Following creates one subscriber membership for the acting User and Group.
- [ ] Unfollowing removes that subscriber membership without deleting unrelated Group or User data.
- [ ] Repeated follow or unfollow requests return the resulting state and never create duplicate memberships or generic errors.
- [ ] Subscriber counts update after each successful change and exclude owners and representatives.
- [ ] Owners and representatives cannot follow or unfollow their own Group.
- [ ] Visitors receive the protected-action dialog instead of a membership mutation.
- [ ] A subscriber membership changes follow state and counts only; no restricted Event access exists in this ticket.
- [ ] Follow controls expose pending, success, conflict, unauthenticated, and server-failure states without layout shifts or duplicate submissions.
- [ ] Automated tests cover persistence, counts, role restrictions, idempotency, authorization, responsive controls, and failure states.
- [ ] The acceptance-to-evidence matrix records the tests and planned follow and subscriber-count evidence.

## Implementation tasks

- [ ] Add server application operations for follow and unfollow with transaction-backed membership and count rules.
- [ ] Add responsive follow controls to Group details and connect visitor actions to the protected-action dialog.
- [ ] Add tests for membership persistence, idempotency, counts, owner and representative restrictions, and failures.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production and screencast checks.

## Comments
