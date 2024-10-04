import { chats, tgUsers } from ".";
import { UserType } from "./models/User";

export type Chat = typeof chats.$inferSelect;
export type IUser = UserType & { tgUser: typeof tgUsers.$inferSelect | null };
