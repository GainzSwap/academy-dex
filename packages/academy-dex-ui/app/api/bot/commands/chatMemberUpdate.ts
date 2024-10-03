import { Composer } from "grammy";
import { TgUser } from "~~/drizzle/schema/models/TgUser";

export const chatMemberUpdate = new Composer();

chatMemberUpdate.on("chat_member", async ctx => {
  const newChatMember = ctx.chatMember?.new_chat_member;
  let tgUser = await TgUser.findOneBy({ tgID: newChatMember?.user.id });

  if (tgUser && newChatMember) {
    tgUser.groupChatStatus = newChatMember.status;
    tgUser = await TgUser.save(tgUser);

    switch (
      tgUser.groupChatStatus
      //  TODO notify user of status
    ) {
    }
  }
});
