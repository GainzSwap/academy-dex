import { adminUserName, dappUrl_ } from "../constants";
import { bot } from "./bot";
import { randomString } from "./helpers";
import Encryption from "./utils/Encryption";
import { createConfig, readContract } from "@wagmi/core";
import { eq } from "drizzle-orm";
import type { User as TgUserType } from "grammy/types";
import { createClient, http } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";
import { db } from "~~/drizzle/db";
import { chats, tgUsers } from "~~/drizzle/schema/index";
import { TgUser } from "~~/drizzle/schema/models/TgUser";
import { User } from "~~/drizzle/schema/models/User";
import { Chat, IUser } from "~~/drizzle/schema/types";
import scaffoldConfig from "~~/scaffold.config";
import { RefIdData } from "~~/utils";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

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
  const tgUser = await makeOrFindTgUser(from.id);

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

  return await TgUser.save(tgUser);
}

export function getTgRefLink(tgUser: TgUser) {
  return `${getBotLink()}/?start=${tgUser.refID}`;
}

export function getBotLink() {
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

    const linkage = new TgDappLinkage(tgUser.tgID, tgUser.referrerID || undefined).toString();
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

async function botOwner() {
  return TgUser.findOneBy({ username: adminUserName });
}

export async function acceptJoinRequest(tgUser: TgUser) {
  try {
    if (tgUser.joinReqSent) {
      tgUser.joinReqSent = false;
      tgUser = await TgUser.save(tgUser);
      
      await bot.api.approveChatJoinRequest((await getOrCreateCommChat()).tgID, tgUser.tgID);
    }
  } catch (error: any) {
    try {
      const mexID = (await botOwner())?.tgID;
      mexID && bot.api.sendMessage(mexID, error.toString());
    } catch (error: any) {
      console.log(error.toString());
    }
  }
}

export async function alertReferralFirstSwap(user: TgUser, referral: User) {
  const referral_firstName =
    referral.tgUser?.firstName || (await TgUser.findOneBy({ tgID: referral.tgID || undefined }))?.firstName;

  const message = `🥳 Your referral ${
    referral_firstName ? referral_firstName : referral.address
  } just did their first Swap!`;

  return await bot.api.sendMessage(user.tgID, message);
}

export type ChainID = (typeof scaffoldConfig)["targetNetworks"][number]["id"];

export const wagmiConfigServer = (chainID: ChainID) =>
  createConfig({
    chains: [scaffoldConfig.targetNetworks.find(network => network.id == chainID)!],
    ssr: true,
    client({ chain }) {
      return createClient({
        chain,
        transport: http(getAlchemyHttpUrl(chain.id)),
      });
    },
  });

export async function getAffiliateDetails(address: string, chainId: ChainID) {
  const Router = deployedContracts[chainId].Router;
  const config = wagmiConfigServer(chainId);

  const [[_referrerID, referrerAddress], _userID] = await Promise.all([
    readContract(config, {
      abi: Router.abi,
      address: Router.address,
      functionName: "getReferrer",
      args: [address],
    }),
    readContract(config, {
      abi: Router.abi,
      address: Router.address,
      functionName: "getUserId",
      args: [address],
    }),
  ]);

  const userID = +_userID.toString();
  const referrerID = +_referrerID.toString();

  return {
    userID: userID > 0 ? userID : undefined,
    referrerData: referrerID <= 0 ? undefined : { id: referrerID, address: referrerAddress },
  };
}

export async function getRefData(address: string, chainId: ChainID) {
  // get user details from blockchain
  const { referrerData, userID } = await getAffiliateDetails(address, chainId);

  return !userID
    ? undefined
    : {
        refIdData: new RefIdData(address, userID),
        referrerData: referrerData && new RefIdData(referrerData.address, referrerData.id),
      };
}

export async function getUserForUI(address: string, chainId: ChainID): Promise<IUser> {
  // try creating user
  const user = await User.create(address, chainId);
  const tgUser = (await TgUser.findOneBy({ tgID: user.tgID || undefined })) || null;

  tgUser && (tgUser.refID = getTgRefLink(tgUser));
  user.tgUser = tgUser;

  return user;
}
