CREATE TABLE IF NOT EXISTS "users" (
	"address" varchar PRIMARY KEY NOT NULL,
	"idInContract" bigint,
	"refID" varchar,
	"tgID" bigint,
	"referrerID" varchar,
	CONSTRAINT "users_address_unique" UNIQUE("address"),
	CONSTRAINT "users_idInContract_unique" UNIQUE("idInContract"),
	CONSTRAINT "users_refID_unique" UNIQUE("refID"),
	CONSTRAINT "users_tgID_unique" UNIQUE("tgID")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tgUsers" ADD CONSTRAINT "tgUsers_tgID_users_tgID_fk" FOREIGN KEY ("tgID") REFERENCES "public"."users"("tgID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
