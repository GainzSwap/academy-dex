import { relations } from "drizzle-orm";
import { bigint, boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const chats = pgTable("comm_chats", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  tgID: bigint("tgID", { mode: "number" }).notNull(),
  username: text("username").notNull(),
});

export const tgUsers = pgTable("tgUsers", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  tgID: bigint("tgID", { mode: "number" }).notNull(),
  refID: text("refID").unique(),
  referrerID: text("referrerID"),
  isBot: boolean("isBot").default(true),
  firstName: text("firstName").notNull(),
  lastName: text("lastName"),
  username: text("username"),
  languageCode: text("languageCode"),
  groupChatStatus: text("groupChatStatus"),
  joinReqSent: boolean("joinReqSent").default(false),
});
export const tgUsersRelations = relations(tgUsers, ({ one, many }) => ({
  user: one(users),
  referrals: many(tgUsers, { relationName: "tgUser_referral" }),
  referrer: one(tgUsers, {
    fields: [tgUsers.referrerID],
    references: [tgUsers.refID],
    relationName: "tgUser_referral",
  }),
}));

export const users = pgTable("users", {
  address: varchar("address").primaryKey().unique(),
  idInContract: bigint("idInContract", { mode: "number" }).unique(),
  refID: varchar("refID").unique(),
  tgID: bigint("tgID", { mode: "number" }).unique(),
  referrerID: varchar("referrerID"),
});
export const usersRelations = relations(users, ({ one, many }) => ({
  tgUser: one(tgUsers, { fields: [users.tgID], references: [tgUsers.tgID] }),
  referrals: many(users, { relationName: "user_referral" }),
  referrer: one(users, { fields: [users.referrerID], references: [users.refID], relationName: "user_referral" }),
}));
