# Issue tracker: local Markdown

Issues and specs for this repo live under `docs/work/`.

## Conventions

- Each feature has a directory at `docs/work/<feature-slug>/`.
- Its specification is `docs/work/<feature-slug>/spec.md`.
- Tickets are separate files under `docs/work/<feature-slug>/issues/`.
- Issue filenames use dependency order: `00-<slug>.md`, `01-<slug>.md`, and so on.
- Each issue has a `Status:` field near the top.
- Discussion is appended under a `## Comments` heading.
- Requirements completed outside the repository workflow must be stated in the issue body.

## Publishing to the issue tracker

When a skill says to publish a spec, create `docs/work/<feature-slug>/spec.md`.

When a skill says to publish tickets, create one file per ticket under `docs/work/<feature-slug>/issues/`.

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

## Larger efforts

A larger effort may include `docs/work/<feature-slug>/map.md`.

Child tickets still live under the effort's `issues/` directory. A `Blocked by:` field lists ticket numbers that must be resolved first.
