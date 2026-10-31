import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user.js";
export const session = sqliteTable("session", {
  id: text().primaryKey().notNull(),
  expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
  token: text().notNull().unique(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
