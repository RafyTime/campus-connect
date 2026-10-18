# Deployment and delivery

## Recorded deployment arrangement

The repository records a Railway service sourced from `main` in EU West, with a public domain and a persistent SQLite volume mounted at `/data`. Railway's Wait for CI setting gates deployment on GitHub Actions. The original auth-only migration was recorded as applied when this arrangement was documented.

This upgrade was verified only in isolated local checkouts. The live service, its feature inventory, configuration, and applied migrations were not inspected. SvelteKit 3 and the required build/runtime origin settings await a separately authorized release. [Ticket 01 evidence](evidence/toolchain-upgrade-01.md) records the migration; [ticket 02 evidence](evidence/toolchain-upgrade-02.md) records standalone Node verification.

## Continuous integration

The workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every push, pull requests targeting `main`, and manual dispatches. It uses the pinned official Vite+ setup action, Node `24.22.0` from `.node-version`, and Bun `1.4.3`. CI performs a frozen-lockfile install, then installs Chromium with `vp run test:install --with-deps`. It then runs `vp run quality`:

1. formatting and linting;
2. Svelte and TypeScript checks;
3. unit, browser-component, and end-to-end tests, plus the production Node-adapter build.

The CI environment uses non-production values solely so the application can build and test. Production secrets stay in Railway.

## Railway configuration

The recorded Railway commands are `bun run build` and `bun run start`. The build delegates to Vite+; the start script executes `node build/index.js` through SvelteKit's Node adapter. The release environment must provide the declared Node 24.22.0 and Bun 1.4.3 runtimes.

| Setting              | Production value / rule                                          |
| -------------------- | ---------------------------------------------------------------- |
| Source               | GitHub repository, `main` branch                                 |
| Region               | EU West                                                          |
| Wait for CI          | Enabled                                                          |
| Volume mount         | `/data`                                                          |
| `DATABASE_URL`       | `file:/data/campus-connect.db`                                   |
| `ORIGIN`             | The complete public HTTPS origin, identical at build and runtime |
| `BETTER_AUTH_SECRET` | A private, high-entropy value configured only in Railway         |

SvelteKit 3's Node adapter no longer reads `ORIGIN`. The Vite configuration loads it from the process environment or Vite's mode-specific env files into `sveltekit({ paths: { origin } })` at build time. Better Auth still requires `ORIGIN` at runtime for its explicit `baseURL`. Configure the same complete public origin, including the scheme and any nonstandard port, for both phases. Rebuild when the public origin changes. Changing only the running container's environment cannot update the origin compiled into the server.

Railway's HTTPS proxy can forward an internal HTTP request to Node. The explicit compiled `paths.origin` makes SvelteKit's CSRF checks use the public HTTPS origin, while Better Auth's explicit runtime base URL keeps authentication and cookies on that origin. This setup does not depend on adapter `ORIGIN`, `PROTOCOL_HEADER`, or `HOST_HEADER`, and does not opt into Better Auth's dynamic forwarded-host handling. Keep CSRF protection enabled with no wildcard trusted origins.

These instructions describe the release configuration. This toolchain migration does not apply Railway settings, deploy, access production data, or run production migrations. Default browser tests build and preview at `http://127.0.0.1:4173` using a disposable database. Explicit built Node verification uses `http://127.0.0.1:4183` and the same existing fixture without rebuilding. The README gives matching local startup examples; [ticket 02 evidence](evidence/toolchain-upgrade-02.md) provides the isolated unavailable-database verification commands.

Do not commit Railway secrets or a production database file. Do not configure restrictive Railway watch paths for this single-service repository: migrations, dependency changes, configuration, and static assets can all require a deployment, not just `src/` changes.

## Why database setup is lazy

Railway volumes are mounted only when the service runs, while SvelteKit evaluates server modules during the build. The database and Better Auth instances are therefore created lazily at runtime through `getDb()` and `getAuth()`, and the auth hook does nothing while SvelteKit is building.

This is required for the real persistent SQLite database to work. Do not replace it with an in-memory build database, a separate SQLite service, or a Railway-only build-command override. See [the lifecycle decision record](research/railway-sveltekit-sqlite-build-lifecycle.md).

## Release checks requiring separate authorization

Before releasing, review Railway's build and runtime variables together. Set `ORIGIN` to the same complete public HTTPS origin in both phases and retain the runtime `DATABASE_URL=file:/data/campus-connect.db` and private `BETTER_AUTH_SECRET`. Preserve Wait for CI and the existing source/volume settings. Rebuild after any public-origin change.

After the authorized deployment, verify public Event and Group pages, registration/sign-in, refresh persistence, and an authenticated create/edit flow using an appropriate release account. Confirm redirects stay on the public HTTPS origin, authentication cookies have `Secure`, `HttpOnly`, and the expected SameSite policy, same-origin forms succeed, and a mismatched Origin receives 403. Inspect service logs for runtime database errors. Local HTTP checks cannot establish Railway TLS or secure-cookie behavior.

Check the actual applied migration journal before any separately authorized production migration. Do not infer its contents from the historical auth-only note. This toolchain upgrade introduces no migrations.

## Production migration procedure

For each separately authorized future schema change:

1. Update the Drizzle schema and generate a committed migration with `bun run db:generate`.
2. Verify the migration against a fresh local SQLite database and run the quality checks.
3. Commit and push the migration. Wait for CI and the Railway deployment to complete.
4. Open the running Railway service's interactive console and run:

   ```sh
   bun run db:migrate
   ```

5. Verify the affected feature and Railway logs.

Drizzle records applied migrations in the database, so rerunning `bun run db:migrate` is safe when there are no new migrations. Never use `db:push` against production: production changes must be represented by reviewed, committed migration files.

Do not use a Railway build or pre-deploy command for SQLite migrations because the attached `/data` volume is unavailable in those phases.

## Operating notes

- To inspect production data visually, download a copy of the SQLite file and run `bun run db:studio` locally against that copy. Do not expose Drizzle Studio from the Railway service.
- Before enabling uploads, implement the planned media-storage abstraction and configure a Railway Storage Bucket. Store metadata and storage keys in SQLite, never media BLOBs.
- Railway has one volume per service and deployments using a volume can incur a short restart. Keep the database file on the mounted volume and validate the application after each schema migration.
