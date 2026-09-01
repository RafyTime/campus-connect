# 02: Build the public responsive application shell

**What to build:** Replace the starter presentation with the public Campus Connect shell. Visitors can move between the public destinations on desktop and mobile before accounts or domain journeys are added.

**Blocked by:** 00: Finish the project skeleton; 01: Plan acceptance evidence and submission.

**Status:** completed

## Acceptance criteria

- [x] The application presents Campus Connect branding and stable destinations for Discover, Groups, Sign in, and Register.
- [x] Desktop uses a persistent header, while small screens use a compact header and navigation that can later accommodate authenticated destinations.
- [x] Navigation exposes the current location, works by keyboard, preserves visible focus, and uses semantic landmarks and accessible names.
- [x] The shell has route-level loading, not-found, and general-server-failure presentations that fit the application design.
- [x] Representative layouts at 360x800, 768x1024, and 1440x900 have no horizontal page scrolling or clipped navigation.
- [x] Interactive navigation targets are at least 44x44 CSS pixels where the layout permits direct interaction.
- [x] Automated browser checks cover public navigation and representative phone, tablet, and desktop shell behavior.
- [x] The acceptance-to-evidence matrix records the shell tests and later screenshot or screencast needs.

## Implementation tasks

- [x] Build the shared responsive layout, public header, compact mobile navigation, and destination placeholders.
- [x] Add semantic, focus, loading, not-found, and server-error states at the shell boundary.
- [x] Add automated navigation, viewport, overflow, and accessibility checks appropriate to the shell.
- [x] Update the acceptance-to-evidence matrix with test references and planned responsive evidence.

## Comments

- 2026-09-01: Public shell landed on Discover (`/`), Groups (`/groups`), Sign in (`/sign-in`), and Register (`/register`). Desktop keeps Discover and Groups in the header. Phone moves those destinations to a bottom bar so later authenticated items can join it. Playwright coverage is `src/routes/public-shell.e2e.ts`. CORE-02 is `verified-local`. Railway checks and screenshots stay for later capture tickets. Loading and server-failure previews are at `/preview/loading` and `/preview/server-failure`.
