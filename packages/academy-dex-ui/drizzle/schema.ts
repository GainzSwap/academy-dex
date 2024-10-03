import { bigint, boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

export const chats = pgTable("comm_chats", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  tgId: bigint("tgId", { mode: "bigint" }).notNull(),
  username: text("username").notNull(),
});
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

export const tgUsers = pgTable("tgUsers", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  tgID: bigint("tgID", { mode: "bigint" }).notNull(),
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
export type TgUser = typeof tgUsers.$inferSelect;
export type NewTgUser = typeof tgUsers.$inferInsert;
