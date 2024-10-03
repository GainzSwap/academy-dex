import { chatJoinRequest } from "./commands/chatJoinRequest";
import { chatMemberUpdate } from "./commands/chatMemberUpdate";
import { init } from "./commands/init";
import { hearsReferrals } from "./commands/referrals";
import { start } from "./commands/start";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

export const bot = new Bot(token);
bot.use(init, start, hearsReferrals, chatMemberUpdate, chatJoinRequest);
