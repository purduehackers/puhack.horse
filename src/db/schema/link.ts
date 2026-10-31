import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const link = sqliteTable("link", {
  slug: text().primaryKey(),
  d: text("destination").notNull(),
  v: integer("visits").notNull().default(0),
});
