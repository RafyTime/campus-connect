# Phase 2 submission outline

Status: planned

This outline adds nine Phase 2 slides to the approved Phase 1 deck. The existing title slide is not counted as one of the nine. Update its repository link to `https://github.com/RafyTime/campus-connect`.

Use only final Railway captures in the nine slides and embedded screencast. Every application image must trace back to the [acceptance-to-evidence matrix](acceptance-evidence.md), including the deployed commit and capture date.

## Slide plan

| Slide                                         | Purpose                                                     | Content                                                                                                                                                                                                                                                                                                                                        | Planned evidence                                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1. Delivered scope and journeys               | State what Phase 2 shipped and what an evaluator can do     | Event-first Campus Connect release; visitor, Explorer, and Creator journeys; committed core; the final outcome of subscriber-only Events, geocoding, and the Group updates plus Notifications package; deliberate Phase 3 deferrals                                                                                                            | Compact delivered-scope list linked to matrix outcomes; public repository URL in the footer                                 |
| 2. Final technology and architecture          | Explain the implemented system and final technology choices | Svelte 5, SvelteKit, TypeScript, Tailwind CSS, shadcn-svelte, Better Auth, Drizzle ORM, SQLite/libSQL, Bun, GitHub Actions, Railway, Leaflet, and OpenStreetMap; browser-facing SvelteKit boundary; server application operations; persistence; authentication; Railway runtime-only volume; external provider adapter only if geocoding ships | Final architecture diagram or updated Phase 1 diagram; short rationale for retained and changed choices                     |
| 3. Desktop discovery                          | Show the main visitor journey                               | Upcoming public Events ordered by start; cards with host, time, Location, Tags, response mode, and capacity; Tag, date, Group, and host-type filters; result count, URL state, clear action, and no-match recovery                                                                                                                             | CAP-01 annotated desktop Discover screenshot with numbered callouts                                                         |
| 4. Responsive exploration                     | Prove the application adapts beyond desktop                 | Mobile Discover, compact header and navigation, filter interaction, visible focus and touch targets; mention checks at 360x800, 768x1024, and 1440x900                                                                                                                                                                                         | CAP-02 annotated mobile screenshot; optional tablet crop if it explains a distinct layout change                            |
| 5. Creator workflow                           | Explain how content reaches Discover                        | Personal and Group Event publication; owner or representative authority; one to three Tags; Europe/Berlin date handling; response modes; curated mapped and manual plain-text Locations; immediate publication; My events                                                                                                                      | CAP-05 annotated Event publication screenshot; small Group or My events crop only if legible                                |
| 6. Participation, permissions, and data rules | Explain the rules that protect users and records            | Interest, registration, cancellation, atomic capacity, idempotent actions, author exclusion, follow state, post-Participation edit locks, final cancellation, retained history, sole Group ownership, and server-owned authorization                                                                                                           | CAP-06 annotated My activity screenshot; compact data or permission diagram; include capacity behavior from automated tests |
| 7. Changes from Phase 1                       | Be explicit about decisions made during development         | Event-first explorer focus; public-only committed core; manual plain-text Location fallback; gated stretches; one complete Group updates plus Notifications package or deferral; invite-only access, Invitations, share links, uploads, representative management, ownership transfer, and Group deletion moved to Phase 3                     | Before-and-after decision table; final stretch outcomes and reasons, not tentative plans                                    |
| 8. Tests, CI, accessibility, and Railway      | Show how the release was checked and deployed               | Agreed Playwright and server application seams; four core browser journeys; domain and concurrency tests; critical and serious accessibility scan result; keyboard and responsive checks; CI release command; single Railway instance; deliberate runtime migration and seed; final smoke result                                               | Public-safe CI result, test summary, accessibility result, Railway deployment metadata, final commit and check date         |
| 9. Reflection and embedded screencast         | Close with lessons and show the working release             | Short reflection on scope control, server-owned rules, evidence planning, Railway SQLite constraints, one challenge and its resolution, one next Phase 3 step; embedded 95 to 110 second H.264 MP4 with voice-over or burned-in subtitles                                                                                                      | Embedded VIDEO-01 with poster frame, playback control, descriptive caption, duration, deployed commit, and capture date     |

## Screenshot and annotation plan

Use the final capture register in the matrix as the source list. The required annotated views are:

- desktop Discover and filtering;
- mobile Discover and navigation;
- Event details and mapped Location;
- Group details with owner, subscriber count, and follow state;
- Event publication;
- My activity;
- geocoding, subscriber-only Events, Group updates, or Notifications only when that stretch path ships.

Annotations should explain accepted behavior, not decorate the interface. Keep the clean source separate. Use short numbered callouts, readable contrast, and a caption that states the Railway commit and capture date. Do not hide a defect with a crop. The [matrix artifact conventions](acceptance-evidence.md#capture-and-artifact-conventions) define which files stay in the repository and which remain in the course Drive folder.

## Screencast plan

Target 95 to 110 seconds. Record after the slides, annotations, and video placeholder are complete.

| Time      | Scene                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00-0:12 | Open desktop Discover, show realistic seeded Events, ordering, and filters.                                                                                  |
| 0:12-0:22 | Combine filters, show the result count and URL state, then open Event details and the mapped Location.                                                       |
| 0:22-0:31 | Attempt a protected action as a visitor and show the sign-in or registration prompt and safe return.                                                         |
| 0:31-0:44 | Follow a Group, confirm the subscriber count, and record interest or registration.                                                                           |
| 0:44-0:54 | Open My activity and show the recorded state.                                                                                                                |
| 0:54-1:09 | Publish a public personal or Group Event and confirm it appears in Discover or My events.                                                                    |
| 1:09-1:19 | Show remaining or full capacity and a recoverable capacity outcome.                                                                                          |
| 1:19-1:31 | Switch to mobile Discover and complete one filter or navigation interaction.                                                                                 |
| 1:31-1:45 | Use this reserved segment for concise transitions, the ending frame, and only the stretch scenes that shipped. Keep the final edit within 95 to 110 seconds. |

Use voice-over or burned-in subtitles. Do not show Railway credentials, demonstration passwords, session values, or private browser data. Add stretch scenes only when their matrix row reaches `captured-final`. Export a compressed H.264 MP4, embed it directly in the desktop PowerPoint, and verify playback outside the authoring session.

## Reflection prompts

Keep the reflection concrete and tied to the delivered application:

- Which Phase 1 assumption changed, and what implementation evidence caused the change?
- Where did server-side authorization, validation, or atomic registration prevent a real failure?
- How did the committed-core gate protect the main journey from unfinished stretch work?
- What did responsive or accessibility checking change in the interface?
- What remains for Phase 3, and why is deferral safer than exposing partial behavior?

## Final submission checks

### PowerPoint file

- Name the file `Plata-Leonardo_92111978_DLBCSPJWD01_P2_S.pptx`.
- Keep the desktop PowerPoint file below 100 MB.
- Embed the compressed H.264 MP4. Do not submit a streaming link in place of the video.
- Verify video playback after closing and reopening the file, outside the authoring session.
- Confirm the deck contains no more than the nine added Phase 2 slides.
- Confirm all application screenshots come from the final Railway deployment and show their deployed commit and capture date in the matrix.
- Check image legibility, annotation contrast, captions, alternative text, spelling, and slide order.

### PebblePad

- Upload the final PPTX and wait for the upload to finish.
- Enter `https://github.com/RafyTime/campus-connect` in the public repository URL field.
- Add a concise implementation and reflection paragraph to any matching Phase 2 text field.
- Confirm the repository is public and opens in a signed-out browser session.
- Recheck the filename, file size, embedded-video playback, and all required fields before submission.
- Open the submitted artifact once from PebblePad when possible and confirm the uploaded version is the intended final file.

### Course Drive retention

- Keep full-resolution clean captures in `Phase 2/evidence/source/`.
- Keep editable and full-resolution annotated images in `Phase 2/evidence/annotated/`.
- Keep full test or Railway console exports in `Phase 2/evidence/checks/` when they are unsuitable for the public repository.
- Keep narration source and the H.264 MP4 in `Phase 2/submission/screencast/`.
- Keep the final PPTX in `Phase 2/submission/`.
