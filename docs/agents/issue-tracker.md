# Issue tracker: local Markdown

Issues and specs for this repo live under `docs/work/`.

## Conventions

- Each feature has a directory at `docs/work/<feature-slug>/`.
- Its specification is `docs/work/<feature-slug>/spec.md`.
- Implementation issues are separate files under `docs/work/<feature-slug>/issues/`.
- Issue filenames use dependency order: `01-<slug>.md`, `02-<slug>.md`, and so on.
- Each issue has a `Status:` field near the top.
- Discussion is appended under a `## Comments` heading.
- Requirements that need manual work must be stated in the issue body. The ready status does not distinguish between human and agent implementation.

## Publishing to the issue tracker

When a skill says to publish a spec, create `docs/work/<feature-slug>/spec.md`.

When a skill says to publish tickets, create one file per ticket under `docs/work/<feature-slug>/issues/`.

## Fetching a ticket

Read the referenced Markdown file. A user may identify it by path, feature slug, or its numbered filename.

## Larger efforts

A larger effort may include `docs/work/<feature-slug>/map.md`.

Child tickets still live under the effort's `issues/` directory. A `Blocked by:` field lists ticket numbers that must be resolved first.
