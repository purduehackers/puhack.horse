import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { db, schema } from "@/lib/db";
import { env } from "@/env";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite", schema, usePlural: true }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "purduehackers",
          clientId: env.PURDUE_HACKERS_CLIENT_ID,
          clientSecret: env.PURDUE_HACKERS_CLIENT_SECRET,
          authorizationUrl: "https://id.purduehackers.com/api/authorize",
          tokenUrl: "https://id.purduehackers.com/api/token",
          userInfoUrl: "https://id.purduehackers.com/api/user",
          scopes: ["user:read"],
          authentication: "post",
          getUserInfo: async (tokens) => {
            const res = await fetch("https://id.purduehackers.com/api/user", {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            const profile = await res.json();
            const passport = profile.latest_passport;
            return {
              id: String(profile.sub),
              name: passport ? `${passport.name} ${passport.surname}` : String(profile.sub),
              email: `${profile.sub}@id.purduehackers.com`,
              emailVerified: false,
              image: undefined,
              raw: profile,
            };
          },
          mapProfileToUser: (profile) => ({
            name: profile.name,
            image: profile.image,
          }),
        },
      ],
    }),
    apiKey({
      defaultPrefix: "ph_horse_",
      rateLimit: { enabled: false },
    }),
  ],
});
