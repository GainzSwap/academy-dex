import { init } from "./commands/init";
import { Bot, webhookCallback } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);

export async function GET() {
  bot.use(init);

  if (!bot.isInited()) {
    await bot.start({ allowed_updates: ["message", "chat_join_request", "chat_member"] });
  }

  //   return webhookCallback(bot, "std/http");
  return Response.json({});
}
