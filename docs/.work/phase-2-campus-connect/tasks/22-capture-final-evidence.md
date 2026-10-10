# 22: Capture final application and test evidence

**What to build:** Capture the final evidence set from the released revision. The evidence matrix must point to clean screenshots, test and CI results, Railway checks, and the exact scenes needed to assemble the presentation and screencast.

**Blocked by:** 21: Finalize the release and repository documentation.

**Status:** ready

## Acceptance criteria

- [ ] All application screenshots come from the final Railway deployment and record its commit and capture date.
- [ ] Clean source screenshots cover desktop Discover, mobile Discover, Event details and map, Group details, public Event publication, and My activity.
- [ ] Shipped stretch paths add only the screenshots and production evidence relevant to their delivered behavior.
- [ ] Screenshots contain realistic seeded content, no credentials or personal secrets, no broken images, and no browser or application error overlays.
- [ ] Test evidence identifies successful formatting, linting, Svelte and TypeScript checks, automated tests, accessibility checks, production build, and CI for the final revision.
- [ ] Railway evidence records the final deployment, migration, seed, and smoke-check outcomes without exposing secrets.
- [ ] The repository contains the evidence plan and selected optimized screenshots; full-resolution captures remain in the course Drive folder.
- [ ] The acceptance-to-evidence matrix has no unexplained missing committed-core evidence and records shipped or deferred outcomes for all stretch paths.
- [ ] The screencast scene list identifies the exact final application states and accounts needed without recording credentials.

## Implementation tasks

- [ ] Run the final release command and link its result and the corresponding CI run from the acceptance-to-evidence matrix.
- [ ] Add selected optimized screenshots to the repository and verify their legibility, attribution, and absence of sensitive data.
- [ ] Complete the matrix with final artifact locations, production outcomes, capture dates, and the deployed commit.
- [ ] Record any waived evidence item and its reason in the owning ticket Comments and the matrix.

## Project delivery

- [ ] In the final Railway application, capture clean desktop and responsive screenshots for every required core scene; store full-resolution files in the course Drive folder as proof.
- [ ] In the final Railway application, capture any additional scene required by a shipped stretch path and record it in that path's matrix entries.
- [ ] In GitHub Actions and the Railway console, capture the final CI, deployment, migration, seed, and smoke-check evidence; store the source captures in the course Drive folder without secrets.
- [ ] In the course Drive folder, organize the full-resolution images and production evidence so each file matches an acceptance-to-evidence matrix entry.

## Comments
