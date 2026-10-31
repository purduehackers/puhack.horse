import { connect } from "../src/db";
import { link } from "../src/db/schema/link";
import { eq } from "drizzle-orm";
if (!process.env.TURSO_DATABASE_URL || !process.argv[2])
  throw new Error("Set TURSO_DATABASE_URL and pass the Edge Config items JSON export");
const items: unknown = await Bun.file(process.argv[2]).json();
if (!Array.isArray(items)) throw new Error("Expected an array of {key, value: {d, v}} items");
const values = items.map(({ key, value }) => {
  if (
    typeof key !== "string" ||
    typeof value?.d !== "string" ||
    !Number.isSafeInteger(value.v) ||
    value.v < 0 ||
    !["https:", "http:"].includes(new URL(value.d).protocol)
  )
    throw new Error("Invalid link in export");
  return { slug: key, d: value.d, v: value.v };
});
const db = connect(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);
await db.transaction(async (tx) => {
  for (const value of values) {
    const [existing] = await tx.select().from(link).where(eq(link.slug, value.slug));
    if (existing && (existing.d !== value.d || existing.v !== value.v))
      throw new Error(`Conflicting existing link: ${value.slug}`);
    if (!existing) await tx.insert(link).values(value);
  }
});
console.log(`Verified/imported ${values.length} links`);
db.$client.close();
