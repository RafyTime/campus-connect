# Ticket 11: interest and basic My activity

Local implementation verification on 2026-10-20 (Europe/Berlin). Production and final submission captures remain planned.

## Delivered behavior

Participation has a unique User/Event pair and an explicitly constrained interest or registration kind. Interest operations run inside a write transaction, reject visitors and the Event author, and accept only scheduled public interest Events. Repeated requests return the resulting state. Other Group owners and representatives may participate when they are not the author.

Event details offer non-binding interest and withdrawal, pending protection, an authentication dialog for visitors, and useful forbidden, unavailable and server-failure states. Announcements have no Participation controls. My activity is protected, links to accessible Event details, has a useful empty state, and retains cancelled and ended interests. Authenticated navigation includes My activity; the compact navigation remains in use through tablet widths to fit all destinations.

Lena has an upcoming interest in Board game evening, Sofia has cancelled Rhine picnic history, Jonas is the Film Society Event author, and Mira has empty activity. Seed helpers use stable User/Event keys and safely rerun. Password fixtures exist only in the disposable browser database.

## Automated evidence

- `src/lib/server/application/participation.spec.ts`: uniqueness, interest and withdrawal retries, response modes, visitors, author exclusion, owner and representative contexts, User isolation, cancelled/ended history and database failure rollback.
- `src/lib/server/seed.spec.ts`: deterministic Participation cases and idempotent accumulated seeding.
- `src/routes/participation.e2e.ts`: persisted interest-to-activity-to-withdrawal journey; visitor prompt; pending and repeated clicks; server failures; author exclusion; retained cancelled links; loading and read failure recovery; 360×800, 768×1024 and 1440×900 layouts; critical/serious accessibility scan of My activity.
- Application tests and the browser runner apply all generated migrations to a fresh disposable SQLite database.

## Quality and review

`bun run quality` passed: formatting, lint, Svelte/TypeScript checks, 163 Vitest tests, 75 Playwright tests, and the production build. The new slice accounts for six application tests, one seed test and eight browser tests. The existing migration journal assertion now follows the generated manifest instead of hard-coding the migration count.

The two read-only code-review axes used baseline `fed63cb4e27e74e944bc3dc21a9ae555e8e5b933`. Standards reported no findings. Spec reported one broken evidence link; it was corrected and the reviewer confirmed resolution. No findings remain.

## Scope and final evidence

Registration controls and capacity remain ticket 12. Participation-dependent editing locks and Event cancellation remain ticket 13. No production deployment, production database or daily preview was accessed.

On the final Railway release, record the deployed commit and date, verify interest, withdrawal, author exclusion and refreshed My activity, and capture CAP-06 clean and annotated My activity screenshots. Include interest and My activity in the screencast; registration and cancellation footage follows tickets 12 and 13. Local browser checks are implementation evidence, not final submission media.
