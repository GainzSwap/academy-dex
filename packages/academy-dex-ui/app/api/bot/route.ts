import { NextRequest } from "next/server";
import { bot } from "./bot";
import { webhookCallback } from "grammy";

const handler = webhookCallback(bot, "std/http");

export async function GET(req: NextRequest) {
  return await handler(req);
}

export async function POST(req: NextRequest) {
  return await handler(req);
}
