import { bot } from "./bot";
import { adminUserName, dappUrl_ } from "./constants";
import { randomString } from "./helpers";
import Encryption from "./utils/Encryption";
import { and, eq } from "drizzle-orm";
import type { User as TgUserType } from "grammy/types";
import { db } from "~~/drizzle/db";
import { chats, tgUsers } from "~~/drizzle/schema/index";
import { TgUser } from "~~/drizzle/schema/models/TgUser";
import { Chat } from "~~/drizzle/schema/types";

let commChat: Chat | undefined;

const encryption = Encryption.new();
export class TgDappLinkage {
  constructor(
    public tgID?: number,
    public referrerID_tg?: string,
  ) {}

  toString() {
    return encryption.encryptPlainText(JSON.stringify(this));
  }

  static fromString(data: string) {
    const { tgID, referrerID_tg } = JSON.parse(encryption.decryptCipherText(data));
    return new TgDappLinkage(tgID, referrerID_tg);
  }
}

export async function getOrCreateCommChat(groupID: number | null = null, groupUsername: string | null = null) {
  const commChatDbID = 1;
  commChat ??= await db
    .select()
    .from(chats)
    .where(eq(chats.id, commChatDbID))
    .then(result => result.at(0));

  if (groupID && groupUsername && !commChat) {
    commChat = await db
      .insert(chats)
      .values({
        id: commChatDbID,
        tgID: groupID,
        username: groupUsername,
      })
      .returning()
      .then(reseult => reseult.at(0));
  }
  try {
    const botInfo = bot.botInfo;
    await db.insert(tgUsers).values({
      refID: "1",
      firstName: botInfo.first_name,
      tgID: botInfo.id,
      username: botInfo.username,
      languageCode: botInfo.language_code,
    });
  } catch (error: any) {
    console.error(`Add bot to TgUsers err: ${error.toString()}`);
  }

  if (!commChat) {
    throw new Error("Community Chat not set");
  }

  return commChat;
}

async function getChatMember(tgID: number) {
  const commChat = await getOrCreateCommChat();

  return await bot.api.getChatMember(commChat.tgID, tgID);
}

async function makeOrFindTgUser(tgID: number): Promise<TgUser> {
  let tgUser = await TgUser.findOneBy({ tgID });

  if (!tgUser) {
    tgUser = new TgUser({ tgID });

    const makeRefId = () => (tgUser!.refID = randomString(10));
    const refIdIsUnique = async () => (await TgUser.findOneBy({ refID: makeRefId() })) === null;

    let trials = 10;
    while (!(await refIdIsUnique()) && trials > 0) {
      trials--;
    }
    if (!tgUser.refID) {
      throw `RefID not created for ${tgID}`;
    }
  }

  return tgUser;
}

export async function addTgUser({
  referrerID,
  from,
  joinReqSent,
}: {
  referrerID?: string;
  from: TgUserType;
  joinReqSent?: boolean;
}) {
  // Make user with thier refID and tgID attached
  let tgUser = await makeOrFindTgUser(from.id);

  // Ensure referrerID is valid
  !tgUser.referrerID &&
    (tgUser.referrerID =
      (await TgUser.findOneBy(referrerID ? { refID: referrerID } : { username: adminUserName }))?.refID ?? null);

  if (tgUser.refID == tgUser.referrerID) {
    tgUser.referrerID = null;
  }

  tgUser.isBot = from.is_bot;
  tgUser.firstName = from.first_name;
  tgUser.lastName = from.last_name ?? null;
  tgUser.username = from.username ?? null;
  tgUser.languageCode = from.language_code ?? null;
  // Request for chatMemberStatus only if user should join group and join request was not just sent
  tgUser.shouldJoinCommChat && !joinReqSent && (tgUser.groupChatStatus = (await getChatMember(from.id)).status);
  joinReqSent !== undefined && (tgUser.joinReqSent = joinReqSent);

  return await (
    tgUser.id !== undefined
      ? (() => {
          const { id, ...updatedData } = tgUser;
          return db.update(tgUsers).set(updatedData).where(eq(tgUsers.id, id));
        })()
      : db.insert(tgUsers).values(tgUser)
  )
    .returning()
    .then(r => new TgUser(r[0]));
}

export async function getTgRefLink(tgUser: TgUser) {
  return `${await getBotLink()}/?start=${tgUser.refID}`;
}

export async function getBotLink() {
  return `https://t.me/${bot.botInfo.username}`;
}

export async function trySwapFirstTime(tgUser: TgUser) {
  // Try an update user parameter of tgUser from db
  tgUser =
    (await TgUser.findOneBy({
      id: tgUser.id,
      // user: true,
      // referredByUser: { user: true },
    })) ?? tgUser;

  if (!tgUser.user?.idInContract) {
    // User has not minted Aku

    let dappUrl = dappUrl_;

    let linkage = new TgDappLinkage(tgUser.tgID, tgUser.referrerID || undefined).toString();
    if (linkage) {
      dappUrl += `?tgLinkage=${linkage}`;
    }

    const btnName = "Swap Now";
    bot.api.sendMessage(tgUser.tgID, `Click the <b>${btnName}</b> button to begin your participation in the CGC.`, {
      parse_mode: "HTML",
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [
          [
            {
              text: btnName,
              url: dappUrl,
            },
          ],
        ],
      },
    });
  }
}
