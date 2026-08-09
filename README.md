# Campus Connect

Campus Connect is an IU Project: Java & Web Development course project. Phase 1 conception docs can be foubnd under [docs/phase-1](docs/phase-1-conception.md). Tutor feedback on the submitted conception work is pending.

## Stack

SvelteKit, TypeScript, Tailwind CSS, Drizzle ORM with SQLite, Better Auth, and Bun.

## Local setup

Prerequisites: [Bun](https://bun.sh/) 1.3.14 or later.

```sh
bun install
Copy-Item .env.example .env
bun run db:migrate
bun run dev
```

Fill in `BETTER_AUTH_SECRET` in `.env` before using authentication. Keep `.env` out of version control.

## Quality checks

```sh
bun run check
bun run lint
bun run test:install # one-time Chromium download
bun run test
```

The GitHub Actions workflow runs these checks for pull requests and every push.

## Database

```sh
bun run db:generate # create migrations after schema changes
bun run db:migrate  # apply migrations
bun run db:studio   # inspect local data
```

## Repository notes

Bun is used for dependency management and scripts instead of node. Deployment preparation and Railway delivery instructions are in [docs/deployment.md](docs/deployment.md). A Railway project, production secrets, persistent volume, and media storage are intentionally not configured yet.
