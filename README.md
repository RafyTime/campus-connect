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

SvelteKit with the Node adapter, Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, Better Auth, Drizzle ORM, SQLite/libSQL, Bun, Vite+ (Oxlint, Oxfmt, and Vitest), Playwright, GitHub Actions, and Railway.

## Local setup

Prerequisites: the [global Vite+ CLI](https://viteplus.dev/guide/global-cli), Bun 1.4.3, and Node.js 24.19.0 or a newer supported Vite+ runtime. Vite+ can manage the Bun and Node installations. `vp install` uses the Bun version pinned in `package.json`.

```sh
vp install
Copy-Item .env.example .env
vp run db:migrate
vp run db:seed
vp dev
```

Replace the example `BETTER_AUTH_SECRET` in `.env` before using authentication. Keep `.env` out of version control.

Use the global `vp` command for built-ins such as `vp dev`, `vp build`, `vp preview`, and `vp test`. Without the global CLI, use `bunx --no-install vp` instead of `vp`.

Run package scripts with `vp run <name>` or its shorthand `vpr <name>`, such as `vp run quality` or `vp run test:install`. `vp run check` runs our Svelte checks; `vp run lint` includes Svelte template linting; `vp run test` includes both unit and end-to-end tests. The built-in `vp check`, `vp lint`, and `vp test` do not run those package scripts. `bun run <name>` also remains supported.

## Quality checks

```sh
vp run test:install # one-time Chromium download
vp run quality
```

The quality command checks formatting, linting, Svelte and TypeScript, runs the automated tests, and creates a production build. GitHub Actions runs the same command for every push and for pull requests targeting `main`.

Vite+ tooling settings live in `vite.config.ts`. Svelte type checking still uses `svelte-check`, and ESLint checks Svelte files because Oxlint does not enforce their template rules. The `vite` alias and Vitest override keep framework and test-helper dependencies on the same toolchain.

## Database

```sh
vp run db:generate # generate migration after schema change
vp run db:migrate  # apply committed migrations to database
vp run db:seed     # idempotent seed of Tags, Locations, and public personal Events
vp run db:studio   # visually inspect local database
```

The committed migrations create Better Auth's `user`, `session`, `account`, and `verification` tables plus the public personal Event records (`post`, `event`, `tag`, `event_tag`, and `location`). Seed uses stable identifiers and can be re-run safely.

If `vp run db:migrate` reports that a table already exists, this SQLite file was created before tracked migrations (for example by an earlier `db:push`). Delete or rename `local.db` and run `vp run db:migrate` again. Local SQLite is disposable; tests do not use this file.

For production SQLite, first deploy the committed migration, then run `bun run db:migrate` once from the Railway service console. Run `bun run db:seed` from the same runtime when demonstration content is required. The `/data` volume is available only at runtime, so do not migrate in Railway's build or pre-deploy phase. See [deployment.md](docs/deployment.md) for the full process.
