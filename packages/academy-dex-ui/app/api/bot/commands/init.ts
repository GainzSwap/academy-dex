import { adminUserName } from "../../constants";
import { getOrCreateCommChat } from "../service";
import { Composer } from "grammy";
import "~~/drizzle/envConfig";

export const init = new Composer();

init.hears("init", async ctx => {
  if (ctx.msg.from?.username !== adminUserName) {
    return;
  }

  const chat = ctx.chat;

  if (Boolean(await getOrCreateCommChat(chat.id, chat.username))) {
    await ctx.reply("Group Initialized");
  } else {
    await ctx.reply("Could not Initialize Group");
  }
});
