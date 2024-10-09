CREATE TABLE IF NOT EXISTS "faucetEntry" (
	"address" varchar PRIMARY KEY NOT NULL,
	"nextClaimTimestamp" integer DEFAULT 0,
	CONSTRAINT "faucetEntry_address_unique" UNIQUE("address")
);
