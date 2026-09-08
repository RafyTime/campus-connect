# 05: Complete accounts, profiles, and protected actions

**What to build:** Complete the account experience around the existing Better Auth infrastructure. Visitors can register or sign in from a protected action, return safely to its source page, maintain a session, edit their display name, and sign out.

**Blocked by:** 03: Browse public personal Events.

**Status:** completed

## Acceptance criteria

- [x] Registration accepts a trimmed display name from 2 to 50 characters, a normalized email address, and a password of at least eight characters.
- [x] Invalid registration, sign-in, and profile input produces field-level messages without discarding valid input.
- [x] Successful sign-in and registration establish a session that persists across navigation and refresh.
- [x] Users can edit their display name and sign out.
- [x] Signed-in navigation replaces the visitor authentication links with session-aware Account controls while keeping Discover and Groups available.
- [x] Email change, password recovery or change, email verification, avatar editing, and account deletion have no Phase 2 controls.
- [x] A visitor attempting a protected action sees a small dialog offering sign-in and registration.
- [x] Authentication accepts only a validated local return path, returns to the originating page, and never replays the original protected mutation automatically.
- [x] External, malformed, or missing return paths fall back to a safe application destination.
- [x] Forms, dialogs, and account navigation work by keyboard and fit the representative phone, tablet, and desktop viewports.
- [x] Automated tests cover input validation, session persistence, profile editing, sign-out, protected-action prompts, and safe return paths.
- [x] The acceptance-to-evidence matrix records the tests and planned authentication evidence.

## Implementation tasks

- [x] Complete registration, sign-in, sign-out, session-aware Account navigation, and display-name editing through the existing Better Auth boundary.
- [x] Add reusable protected-action dialog behavior and validated return-path handling.
- [x] Add responsive validation, loading, failure, and unauthenticated states for all account interactions.
- [x] Add server and browser tests for account rules, sessions, profile changes, dialogs, and return-path security.
- [x] Update the acceptance-to-evidence matrix with test references and planned production and screencast checks.

## Comments

- 2026-09-08: Account flows land on `/register`, `/sign-in`, and `/account`, with session-aware Account navigation and a reusable protected-action dialog on public Group details. Registration, sign-in, and display-name rules live in `src/lib/server/application/accounts.ts` and are exercised by Better Auth remote functions. Server coverage is `src/lib/server/application/accounts.spec.ts`. Browser coverage is `src/routes/accounts.e2e.ts`. CORE-05 is `verified-local`. Railway checks and screencast capture stay for later tickets.
