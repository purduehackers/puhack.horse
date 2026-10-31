import { Elysia, t } from "elysia";
import type { Authorize } from "./auth";
import type { Store } from "./store";

const slug = t.String({ pattern: "^[A-Za-z0-9][A-Za-z0-9-]{0,62}[A-Za-z0-9]$" });
const params = t.Object({ slug });
const reserved = new Set(["404", "api", "dashboard", "favicon", "login"]);

export function createApp(store: Store, authorize: Authorize) {
  return new Elysia()
    .onError(({ code, status }) => {
      if (code === "UNKNOWN") return status(503, { message: "Link store unavailable" });
    })
    .get("/", ({ request, redirect }) =>
      redirect(
        new URL(request.url).hostname === "dash.puhack.horse"
          ? "/dashboard"
          : "https://purduehackers.com",
      ),
    )
    .group("/api", (app) =>
      app
        .onBeforeHandle(async ({ request, status }) => {
          const denied = await authorize(request);
          if (denied)
            return status(
              denied.status === 401 ? 401 : denied.status === 403 ? 403 : 503,
              (await denied.json()) as { message: string },
            );
        })
        .get("/links", () => store.list())
        .get(
          "/links/:slug",
          async ({ params, status }) =>
            (await store.get(params.slug)) ?? status(404, { message: "Link not found" }),
          { params },
        )
        .post(
          "/links",
          async ({ body, status }) => {
            const { slug, destination } = body;
            if (reserved.has(slug.toLowerCase())) return status(422, { message: "Reserved slug" });
            try {
              const url = new URL(destination);
              if (!["http:", "https:"].includes(url.protocol)) throw new Error();
            } catch {
              return status(422, { message: "Use an HTTP(S) destination" });
            }
            try {
              await store.create(slug, destination);
              return { slug, d: destination, v: 0, status: "created" as const };
            } catch {
              // A timeout may mean the write succeeded. Never overwrite or pick another slug.
              const existing = await store.get(slug).catch(() => undefined);
              if (existing?.d === destination)
                return { slug, ...existing, status: "existing" as const };
              if (existing)
                return status(409, { message: `Slug ${slug} already points elsewhere` });
              return status(503, {
                message: `Creation unverified. Read ${slug}, then retry with the same slug.`,
              });
            }
          },
          { body: t.Object({ slug, destination: t.String({ maxLength: 8192 }) }) },
        )
        .delete(
          "/links/:slug",
          async ({ params }) => {
            await store.delete(params.slug);
            return { ok: true };
          },
          { params },
        ),
    )
    .get("/:slug", async ({ params, redirect, status, set }) => {
      const link = await store.get(params.slug);
      set.headers["cache-control"] = "no-store";
      return link ? redirect(link.d, 307) : status(404, "Link not found");
    });
}
export type App = ReturnType<typeof createApp>;
