import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user";
export const apikey = sqliteTable("apikey", {
  id: text().primaryKey(),
  configId: text().notNull().default("default"),
  name: text(),
  start: text(),
  referenceId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  prefix: text(),
  key: text().notNull().unique(),
  refillInterval: integer(),
  refillAmount: integer(),
  lastRefillAt: integer({ mode: "timestamp_ms" }),
  enabled: integer({ mode: "boolean" }).default(true),
  rateLimitEnabled: integer({ mode: "boolean" }).default(true),
  rateLimitTimeWindow: integer().default(86400000),
  rateLimitMax: integer().default(1000),
  requestCount: integer().default(0),
  remaining: integer(),
  lastRequest: integer({ mode: "timestamp_ms" }),
  expiresAt: integer({ mode: "timestamp_ms" }),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
  permissions: text(),
  metadata: text(),
});
