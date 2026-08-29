# 03: Browse public personal Events

**What to build:** Let a visitor browse realistic, seeded public personal Events and open a complete Event detail page. This is the first working explorer journey and introduces only the domain records needed for public personal Events.

**Blocked by:** 02: Build the public responsive application shell.

**Status:** ready

## Acceptance criteria

- [ ] Post, Event, Tag, and Location records support a public personal Event authored by a User, with no Group relationship.
- [ ] Event records store unambiguous timestamps, use Europe/Berlin for campus validation and display, and keep visibility fixed to public in the committed core.
- [ ] Discover lists scheduled, non-ended public personal Events by soonest start and shows time, host, Location, Tags, response mode, and capacity state.
- [ ] Event details show the full plain-text description with preserved line breaks, exact time, host, Tags, Location label, response mode, and current status.
- [ ] User-authored text renders as text: HTML and Markdown are not interpreted, and URLs are not turned into links automatically.
- [ ] Visitors can use Discover and Event details without an account.
- [ ] Loading, empty-feed, not-found, remote-image-failure, and general-server-failure states are usable on phone, tablet, and desktop layouts.
- [ ] Fixed remote seed images use constrained hosts, have attribution where required, and fall back to initials, icons, or gradients.
- [ ] Generated migrations work against a fresh database.
- [ ] The idempotent seed operation creates a normalized taxonomy of roughly 8 to 12 Tags with stable identifiers.
- [ ] This ticket adds deterministic fixtures and idempotent seed helpers for every table it introduces, using stable identifiers and representative personal Events.
- [ ] Automated tests cover public visibility, ordering, detail retrieval, ended-Event exclusion, plain-text rendering, and failure states through the agreed server and browser seams.
- [ ] The acceptance-to-evidence matrix records the tests and planned Discover and Event-detail evidence.

## Implementation tasks

- [ ] Add the Post, Event, Tag, Event-Tag, and Location persistence required for public personal Events, together with a generated migration.
- [ ] Add server application operations for public Event discovery and detail retrieval, keeping browser-facing handlers thin.
- [ ] Build responsive Discover cards and the Event detail experience without adding filtering or participation mutations.
- [ ] Add deterministic fixtures and idempotent seed helpers for the introduced tables, including the normalized Tag taxonomy and representative announcement, interest, and registration Events.
- [ ] Add server and browser tests for the accepted public browsing, safe text rendering, and failure states.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
