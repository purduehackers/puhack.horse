import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "../src/db";
import { sqlStore } from "../src/store";

test("migration and import are repeatable and roll back conflicting exports", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phack-import-"));
  const url = `file:${join(dir, "test.db")}`;
  const file = join(dir, "items.json");
  const run = async (...args: string[]) => {
    const child = Bun.spawn(["bun", ...args], {
      env: { ...process.env, TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "" },
      stdout: "pipe",
      stderr: "pipe",
    });
    await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()]);
    return child.exited;
  };
  try {
    expect(await run("scripts/migrate.ts")).toBe(0);
    expect(await run("scripts/migrate.ts")).toBe(0);
    await Bun.write(
      file,
      JSON.stringify([{ key: "legacy", value: { d: "https://example.com", v: 42 } }]),
    );
    expect(await run("scripts/import-links.ts", file)).toBe(0);
    expect(await run("scripts/import-links.ts", file)).toBe(0);
    await Bun.write(
      file,
      JSON.stringify([
        { key: "rollback", value: { d: "https://example.com", v: 1 } },
        { key: "legacy", value: { d: "https://other.com", v: 0 } },
      ]),
    );
    expect(await run("scripts/import-links.ts", file)).not.toBe(0);
    const db = connect(url);
    expect(await sqlStore(db).list()).toEqual({ legacy: { d: "https://example.com", v: 42 } });
    db.$client.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
