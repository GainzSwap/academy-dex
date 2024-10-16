import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const faucetEntry = pgTable("faucetEntry", {
  ipAddress: varchar("ipAddress").primaryKey().unique(),
  nextClaimTimestamp: integer("nextClaimTimestamp").default(0),
});
