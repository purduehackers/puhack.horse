# phack.rs

One Bun package: an Elysia API, plain HTML dashboard, Eden CLI, and thin Eden library. Links and Better Auth data live in Turso through Drizzle. Each entity has its own schema file in `src/db/schema/`; generated SQL and metadata live in `migrations/`.

## Run

```sh
bun install
cp .env.example .env
# Fill in Better Auth secret and ID application credentials.
bunx --bun drizzle-kit migrate
bun run dev
```

Use a random secret of at least 32 characters for `BETTER_AUTH_SECRET`. Local development uses `file:local.db`; production uses a Turso database URL and auth token. Generate schema changes with `bunx --bun drizzle-kit generate` and apply them with `bunx --bun drizzle-kit migrate`. Migrations run explicitly, never during application startup or preview builds.

Register an application at [Purdue Hackers ID](https://id.purduehackers.com) with scopes `openid profile email roles offline_access` and callback `http://localhost:3000/api/auth/callback/purduehackers` for development, or `https://phack.rs/api/auth/callback/purduehackers` for production. Set its client ID and, for a confidential client, client secret. `BETTER_AUTH_URL` is the canonical application origin. Dashboard requests on other hostnames redirect there; public short links continue working on every alias.

Open `/dashboard` and sign in with ID. Search, copy, create, edit, and delete links; view counts retain their history when a destination changes. Only users with the ID `organizer` claim can sign in or manage links and API keys; ID admins also receive that claim. OAuth uses PKCE and verified ID tokens. Every management request checks the owner's current roles at ID's userinfo endpoint, including requests authenticated with an API key. ID failures deny management access but do not affect public redirects. Refresh tokens allow integrations to continue after the browser session ends; revoked/expired ID authorization requires signing in again. OAuth tokens are encrypted at rest using the Better Auth secret.

Organizers can create, list and revoke their own API keys on the dashboard. New keys start with `phrs_`. Keys are shown once, stored hashed, and allow 1,000 requests per 24 hours. Exhausted keys return HTTP 429. API keys cannot manage other API keys; key management requires an organizer's browser session. Cookie-authenticated writes require a matching Origin. Do not put `BETTER_AUTH_SECRET` in clients.

## Migrate production

1. Provision Turso and register the production ID application. Configure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `ID_CLIENT_ID`, and optionally `ID_CLIENT_SECRET` in the Vercel project. Give previews their own database and ID callback.
2. Stop legacy link writers briefly and export the complete Edge Config items array (`[{"key":"slug","value":{"d":"https://…","v":0}}]`) to a private JSON file.
3. Run `bunx --bun drizzle-kit migrate` against the target database. Import the export once during cutover, preserving exact slugs, destinations and visit counts, then compare every row to the export. Provisioning and this one-time data transfer stay outside the application repository.
4. Deploy, sign in as an organizer, create a key for each integration, and update its `PHACK_TOKEN`. Old shared tokens are no longer accepted. Update Wack Hacker and agent harness to the API before resuming their writes. Keep the export and old store for rollback; do not delete Edge Config while any legacy writer still uses it.

Production uses Vercel's Elysia preset and Bun runtime at the repository root (`puhack-horse-dash`). For another Bun host, run `bun run build` then `bun start` behind HTTPS.

## CLI and library

```sh
bun add --global @purduehackers/phack
export PHACK_URL=https://phack.rs
export PHACK_TOKEN=phrs_your_api_key
phack create https://purduehackers.com/events --slug events
phack get events
phack list
phack delete events
```

The CLI requires Bun. Commands return JSON and exit nonzero on failure. An omitted slug is generated in the client and retained in recovery instructions. Check the same slug after a failed create and retry with the same `--slug`.

Install the library with `bun add @purduehackers/phack` or `npm install @purduehackers/phack`:

```ts
import { createClient } from "@purduehackers/phack";
const api = createClient("https://phack.rs", process.env.PHACK_TOKEN!);
const { data, error } = await api.links.post({
  slug: "events",
  destination: "https://purduehackers.com/events",
});
```

The library returns Eden responses directly. Check `error` for HTTP failures and catch transport failures. Omitting the token uses same-origin browser cookies. Server code is imported only as types and is not bundled into the dashboard.

| Method | Path               | Purpose                                               |
| ------ | ------------------ | ----------------------------------------------------- |
| GET    | `/`                | Purdue Hackers homepage redirect                      |
| GET    | `/:slug`           | Public 307 redirect; 404 for missing links            |
| GET    | `/dashboard`       | ID login, link and API-key management                 |
| *      | `/api/auth/*`      | Better Auth endpoints                                 |
| GET    | `/api/links`       | List links                                            |
| GET    | `/api/links/:slug` | Read a link                                           |
| POST   | `/api/links`       | Create `{ slug, destination }`                        |
| PATCH  | `/api/links/:slug` | Update `{ destination }`; preserve the slug and count |
| DELETE | `/api/links/:slug` | Delete a link                                         |

Link management accepts an organizer session, `Authorization: Bearer <API key>`, or `x-api-key`. Creates accept HTTP(S) URLs and nonreserved slugs of 2–64 alphanumeric characters with internal hyphens. Atomic inserts never overwrite destinations or counters. Retrying an identical link succeeds. Existing view counts are preserved. GET redirects increment views atomically; HEAD requests and management reads do not. Store failures return 503. There are no automatic write retries.

## Check

```sh
bun run typecheck
bun run lint
bun run format --check
bun test
bun run build
```

Tests use isolated SQLite databases and mocked ID responses; they never touch production.

## Publish

Set the next version in `package.json`, run the checks above, then run `npm publish`.
The prepack hook builds the library, CLI, and TypeScript declarations. Dashboard assets,
server bundles, migrations, tests, and local configuration are excluded from the npm package.
