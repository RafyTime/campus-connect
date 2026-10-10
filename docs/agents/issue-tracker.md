# Issue tracker: local Markdown

Issues and specs for this repo live under `docs/.work/`.

## Conventions

- Each feature has a directory at `docs/.work/<feature-slug>/`.
- New specifications use `docs/.work/<feature-slug>/spec.md`. Reuse an existing specification as described below.
- Tickets are separate files under `docs/.work/<feature-slug>/tasks/`.
- Issue filenames use dependency order: `00-<slug>.md`, `01-<slug>.md`, and so on.
- Each issue has a `Status:` field near the top.
- Discussion is appended under a `## Comments` heading.
- Requirements completed outside the repository workflow must be stated in the issue body.

## Publishing to the issue tracker

When a skill says to publish a spec, first inspect the feature directory for an existing `spec.md` or `*.spec.md`. Reuse the existing specification. If more than one exists, follow an explicit reference from the user or feature documents; ask which is authoritative when those references do not settle it. Create `docs/.work/<feature-slug>/spec.md` only when no specification exists.

The Phase 2 feature uses `docs/.work/phase-2-campus-connect/phase-2.spec.md`.

When a skill says to publish tickets, create one file per ticket under `docs/.work/<feature-slug>/tasks/`.

## Ticket template

```md
# <NN>: <Ticket title>

**What to build:** <The complete behavior this ticket delivers.>

**Blocked by:** <Blocking ticket numbers and titles, or "None (can start immediately).">

**Status:** ready

## Acceptance criteria

- [ ] <Observable completion criterion>

## Implementation tasks

- [ ] <Code, tests, migrations, repository documentation, or automated checks>

## Project delivery

- [ ] <Work location, action, and the artifact or evidence that proves completion>

## Comments
```

`Implementation tasks` and `Project delivery` are optional. Omit either heading when the ticket has no work of that kind. Keep acceptance criteria and comments in every ticket.

Implementation tasks cover repository work such as code, tests, migrations, documentation, and automated checks.

Project delivery covers work in the deployed application, Railway console, desktop PowerPoint, course Drive folder, or PebblePad. Describe the work location and the artifact or evidence that proves completion.

Describe tasks by their work and proof, not by assignee. Set `Status` to `completed` only when every checklist item in the required sections is complete or explicitly waived. Record the reason for any waiver under `Comments`.

A blocking ticket is resolved when its `Status` is `completed` or `wontfix`.

## Fetching a ticket

Read the referenced Markdown file. A user may identify it by path, feature slug, or its numbered filename.

## Wayfinding operations

Wayfinder plans decisions for a larger effort. Its decision tasks use these conventions; implementation tickets keep the template and statuses above.

- **Map:** `docs/.work/<feature-slug>/map.md`, with the Destination, Notes, Decisions so far, Not yet specified, and Out of scope sections defined by the Wayfinder skill.
- **Child task:** `docs/.work/<feature-slug>/tasks/<NN>-<slug>.md`, numbered from `00`. Use the next unused number in the feature's tasks directory. The body states the decision under `## Question`.
- **Type:** A `Type:` field records `research`, `prototype`, `grilling`, or `task`. This field identifies Wayfinder decision tasks. Their `Status:` is `open`, `claimed`, or `resolved`; they do not use triage states.
- **Blocking:** A `Blocked by:` field lists task numbers or says `None`. A blocking decision task is resolved when its status is `resolved`; a blocking implementation ticket is resolved when its status is `completed` or `wontfix`.
- **Frontier:** Scan the feature's `tasks/` directory for decision tasks with `Status: open` whose blockers are all resolved. Choose the lowest numbered eligible task.
- **Claim:** Set `Status: claimed` and save before starting work, so other sessions skip the task.
- **Resolve:** Append the answer under `## Answer`, set `Status: resolved`, and add a one-line gist linked by task title to the map's Decisions so far section. Link any supporting artifacts from the answer.
- **Out of scope:** Record the reason under `## Answer`, set `Status: resolved`, and link the task by title from the map's Out of scope section.
