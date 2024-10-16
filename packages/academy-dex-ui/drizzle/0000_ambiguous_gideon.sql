CREATE TABLE IF NOT EXISTS "faucetEntry" (
	"ipAddress" varchar PRIMARY KEY NOT NULL,
	"nextClaimTimestamp" integer DEFAULT 0,
	CONSTRAINT "faucetEntry_ipAddress_unique" UNIQUE("ipAddress")
);
