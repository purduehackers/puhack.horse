import { describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createApp } from "../src/api";
import { createClient } from "../src/client";
import { type Link, type Store } from "../src/store";

function fixture() {
  const links = new Map<string, Link>();
  const store: Store = {
    async list() {
      return Object.fromEntries(links);
    },
    async get(slug) {
      return links.get(slug);
    },
    async visit(slug) {
      const link = links.get(slug);
      if (!link) return;
      const visited = { ...link, v: link.v + 1 };
      links.set(slug, visited);
      return visited;
    },
    async create(slug, d) {
      if (links.has(slug)) throw new Error("Conflict");
      links.set(slug, { d, v: 0 });
    },
    async update(slug, d) {
      const previous = links.get(slug);
      if (!previous) return;
      const updated = { ...previous, d };
      links.set(slug, updated);
      return updated;
    },
    async delete(slug) {
      links.delete(slug);
    },
  };
  const app = createApp(store, async (request) =>
    request.headers.get("authorization") === "Bearer test-token"
      ? undefined
      : Response.json({ message: "Unauthorized" }, { status: 401 }),
  );
  const api = treaty(app, { headers: { authorization: "Bearer test-token" } }).api;
  return { links, store, app, api };
}

describe("API", () => {
  test("protects every management operation", async () => {
    const { app, links } = fixture();
    for (const [method, path] of [
      ["GET", "/api/links"],
      ["GET", "/api/links/abc"],
      ["POST", "/api/links"],
      ["PATCH", "/api/links/abc"],
      ["DELETE", "/api/links/abc"],
    ]) {
      const response = await app.handle(
        new Request(`http://localhost${path}`, {
          method,
          headers: { "content-type": "application/json" },
          body:
            method === "POST" || method === "PATCH"
              ? JSON.stringify({ slug: "abc", destination: "https://example.com" })
              : undefined,
        }),
      );
      expect(response.status).toBe(401);
    }
    expect(links.size).toBe(0);
  });
  test("create, read, list, redirect, delete", async () => {
    const { api, app } = fixture();
    expect(
      (await api.links.post({ slug: "hello", destination: "https://example.com/path?q=1" })).data
        ?.status,
    ).toBe("created");
    expect((await api.links({ slug: "hello" }).get()).data?.d).toBe("https://example.com/path?q=1");
    expect(Object.keys((await api.links.get()).data!)).toEqual(["hello"]);
    const redirect = await app.handle(new Request("http://localhost/hello"));
    expect(redirect.status).toBe(307);
    expect(redirect.headers.get("location")).toBe("https://example.com/path?q=1");
    expect((await api.links({ slug: "hello" }).delete()).data?.ok).toBe(true);
    expect((await app.handle(new Request("http://localhost/hello"))).status).toBe(404);
  });
  test("rejects invalid or reserved input", async () => {
    const { api, links } = fixture();
    for (const slug of ["a", "-abc", "a/b", "dashboard", "API"])
      expect((await api.links.post({ slug, destination: "https://example.com" })).status).toBe(422);
    for (const destination of ["javascript:alert(1)", "ftp://example.com", "broken"])
      expect((await api.links.post({ slug: "okay", destination })).status).toBe(422);
    expect(links.size).toBe(0);
  });
  test("retries never overwrite destinations or counters", async () => {
    const { api, links } = fixture();
    links.set("taken", { d: "https://example.com", v: 42 });
    expect(
      (await api.links.post({ slug: "taken", destination: "https://example.com" })).data?.status,
    ).toBe("existing");
    expect((await api.links.post({ slug: "taken", destination: "https://other.com" })).status).toBe(
      409,
    );
    expect(links.get("taken")).toEqual({ d: "https://example.com", v: 42 });
  });
  test("explicit edits change only the destination and reject unsafe or missing links", async () => {
    const { api, app, links } = fixture();
    links.set("edit-me", { d: "https://old.example", v: 42 });
    expect(
      (await api.links({ slug: "edit-me" }).patch({ destination: "https://new.example" })).data,
    ).toEqual({ d: "https://new.example", v: 42 });
    const redirect = await app.handle(new Request("http://localhost/edit-me"));
    expect(redirect.headers.get("location")).toBe("https://new.example/");
    for (const destination of ["javascript:alert(1)", "ftp://example.com", "broken"])
      expect((await api.links({ slug: "edit-me" }).patch({ destination })).status).toBe(422);
    expect(
      (await api.links({ slug: "missing" }).patch({ destination: "https://new.example" })).status,
    ).toBe(404);
    expect(links.get("edit-me")).toEqual({ d: "https://new.example", v: 43 });
  });
  test("redirects count views while management reads and HEAD requests do not", async () => {
    const { app, api, links } = fixture();
    links.set("viewed", { d: "https://example.com", v: 12 });
    await api.links({ slug: "viewed" }).get();
    expect(
      (await app.handle(new Request("http://localhost/viewed", { method: "HEAD" }))).status,
    ).toBe(307);
    expect(links.get("viewed")?.v).toBe(12);
    await Promise.all(
      Array.from({ length: 5 }, () => app.handle(new Request("http://localhost/viewed"))),
    );
    expect(links.get("viewed")?.v).toBe(17);
  });
  test("reconciles a committed write whose response was lost", async () => {
    const { api, store, links } = fixture();
    store.create = async (slug, d) => {
      links.set(slug, { d, v: 7 });
      throw new Error("Timeout");
    };
    const response = await api.links.post({ slug: "retry", destination: "https://example.com" });
    expect(response.data).toEqual({
      slug: "retry",
      d: "https://example.com",
      v: 7,
      status: "existing",
    });
  });
  test("unavailable storage gives a recovery slug and no false success", async () => {
    const { api, store } = fixture();
    store.create = store.get = async () => {
      throw new Error("Secret upstream detail");
    };
    const response = await api.links.post({ slug: "retry", destination: "https://example.com" });
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.error?.value)).toContain("retry");
    expect(JSON.stringify(response.error?.value)).not.toContain("Secret");
    expect((await api.links({ slug: "retry" }).get()).status).toBe(503);
  });
  test("concurrent creates have one winner", async () => {
    const { api, links } = fixture();
    const results = await Promise.all(
      ["https://one.com", "https://two.com"].map((destination) =>
        api.links.post({ slug: "race", destination }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
    expect(links.size).toBe(1);
  });
  test("library and CLI work over HTTP", async () => {
    const { app } = fixture();
    app.listen(0);
    try {
      const url = String(app.server!.url);
      const client = createClient(url, "test-token");
      expect(
        (await client.links.post({ slug: "client", destination: "https://example.com" })).status,
      ).toBe(200);
      for (const args of [
        ["get", "client"],
        ["create", "https://example.com", "--slug", "cli"],
        ["list"],
        ["delete", "cli"],
      ]) {
        const child = Bun.spawn(["bun", "src/cli.ts", ...args], {
          env: { ...process.env, PHACK_URL: url, PHACK_TOKEN: "test-token" },
          stdout: "pipe",
          stderr: "pipe",
        });
        const output = await new Response(child.stdout).text();
        expect(await child.exited).toBe(0);
        expect(() => JSON.parse(output)).not.toThrow();
      }
    } finally {
      app.stop();
    }
  });
});
