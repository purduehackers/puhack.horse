import { z } from "zod";

export const slugSchema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,62}[A-Za-z0-9]$/u)
  .refine(
    (slug) => !["404", "api", "dashboard", "favicon", "login"].includes(slug.toLowerCase()),
    "Reserved slug",
  );
export const destinationSchema = z.url({ protocol: /^https?$/u });
export const storedLinkSchema = z.object({ value: z.object({ d: destinationSchema }) });
