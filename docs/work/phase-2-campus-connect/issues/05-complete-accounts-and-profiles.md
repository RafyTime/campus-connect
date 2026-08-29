# 05: Complete accounts, profiles, and protected actions

**What to build:** Complete the account experience around the existing Better Auth infrastructure. Visitors can register or sign in from a protected action, return safely to its source page, maintain a session, edit their display name, and sign out.

**Blocked by:** 03: Browse public personal Events.

**Status:** ready

## Acceptance criteria

- [ ] Registration accepts a trimmed display name from 2 to 50 characters, a normalized email address, and a password of at least eight characters.
- [ ] Invalid registration, sign-in, and profile input produces field-level messages without discarding valid input.
- [ ] Successful sign-in and registration establish a session that persists across navigation and refresh.
- [ ] Users can edit their display name and sign out.
- [ ] Signed-in navigation replaces the visitor authentication links with session-aware Account controls while keeping Discover and Groups available.
- [ ] Email change, password recovery or change, email verification, avatar editing, and account deletion have no Phase 2 controls.
- [ ] A visitor attempting a protected action sees a small dialog offering sign-in and registration.
- [ ] Authentication accepts only a validated local return path, returns to the originating page, and never replays the original protected mutation automatically.
- [ ] External, malformed, or missing return paths fall back to a safe application destination.
- [ ] Forms, dialogs, and account navigation work by keyboard and fit the representative phone, tablet, and desktop viewports.
- [ ] Automated tests cover input validation, session persistence, profile editing, sign-out, protected-action prompts, and safe return paths.
- [ ] The acceptance-to-evidence matrix records the tests and planned authentication evidence.

## Implementation tasks

- [ ] Complete registration, sign-in, sign-out, session-aware Account navigation, and display-name editing through the existing Better Auth boundary.
- [ ] Add reusable protected-action dialog behavior and validated return-path handling.
- [ ] Add responsive validation, loading, failure, and unauthenticated states for all account interactions.
- [ ] Add server and browser tests for account rules, sessions, profile changes, dialogs, and return-path security.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production and screencast checks.

## Comments
