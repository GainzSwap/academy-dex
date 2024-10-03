import { tgUsers, tgUsersRelations } from "..";
import { User } from "./User";
import { and, eq } from "drizzle-orm";
import { ChatMember } from "grammy/types";
import { db } from "~~/drizzle/db";

type TgUserType = typeof tgUsers.$inferSelect;

export type GroupChatStatusType = ChatMember["status"] | null;

const status: GroupChatStatusType[] = ["administrator", "creator", "member"];

export class TgUser implements TgUserType {
  id!: number;
  username: string | null;
  tgID!: number;
  refID: string | null;
  referrerID: string | null;
  isBot: boolean | null;
  firstName!: string;
  lastName: string | null;
  languageCode: string | null;
  groupChatStatus: GroupChatStatusType;
  joinReqSent: boolean | null;

  user: User | null;
  referrals?: TgUser[];
  referrer: TgUser | null;

  constructor(data: Partial<TgUserType & Pick<TgUser, "user" | "referrals" | "referrer">>) {
    if (data.id) {
      this.id = data.id;
    }

    if (data.firstName) {
      this.firstName = data.firstName;
    }

    if (data.tgID) {
      this.tgID = data.tgID;
    }

    this.username = data.username ?? null;
    this.refID = data.refID ?? null;
    this.isBot = data.isBot ?? null;
    this.referrerID = data.referrerID ?? null;
    this.lastName = data.lastName ?? null;
    this.languageCode = data.languageCode ?? null;
    this.groupChatStatus = (data.groupChatStatus as GroupChatStatusType) ?? null;
    this.joinReqSent = data.joinReqSent ?? null;

    // Relations
    this.user = data.user ?? null;
    this.referrals = data.referrals;
    this.referrer = data.referrer ?? null;
  }

  get isCommChatMember() {
    return status.includes(this.groupChatStatus);
  }

  get shouldJoinCommChat() {
    return !this.isCommChatMember;
  }

  static save = async (tgUser: TgUser) =>
    (tgUser.id !== undefined
      ? (() => {
          const { id, user, referrals, referrer, ...updatedData } = tgUser;
          return db.update(tgUsers).set(updatedData).where(eq(tgUsers.id, id));
        })()
      : db.insert(tgUsers).values(tgUser)
    )
      .returning()
      .then(r => new TgUser(r[0]));

  static findOneBy = async (params: Partial<TgUser>) =>
    db.query.tgUsers
      .findFirst({
        where: and(...(Object.keys(params) as (keyof TgUserType)[]).map(key => eq(tgUsers[key], params[key]!))),
        with: { referrals: true, referrer: true, user: true }, // TODO optimise,
      })
      .then(
        data =>
          data &&
          (() => {
            const { user, referrals, referrer, ...otherData } = data;

            return new TgUser({
              ...otherData,
              user: user && new User(user),
              referrals: referrals.map(r => new TgUser(r)),
              referrer: referrer && new TgUser(referrer),
            });
          })(),
      );
}
