import { users } from "..";
import { TgUser } from "./TgUser";
import { and, eq } from "drizzle-orm";
import { ChainID, acceptJoinRequest, alertReferralFirstSwap, getRefData } from "~~/app/api/bot/service";
import { db } from "~~/drizzle/db";

type UserType = typeof users.$inferSelect;

export class User implements UserType {
  address!: string;
  idInContract: number | null;
  refID: string | null;
  tgID: number | null;
  referrerID: string | null;

  tgUser: TgUser | null;
  referrals?: User[];
  referrer: User | null;

  constructor(data: Partial<UserType & Pick<User, "tgUser" | "referrals" | "referrer">>) {
    this.idInContract = data.idInContract ?? null;
    this.refID = data.refID ?? null;
    this.tgID = data.tgID ?? null;
    this.referrerID = data.referrerID ?? null;

    // Relations
    this.tgUser = data.tgUser ?? null;
    this.referrals = data.referrals;
    this.referrer = data.referrer ?? null;
  }

  get hasSwapped() {
    return this.idInContract !== undefined;
  }

  static findOneBy = async (params: Partial<User>) =>
    db.query.users
      .findFirst({
        where: and(...(Object.keys(params) as (keyof UserType)[]).map(key => eq(users[key], params[key]!))),
        with: { referrals: true, referrer: true, tgUser: true }, // TODO optimise,
      })
      .then(
        data =>
          data &&
          (() => {
            const { tgUser, referrals, referrer, ...otherData } = data;

            return new User({
              ...otherData,
              tgUser: tgUser && new TgUser(tgUser),
              referrals: referrals.map(r => new User(r)),
              referrer: referrer && new User(referrer),
            });
          })(),
      );

  static save = async (user: User) =>
    (!!user.address
      ? (() => {
          const { address, tgUser, referrals, referrer, ...updatedData } = user;
          return db.update(users).set(updatedData).where(eq(users.address, address));
        })()
      : db.insert(users).values(user)
    )
      .returning()
      .then(r => new User(r[0]));

  static async create(sender: string, chainId: ChainID, tgID?: number) {
    let user = await User.findOneBy({ address: sender });

    if (!user?.refID || !user.tgID) {
      // Create new user if was not created before
      user ??= new User({});
      user.address ??= sender;

      if (!user.refID) {
        // get user details from blockchain
        const userRefData = await getRefData(sender, chainId);

        user.refID = userRefData?.refIdData.refID ?? null;
        user.idInContract = userRefData?.refIdData.getUserID() || null;
        user.referrerID = userRefData?.referrerData?.refID || null;
      }

      // Set tgID
      tgID && (user.tgID ??= tgID);

      try {
        user = await User.save(user);
      } catch (error) {
        console.log("Create User Err: \n\n", { user, error });
      }
    }

    if (tgID && !user.tgUser) {
      // Attach TgUser if any
      user.tgUser = (await TgUser.findOneBy({ tgID })) || null;

      // Get tgReferrer and alert successful tg Invite
      if (user.referrerID) {
        const referrerTgUser = (await User.findOneBy({ refID: user.referrerID }))?.tgUser;

        referrerTgUser && alertReferralFirstSwap(referrerTgUser, user);
      }
    }

    user.tgUser && (await acceptJoinRequest(user.tgUser));

    return user;
  }
}
