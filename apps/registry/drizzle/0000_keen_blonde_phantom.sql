CREATE TYPE "public"."registry_deployment_mode" AS ENUM('hosted', 'self_hosted');--> statement-breakpoint
CREATE TYPE "public"."registry_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TABLE "institution_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"region" text,
	"deployment_mode" "registry_deployment_mode" DEFAULT 'hosted' NOT NULL,
	"backend_url" text NOT NULL,
	"status" "registry_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "institution_registry_slug_unique" UNIQUE("slug")
);
