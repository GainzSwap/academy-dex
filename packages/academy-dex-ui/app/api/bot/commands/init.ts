import * as schema from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { Composer } from "grammy";
import { db } from "~~/drizzle/db";
import "~~/drizzle/envConfig";

export const init = new Composer();

const adminUserName = process.env.ADMIN_TG_USERANME;
if (!adminUserName) {
  throw new Error("tg admin not set");
}

let commChat: schema.Chat | undefined;

init.hears("init", async ctx => {
  if (ctx.msg.from?.username !== adminUserName) {
    return;
  }

  const { id: groupID, username: groupUsername } = ctx.chat;

  const commChatDbID = 1;
  commChat ??= await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.id, commChatDbID))
    .then(result => result.at(0));

  if (groupID && groupUsername && !commChat) {
    commChat = await db
      .insert(schema.chats)
      .values({
        id: commChatDbID,
        tgId: BigInt(groupID),
        username: groupUsername,
      })
      .returning()
      .then(reseult => reseult.at(0));
  }
  try {
    const bot = ctx.me;
    await db.insert(schema.tgUsers).values({
      refID: "1",
      firstName: bot.first_name,
      tgID: BigInt(bot.id),
      username: bot.username,
      languageCode: bot.language_code,
    });
  } catch (error: any) {
    console.error(`Add bot to TgUsers err: ${error.toString()}`);
  }

  if (!commChat) {
    ctx.reply("Could not Initialize Group");
    throw new Error("Community Chat not set");
  } else {
    ctx.reply("Group Initialized");
  }
});
