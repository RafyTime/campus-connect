# 18: Add Nominatim geocoding

**What to build:** If its gate is go, let a Creator explicitly search for an address through a protected backend Nominatim integration, select one restricted result, and save its coordinates. Manual plain-text Location publishing remains available through every provider failure. A no-go decision resolves this ticket as `wontfix` without changing the committed core.

**Blocked by:** 16: Deploy the committed core and decide stretch paths.

**Status:** ready

## Acceptance criteria

- [ ] The ticket records the geocoding gate outcome from ticket 16.
- [ ] For a go decision, geocoding runs only after the Creator submits Search, never while typing, on page load, or through background polling.
- [ ] For a go decision, the backend normalizes the query and checks a persistent cache keyed by normalized query and regional-scope version before calling the provider.
- [ ] For a go decision, one global limiter permits no more than one provider request per second for the Railway application.
- [ ] For a go decision, the provider base URL is configurable and requests send an application-specific identifier.
- [ ] For a go decision, results are restricted to Germany and the configured greater Bonn-Cologne bounds, transformed to permitted fields, and limited to five.
- [ ] For a go decision, coordinates are stored only after the Creator selects a result.
- [ ] For a go decision, empty results, timeout, provider error, invalid response, and rate-limited requests leave manual plain-text Location publication usable.
- [ ] For a go decision, automated tests use a provider replacement rather than the public service and cover cache hits, regional-scope versioning, global throttling, transformation, filtering, selection, persistence, and failures.
- [ ] For a go decision, the acceptance-to-evidence matrix records tests and the required production, screenshot, and screencast evidence.
- [ ] For a no-go decision, or when a go implementation cannot pass acceptance, the ticket is `wontfix`, no incomplete address-search control is exposed, its implementation checklist is explicitly waived in Comments, and Phase 3 and evidence records state the reason for deferral.

## Implementation tasks

- [ ] For a go decision, add a replaceable provider adapter and an application operation that owns normalization, caching, global throttling, regional restriction, transformation, and fallback.
- [ ] For a go decision, add persistent cache storage with a generated migration, deterministic cache fixtures, and idempotent seed helpers for any introduced table.
- [ ] For a go decision, add explicit responsive address search and result selection to Event authoring while preserving the manual Location path.
- [ ] For a go decision, add server and browser tests without calling public Nominatim.
- [ ] For a go decision, document configuration, regional bounds, provider attribution, usage limits, and failure operation.
- [ ] Update the acceptance-to-evidence matrix with the gate outcome and, when shipped, its test references and production evidence needs.

## Comments
