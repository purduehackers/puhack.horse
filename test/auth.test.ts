import { test, expect } from "bun:test";
import { Elysia } from "elysia";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { makeSignature, symmetricEncrypt } from "better-auth/crypto";
import { connect, schema } from "../src/db";
import { createAuth, accessControl, authHandler } from "../src/auth";
import { sqlStore } from "../src/store";

const secret = "test-secret-with-at-least-thirty-two-characters";
test("real Better Auth sessions and API keys enforce owner membership and revocation", async () => {
  const db = await connect("file::memory:");
  await migrate(db, { migrationsFolder: "migrations" });
  const original = globalThis.fetch;
  let roles = ["organizer"];
  let subject = "id-owner";
  let unavailable = false;
  globalThis.fetch = Object.assign(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.endsWith("openid-configuration"))
        return Response.json({
          issuer: "https://id.purduehackers.com/api/auth",
          authorization_endpoint: "https://id.purduehackers.com/api/auth/oauth2/authorize",
          token_endpoint: "https://id.purduehackers.com/api/auth/oauth2/token",
          userinfo_endpoint: "https://id.purduehackers.com/api/auth/oauth2/userinfo",
          jwks_uri: "https://id.purduehackers.com/api/auth/jwks",
        });
      if (url.endsWith("/token")) {
        const request = new Request(input, init);
        expect(request.headers.get("authorization")).toBe(`Basic ${btoa("test:client-secret")}`);
        const body = new URLSearchParams(await request.text());
        expect(body.has("client_secret")).toBe(false);
        return Response.json({
          access_token: "renewed-token",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }
      if (url.endsWith("/userinfo"))
        return unavailable
          ? new Response(null, { status: 503 })
          : Response.json({ sub: subject, roles });
      throw new Error(`Unexpected request ${url}`);
    },
    { preconnect: original.preconnect },
  ) as typeof fetch;
  try {
    const auth = createAuth(db, {
      url: "http://localhost:3000",
      secret,
      clientId: "test",
      clientSecret: "client-secret",
    });
    const context = await auth.$context;
    const [user] = await db
      .insert(schema.user)
      .values({
        id: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Organizer",
        email: "organizer@example.com",
        emailVerified: true,
      })
      .returning();
    const session = await context.internalAdapter.createSession(user.id);
    await db.insert(schema.account).values({
      id: "account",
      userId: user.id,
      accountId: subject,
      providerId: "purduehackers",
      accessToken: await symmetricEncrypt({ key: secret, data: "access-token" }),
      accessTokenExpiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const cookie = `better-auth.session_token=${encodeURIComponent(`${session.token}.${await makeSignature(session.token, secret)}`)}`;
    const authorize = accessControl(auth, db, "http://localhost:3000");
    const app = new Elysia().all(
      "/api/auth/*",
      ({ request }) => authHandler(auth, authorize)(request),
      { parse: "none" },
    );
    const handler = (request: Request) => app.handle(request);
    const request = (
      path: string,
      method: "GET" | "POST" = "GET",
      body?: object,
      headers: Record<string, string> = { cookie, origin: "http://localhost:3000" },
    ) =>
      new Request(`http://localhost:3000${path}`, {
        method,
        headers: { ...headers, "content-type": "application/json" },
        ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
      });
    expect(await authorize(request("/api/links"))).toBeUndefined();
    expect(
      (
        await authorize(
          request("/api/links", "POST", {}, { cookie, origin: "https://evil.example" }),
        )
      )?.status,
    ).toBe(403);
    const response = await handler(
      request("/api/auth/api-key/create", "POST", { name: "Test integration" }),
    );
    expect(response.status).toBe(200);
    const key = await response.json();
    expect(key.key).toStartWith("phrs_");
    const keyHeaders = { authorization: `Bearer ${key.key}` };
    for (let i = 0; i < 11; i++)
      expect(await authorize(request("/api/links", "GET", undefined, keyHeaders))).toBeUndefined();
    await db.update(schema.apikey).set({ requestCount: 999 }).where(eq(schema.apikey.id, key.id));
    expect(await authorize(request("/api/links", "GET", undefined, keyHeaders))).toBeUndefined();
    const limited = await authorize(request("/api/links", "GET", undefined, keyHeaders));
    expect(limited?.status).toBe(429);
    expect(await limited?.json()).toEqual({ message: "API key rate limit exceeded" });
    await db
      .update(schema.apikey)
      .set({ lastRequest: new Date(Date.now() - 86_400_001) })
      .where(eq(schema.apikey.id, key.id));
    expect(await authorize(request("/api/links", "GET", undefined, keyHeaders))).toBeUndefined();
    expect(
      (
        await handler(
          request("/api/auth/api-key/create", "POST", { name: "Escalated" }, keyHeaders),
        )
      ).status,
    ).toBe(401);
    roles = ["alumni"];
    const provider = context.socialProviders.find((p) => p.id === "purduehackers")!;
    expect(
      (
        await provider.validateAuthorizationCode({
          code: "test-code",
          codeVerifier: "test-verifier",
          redirectURI: "http://localhost:3000/api/auth/callback/purduehackers",
        })
      )?.accessToken,
    ).toBe("renewed-token");
    expect((await provider.refreshAccessToken!("test-refresh"))?.accessToken).toBe("renewed-token");
    await expect(provider.getUserInfo({ accessToken: "test" })).rejects.toThrow("Organizers only");
    expect((await authorize(request("/api/links")))?.status).toBe(403);
    expect((await authorize(request("/api/links", "GET", undefined, keyHeaders)))?.status).toBe(
      403,
    );
    expect((await handler(request("/api/auth/api-key/list"))).status).toBe(403);
    roles = ["organizer"];
    subject = "another-id-user";
    expect((await authorize(request("/api/links")))?.status).toBe(403);
    subject = "id-owner";
    unavailable = true;
    expect((await authorize(request("/api/links")))?.status).toBe(503);
    unavailable = false;
    const [other] = await db
      .insert(schema.user)
      .values({
        id: "other",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Other",
        email: "other@example.com",
        emailVerified: true,
      })
      .returning();
    const otherKey = await auth.api.createApiKey({
      body: { userId: other.id, name: "Other owner" },
    });
    const forbidden = await handler(
      request("/api/auth/api-key/delete", "POST", { keyId: otherKey.id }),
    );
    expect(forbidden.ok).toBe(false);
    expect(
      (await handler(request("/api/auth/api-key/delete", "POST", { keyId: key.id }))).status,
    ).toBe(200);
    expect((await authorize(request("/api/links", "GET", undefined, keyHeaders)))?.status).toBe(
      401,
    );
    const signin = await handler(
      request("/api/auth/sign-in/social", "POST", {
        provider: "purduehackers",
        callbackURL: "/dashboard",
      }),
    );
    expect(signin.status).toBe(200);
    const url = new URL((await signin.json()).url);
    expect(url.searchParams.get("scope")).toContain("roles");
    expect(url.searchParams.get("scope")).toContain("offline_access");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/callback/purduehackers",
    );
    const failedCallback = await handler(
      request("/api/auth/callback/purduehackers?error=access_denied"),
    );
    const errorURL = new URL(failedCallback.headers.get("location")!);
    expect(errorURL.pathname).toBe("/dashboard");
    expect(errorURL.searchParams.get("error")).toBe("state_not_found");
  } finally {
    globalThis.fetch = original;
    db.$client.close();
  }
});

test("Turso schema preserves counts and enforces atomic unique slugs", async () => {
  const db = await connect("file::memory:");
  try {
    await migrate(db, { migrationsFolder: "migrations" });
    await db.insert(schema.link).values({ slug: "legacy", d: "https://example.com", v: 42 });
    const store = sqlStore(db);
    expect(await store.get("legacy")).toEqual({ d: "https://example.com", v: 42 });
    expect(await store.update("legacy", "https://changed.com")).toEqual({
      d: "https://changed.com",
      v: 42,
    });
    expect(await store.update("missing", "https://changed.com")).toBeUndefined();
    await Promise.all(Array.from({ length: 8 }, () => store.visit("legacy")));
    expect((await store.get("legacy"))?.v).toBe(50);
    const results = await Promise.allSettled([
      store.create("race", "https://one.com"),
      store.create("race", "https://two.com"),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(Object.keys(await store.list())).toHaveLength(2);
    await store.delete("race");
    expect(await store.get("race")).toBeUndefined();
  } finally {
    db.$client.close();
  }
});
