import { acceptJoinRequest, addTgUser, getBotLink, trySwapFirstTime } from "../service";
import { Composer } from "grammy";
import { TgUser } from "~~/drizzle/schema/models/TgUser";

export const chatJoinRequest = new Composer();

chatJoinRequest.on("chat_join_request", async ctx => {
  if (!ctx.from || !ctx.chat) {
    return;
  }

  // No need to await this, just fall through and process other stuff
  ctx.reply(
    `Welcome ${ctx.from.first_name} to Academy-DEX Community Chat, please click the <b>Process Request</b> button below to complete your join request`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Process Request",
              url: getBotLink(),
            },
          ],
        ],
      },
    },
  );

  const tgID = ctx.from.id;

  let tgUser = await TgUser.findOneBy({ tgID });
  const hadContactedBot = Boolean(tgUser);

  if (!tgUser?.joinReqSent) {
    tgUser = await addTgUser({
      from: ctx.from,
      joinReqSent: true,
    });
  }

  if (tgUser.user) {
    await acceptJoinRequest(tgUser);
  }

  if (hadContactedBot) {
    await trySwapFirstTime(tgUser);
  }
});
