ALTER TABLE "institutions" ALTER COLUMN "address" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "main_institution_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "can_manage_accounts" boolean DEFAULT false NOT NULL;