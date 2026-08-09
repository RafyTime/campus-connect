# Deployment and delivery

## Continuous integration

GitHub Actions runs the **Continuous integration** workflow for pull requests targeting `main`, every push to `main`, and manual runs. It uses Bun `1.3.14` to run formatting/linting, Svelte/TypeScript checking, unit tests, and Playwright end-to-end tests.

The workflow is defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Continuous delivery to Railway

The repository is ready for Railway’s GitHub integration:

1. Create a Railway project and service, then connect this GitHub repository.
2. Set the deployed branch to `main`.
3. In the service’s GitHub deployment settings, enable **Wait for CI** so Railway deploys only after the GitHub Actions workflow succeeds.
4. Create a persistent volume and mount it at `/data` before using production SQLite. Set `DATABASE_URL` to a file on that volume, for example `file:/data/campus-connect.db`.
5. Set the production `BETTER_AUTH_SECRET` and `ORIGIN` in Railway. Do not commit them to the repository.
6. Generate a public domain once the first deployment is healthy, then set `ORIGIN` to its full HTTPS URL and redeploy.

The application uses SvelteKit’s Node adapter. Railway builds it with `bun run build` and runs it with `bun run start`.

## First-production checklist

- Confirm the persistent-volume mount and SQLite file location.
- Generate a new high-entropy Better Auth secret for Railway.
- Configure the production media-storage adapter and its credentials before enabling uploads.
- Confirm that all deployed environment variables are set in Railway, not in version control.
- Verify the Railway deployment and its public URL after a successful CI run.
