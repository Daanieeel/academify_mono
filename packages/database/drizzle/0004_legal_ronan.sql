ALTER TABLE "invites" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "role_bindings" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
DROP TYPE "public"."role";