import { JOIN_GROUP_CHAT, REFERRALS } from "../../constants";
import { addTgUser, getOrCreateCommChat, trySwapFirstTime } from "../service";
import { Composer, Context } from "grammy";

export const startCommandHandler = async (ctx: Context) => {
  if (ctx.from?.is_bot) {
    return;
  }
  if (!ctx.from) {
    throw new Error("From must be defined");
  }

  await ctx.reply("Hello", {
    reply_markup: { resize_keyboard: true, keyboard: [[{ text: REFERRALS }]] },
  });

  const tgUser = await addTgUser({
    referrerID: ctx.match?.toString(),
    from: ctx.from,
  });

  if (tgUser.shouldJoinCommChat && !tgUser.joinReqSent) {
    const commChatUsername = (await getOrCreateCommChat()).username;

    await ctx.reply(`Welcome ${tgUser.firstName}, click the button below to join the Academy-DEX Community chat`, {
      reply_markup: {
        inline_keyboard: [[{ text: JOIN_GROUP_CHAT, url: `t.me/${commChatUsername}` }]],
      },
    });
  } else {
    await trySwapFirstTime(tgUser);
  }
};

export const start = new Composer();
start.command("start", startCommandHandler);
