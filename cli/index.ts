#!/usr/bin/env bun
import { parseArgs } from "node:util";

import { Result } from "better-result";

import { createLink, getLink } from "./client";
import { PhackError } from "./errors";

const usage =
  "Usage: phack create <https://destination> [--slug <slug>]\n       phack get <slug>\nJSON output. Uses vercel login and the Purdue Hackers short-link store. Existing destinations are never overwritten.";

function run() {
  return Result.gen(async function* () {
    const args = yield* Result.try({
      try: () =>
        parseArgs({
          args: Bun.argv.slice(2),
          allowPositionals: true,
          strict: true,
          options: { slug: { type: "string" }, help: { type: "boolean", short: "h" } },
        }),
      catch: () => new PhackError({ message: usage }),
    });
    if (args.values.help) {
      console.log(usage);
      return Result.ok(undefined);
    }
    const [command, value] = args.positionals;
    if (
      args.positionals.length !== 2 ||
      (command !== "create" && command !== "get") ||
      (command === "get" && args.values.slug)
    )
      return Result.err(new PhackError({ message: usage }));
    const data = yield* Result.await(
      command === "get" ? getLink(value) : createLink(value, args.values.slug),
    );
    console.log(JSON.stringify(data, null, 2));
    return Result.ok(undefined);
  });
}

const result = await run();
if (result.isErr()) {
  console.error(result.error.message);
  process.exitCode = 1;
}
