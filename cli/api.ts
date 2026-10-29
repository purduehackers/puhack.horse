import { Result } from "better-result";

import { PhackError } from "./errors";

/** Uses the existing Vercel login. Request bodies stay off command arguments. */
export function api(path: string, body?: string): Promise<Result<string, PhackError>> {
  return Result.tryPromise({
    try: async () => {
      const child = Bun.spawn(
        [
          "vercel",
          "api",
          "/v1/global-config/ecfg_k1ocmrcfwo57k9v2klgtljycqsqj" +
            path +
            "?teamId=team_kOQWJUQYzGW4blWthdK71Y8A",
          "--raw",
          "--non-interactive",
          ...(body ? ["--method", "PATCH", "--input", "-"] : []),
        ],
        {
          stdin: body ? new TextEncoder().encode(body) : "ignore",
          stdout: "pipe",
          stderr: "ignore",
          timeout: 30_000,
        },
      );
      const [output, code] = await Promise.all([new Response(child.stdout).text(), child.exited]);
      return { output, code };
    },
    catch: () =>
      new PhackError({
        message: "Vercel could not run or timed out. Install Vercel CLI and run vercel login.",
      }),
  }).then((result) =>
    result.andThen(({ output, code }) =>
      code === 0
        ? Result.ok(output)
        : Result.err(
            new PhackError({
              message: "Vercel request failed. Check vercel login and Purdue Hackers team access.",
            }),
          ),
    ),
  );
}
