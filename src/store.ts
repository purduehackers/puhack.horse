import { eq, sql } from "drizzle-orm";
import type { Database } from "./db";
import { link } from "./db/schema/link";
export type Link = { d: string; v: number };
export interface Store {
  list(): Promise<Record<string, Link>>;
  get(slug: string): Promise<Link | undefined>;
  visit(slug: string): Promise<Link | undefined>;
  create(slug: string, destination: string): Promise<void>;
  update(slug: string, destination: string): Promise<Link | undefined>;
  delete(slug: string): Promise<void>;
}
export function sqlStore(db: Database): Store {
  return {
    async list() {
      return Object.fromEntries(
        (await db.select().from(link)).map(({ slug, d, v }) => [slug, { d, v }]),
      );
    },
    async get(slug) {
      return (await db.select({ d: link.d, v: link.v }).from(link).where(eq(link.slug, slug)))[0];
    },
    async visit(slug) {
      return (
        await db
          .update(link)
          .set({ v: sql`${link.v} + 1` })
          .where(eq(link.slug, slug))
          .returning({ d: link.d, v: link.v })
      )[0];
    },
    async create(slug, d) {
      await db.insert(link).values({ slug, d });
    },
    async update(slug, d) {
      return (
        await db
          .update(link)
          .set({ d })
          .where(eq(link.slug, slug))
          .returning({ d: link.d, v: link.v })
      )[0];
    },
    async delete(slug) {
      await db.delete(link).where(eq(link.slug, slug));
    },
  };
}
