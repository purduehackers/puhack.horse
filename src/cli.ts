#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { createClient } from "./client";

const usage =
  "phack list | get <slug> | create <url> [--slug <slug>] | delete <slug>\nSet PHACK_URL and PHACK_TOKEN. Output is JSON.";
try {
  const {
    values,
    positionals: [command, value, ...extra],
  } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
    options: { slug: { type: "string" }, help: { type: "boolean", short: "h" } },
  });
  if (values.help) {
    console.log(usage);
  } else {
    if (
      extra.length ||
      !["list", "get", "create", "delete"].includes(command ?? "") ||
      (command === "list" ? !!value : !value) ||
      (values.slug && command !== "create")
    )
      throw new Error(usage);
    const { PHACK_URL, PHACK_TOKEN } = process.env;
    if (!PHACK_URL || !PHACK_TOKEN) throw new Error(usage);
    const api = createClient(PHACK_URL, PHACK_TOKEN);
    const slug = values.slug ?? crypto.randomUUID().replaceAll("-", "").slice(0, 8);
    const result = await (command === "list"
      ? api.links.get()
      : command === "get"
        ? api.links({ slug: value! }).get()
        : command === "delete"
          ? api.links({ slug: value! }).delete()
          : api.links.post({ slug, destination: value! }).catch(() => {
              throw new Error(
                `Creation unverified. Run phack get ${slug}; retry with --slug ${slug}.`,
              );
            }));
    if (result.error) throw new Error(JSON.stringify(result.error.value));
    console.log(JSON.stringify(result.data, null, 2));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Request failed");
  process.exitCode = 1;
}
