# Railway Deployment Handoff — Resolved Baseline

## Final state

The Railway deployment is healthy and publicly accessible. The service is deployed in **EU West**, sleeps after inactivity, resumes promptly, and has **Wait for CI** enabled.

The service uses a persistent volume mounted at `/data` with:

```text
DATABASE_URL=file:/data/campus-connect.db
```

`ORIGIN` is configured as the full public HTTPS Railway domain and `BETTER_AUTH_SECRET` is configured as a private Railway variable. Do not request, record, or commit their values.

## Resolved issues

- **Build could not open `/data/campus-connect.db`:** Railway volumes are unavailable during build, while SvelteKit evaluates imported modules during build analysis. `getDb()` and `getAuth()` now create cached singletons only at runtime, and the auth hook skips work while SvelteKit is building.
- **Better Auth base URL warning:** setting the production `ORIGIN` value fixes Better Auth's `baseURL` configuration.
- **Missing database tables:** the original scaffold migration was replaced with the auth-only baseline migration in [`drizzle/0000_auth_baseline.sql`](../../drizzle/0000_auth_baseline.sql), then applied from the running service console. Registration has been verified.

## Ongoing operating rule

For every future schema migration, commit it, deploy successfully, then run:

```sh
bun run db:migrate
```

from the running Railway service console. Do not run SQLite migrations during Railway build or pre-deploy; the `/data` volume is unavailable then.

The detailed current reference is [deployment.md](../deployment.md). The design rationale is in [the Railway/SvelteKit/SQLite lifecycle decision](../research/railway-sveltekit-sqlite-build-lifecycle.md).
