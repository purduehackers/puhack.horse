import { Elysia } from "elysia";
import { createApp } from "./api";
import { vercelStore } from "./store";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
const app = new Elysia()
  .use(
    createApp(
      vercelStore(required("VERCEL_API_TOKEN"), required("EDGE_CONFIG_ID"), required("TEAM_ID")),
      required("PHACK_TOKEN"),
    ),
  )
  .get(
    "/dashboard",
    () =>
      new Response(Bun.file(new URL("../web/index.html", import.meta.url)), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
  )
  .get("/dashboard/main.js", () => Bun.file(new URL("../dist/main.js", import.meta.url)));

export default app;
if (import.meta.main) {
  app.listen(process.env.PORT ?? 3000);
  console.log(`phack listening on ${app.server?.url}`);
}
