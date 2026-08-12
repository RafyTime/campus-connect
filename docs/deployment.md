# Deployment and delivery

## Current state

Campus Connect is deployed from the `main` branch to Railway in **EU West**. The service has a Railway public domain, resumes promptly after inactivity, and uses a persistent volume mounted at `/data` for its SQLite database.

GitHub Actions CI is enabled and Railway's **Wait for CI** setting prevents an automatic deployment until the relevant CI run succeeds. The initial auth-only Drizzle migration has been applied to the production database.

The application remains a development skeleton; media-bucket integration and Campus Connect domain features are not deployed yet.

## Continuous integration

The workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every push, pull requests targeting `main`, and manual dispatches. It uses Bun `1.3.14` to run:

1. formatting and linting;
2. Svelte and TypeScript checks;
3. Chromium installation for Playwright; and
4. unit and end-to-end tests.

The CI environment uses non-production values solely so the application can build and test. Production secrets stay in Railway.

## Railway configuration

The deployed service uses SvelteKit's Node adapter. Railway builds with `bun run build` and starts the app with `bun run start`.

| Setting              | Production value / rule                                  |
| -------------------- | -------------------------------------------------------- |
| Source               | GitHub repository, `main` branch                         |
| Region               | EU West                                                  |
| Wait for CI          | Enabled                                                  |
| Volume mount         | `/data`                                                  |
| `DATABASE_URL`       | `file:/data/campus-connect.db`                           |
| `ORIGIN`             | The complete public HTTPS application URL                |
| `BETTER_AUTH_SECRET` | A private, high-entropy value configured only in Railway |

Do not commit Railway secrets or a production database file. Do not configure restrictive Railway watch paths for this single-service repository: migrations, dependency changes, configuration, and static assets can all require a deployment, not just `src/` changes.

## Why database setup is lazy

Railway volumes are mounted only when the service runs, while SvelteKit evaluates server modules during the build. The database and Better Auth instances are therefore created lazily at runtime through `getDb()` and `getAuth()`, and the auth hook does nothing while SvelteKit is building.

This is required for the real persistent SQLite database to work. Do not replace it with an in-memory build database, a separate SQLite service, or a Railway-only build-command override. See [the lifecycle decision record](research/railway-sveltekit-sqlite-build-lifecycle.md).

## Production migration procedure

The initial auth-only migration is already applied to production. For each future schema change:

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
