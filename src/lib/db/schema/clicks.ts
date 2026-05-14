import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const clicks = sqliteTable(
  "clicks",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    linkId: text("link_id").notNull(),
    campaignId: text("campaign_id").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    referrer: text("web_referrer"),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    deviceType: text("device_type"),
    os: text("os"),
    browser: text("browser"),
    isBot: integer("is_bot", { mode: "boolean" }).notNull().default(false),
    botReason: text("bot_reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("clicks_utmSource_idx").on(table.utmSource),
    index("clicks_utmMedium_idx").on(table.utmMedium),
    index("clicks_utmCampaign_idx").on(table.utmCampaign),
    index("clicks_linkId_idx").on(table.linkId),
    index("clicks_campaignId_idx").on(table.campaignId),
  ],
);
