import { users } from "..";
import { TgUser } from "./TgUser";
import { and, eq } from "drizzle-orm";
import { db } from "~~/drizzle/db";

type UserType = typeof users.$inferSelect;

export class User implements UserType {
  address!: string;
  idInContract: number | null;
  refID: string | null;
  tgID: number | null;
  referrerID: string | null;

  tgUser?: TgUser;
  referrals?: User[];
  referrer?: User;

  constructor(data: Partial<UserType> & Pick<User, "tgUser" | "referrals" | "referrer">) {
    this.idInContract = data.idInContract ?? null;
    this.refID = data.refID ?? null;
    this.tgID = data.tgID ?? null;
    this.referrerID = data.referrerID ?? null;

    // Relations
    this.tgUser = data.tgUser
    this.referrals = data.referrals
    this.referrer = data.referrer
  }

  get hasSwapped() {
    return this.idInContract !== undefined;
  }

  static findOneUserBy = async (params: Partial<User>) =>
    db
      .select()
      .from(users)
      .where(and(...(Object.keys(params) as (keyof UserType)[]).map(key => eq(users[key], params[key]!))))
      .then(r => {
        const data = r.at(0) || null;

        return data && new User(data);
      });
}
