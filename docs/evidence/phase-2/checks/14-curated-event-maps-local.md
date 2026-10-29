# Ticket 14: Curated Event maps

Local implementation verification on 2026-10-27; style selection and renderer refinement on 2026-10-28, Europe/Berlin. Final Railway verification and submission captures remain planned.

## Delivered behavior

Mapped Event details dynamically import Leaflet, the MapLibre renderer, its dedicated worker and styles, then load the unmodified OpenFreeMap Positron style. Discover and plain-text Locations load none of these map resources. Existing curated Locations and seeded Events cover both paths; no fixture, coordinate or schema changes are needed.

Leo chose Positron at zoom 16 after comparing the default Bright, Liberty and Positron styles. Keep the compact circular marker in the application's primary and background colors and the existing frame. No style overrides, pan, zoom, search, directions or coordinate-editing controls remain in the core map. The prototype source was captured locally outside the application before removal. A throwaway-branch commit is deferred until explicitly authorized under AGENTS.md.

The bridge translates Leaflet's 256px zoom grid to MapLibre's 512px grid, so Leaflet is initialized at 17 to reproduce the selected MapLibre zoom 16. Each map keeps one marker at the stored coordinates. The Location label stays outside the map. Persistent OpenFreeMap, OpenMapTiles and OpenStreetMap links remain below the map, including when loading fails.

Provider style, tile, script, stylesheet and worker failures, or a 12-second loading timeout, leave an inline fallback and Retry map button. Retry reloads the page so failed browser module imports can recover too. Description, time, host, Tags, Location and Participation stay independently usable. Navigation removes both renderers and the resize observer; late imports cannot initialize a removed map.

The integration follows [OpenFreeMap's Leaflet guide](https://openfreemap.org/quick_start/) and [attribution requirements](https://openfreemap.org/#attribution). No API key, new account, production database or production deployment is involved in local verification.

## Automated evidence

`src/routes/event-maps.e2e.ts` covers:

- The Positron style URL, zoom-16 tile coordinates, a centered marker with its accessible Location label, all attribution links. `src/lib/server/application/events.spec.ts` separately verifies the stored latitude and longitude returned through the public Event detail operation.
- No map script, stylesheet or tiles on Discover or plain-text Event details; navigating from plain-text to mapped Events and between different mapped Events.
- No horizontal page overflow, fully visible attribution, keyboard traversal out of the map, and no serious or critical axe violations at 360x800, 768x1024 and 1440x900.
- Failed tiles, provider style, dynamic script, stylesheet and worker loading, plus stalled tiles, preserving all Event information and the visitor Participation dialog; successful recovery after Retry map reloads the page.

The external style response is replaced at the HTTP boundary with a small raster-and-GeoJSON style. Its inline building requires real worker processing; its tile requests use a deterministic PNG. Leaflet, MapLibre, worker execution, application rendering and the disposable database remain real. The failure tests verify that the intended resource was actually intercepted. Tests never depend on the public tile service.

The initial mapped-Location test failed because the map region did not exist, then passed after implementation. All nine focused browser cases pass. Formatting, lint and Svelte/TypeScript checks passed. All 181 unit and integration tests passed (`bunx vp test --run --pool=threads --maxWorkers=2`). The production build passed through the Playwright build-and-preview runner. All 97 Playwright tests passed (`bun run test:e2e --workers=2`). After tightening the coordinate assertion during review, all nine focused map tests passed again against the built Node application (`PLAYWRIGHT_SERVER=node bun run test:e2e src/routes/event-maps.e2e.ts`).

Selected-style verification completed on 2026-10-28: formatting and lint passed; Svelte/TypeScript reported zero errors and warnings; all 182 unit/integration tests and all 99 Playwright tests passed, including the 1440px registration scenario. The final production build passed. Browser tests used two workers and disposable databases. The build reports a large lazy-loaded renderer chunk; it remains excluded from plain-text Locations and Discover.

A separate local preview on port 4184, using a fresh disposable seeded database, visibly rendered the actual OpenFreeMap Positron style with its centered circular marker, building outlines and persistent attribution. The comparison controls are removed. Screenshot: `/tmp/campus-connect-positron-final.png`. No production deployment or live database was touched.

## Original code review

Review baseline: `bbc03ece2f5d858dcb83e08d3506c1f4239aee48`, using the working diff before committing. Standards review found no violations or actionable smells. Spec review identified an imprecise coordinate assertion; it now checks independently calculated marker-center offsets within the expected tile to less than one pixel. The reviewer confirmed that this resolves the evidence gap. No product requirement or implementation findings remain.

## Selected-style review

Review baseline: `8ebc721faca40f4e01fe56f3794c2b26951fda2d`, including the working diff and this local evidence document.

### Standards

No documented-standard violations or lifecycle blockers. One minor test-quality finding was resolved by removing an assertion about the deleted prototype controls; the remaining assertions verify lasting product behavior.

### Spec

No findings. The selected default Positron style, MapLibre zoom 16, conditional loading, attribution, plain-text Locations and failure recovery match the accepted requirements. Real campus coordinates remain deferred by Leo.

Review totals: Standards 0 unresolved findings; Spec 0 findings.

## Final Railway evidence plan

After the final deployment, record the deployed commit and capture date. Open Board game evening, check its cafeteria marker and attribution, then open Plain-text campus briefing and confirm its label without map requests. Block tiles or the map script in browser developer tools and confirm Event content and Participation remain usable; remove the block and retry.

Capture clean and annotated Event details and map for CAP-03 at desktop and mobile sizes, including readable attribution. Include the Event-map scene in VIDEO-01. Keep final optimized captures in the repository evidence folder and full-resolution sources in the course Drive folder. These production checks and final media are planned; no live database, deployment or daily-driver preview was touched during implementation.
