CREATE TYPE "public"."meeting_status" AS ENUM('SCHEDULED', 'CANCELLED');--> statement-breakpoint
ALTER TYPE "public"."meeting_source" ADD VALUE 'GOOGLE_CALENDAR_IMPORTED';--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "status" "meeting_status" DEFAULT 'SCHEDULED' NOT NULL;