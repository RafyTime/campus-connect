# Campus Connect Phase 1 - Handoff

## Current status

Phase 1 (conception) for IU course `Project: Java & Web Development (DLBCSPJWD01)` has been completed and uploaded. Tutor feedback on the submitted revision is pending.

The next session should support repository setup and implementation planning, then begin implementation once the tutor feedback is available.

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

## Technical decisions

- Frontend: Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte.
- Full-stack server: SvelteKit with remote functions. The server validates input, authorises actions, and is the only route to external geocoding.
- Authentication: Better Auth, email/password only.
- Persistence: Drizzle ORM + SQLite.
- Runtime/tooling: Bun, ESLint, Prettier.
- Deployment: Railway. SQLite needs a persistent Railway volume.
- Media: local `uploads/` directory in development; Railway Storage Bucket in deployment. Store only media metadata/storage keys in SQLite, not BLOBs. Use a storage abstraction so local and bucket adapters share one interface.
- Maps: Leaflet loads OpenStreetMap tiles in the browser with attribution. SvelteKit calls Nominatim only after an explicit search request. A Google Maps directions link may be generated from stored coordinates; no Google Maps API.

## Domain/data model

Core entities: `User`, `MediaAsset`, `Group`, `GroupMembership`, `Post`, `Event`, `Location`, `Tag`, `EventTag`, `EventParticipation`, `EventInvitation`, and `Notification`.

Important rules:

- Every `Event` is a one-to-one extension of a feed `Post`; ordinary updates are `Post` records without an event extension.
- `GroupMembership.role` is `owner`, `representative`, or `subscriber`. Only owner/representative roles manage group posts/events.
- `EventParticipation` has a unique user/event pair; capacity is checked before confirming a registration.
- `EventInvitation` supports a direct recipient and/or a hashed revocable share token.
- `Location` contains a display label and coordinates. `EventTag` provides normalized tag filtering.
- `MediaAsset` contains the storage key and file metadata. It is referenced by user, group, and post records.
- The group flag should be named `isCampusChannel` or `isCampusWide`; do not use the unclear name `hasPriority`.

## Assignment constraints to preserve

- The web frontend must be responsive and communicate with a developed backend.
- Include at least two JavaScript-driven dynamic frontend/backend interactions; Campus Connect has several: filtered event retrieval, creation/editing, follow actions, RSVP/capacity changes, and notification reads.
- External APIs must be consumed by the backend before data reaches the frontend; maintain this for Nominatim.
- Phase 2 will require GitHub, screenshots, a 1-2 minute desktop/responsive screencast, changed-design notes, and test cases.
- Phase 3 requires a documented, runnable repository with README installation/run instructions and a final abstract/making-of presentation section.

## Submitted Phase 1 artefacts

The final submission contained a title slide and five content slides:

1. Purpose and scope/problem context.
2. User roles and outcomes.
3. Functional requirements and constraints.
4. Technical architecture.
5. Data model and business rules.

The half-page PebblePad abstract uses `Problem` and `Solution Approach` headings. It states the application is a concrete implementation plan, not a speculative startup pitch.

## Recent presentation-review corrections

The final deck was revised after review. If presentation work resumes, verify that it:

- Names the app explicitly on the title slide: `Campus Connect - Conceptual Design Specification`.
- Uses specification language such as "the system will", "users can", and "the backend enforces".
- Shows Nominatim as a backend integration and OpenStreetMap tiles as a browser/Leaflet integration.
- Shows Railway bucket media storage and persistent SQLite storage in the architecture.
- Shows `GroupMembership.role` in the ERD.
- Uses consistent naming: `TypeScript`, `shadcn-svelte`, `Bun`, `OpenStreetMap`, and `isCampusChannel`.

## Recommended implementation order

1. Create the GitHub repository and initialise the SvelteKit/Bun/TypeScript project.
2. Configure linting, formatting, environment example, and README skeleton before features.
3. Define Drizzle schema and migrations for Better Auth plus the core entities.
4. Implement authentication and an authorization helper for group/event permissions.
5. Seed users, groups, tags, campus locations, posts, and events for repeatable demos/tests.
6. Implement the event feed, server-side filters, event detail view, and RSVP/capacity flow.
7. Add groups/posts/notifications, then private-event invitations/share links.
8. Add media storage abstraction and map/geocoding integration.
9. Add tests, responsive checks, deployment configuration, and documentation.

## Notes

No repository has been created yet at the time of this handoff. Do not create deployment credentials, API keys, or paid resources until the user explicitly asks.
