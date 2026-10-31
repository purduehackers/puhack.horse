import { betterAuth } from "better-auth/minimal";
import { APIError } from "better-auth/api";
import { genericOAuth } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { schema, type Database } from "./db/index.js";

const providerId = "purduehackers";
const issuer = "https://id.purduehackers.com/api/auth";
const organizer = (profile: { roles?: unknown }) =>
  Array.isArray(profile.roles) && profile.roles.includes("organizer");
export function createAuth(
  db: Database,
  config: { url: string; secret: string; clientId: string; clientSecret?: string },
) {
  return betterAuth({
    baseURL: config.url,
    secret: config.secret,
    onAPIError: { errorURL: new URL("/dashboard", config.url).href },
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    account: { encryptOAuthTokens: true, accountLinking: { enabled: false } },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            tokenEndpointAuth: {
              method: config.clientSecret ? "client_secret_basic" : "none",
            },
            discoveryUrl: `${issuer}/.well-known/openid-configuration`,
            scopes: ["openid", "profile", "email", "roles", "offline_access"],
            pkce: true,
            requireIdTokenVerification: true,
            mapProfileToUser(profile) {
              if (!organizer({ roles: profile.roles }))
                throw new APIError("FORBIDDEN", { message: "Organizers only" });
              return {};
            },
          },
        ],
      }),
      apiKey({
        defaultPrefix: "phrs_",
        requireName: true,
        enableSessionForAPIKeys: false,
        rateLimit: { timeWindow: 86_400_000, maxRequests: 1000 },
      }),
    ],
  });
}
export type Auth = ReturnType<typeof createAuth>;
export type Authorize = (request: Request, sessionOnly?: boolean) => Promise<Response | undefined>;
export function accessControl(auth: Auth, db: Database, origin: string): Authorize {
  return async (request, sessionOnly = false) => {
    const denied = (status: number, message: string) => Response.json({ message }, { status });
    try {
      let userId: string | undefined;
      const key =
        request.headers.get("authorization")?.replace(/^Bearer /, "") ||
        request.headers.get("x-api-key");
      if (key && !sessionOnly) {
        const result = await auth.api.verifyApiKey({ body: { key } });
        if (result.error?.code === "RATE_LIMITED")
          return denied(429, "API key rate limit exceeded");
        if (result.valid) userId = result.key?.referenceId;
      } else {
        const session = await auth.api.getSession({ headers: request.headers });
        userId = session?.user.id;
        if (
          userId &&
          !["GET", "HEAD"].includes(request.method) &&
          request.headers.get("origin") !== origin
        )
          return denied(403, "Invalid origin");
      }
      if (!userId) return denied(401, "Sign in or supply an API key");
      const [account] = await db
        .select()
        .from(schema.account)
        .where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, providerId)))
        .limit(1);
      if (!account) return denied(403, "Purdue Hackers ID required");
      const token = await auth.api.getAccessToken({ body: { accountId: account.id, userId } });
      const response = await fetch(`${issuer}/oauth2/userinfo`, {
        headers: { authorization: `Bearer ${token.accessToken}` },
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === 401 || response.status === 403)
        return denied(403, "Sign in again with Purdue Hackers ID");
      if (!response.ok) return denied(503, "Identity service unavailable");
      const profile = await response.json();
      if (profile.sub !== account.accountId || !organizer(profile))
        return denied(403, "Organizers only");
    } catch {
      return denied(503, "Unable to verify access");
    }
  };
}

export function authHandler(auth: Auth, authorize: Authorize) {
  return async (request: Request) => {
    // Decode before matching so encoded route segments cannot bypass the session gate.
    const path = decodeURIComponent(new URL(request.url).pathname);
    if (path.startsWith("/api/auth/api-key")) {
      const denied = await authorize(request, true);
      if (denied) return denied;
    }
    return auth.handler(request);
  };
}
