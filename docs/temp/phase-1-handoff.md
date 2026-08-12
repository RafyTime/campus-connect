# Campus Connect — Phase 1 Handoff

## Current Status (Before Phase 2)

Phase 1 (conception) for IU course `Project: Java & Web Development (DLBCSPJWD01)` is complete, submitted, and approved. Tutor Christian confirmed that the concept fits the requirements, the benefits/target groups/technology are appropriate, and development may continue. The tutor also noted that a revised conception document may be submitted with the final project.

The repository now has a verified, deployed Phase 2 baseline. It is deliberately a skeleton: its infrastructure and authentication foundation work, but the Campus Connect domain features remain to be implemented.

The repository-local source of truth for the agreed product scope is [Phase 1: Conceptual Design Specification](../phase-1/conception-phase.md). The original PowerPoint remains outside the repository.

## Completed baseline

### Application and quality tooling

- SvelteKit with the Node adapter, Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, and Bun `1.3.14` are configured.
- ESLint, Prettier, Svelte/TypeScript checking, Vitest, and Playwright are configured with scripts in `package.json`.
- GitHub Actions in `[.github/workflows/ci.yml](../../.github/workflows/ci.yml)` runs formatting/linting, Svelte/TypeScript checks, and unit/end-to-end tests on every push, pull requests to `main`, and manual runs.
- Existing tests are primarily scaffold/regression coverage. Phase 2 must add feature-specific acceptance and business-rule tests.

### Authentication and database

- Better Auth is configured for email/password authentication.
- Drizzle ORM uses SQLite through libSQL. The current schema exports only Better Auth's generated tables.
- [The initial auth-only migration](../../drizzle/0000_auth_baseline.sql) creates `user`, `session`, `account`, and `verification`. The earlier sample `task` table and its migration were removed before any production data existed.
- The migration was tested against a fresh local SQLite database and successfully applied once to the production database.
- `getDb()` and `getAuth()` lazily initialise singleton instances at runtime. This prevents Railway builds from trying to open the runtime-only SQLite volume. Keep this lifecycle-safe design.

### Railway deployment

- Railway is connected to the GitHub repository and deploys the `main` branch in **EU West**.
- Railway **Wait for CI** is enabled.
- The application is publicly deployed, sleeps after inactivity, and resumes promptly.
- The service has a persistent volume mounted at `/data`; production SQLite uses `DATABASE_URL=file:/data/campus-connect.db`.
- Railway production variables include `DATABASE_URL`, `ORIGIN` (the full public HTTPS URL), and `BETTER_AUTH_SECRET`. Do not record or commit their values.
- The current production database contains only the initial Better Auth tables and Drizzle's migration ledger.

See [deployment.md](../deployment.md) for the current operating procedure and [the Railway lifecycle research](../research/railway-sveltekit-sqlite-build-lifecycle.md) for the rationale behind the lazy runtime initialisation.

## Product definition

**Campus Connect** is an unofficial, responsive web application for IU Campus Bad Honnef. It centralises campus events and group updates that are otherwise spread across informal channels.

The MVP is an event-first feed. Authenticated users can create personal events, create or follow groups, publish group posts, and register interest or attendance for events.

### Functional scope

- Email/password authentication; profile with display name and optional avatar.
- Groups with one `owner`, optional `representative` members, and `subscriber` followers.
- A seeded campus-wide updates group that every account can read/follow.
- Personal and group events with title, description, hobby tags, start/end time, visibility, response mode, capacity, and location.
- Event visibility: public, subscriber-only, or invite-only.
- Event response modes: announcement, interest sign-up, and limited-capacity registration.
- Direct in-app invitations and revocable share links for private events.
- Persisted in-app notifications for followed-group content and event changes; no email or push delivery.
- Leaflet map with an event marker. Use seeded campus locations first; send explicit off-campus geocoding searches through the backend to Nominatim, with caching/rate limiting and no autocomplete.
- Optional images: user avatar; group avatar/banner; post image. No video.

### Explicit exclusions

Comments, direct messages, payments, email invitations, video uploads, calendar synchronisation, and real-time push notifications are out of scope.

## Technical decisions to preserve

- **Frontend:** Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte.
- **Full-stack server:** SvelteKit with remote functions. The server validates input, authorises actions, and is the only route to external geocoding.
- **Authentication:** Better Auth, email/password only.
- **Persistence:** Drizzle ORM + SQLite. Use committed Drizzle migrations for schema changes; never `db:push` in production.
- **Deployment:** Railway with SvelteKit's Node adapter and a persistent SQLite volume at `/data`.
- **Media:** local `uploads/` directory in development; Railway Storage Bucket in deployment. Store only media metadata/storage keys in SQLite, not BLOBs. Implement a storage abstraction before enabling uploads.
- **Maps:** Leaflet loads OpenStreetMap tiles in the browser with attribution. SvelteKit calls Nominatim only after an explicit search request. A Google Maps directions link may be generated from stored coordinates; no Google Maps API.

## Planned domain/data model

The production database currently has **only authentication tables**. The following Campus Connect tables are planned Phase 2 work, not already implemented: `MediaAsset`, `Group`, `GroupMembership`, `Post`, `Event`, `Location`, `Tag`, `EventTag`, `EventParticipation`, `EventInvitation`, and `Notification`.

Important rules:

- Every `Event` is a one-to-one extension of a feed `Post`; ordinary updates are `Post` records without an event extension.
- `GroupMembership.role` is `owner`, `representative`, or `subscriber`. Only owner/representative roles manage group posts/events.
- `EventParticipation` has a unique user/event pair; capacity is checked before confirming a registration.
- `EventInvitation` supports a direct recipient and/or a hashed revocable share token.
- `Location` contains a display label and coordinates. `EventTag` provides normalized tag filtering.
- `MediaAsset` contains the storage key and file metadata. It is referenced by user, group, and post records.
- The group flag should be named `isCampusChannel` or `isCampusWide`; do not use the unclear name `hasPriority`.

## Development and deployment rules

- Use `.env.example` to create a local `.env`; never commit `.env` or production secrets.
- `ORIGIN` must be the full public HTTPS Railway domain in production because Better Auth uses it as its base URL.
- Railway volumes are unavailable during build and pre-deploy. Keep database/auth initialization lazy, and do not use an in-memory build database or a second SQLite service.
- For each future production migration: generate and commit it, deploy it after CI, then run `bun run db:migrate` once in the running Railway service console. The initial migration has already been applied this way.
- Do not configure restrictive Railway watch paths for this single-service repository; migrations, dependencies, configuration, and assets can require deployment.

## Recommended Phase 2 implementation order

1. Define the core Campus Connect domain schema, generate reviewed migrations, and seed repeatable demo/test data.
2. Implement the profile and authorization helpers for group/event permissions.
3. Implement groups, posts, the event feed, server-side filters, and the event detail view.
4. Implement RSVP/interest/capacity handling with concurrency-safe validation.
5. Add notifications, private-event invitations, and share links.
6. Add the media-storage abstraction, Railway bucket integration, map display, and backend Nominatim integration.
7. Add feature-specific tests, responsive evidence, screenshots, screencast material, and design-change notes required for Phase 2.

## Assignment constraints to preserve

- The web frontend must be responsive and communicate with a developed backend.
- Include at least two JavaScript-driven dynamic frontend/backend interactions; Campus Connect has several: filtered event retrieval, creation/editing, follow actions, RSVP/capacity changes, and notification reads.
- External API data must be consumed by the backend before data reaches the frontend; maintain this for Nominatim.
- Phase 2 requires GitHub evidence, screenshots, a 1–2 minute desktop/responsive screencast, changed-design notes, and test cases.
- Phase 3 requires a documented, runnable repository with README installation/run instructions and a final abstract/making-of presentation section.
