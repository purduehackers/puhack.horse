import { readFileSync } from "node:fs";
import { Elysia } from "elysia";
import { createApp } from "./api";
import { sqlStore } from "./store";
import { connect } from "./db";
import { createAuth, accessControl, authHandler } from "./auth";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
const db = connect(required("TURSO_DATABASE_URL"), process.env.TURSO_AUTH_TOKEN);
const auth = createAuth(db, {
  url: required("BETTER_AUTH_URL"),
  secret: required("BETTER_AUTH_SECRET"),
  clientId: required("ID_CLIENT_ID"),
  clientSecret: process.env.ID_CLIENT_SECRET,
});
const authorize = accessControl(auth, db, new URL(required("BETTER_AUTH_URL")).origin);
const app = new Elysia()
  .all("/api/auth/*", ({ request }) => authHandler(auth, authorize)(request))
  .use(createApp(sqlStore(db), authorize))
  .get("/dashboard", ({ request, redirect }) =>
    new URL(request.url).origin !== new URL(required("BETTER_AUTH_URL")).origin
      ? redirect(`${new URL(required("BETTER_AUTH_URL")).origin}/dashboard`)
      : new Response(readFileSync(new URL("../web/index.html", import.meta.url), "utf8"), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
  )
  .get(
    "/dashboard/main.js",
    () =>
      new Response(readFileSync(new URL("../dist/main.js", import.meta.url), "utf8"), {
        headers: { "Content-Type": "text/javascript; charset=utf-8" },
      }),
  );

export default app;
if (import.meta.main) {
  app.listen(process.env.PORT ?? 3000);
  console.log(`phack listening on ${app.server?.url}`);
}
