import { REFERRALS } from "../constants";
import { getTgRefLink } from "../service";
import { startCommandHandler } from "./start";
import { Composer } from "grammy";
import { TgUser } from "~~/drizzle/schema/models/TgUser";

export const hearsReferrals = new Composer();

hearsReferrals.hears(REFERRALS, async ctx => {
  if (!ctx.from) {
    return;
  }

  const tgUser = await TgUser.findOneBy({
    tgID: ctx.from.id,
  });
  if (!tgUser || tgUser.shouldJoinCommChat) {
    await startCommandHandler(ctx);
    return;
  }

  const refLink = await getTgRefLink(tgUser);
  let message = `Your referral link is\n\n<code>${refLink}</code>`;
  // Telegram has limit to messages, so we need to break the message into multiple places
  let extraMsgs: string[] = [];

  if (tgUser.referrals?.length) {
    message += `\n\nThese are your Telegram referrals:\n`;

    let iterationCount = 0;
    const maxRefPerMsg = 50;
    tgUser.referrals.forEach(({ firstName, user }, index) => {
      const sn = index + 1;
      const akuMintStatus = !user?.hasSwapped ? "❌" : "✅";
      const msg = `\n<b>${sn}.)</b> ${akuMintStatus} ${firstName}`;

      if (iterationCount < maxRefPerMsg) {
        message += msg;
      } else {
        const extrasIndex = Math.floor(iterationCount / maxRefPerMsg) - 1;
        let extraMessage = extraMsgs[extrasIndex] || "";
        extraMessage += msg;
        extraMsgs[extrasIndex] = extraMessage;
      }

      iterationCount++;
    });
  }

  ctx.reply(message, { parse_mode: "HTML" }).then(async () => {
    for (const msg of extraMsgs) {
      await ctx.reply(msg, { parse_mode: "HTML" });
    }
  });
});
