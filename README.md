# Campus Connect

Campus Connect is an IU **Project: Java & Web Development** course project: an unofficial, event-first web application for IU Campus Bad Honnef. It brings campus events and group updates into one responsive place.

Phase 1 is complete and approved. The tutor confirmed that the concept meets the phase requirements and that development may continue. The agreed scope and architecture are recorded in [the Phase 1 conception document](docs/phase-1/conception-phase.md).

## Current status

The repository implements the Phase 2 development baseline:

- SvelteKit 3/Svelte 5, TypeScript, Tailwind CSS, and shadcn-svelte are configured.
- Better Auth provides the initial email/password authentication foundation.
- Drizzle ORM and SQLite include Better Auth tables plus public personal Event records.
- Visitors can browse seeded public personal Events on Discover and open Event details without an account.
- GitHub Actions runs the quality checks on every push and on pull requests to `main`.
- The recorded Railway arrangement deploys `main` after CI and mounts `/data` for SQLite.

Accounts, Groups, personal and Group Event authoring, Group subscriptions, and Event filtering are implemented. Event participation remains a later Phase 2 ticket.

The SvelteKit 3 upgrade is verified locally and awaits a separately authorized release. This page does not describe a verified inventory of the live service. See [the upgrade evidence](docs/evidence/toolchain-upgrade-02.md).

## Stack

SvelteKit with the Node adapter, Svelte 5, TypeScript, Tailwind CSS, shadcn-svelte, Better Auth, Drizzle ORM, SQLite/libSQL, Bun, Vite+ (Oxlint, Oxfmt, and Vitest), Playwright, GitHub Actions, and Railway.

## Local setup

Install the [global Vite+ CLI](https://viteplus.dev/guide/global-cli) with its environment management enabled and open a new terminal. Vite+ selects Node.js 24.22.0 from `.node-version` and Bun 1.4.3 from `package.json`. Run `vp env current` to check both selections. Bun manages dependencies and runs the existing database utilities; the deployed application uses Node.

```powershell
vp install --frozen-lockfile
Copy-Item .env.example .env
vp run db:migrate
vp run db:seed
vp dev
```

Replace the example `BETTER_AUTH_SECRET` in `.env` before using authentication. Keep `.env` out of version control.

Use the global `vp` command for the workflow below. It selects the declared environment and delegates project tooling to the pinned local Vite+ 1.0.0 package.

| Operation                                          | Command                                    |
| -------------------------------------------------- | ------------------------------------------ |
| Install the committed dependencies                 | `vp install --frozen-lockfile`             |
| Add or remove a dependency                         | `vp add <package>` / `vp remove <package>` |
| Update dependencies and the lockfile intentionally | `vp update`                                |
| Start development                                  | `vp dev`                                   |
| Build the Node application                         | `vp build`                                 |
| Preview the build locally                          | `vp preview`                               |
| Format files                                       | `vp fmt .`                                 |
| Run Oxlint                                         | `vp lint .`                                |
| Run unit and browser-component tests               | `vp test --run`                            |
| Run the complete acceptance gate                   | `vp run quality`                           |

Commit dependency and lockfile changes together. `vp preview` is a local preview; `vp run start` runs the built Node adapter server.

SvelteKit 3 reads `ORIGIN` into `paths.origin` when Vite loads its configuration. Better Auth reads the same value at runtime. Keep the build and server values identical to the browser's complete origin, including its port. Vite loads `.env` and the selected mode's env files, with process environment values taking precedence. The development example uses `http://localhost:5173`.

For a local production preview in PowerShell, set the preview origin before building and keep it set while preview runs:

```powershell
$env:ORIGIN = 'http://127.0.0.1:4173'
vp build
vp preview --host 127.0.0.1
```

To run the actual built Node server in PowerShell, first migrate and seed the local database as above, then run:

```powershell
$env:ORIGIN = 'http://127.0.0.1:4183'
vp build
$env:HOST = '127.0.0.1'
$env:PORT = '4183'
vp env exec node --env-file=.env build/index.js
```

Node does not automatically load `.env`. The explicit `--env-file` supplies `DATABASE_URL` and your `BETTER_AUTH_SECRET`; the exported `ORIGIN` takes precedence over the file. `vp run start` instead expects all runtime values already exported by the shell or hosting platform. Rebuild after changing the public origin. After stopping the local server, restore `ORIGIN` to `http://localhost:5173` before returning to `vp dev`.

The Node adapter no longer consumes its former `ORIGIN` setting. The application deliberately retains `ORIGIN` for both the build configuration and Better Auth. CSRF protection remains enabled without cross-origin exceptions. See [deployment.md](docs/deployment.md) before preparing a release.

Run custom package tasks with `vp run <name>`, such as `vp run test:install`. `vp run check` runs Svelte/type checking. `vp run lint` checks formatting, Oxlint, and Svelte-aware ESLint template rules. `vp run test` includes unit, browser-component, and end-to-end tests; `vp run test:e2e` runs the end-to-end suite alone. Built-ins such as `vp check`, `vp lint`, and `vp test` do not invoke these custom tasks. Use `vp run quality` for acceptance.

## Quality checks

```sh
vp run test:install # one-time Chromium download
vp run quality
```

The quality command checks formatting, linting, Svelte and TypeScript, runs the automated tests, and creates a production build. Browser tests create a disposable database. Run the gate in an isolated checkout when its build or preview would conflict with another local session. GitHub Actions uses the exact official `setup-vp@v1.21.2` integration, reads the same Node and Bun pins, installs from the frozen lockfile, installs Chromium with system dependencies, and runs `vp run quality` for every push, pull requests targeting `main`, and manual dispatch. CI does not cache project task results.

Vite+ tooling settings live in `vite.config.ts`. Svelte type checking still uses `svelte-check`, and ESLint checks Svelte files because Oxlint does not enforce their template rules. The `vite` alias and Vitest override keep framework and test-helper dependencies on the same toolchain. Library imports use the `#lib` Node subpath mappings in `package.json` with explicit file extensions. `components.json` uses the same aliases for component generation. The TypeScript config extends `$app/tsconfig` and explicitly includes application, Vite, Drizzle, and Playwright sources.

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
