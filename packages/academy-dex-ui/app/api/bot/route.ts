import { NextRequest } from "next/server";
import { bot } from "./bot";
import { init } from "./commands/init";
import { start } from "./commands/start";
import { webhookCallback } from "grammy";

bot.use(init, start);
const handler = webhookCallback(bot, "std/http");

export async function GET(req: NextRequest) {
  return await handler(req);
}

export async function POST(req: NextRequest) {
  return await handler(req);
}
