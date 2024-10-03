ALTER TABLE "tgUsers" DROP CONSTRAINT "tgUsers_tgID_unique";--> statement-breakpoint
ALTER TABLE "tgUsers" ALTER COLUMN "tgID" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "tgUsers" ALTER COLUMN "tgID" SET NOT NULL;