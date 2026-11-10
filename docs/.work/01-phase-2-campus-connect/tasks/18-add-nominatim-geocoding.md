# 18: Add Nominatim geocoding

**What to build:** If its gate is go, let a Creator explicitly search for an address through a protected backend Nominatim integration, select one restricted result, and save its coordinates. Manual plain-text Location publishing remains available through every provider failure. A no-go decision resolves this ticket as `wontfix` without changing the committed core.

**Blocked by:** 16: Deploy the committed core and decide stretch paths.

**Status:** ready

## Acceptance criteria

- [x] The ticket records the geocoding gate outcome from ticket 16.
- [x] For a go decision, geocoding runs only after the Creator submits Search, never while typing, on page load, or through background polling.
- [x] For a go decision, the backend normalizes the query and checks a persistent cache keyed by normalized query and regional-scope version before calling the provider.
- [x] For a go decision, one global limiter permits no more than one provider request per second for the Railway application.
- [x] For a go decision, the provider base URL is configurable and requests send an application-specific identifier.
- [x] For a go decision, results are restricted to Germany and the configured greater Bonn-Cologne bounds, transformed to permitted fields, and limited to five.
- [x] For a go decision, coordinates are stored only after the Creator selects a result.
- [x] For a go decision, empty results, timeout, provider error, invalid response, and rate-limited requests leave manual plain-text Location publication usable.
- [x] For a go decision, automated tests use a provider replacement rather than the public service and cover cache hits, regional-scope versioning, global throttling, transformation, filtering, selection, persistence, and failures.
- [x] For a go decision, the acceptance-to-evidence matrix records tests and the required production, screenshot, and screencast evidence.
- [ ] For a no-go decision, or when a go implementation cannot pass acceptance, the ticket is `wontfix`, no incomplete address-search control is exposed, its implementation checklist is explicitly waived in Comments, and Phase 3 and evidence records state the reason for deferral.

## Implementation tasks

- [x] For a go decision, add a replaceable provider adapter and an application operation that owns normalization, caching, global throttling, regional restriction, transformation, and fallback.
- [x] For a go decision, add persistent cache storage with a generated migration, deterministic cache fixtures, and idempotent seed helpers for any introduced table.
- [x] For a go decision, add explicit responsive address search and result selection to Event authoring while preserving the manual Location path.
- [x] For a go decision, add server and browser tests without calling public Nominatim.
- [x] For a go decision, document configuration, regional bounds, provider attribution, usage limits, and failure operation.
- [x] Update the acceptance-to-evidence matrix with the gate outcome and, when shipped, its test references and production evidence needs.

## Comments

2026-11-01 — **Go for Phase 2; status remains ready.** [The dated decision](../../../evidence/phase-2/checks/16-stretch-decisions-2026-11-01.md) records the value judgment and complete release-evidence requirements. The existing coordinate/map path makes explicit address search a useful bounded addition. Before completion, provide replacement-provider server/browser tests, cache/scope/throttle/bounds/selection/fallback coverage, configuration and attribution documentation, passing quality/migration checks, and Railway search/publication/cache/fallback evidence with commit/date plus final media references. This gate approval is not implementation or release acceptance. Dark-mode/PWA work has higher execution priority.

2026-11-08 — Implementation on `feat/nominatim-geocoding`. Added protected explicit
search, persistent cache and global limiter, configurable bounded provider,
server-validated selection persistence and manual fallback. Server and browser
tests replace the public provider. See README configuration and the updated
acceptance evidence record. Production checks and final media evidence remain
pending; this ticket stays ready until release acceptance. No production service
or database was accessed.

2026-11-10 — **Prototype verdict: A everywhere, with B's preview on desktop.**
Throwaway variants are kept on branch `feat/event-location-prototype` (`3670bfb`). The
question was which layout best connects choosing a place with confirming it, without
hiding the rest of the Event. A single-page form won. It has three sections: The plan;
Time and responses; and Where are we meeting? On campus, Address and Plain text tabs
replace the separate search field and Location dropdown. A chosen address collapses into
a confirmation card with a Change action that keeps the previous results. Places with
coordinates show an inline map and a Google Maps link. Before a choice there is no
placeholder map. The form uses styled selects for consistency with the rest of the app.
From `lg` upward, a sticky Discover card previews the Event. It reuses `EventCard`. The
guided steps (C) were rejected because they add steps without clarifying anything. The
desktop preview ships in this ticket's PR as a cosmetic layer over the location flow.
