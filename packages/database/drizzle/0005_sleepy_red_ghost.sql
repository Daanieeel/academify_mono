/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'profiles'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "profiles" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_institution_id_pk" PRIMARY KEY("user_id","institution_id");--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "photo_ref" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar_background_color" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar_emoji" text;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "photo_ref";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "avatar_background_color";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "avatar_emoji";