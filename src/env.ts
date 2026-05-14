import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string(),
    PURDUE_HACKERS_CLIENT_ID: z.string(),
    PURDUE_HACKERS_CLIENT_SECRET: z.string(),
    SENTRY_AUTH_TOKEN: z.string(),
    SENTRY_OLTP_TRACES_URL: z.url(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),
    SENTRY_PUBLIC_KEY: z.string(),
    SENTRY_VERCEL_LOG_DRAIN: z.url(),
    TURSO_AUTH_TOKEN: z.string(),
    TURSO_DATABASE_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    PURDUE_HACKERS_CLIENT_ID: process.env.PURDUE_HACKERS_CLIENT_ID,
    PURDUE_HACKERS_CLIENT_SECRET: process.env.PURDUE_HACKERS_CLIENT_SECRET,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_OLTP_TRACES_URL: process.env.SENTRY_OLTP_TRACES_URL,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_PUBLIC_KEY: process.env.SENTRY_PUBLIC_KEY,
    SENTRY_VERCEL_LOG_DRAIN: process.env.SENTRY_VERCEL_LOG_DRAIN,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
});
