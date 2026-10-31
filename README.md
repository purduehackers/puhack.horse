# phack.rs

One Bun package: an Elysia API, a plain HTML dashboard, an Eden CLI, and a thin Eden library. Two runtime dependencies; no React, Next.js, SDK, database migration, or separate client schemas.

## Run

```sh
bun install
cp .env.example .env
# Fill in PHACK_TOKEN (a long random secret) and VERCEL_API_TOKEN.
bun run dev
```

Open http://localhost:3000/dashboard and enter PHACK_TOKEN. The dashboard keeps credentials in memory only. The API uses the existing Purdue Hackers Global Config store, with its existing `{ d, v }` records. Local development uses the configured real store; use a separate store for experimentation.

Production runs on Vercel with the Elysia preset and Bun runtime, using the repository root. The `puhack-horse-dash` project serves the consolidated app and existing domains; `main` is the production branch. Set the variables from `.env.example`. The protected `PHACK_TOKEN` is available to project administrators in Vercel environment settings. For another Bun host, run `bun run build` then `bun start` behind HTTPS; `PORT` defaults to 3000.

## CLI

```sh
export PHACK_URL=http://localhost:3000
export PHACK_TOKEN=your-admin-token
bun src/cli.ts create https://purduehackers.com/events --slug events
bun src/cli.ts get events
bun src/cli.ts list
bun src/cli.ts delete events
```

The package exposes the `phack` binary. Commands return JSON and exit nonzero on failure. An omitted slug is generated in the client. A failed create retains that slug in recovery instructions; check it and retry with the same `--slug`. Atomic creates never overwrite another destination or reset visit counts. An identical existing link is a successful retry.

## Library

```ts
import { createClient } from "@purduehackers/phack";

const api = createClient("https://your-shortener.example", process.env.PHACK_TOKEN!);
const { data, error } = await api.links.post({
  slug: "events",
  destination: "https://purduehackers.com/events",
});
const result = await api.links({ slug: "events" }).get();
```

The library returns Eden responses directly. Check `error` for HTTP failures and catch transport failures. Generate and retain a slug before submitting a create so that transport retries are idempotent. Consumers use Bun or a TypeScript-aware bundler. API types are imported only as types; server code and credentials are not bundled in the browser.

## Routes

| Method | Path               | Purpose                                    |
| ------ | ------------------ | ------------------------------------------ |
| GET    | `/`                | Purdue Hackers homepage redirect           |
| GET    | `/:slug`           | Public 307 redirect; 404 for missing links |
| GET    | `/dashboard`       | HTML interface                             |
| GET    | `/api/links`       | List links                                 |
| GET    | `/api/links/:slug` | Read a link                                |
| POST   | `/api/links`       | Create `{ slug, destination }`             |
| DELETE | `/api/links/:slug` | Delete a link                              |

All `/api` routes require `Authorization: Bearer <PHACK_TOKEN>`. The browser is same-origin. GitHub OAuth and Vercel CLI login are replaced by this shared admin token; the Vercel management token stays on the server. Creates accept HTTP(S) URLs and nonreserved slugs of 2–64 alphanumeric characters with internal hyphens.

Existing visit counts are preserved, but redirects no longer increment them. Reads currently use the authoritative Vercel management API, so latency and rate limits apply to public redirects too; this minimal implementation is not an edge-cached high-volume redirect service. Store failures return 503 rather than a misleading redirect. There are no automatic write retries.

## Check

```sh
bun run typecheck
bun run lint
bun run format --check
bun test
bun run build
```

Tests use an isolated in-memory store and mocked Vercel requests; they do not touch production.
