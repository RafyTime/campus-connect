# Campus Connect Phase 2

Status: ready

## Problem Statement

Campus Connect has an approved concept, working authentication infrastructure, continuous integration, and a Railway deployment, but it does not yet provide the campus activity product described in Phase 1. Visitors cannot discover events, users cannot follow groups or participate, and creators cannot publish content. The current tests cover the starter project rather than Campus Connect behavior.

Phase 2 must turn that skeleton into a coherent web application and document the result for the DLBCSPJWD01 development and reflection submission. A broad but unfinished implementation would be a poor trade. The product needs one polished explorer-led story, enough creator capability to produce its content, verified server-side rules, responsive behavior, a reproducible deployment, and evidence that fits the university submission format.

## Solution

Build and deploy an event-first Campus Connect release for IU Campus Bad Honnef. Visitors can browse and filter public events. Users can register, sign in, follow groups, express interest, register for limited events, and review their activity. Creators can create groups and publish personal or group events. Owners and representatives can manage group events. The server owns validation, authorization, persistence, participation capacity, and any enabled external integration.

The committed release includes public personal and group Events, all three response modes, persisted Group subscriptions, curated mapped campus locations, manual plain-text locations, responsive layouts, automated acceptance evidence, and the complete Phase 2 presentation package. Three separately gated stretch paths may follow the committed-core deployment: subscriber-only Events; backend geocoding; and the existing package of text-only Group updates with stored Notifications. Invite-only access, uploads, and broader Group administration remain Phase 3 work.

## User Stories

1. As a visitor, I want to see upcoming public events without creating an account, so that I can judge whether Campus Connect is useful.
2. As a visitor, I want events ordered by their next start time, so that the most immediate opportunities appear first.
3. As an explorer, I want to filter events by one or more tags, so that I can find activities matching my interests.
4. As an explorer, I want an event to match any selected tag, so that selecting several interests does not make discovery unnecessarily narrow.
5. As an explorer, I want to filter events by date, so that I can find activities that fit my schedule.
6. As an explorer, I want to filter events by group, so that I can inspect activity from a community I recognize.
7. As an explorer, I want to filter by personal or group host type, so that I can distinguish individual activities from group events.
8. As an explorer, I want different filter categories to combine, so that results satisfy the complete search I asked for.
9. As an explorer, I want filters preserved in the URL, so that I can refresh or share the same result set.
10. As an explorer, I want a result count and a clear-filters action, so that I understand and can recover from a narrow search.
11. As an explorer, I want a useful empty state when no events match, so that I know how to broaden the search.
12. As a visitor, I want each event card to summarize its time, host, location, tags, response mode, and capacity state, so that I can decide whether to open it.
13. As a visitor, I want a public event detail page with its full description, exact time, host, tags, and location, so that I can understand the event before acting.
14. As a visitor, I want a mapped location to show a visual marker, so that I can recognize where the event takes place.
15. As a visitor, I want an authentication prompt when I attempt a protected action, so that I understand why I cannot continue anonymously.
16. As a visitor, I want the authentication prompt to offer sign-in and registration, so that I can choose the correct next step.
17. As a visitor, I want to return to the page where authentication started, so that I do not lose my place.
18. As a new user, I want to register with a display name, email, and password, so that I can participate in Campus Connect.
19. As a user, I want my session to persist across navigation and refresh, so that I do not repeatedly sign in.
20. As a user, I want to sign out, so that I can end access on a shared device.
21. As a user, I want to edit my display name, so that Campus Connect shows the name I currently use.
22. As a visitor, I want to browse a public group directory, so that I can discover campus communities.
23. As a visitor, I want a group page with its description, owner, subscriber count, and upcoming accessible events, so that I can understand the group.
24. As a user, I want to follow a Group, so that I gain a persisted subscriber membership and the displayed subscriber count updates.
25. As a subscriber, I want to unfollow a group, so that I can stop following content I no longer want.
26. As a participant, I want to retain access to a subscriber-only Event I joined before unfollowing when that stretch feature ships, so that unfollowing does not silently erase my attendance record.
27. As a creator, I want to create a group, so that I can publish events for a campus community.
28. As an owner, I want to edit my group's basic details, so that its public information stays accurate.
29. As an owner, I want my ownership established when I create the group, so that the group always has one accountable manager.
30. As a representative, I want the same group-event publishing authority as the owner, so that the group can delegate day-to-day content work.
31. As a creator, I want to publish a personal event, so that I can organize an activity without creating a group.
32. As an owner or representative, I want to publish a public group Event, so that the Event clearly belongs to the Group.
33. As a creator, I want inline event-form validation, so that I can fix invalid fields before resubmitting.
34. As a creator, I want the server to enforce the same validation, so that bypassing the browser cannot create invalid events.
35. As a creator, I want to choose one to three normalized tags, so that my event participates in reliable filtering.
36. As a creator, I want to provide an event start and end in the campus timezone, so that explorers see an unambiguous schedule.
37. As a creator, I want to choose a curated campus location, so that common locations require no address search.
38. As a creator, I want to search for a custom address explicitly when the geocoding stretch feature ships, so that I can map an off-campus activity.
39. As a creator, I want to select one result from a short geocoding result list when that stretch feature ships, so that Campus Connect stores the intended place rather than the first guess.
40. As a creator, I want to save a manual plain-text location whether geocoding ships or not, so that an external service never blocks publication.
41. As a creator, I want a valid event to publish immediately, so that it becomes discoverable without a separate draft workflow.
42. As a creator, I want to edit an upcoming event before anyone participates, so that I can correct its details.
43. As a creator, I want safe edits after participation exists, so that I can improve text without silently changing access, time, response mode, or location.
44. As a creator, I want to raise registration capacity, so that I can admit more participants when space becomes available.
45. As a creator, I want to cancel a future event without erasing its history, so that participants see that it was withdrawn.
46. As a participant, I want a cancelled event to remain in my activity history, so that my prior registration or interest has an explanation.
47. As a creator, I want ended events to become read-only, so that historical records do not change after completion.
48. As a creator, I want My events to list events I may manage, so that I do not need to rediscover them through the public feed.
49. As an explorer, I want announcement events to show information without participation controls, so that the interface matches the creator's intent.
50. As an explorer, I want to record and withdraw interest, so that I can maintain a non-binding list of possible activities.
51. As an explorer, I want to register for an event with remaining capacity, so that I can reserve a place.
52. As a participant, I want to cancel my registration, so that capacity becomes available to someone else.
53. As an explorer, I want remaining capacity shown on registration events, so that I know whether space is scarce.
54. As an explorer, I want a clear full-capacity response, so that I understand why registration failed.
55. As an explorer, I want repeated participation actions handled safely, so that retries cannot create duplicate records.
56. As an explorer competing for the final place, I want capacity checked atomically, so that simultaneous requests cannot oversubscribe an event.
57. As an event author, I want my own event excluded from participation actions, so that organizer presence does not consume participant capacity.
58. As a user, I want My activity to list my interests and registrations, so that I can manage upcoming participation.
59. As a user, I want cancelled and ended participation records retained in My activity, so that the page explains my activity history.
60. As an outsider, I want subscriber-only Events omitted from discovery when that stretch feature ships, so that restricted Group activity is not exposed.
61. As an outsider following a direct subscriber-only link when that stretch feature ships, I want a non-disclosing not-found response, so that the application does not leak restricted Event details.
62. As a visitor, I want public Campus Updates content without subscribing, so that campus-wide information is always available.
63. As a visitor, I want remote image failures to fall back to initials, icons, or designed placeholders, so that the interface remains usable.
64. As a keyboard user, I want to complete the main journeys without a pointer, so that Campus Connect is operable with keyboard input.
65. As a screen-reader user, I want semantic structure, associated labels, useful errors, and descriptive alternatives, so that I can understand and operate the application.
66. As a mobile user, I want navigation, cards, forms, dialogs, and maps to fit a small screen without horizontal page scrolling, so that Campus Connect works on my phone.
67. As a tablet user, I want layouts to adapt at the standard Tailwind breakpoints, so that controls remain readable between phone and desktop sizes.
68. As an owner or representative, I want to publish a text-only group update when the stretch package ships, so that subscribers can receive news outside an event.
69. As an owner or representative, I want to edit or delete a group update when the stretch package ships, so that group information stays accurate.
70. As an explorer, I want a separate Updates view when the stretch package ships, so that ordinary posts do not interfere with event filters.
71. As a subscriber, I want a stored notification for newly published group events and updates when the stretch package ships, so that I can find new content.
72. As a user, I want an unread count and notification list when the stretch package ships, so that I can see what requires attention.
73. As a user, I want to mark one or all notifications as read when the stretch package ships, so that I can maintain the list.
74. As a course evaluator, I want a public Railway deployment with realistic content, so that I can assess the application without reconstructing the dataset.
75. As a course evaluator, I want the public GitHub repository linked from the presentation and PebblePad, so that I can inspect the implementation and history.
76. As a course evaluator, I want annotated desktop and responsive screenshots, so that the presentation explains the working product.
77. As a course evaluator, I want an embedded 1 to 2 minute screencast with narration or subtitles, so that I can see desktop and mobile behavior.
78. As a course evaluator, I want the final technology choices, Phase 1 changes, test evidence, and deployment evidence summarized, so that I can evaluate the development process.
79. As a developer, I want installation, migration, seeding, test, build, run, and deployment instructions, so that I can reproduce the application.
80. As a developer, I want every feature ticket to update an acceptance-to-evidence matrix, so that tests, production checks, screenshots, and screencast evidence stay traceable.
81. As a developer, I want each domain slice to introduce its own deterministic fixtures and seed helpers, so that tests and demonstrations evolve with the tables they exercise.
82. As an operator, I want external image and map failures to degrade safely, so that the committed core remains usable.
83. As an operator, I want production migrations applied deliberately against the attached Railway volume, so that deployment does not attempt to access unavailable storage during build.
84. As an operator, I want authentication secrets, demonstration credentials, and sensitive request data kept outside Git and logs, so that the public repository does not expose them.
85. As an owner or representative, I want to publish a subscriber-only Event when that stretch feature ships, so that Group members can receive restricted activity details.
86. As a course evaluator, I want the submission outline and acceptance-to-evidence matrix established before feature development, so that each completed slice leaves usable portfolio evidence.

## Implementation Decisions

### Delivery boundary

- The committed scope is defined by product coherence and acceptance quality, not by a 28-hour limit. The two-week schedule is aspirational and fully flexible.
- The deployed Railway application is the canonical Phase 2 demonstration. Local development and testing remain reproducible.
- Seeded content supports the demonstration but does not replace a committed mutation or permission check. Deferred interactions are omitted rather than mocked as working.
- The existing Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, SvelteKit, Better Auth, Drizzle ORM, SQLite/libSQL, Bun, GitHub Actions, and Railway choices remain in place.
- Preserve the accepted lazy database and authentication initialization decision. Server imports and production builds must not access the runtime-only Railway volume.
- Deploy and verify the committed core before deciding whether to open any stretch path.
- Record separate go or no-go decisions for geocoding, subscriber-only Events, and the Group updates plus Notifications package.
- Final release work waits until every stretch path is complete or explicitly marked `wontfix`.

### Application boundaries

- SvelteKit owns the browser-facing query and mutation boundary. Loaders, actions, or remote functions stay thin and delegate to server application operations.
- Server application operations accept the acting user context and validated input, enforce authorization and business rules, and perform database work. Browser code never decides access or capacity.
- Use one shared application boundary for event, group, participation, activity, and discovery operations. Separate internal modules may organize the domain, but routes must not duplicate rules.
- If geocoding ships, put the Nominatim HTTP call behind a replaceable provider adapter. The application-level geocoding operation owns normalization, caching, throttling, result restriction, and fallback behavior.
- External API data reaches the browser only after the backend has selected and transformed the permitted fields.

### Accounts and profiles

- Better Auth remains email and password only.
- Registration requires a trimmed display name between 2 and 50 characters, a normalized email address, and a password of at least eight characters.
- Phase 2 exposes registration, sign-in, sign-out, session persistence, and display-name editing.
- Email change, password change or recovery, email verification, avatar change, and account deletion have no Phase 2 UI.
- A protected visitor action opens a small dialog offering sign-in and registration. The chosen page receives a validated return path. Authentication returns the visitor to the originating page but does not execute the original mutation automatically.

### Groups and memberships

- A Group has a case-insensitively unique name, a short description, an owner, optional seed-controlled remote image URL, and timestamps.
- Group membership has exactly one role per user and group: owner, representative, or subscriber.
- A database constraint and transaction-backed application rule preserve at most one membership per user and group and exactly one owner per group.
- Creating a Group and its owner membership is one transaction.
- Owners and representatives are members but do not count toward the displayed subscriber count and cannot follow or unfollow their group.
- Follow creates a subscriber membership. Unfollow removes it. Repeated requests return the resulting state without creating duplicates or unrelated errors.
- In the committed core, subscriber membership updates Group state and counts but does not unlock restricted content. Restricted access exists only if the subscriber-only Event stretch path ships.
- Phase 2 permits Group creation and basic editing. Representative management, ownership transfer, additional owners, and Group deletion are deferred.
- Campus Updates is seeded, public, system-managed, and readable without a Group membership. Ordinary users cannot edit it.

### Posts and events

- Post is the common feed-content record. Every Event has exactly one Post. A personal Event Post has a user author and no Group. A group Event Post has a user author and a Group.
- Group update is the only non-Event Post type. It remains dormant unless the stretch package ships.
- Event stores its unique Post relationship, description, start and end timestamps, visibility, response mode, optional capacity, status, and Location relationship. Visibility is fixed to public in the committed core.
- Derive host type from whether the Event Post belongs to a Group. Do not store a second host-type value that can disagree.
- Store timestamps unambiguously and apply `Europe/Berlin` when validating and presenting campus dates.
- Require a title of 5 to 100 characters, description of 20 to 2,000 characters, one to three Tags, a start and end, response mode, and Location. Committed-core authoring assigns public visibility without exposing a restricted-visibility choice.
- Start must be in the future at creation. End must follow start. Ended Events are read-only.
- The committed core publishes public personal and public group Events only. Subscriber-only visibility belongs to its independent stretch path.
- Supported response modes are announcement, interest, and registration. Registration requires a positive capacity. Other modes have no capacity.
- New Events publish immediately with scheduled status. Drafts are not part of Phase 2.
- Host cannot change after publication.
- Before Participation exists, creators may edit every exposed field except host. After Participation exists, lock response mode, start, end, and Location. Continue allowing title, description, Tags, and capacity increases. If subscriber-only visibility ships, creators may change visibility only before Participation exists.
- Creators cannot lower capacity below the confirmed registration count.
- Cancellation is final. It retains the Event, Post, and Participation history, blocks new Participation, removes the Event from discovery, and exposes a cancelled state through direct links and activity views.
- There is no user-facing hard deletion or reopening for Events.
- Render user-authored text as plain text with preserved line breaks. Do not accept HTML or Markdown and do not turn URLs into links automatically.

### Tags, locations, maps, and images

- Tags use a seeded normalized taxonomy of roughly 8 to 12 values. Creators choose one to three. Custom Tag creation is deferred.
- Location stores a display label and nullable coordinates. The committed core supports curated mapped campus locations and manual plain-text locations. A plain-text location has no coordinates.
- The Event detail page loads Leaflet and OpenStreetMap tiles only for a mapped location and always shows required attribution.
- The map is visual. Routing, directions, editing coordinates, and choosing a point by dragging a marker are outside Phase 2.
- User image uploads and arbitrary image URLs are not accepted. Seed data may contain fixed remote image URLs from constrained hosts. Every remote image has an initials, icon, or gradient fallback.

### Discovery and access

- Discover queries scheduled, non-ended public Events in the committed core and sorts them by soonest start.
- Public Events are visible to visitors and users.
- Support Tag, date, Group, and host-type filters. Multiple Tags use OR semantics. Different filter categories use AND semantics.
- Represent filter state in URL query parameters. The backend receives normalized filter inputs and returns the result count with the accessible records.
- Discover includes a clear-filters action, loading state, empty-feed state, and no-matching-results state.
- If Group updates ship, place them in a separate Updates view. Event filters never apply to Group updates.

### Participation and activity

- Event participation has a unique user and Event pair and records either interest or registration according to the Event response mode.
- Announcement Events expose no Participation mutation.
- Interest can be recorded and withdrawn.
- Registration can be confirmed and cancelled.
- Event authors cannot participate in their own Events. Other owners or representatives may participate when they are not the author.
- Registration uses an atomic database operation that confirms capacity remains before inserting. Concurrent requests cannot raise the confirmed count above capacity.
- Repeated Participation requests are safe and never create duplicate records.
- A full registration attempt returns a specific recoverable result. Do not convert expected capacity conflicts into generic server errors.
- My activity includes upcoming interests and registrations plus relevant cancelled and ended history.
- My events includes Events the current user may manage.

### Stretch gates

- The stretch gate opens only after the committed journeys pass locally and on Railway, the responsive shell is stable, and an evidence-capture rehearsal confirms that the planned scenes and records are obtainable. Rehearsal artifacts are not final submission evidence.
- Record independent go or no-go outcomes for geocoding, subscriber-only Events, and the Group updates plus Notifications package.
- A no-go path is marked `wontfix` for Phase 2 and recorded as a Phase 3 deferral.
- Final release, submission-evidence capture, and submission assembly wait until every stretch path is complete or explicitly marked `wontfix`.

### Subscriber-only Event stretch

- Add subscriber-only visibility to group Events without changing personal Events.
- Subscriber-only Events are discoverable by current Group members and visible through direct access to users with an existing Participation for that Event.
- Omit restricted Events from unauthorized discovery results. A direct unauthorized request returns a non-disclosing not-found response.
- Following creates the subscriber membership that grants discovery access. Unfollowing removes discovery access but does not remove existing Participation or direct access to joined Events.
- Cover restricted publication, access-aware discovery, direct requests, Participation access, retained access after unfollowing, and evidence updates in this stretch path.

### Geocoding stretch

- Geocoding starts only when the creator submits an address or place with Search. Never call the provider while typing, on page load, or in a background polling loop.
- Normalize the query and check a persistent cache before the provider call. Cache results by normalized query and the configured regional-scope version.
- Enforce one provider request per second for the whole Railway application. Send an application-specific identifier and keep the provider base URL configurable.
- Restrict results to Germany and a configurable bounded greater Bonn-Cologne region. Return at most five transformed results. The creator must select one before coordinates are stored.
- A provider failure or empty result keeps manual plain-text Location available and does not affect committed Event publication.
- Cover cache behavior, global throttling, result transformation, regional filtering, selection persistence, provider failures, production checks, and evidence updates in this stretch path.

### Group updates and Notifications stretch

- Implement Group updates before Notifications because Notifications depend on published Group content.
- A Group update is public text content with a title of 5 to 100 characters and body of 1 to 2,000 characters. Owners and representatives may create, edit, and delete it.
- Show Group updates newest first on Group pages and in the separate Updates view. Include author and publication time.
- Exclude images, comments, reactions, pinning, drafts, and scheduled publishing.
- Publishing a group Event or Group update creates one stored Notification for every current subscriber except the author. Campus Updates creates no Notifications.
- Notification supports recipient, target content, creation time, and nullable read time. Prevent duplicate delivery for the same publication and recipient.
- Expose an unread count, Notification list, mark-read during target navigation, and mark-all-read.
- Exclude real-time refresh, push, email, preferences, edit alerts, and cancellation alerts.
- Ship Group updates and Notifications as one package. If either half is incomplete, expose neither half and mark both tickets `wontfix` for Phase 2.

### Interface, responsive behavior, and accessibility

- Primary destinations are Discover, Groups, Create, My activity, My events, and Account.
- Visitors see Discover, Groups, Sign in, and Register. Desktop uses a persistent header. Mobile uses a compact header and bottom navigation for the main authenticated destinations.
- Use Tailwind's default breakpoints. Verify representative small-phone, tablet, and desktop viewports, including 360×800, 768×1024, and 1440×900.
- Prevent horizontal page scrolling and clipped controls. Keep interactive touch targets at least 44×44 CSS pixels.
- Use shadcn-svelte primitives where they fit, but verify semantics rather than assuming the library guarantees accessibility.
- Require semantic landmarks, keyboard operation, visible focus, associated form labels, useful error messages, sufficient contrast, descriptive alternative text, and no color-only status communication.
- Every feature slice includes its own validation, failure states, responsive behavior, and automated tests. The later hardening pass audits cross-journey consistency rather than supplying missing feature acceptance.
- The committed core covers loading, empty, validation, unauthenticated, full-capacity, duplicate-action, cancelled, remote-image-failure, map-tile-failure, and general-server-failure states. Each stretch path adds the failure states specific to its behavior.
- Exact layout, visual hierarchy, and component composition remain subject to prototyping. Prototyping may change presentation but not the accepted behavior.

### Seeding, deployment, and operations

- The baseline provides disposable test databases and deterministic clock support. Each ticket that introduces domain tables also introduces the fixtures and idempotent seed helpers for those tables.
- The accumulated seed command uses stable identifiers for Tags, locations, Groups, memberships, Events, and representative Participation states.
- Local and test environments may use known credentials. Railway demonstration credentials stay outside Git and the screencast.
- Keep Railway on one application instance because the SQLite database lives on its attached volume.
- Generate and commit every Drizzle migration. Verify migrations against a fresh local database.
- Deploy the reviewed commit after CI passes, then apply the migration once from the running Railway service. Never migrate or open the production SQLite volume during build or pre-deploy.
- Run the idempotent seed operation when required, then smoke-test authentication, public discovery, Participation, creator authorization, mapped locations, and responsive navigation. Add stretch-specific smoke checks only for paths that ship.
- Back up the production database before later schema migrations once it contains meaningful user data.
- Event discovery, authoring, and Participation must continue when remote images or map tiles fail. If geocoding ships, Nominatim failure must not affect committed Event authoring.
- Do not log passwords, session tokens, demonstration credentials, or complete authentication payloads.

### Documentation and university evidence

- Update the README with prerequisites, environment variables, migrations, seeding, development, tests, build, run, and deployment instructions.
- Document architecture, domain rules, deployment procedure, Phase 1 changes, Phase 3 deferrals, known limits, and external attribution.
- Comment non-obvious authorization, registration concurrency, and Railway lifecycle decisions. If geocoding ships, also comment non-obvious cache or throttle behavior. Do not comment routine syntax.
- Create the acceptance-to-evidence matrix and submission outline before feature development begins.
- Every later feature ticket updates the matrix with its automated tests and any required production check, screenshot, or screencast evidence.
- The matrix records separate outcomes and evidence for the committed core and each stretch path.
- Capture application screenshots and the screencast only from the final Railway deployment and record the deployed commit and capture date. Earlier core-deployment smoke records support the stretch decisions but are not final submission captures.
- Preserve clean source screenshots and create annotated presentation versions for desktop Discover, mobile Discover, Event details and map, Group details, Event publication, and My activity. Add geocoding, subscriber-only access, Group updates, or Notifications evidence only for stretch paths that ship.
- Update the title slide with `https://github.com/RafyTime/campus-connect`.
- Add nine Phase 2 slides covering delivered scope and journeys; final technology and architecture; desktop discovery; responsive exploration; creator workflow; Participation, permissions, and data rules; Phase 1 changes; tests, CI, accessibility, and Railway; and the embedded screencast.
- Record invite-only access, Invitations, share links, uploads, representative management, ownership transfer, and Group deletion as deliberate Phase 3 deferrals. Report all three stretch paths according to their final outcomes.
- Produce a 95 to 110 second screencast with voice-over or burned-in subtitles. Show desktop discovery and filtering, Event details and map, visitor authentication prompt, following and registration, My activity, public creator publication, capacity behavior, and a mobile discovery interaction. Add stretch scenes only for paths that ship.
- Build the completed slides, annotations, video placeholder, and screencast plan before recording the final video.
- Record the final video after the presentation is complete, embed it, verify playback and file size, and complete the PebblePad checklist.
- Embed a compressed H.264 MP4 directly in the final desktop PowerPoint file. Verify playback outside the authoring session and keep the PPTX below 100 MB.
- Name the submission `Plata-Leonardo_92111978_DLBCSPJWD01_P2_S.pptx`.
- Put the public repository URL in the PebblePad text field and prepare a concise implementation and reflection paragraph for any matching Phase 2 text field.
- Keep the evidence plan and selected optimized screenshots in the repository. Keep full-resolution captures, narration source, MP4, and final PPTX in the course Drive folder.

## Testing Decisions

### Test quality

- Test externally observable behavior rather than private helper structure. A refactor that preserves the application contract should not require widespread test rewrites.
- Every committed business rule and permission boundary must map to at least one automated test. Do not use an arbitrary coverage percentage.
- The baseline supplies deterministic clocks and disposable databases. Feature tickets add only the fixtures and seed helpers for the tables they introduce.
- Tests must not depend on the developer's local database. If geocoding ships, its tests must not call the public Nominatim service.
- Test expected domain conflicts as explicit results, including full capacity, duplicate Participation, forbidden mutation, and locked Event fields. The geocoding stretch adds provider failure coverage if it ships.
- Keep test data small enough to understand. Add records only when they prove a distinct access, role, filter, or concurrency case.

### Agreed test seams

- The primary product seam is Playwright against the built SvelteKit application with a disposable SQLite database and deterministic users and content. It proves the four core journeys through browser, server, and persistence together.
- The server application seam calls the same application operations used by SvelteKit with a real disposable SQLite database. In the committed core it proves authorization, public visibility, Event mutation locks, cancellation, and atomic capacity without testing through internal helpers. If geocoding ships, the same seam also proves caching and fallback behavior.
- If geocoding ships, replace only the external provider at the server application seam. Keep the cache, rate limiter, transformer, and database real.
- Accessibility scanning runs through the primary browser seam. Manual keyboard testing complements it rather than creating a separate automated architecture.
- Component tests are selective. Use them only when a complex isolated interaction is materially clearer than the product seam.

### Required automated coverage

- Validate account input and protected-action return paths.
- Validate Group name uniqueness, sole ownership, role authorization, subscriber counts, and idempotent follow or unfollow.
- Validate Event fields, timezone boundaries, host immutability, visibility rules, post-participation locks, capacity changes, cancellation, and ended read-only behavior.
- Validate public discovery results for visitors and users in the committed core.
- Validate Tag OR behavior, cross-category AND behavior, date boundaries, Group filters, host-type filters, ordering, result counts, and URL restoration.
- Validate announcement, interest, registration, withdrawal, author exclusion, duplicate requests, full capacity, and concurrent final-place attempts.
- Always validate curated mapped locations, plain-text locations, markers, attribution, and map failure behavior.
- If geocoding ships, validate explicit search only, cache hits, provider throttling, result restriction and transformation, selection persistence, provider failure, and plain-text fallback.
- If subscriber-only Events ship, validate restricted publication, access-aware discovery, non-disclosing direct responses, Participation access, and retained access after unfollowing.
- Validate My activity and My events across scheduled, cancelled, and ended records.
- Validate four committed Playwright journeys at desktop size: public visitor discovery; explorer authentication, follow, and public Event Participation; personal Event publication; and public group Event publication. Validate representative responsive interactions at phone and tablet sizes.
- Scan Discover, Event details, authentication, Event creation, Group details, My activity, and My events for critical or serious accessibility violations.
- If the stretch package ships, validate Group update permissions and ordering, Notification recipient selection, author exclusion, deduplication, unread count, mark-read, and mark-all-read.

### Browser and release checks

- Chromium is the automated browser and primary manual browser.
- Perform a manual Firefox desktop smoke test before submission. Safari is not a Phase 2 blocker.
- The release gate requires formatting, linting, Svelte and TypeScript checks, unit and integration tests, Playwright, accessibility checks, and the production build to pass.
- The current database import timeout and formatting failures are baseline defects. Fix them before treating feature work as release-green.
- After committed-core deployment, smoke-test registration or sign-in, public Event filtering, Event details, follow and subscriber counts, Participation, creator authorization, mapped locations, and mobile navigation.
- Record separate production checks for each stretch path that ships.

### Prior art

- The repository already separates server Vitest tests, browser component tests, and Playwright end-to-end tests through the Vite and Playwright configuration.
- The current database initialization test is prior art for server-side Vitest, although its timeout must be repaired.
- The existing Svelte browser example is prior art for component rendering, but Phase 2 should avoid duplicating full journeys at this lower seam.
- The existing Playwright demo proves the build-and-preview runner. Replace scaffold coverage with Campus Connect acceptance journeys.

## Out of Scope

### Phase 3 candidates

- Subscriber-only Events when that independent stretch path is marked `wontfix` for Phase 2.
- Nominatim search when the geocoding stretch path is marked `wontfix` for Phase 2.
- Invite-only Events.
- Direct Invitations and revocable share links.
- User, Group, Post, or Event image uploads and the Railway storage integration.
- Representative appointment or removal.
- Ownership transfer, additional owners, and Group deletion.
- Password change or recovery, email verification or change, avatar editing, and account deletion.
- Custom Tag management.
- Event reopening, drafts, user-facing hard deletion, waitlists, and richer Event-change Notifications.
- Group updates and Notifications when their complete stretch package is marked `wontfix` for Phase 2.

### Excluded from the approved project unless it is reconceived

- Comments.
- Direct messages.
- Payments.
- Email Invitations.
- Video uploads.
- Calendar synchronization.
- Real-time push Notifications.

### Other exclusions

- Arbitrary user-provided remote image URLs.
- Nominatim autocomplete or background geocoding.
- Map routing, directions, draggable coordinate selection, or manual coordinate entry.
- Safari as a required Phase 2 browser.
- An uptime service-level agreement.
- An arbitrary automated-test coverage percentage.
- Pagination for the Phase 2 demonstration dataset unless implementation evidence shows it is required.

## Further Notes

- The approved Phase 1 conception remains the product source of truth where this specification does not record a deliberate Phase 2 refinement.
- The course-specific assignment is authoritative over the general portfolio guidelines. Phase 2 adds no more than ten slides to the approved Phase 1 deck, requires annotated application screenshots, the final technology choices, explicit changes, a 1 to 2 minute responsive screencast, and test cases when they are not coded.
- The current repository is an authentication and deployment skeleton. Campus Connect domain tables, product routes, and feature tests do not exist yet.
- Two weeks is an aspirational target, not a deadline. The schedule is fully flexible, and the committed scope is not constrained to 28 implementation hours.
- Extend the schedule rather than weaken committed acceptance or consume evidence work. Incomplete stretch paths stay unexposed and are marked `wontfix` for Phase 2.
- The exact visual composition, final seeded Tags and campus locations, fixed remote image URLs and attribution, separate stretch-path outcomes, and minor screencast timing remain evidence-dependent. Exact regional bounds remain open only if geocoding ships.
- If geocoding ships, public Nominatim remains suitable only while the application stays within its published usage policy. Keep the provider replaceable and preserve the committed plain-text fallback.
- Railway SQLite requires one running application instance and deliberate runtime migrations. This specification does not override the accepted lazy initialization ADR.
- No new ADR is required. The Phase 2 scope and delivery choices are reversible and unsurprising within a university development phase.
