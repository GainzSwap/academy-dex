import { bot } from "./bot";
import { webhookCallback } from "grammy";

export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

const handler = webhookCallback(bot, "std/http");

export const GET = handler;

export const POST = handler;
