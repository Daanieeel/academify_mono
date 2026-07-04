ALTER TABLE "institution_registry" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "institution_registry" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "institution_registry" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "institution_registry" ADD COLUMN "telephone" text;--> statement-breakpoint
ALTER TABLE "institution_registry" ADD COLUMN "description" text;