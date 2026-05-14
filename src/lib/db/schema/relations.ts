import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { campaigns } from "./campaigns";
import { links } from "./links";
import { clicks } from "./clicks";
import { sessions } from "./sessions";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  links: many(links),
  campaigns: many(campaigns),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  users: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  campaigns: one(campaigns, {
    fields: [links.campaignId],
    references: [campaigns.id],
  }),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  campaigns: one(campaigns, {
    fields: [clicks.campaignId],
    references: [campaigns.id],
  }),
  links: one(links, {
    fields: [clicks.linkId],
    references: [links.id],
  }),
}));
