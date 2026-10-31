import { defineConfig } from "drizzle-kit";
const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./migrations",
  ...(url.startsWith("file:")
    ? { dialect: "sqlite", dbCredentials: { url } }
    : { dialect: "turso", dbCredentials: { url, authToken: process.env.TURSO_AUTH_TOKEN! } }),
});
