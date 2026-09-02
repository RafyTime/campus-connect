# Campus Connect

Campus Connect is an IU **Project: Java & Web Development** course project: an unofficial, event-first web application for IU Campus Bad Honnef. It brings campus events and group updates into one responsive place.

Phase 1 is complete and approved. The tutor confirmed that the concept meets the phase requirements and that development may continue. The agreed scope and architecture are recorded in [the Phase 1 conception document](docs/phase-1/conception-phase.md).

## Current status

The Phase 2 development baseline is complete and deployed to Railway:

- SvelteKit/Svelte 5, TypeScript, Tailwind CSS, and shadcn-svelte are configured.
- Better Auth provides the initial email/password authentication foundation.
- Drizzle ORM and SQLite include Better Auth tables plus public personal Event records.
- Visitors can browse seeded public personal Events on Discover and open Event details without an account.
- GitHub Actions runs the quality checks on every push and on pull requests to `main`.
- Railway deploys the `main` branch after CI, with a persistent `/data` volume for SQLite.

Groups, accounts, participation, and creator publishing are still later Phase 2 tickets.

## Stack

SvelteKit with the Node adapter, Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, Better Auth, Drizzle ORM, SQLite/libSQL, Bun, ESLint, Prettier, Vitest, Playwright, GitHub Actions, and Railway.

## Local setup

Prerequisite: [Bun](https://bun.sh/) 1.3.14 or later.

```sh
bun install
Copy-Item .env.example .env
bun run db:migrate
bun run db:seed
bun run dev
```

Replace the example `BETTER_AUTH_SECRET` in `.env` before using authentication. Keep `.env` out of version control.

## Quality checks

```sh
bun run test:install # one-time Chromium download
bun run quality
```

The quality command checks formatting, linting, Svelte and TypeScript, runs the automated tests, and creates a production build. GitHub Actions runs the same command for every push and for pull requests targeting `main`.

## Database

```sh
bun run db:generate # generate migration after schema change
bun run db:migrate  # apply committed migrations to database
bun run db:seed     # idempotent seed of Tags, Locations, and public personal Events
bun run db:studio   # visually inspect local database
```

The committed migrations create Better Auth's `user`, `session`, `account`, and `verification` tables plus the public personal Event records (`post`, `event`, `tag`, `event_tag`, and `location`). Seed uses stable identifiers and can be re-run safely.

If `bun run db:migrate` reports that a table already exists, this SQLite file was created before tracked migrations (for example by an earlier `db:push`). Delete or rename `local.db` and run `db:migrate` again. Local SQLite is disposable; tests do not use this file.

For production SQLite, first deploy the committed migration, then run `bun run db:migrate` once from the Railway service console. Run `bun run db:seed` from the same runtime when demonstration content is required. The `/data` volume is available only at runtime, so do not migrate in Railway's build or pre-deploy phase. See [deployment.md](docs/deployment.md) for the full process.
