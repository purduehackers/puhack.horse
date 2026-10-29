/** @fileoverview Creates short links atomically and reconciles uncertain writes without replacing existing destinations. */
import { Result } from "better-result";

import { api } from "./api";
import { PhackError } from "./errors";
import { destinationSchema, slugSchema, storedLinkSchema } from "./schemas";

/** Reads the stored destination without following the public redirect. */
export function getLink(slug: string, request = api) {
  return Result.gen(async function* () {
    if (!slugSchema.safeParse(slug).success)
      return Result.err(
        new PhackError({
          message: "Use a nonreserved slug of 2–64 letters, digits, or internal hyphens.",
        }),
      );
    const raw = yield* Result.await(request("/item/" + encodeURIComponent(slug)));
    const json = yield* Result.try({
      try: () => JSON.parse(raw),
      catch: () => new PhackError({ message: "No readable link found for " + slug + "." }),
    });
    const link = storedLinkSchema.safeParse(json);
    if (!link.success)
      return Result.err(new PhackError({ message: "No valid link found for " + slug + "." }));
    return Result.ok({ slug, url: "https://phack.rs/" + slug, destination: link.data.value.d });
  });
}

/** Creates links without overwriting destinations. Reads the same slug to resolve uncertain writes. */
export async function createLink(
  destination: string,
  slug = crypto.randomUUID().replaceAll("-", "").slice(0, 8),
  request = api,
) {
  if (!destinationSchema.safeParse(destination).success || !slugSchema.safeParse(slug).success)
    return Result.err(
      new PhackError({
        message:
          "Use an HTTP(S) destination and a nonreserved slug of 2–64 letters, digits, or internal hyphens.",
      }),
    );
  const write = await request(
    "/items",
    JSON.stringify({
      items: [{ operation: "create", key: slug, value: { d: destination, v: 0 } }],
    }),
  );
  if (write.isOk())
    return Result.ok({ slug, url: "https://phack.rs/" + slug, destination, status: "created" });
  const existing = await getLink(slug, request);
  if (existing.isOk()) {
    if (existing.value.destination === destination)
      return Result.ok({ ...existing.value, status: "existing" });
    return Result.err(
      new PhackError({
        message: "Slug " + slug + " already points elsewhere. Nothing was overwritten.",
      }),
    );
  }
  return Result.err(
    new PhackError({
      message:
        "Creation could not be verified for " +
        slug +
        ". Run phack get " +
        slug +
        "; retry with --slug " +
        slug +
        " to avoid duplicates. " +
        write.error.message,
    }),
  );
}
