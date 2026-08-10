# Railway, SvelteKit, and SQLite build lifecycle

**Decision:** retain SQLite on the Railway volume mounted at `/data` and defer creation of the libSQL/Drizzle/Better Auth objects until runtime. Do not add a build-time database, a second SQLite service, or a Railway-specific build-command override.

## What is normal, and what failed here

SQLite on a service-attached Railway volume is a supported, ordinary deployment shape. Railway describes volumes as persistent storage for services and identifies a SQLite database as a good fit for a volume ([Railway volumes](https://docs.railway.com/volumes), [Railway storage guidance](https://docs.railway.com/guides/running-agents-on-railway)). With `/data` mounted, `DATABASE_URL=file:/data/campus-connect.db` is the correct runtime configuration.

The initial deployment did not fail because the volume was missing or misconfigured. It failed because the app opened that SQLite file **while its modules were being imported during `bun run build`**:

1. Railway mounts a volume only when the service container starts, not at build time. It is also unavailable to a pre-deploy command ([Railway volume availability](https://docs.railway.com/volumes#volume-availability)). No service, build, deploy, or volume setting can make `/data` available to the build image.
2. SvelteKit analyses the app during `build` by running it; its `building` flag is `true` during this analysis ([`$app/environment`](https://svelte.dev/docs/kit/%24app-environment#building)).
3. The original module-level `createClient({ url: env.DATABASE_URL })` therefore tried to open `/data/campus-connect.db` during analysis, before Railway had mounted `/data`.

An empty SvelteKit project (and Railway's standard SvelteKit guide) does not hit this issue because it has no server import that opens a local database file during build. Likewise, Better Auth's normal SvelteKit example exports an eager `auth` instance; that is fine when its database is available at module evaluation time, but it is not a guarantee that an attached file volume will be present during a build ([Better Auth's SvelteKit integration](https://better-auth.com/docs/integrations/svelte-kit)).

## Clean solution for Campus Connect

`getDb()` and `getAuth()` each cache a singleton but create it only on their first runtime use. The hook returns immediately while `building` is true. Consequently:

- importing server modules during SvelteKit's build has no filesystem side effect;
- the first real request runs after Railway has mounted `/data`, so it uses the persistent production database;
- the application still has one libSQL client and one Better Auth instance per Node process, not one per request;
- local development continues to use the local `DATABASE_URL` unchanged.

This is lifecycle-safe dependency initialization, not an in-memory or temporary-database workaround. It is also portable: the same code works on Railway and on any platform where build and runtime have different filesystems or credentials.

## Alternatives considered

| Option                                                       | Result                               | Why not chosen                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Change Railway volume/build/deploy settings                  | Cannot work                          | Railway explicitly does not mount volumes during build or pre-deploy.                                                     |
| Override the build command with `DATABASE_URL=file:/tmp/...` | Can make this build pass             | It hides an import-time side effect behind Railway-only configuration and uses a different, empty database at build time. |
| Use an in-memory build database                              | Can make this build pass             | Same lifecycle mismatch, with an unnecessary fake database.                                                               |
| Create a separate SQLite/libSQL service                      | Changes the architecture             | It adds a networked database service and does not make import-time connections during a SvelteKit build a sound pattern.  |
| Defer DB/auth initialization until runtime                   | Works with the real `/data` database | Small, platform-neutral, and aligned with both documented lifecycles.                                                     |

## Migration implication

Database migration must also occur after the service starts, because Railway makes the volume available then, not at build or pre-deploy time. When migrations are added, make them an explicit runtime-start step (with an idempotent migration strategy) before accepting traffic; do not run them in `bun run build` or a Railway pre-deploy command.

## Source links

- [Railway: Using Volumes](https://docs.railway.com/volumes)
- [Railway: Volume availability](https://docs.railway.com/volumes#volume-availability)
- [Railway: Deploy a SvelteKit App](https://docs.railway.com/guides/sveltekit)
- [SvelteKit: `$app/environment` and `building`](https://svelte.dev/docs/kit/%24app-environment#building)
- [SvelteKit: Node adapter](https://svelte.dev/docs/kit/adapter-node)
- [Better Auth: SvelteKit integration](https://better-auth.com/docs/integrations/svelte-kit)
- [Drizzle: SQLite with libSQL](https://orm.drizzle.team/docs/get-started/sqlite-new)
