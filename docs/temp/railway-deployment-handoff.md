# Railway Deployment Handoff

## Purpose of the next session

Diagnose the runtime crash of the first Railway deployment of Campus Connect, then make the smallest verified fix. The user will provide Railway deployment logs in the next session.

## Current deployment state

- Railway account, project, and GitHub repository connection have been created by the user.
- Deployment region is **EU West**.
- Railway **Wait for CI** is enabled.
- The user reported adding `DATABASE_URL` and `BETTER_AUTH_SECRET` as Railway service variables. Never request or record their values.
- The intended production SQLite location is `file:/data/campus-connect.db`, with a Railway persistent volume mounted at `/data`.
- The latest pushed commit, `810ab34`, built successfully on Railway after the prior build failure was fixed, but the deployment then crashed at runtime. No crash log has yet been captured in this conversation.

## What was already diagnosed and fixed

The original Railway build failed with:

```text
ConnectionFailed("Unable to open connection to local database /data/campus-connect.db: 14")
```

Cause: Railway volumes are unavailable during build, while SvelteKit runs imported server modules during build analysis. The scaffold eagerly created a libSQL client during module import.

Fix included in commit `810ab34`:

- [`src/lib/server/db/index.ts`](../../src/lib/server/db/index.ts) now creates and caches the Drizzle/libSQL client through `getDb()` only on first runtime use.
- [`src/lib/server/auth.ts`](../../src/lib/server/auth.ts) now creates and caches Better Auth through `getAuth()` only on first runtime use.
- [`src/hooks.server.ts`](../../src/hooks.server.ts) skips Better Auth while SvelteKit is building.
- Better Auth demo route actions now call `getAuth()` at request time.
- [`src/lib/server/db/index.spec.ts`](../../src/lib/server/db/index.spec.ts) prevents a return to import-time database initialization.

Validation already completed before the push:

- Regression test first failed with the exact missing-volume error, then passed after the change.
- `bun run build` passed even with `DATABASE_URL=file:/nonexistent-volume/campus-connect.db`.
- `bun run lint`, `bun run check`, and `bun run test` all passed.

The evidence and architecture decision are recorded in [`docs/research/railway-sveltekit-sqlite-build-lifecycle.md`](../research/railway-sveltekit-sqlite-build-lifecycle.md). Do not replace the lazy initialization with an in-memory build database, a Railway-only build-command override, or a separate SQLite service.

## Most likely next issue, but do not assume

The mounted production SQLite file begins empty. Better Auth tables and the existing Drizzle migrations have not yet been confirmed as applied on Railway. This may cause a runtime error such as a missing SQLite table once authentication performs its first query.

However, diagnose from the actual Railway crash log before changing code or Railway settings. Confirm, at minimum:

1. the first error and stack trace after the process starts;
2. whether `ORIGIN` is set to the generated public `https://` Railway domain;
3. that the volume is attached to the application service at `/data`; and
4. whether the error occurs before or after the first request.

Do not ask the user to paste secret values. Redact any secrets from logs.

## Expected next implementation area

If the logs confirm an uninitialised SQLite schema, add an explicit, idempotent runtime migration strategy. Railway volumes are not available during build or pre-deploy, so migrations must not run in either phase. Decide and test the runtime-start mechanism before changing Railway's start command.

## Repository context

- GitHub repository: `https://github.com/RafyTime/campus-connect`
- The user has committed and pushed the lazy initialization fix. Do not commit or push further changes unless explicitly asked.
- The working tree contains user-managed documentation reorganisations and uncommitted deployment/research documents. Preserve them:
  - `README.md` modified
  - `docs/phase-1-conception.md` deleted and replaced by `docs/phase-1/conception-phase.md`
  - `docs/temp/phase-1-handoff.md` modified
  - `docs/deployment.md`, `docs/phase-1/`, and `docs/research/` untracked

## Suggested skills

- `diagnosing-bugs` — build a tight reproduction from the redacted Railway crash log before changing deployment code.
- `research` — only if the exact runtime error requires an up-to-date Railway, Better Auth, Drizzle, or libSQL behaviour check.
- `tdd` — if adding the runtime migration mechanism, write a focused regression/integration test first.
