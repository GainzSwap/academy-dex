import { chats, tgUsers } from "./schema";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const db = drizzle(sql, { schema: { chats, tgUsers } });
