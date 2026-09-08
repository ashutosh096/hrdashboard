-- 0004_agile_schema_alignment.sql
-- Captured migration aligning Supabase schema constraints, new short ID sequence counters, task_type enum, and symmetric lineage CHECK constraint

DO $$ BEGIN
  CREATE TYPE "public"."epic_status" AS ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."task_type" AS ENUM('SPRINT_TASK', 'EPIC_TASK', 'BACKLOG');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."meeting_status" AS ENUM('SCHEDULED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Initiatives table constraints & columns
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "initiative_code" VARCHAR(50);
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "department_id" UUID REFERENCES "departments"("id");
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "sub_department" VARCHAR(100);
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "target_month" VARCHAR(100);
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "epics_count_target" INT DEFAULT 3;
ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "target_deliverable_metric" TEXT;

ALTER TABLE "initiatives" ALTER COLUMN "initiative_code" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_initiative_code_unique" UNIQUE ("initiative_code");
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;

-- 2. Epics table definition & columns
CREATE TABLE IF NOT EXISTS "epics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "epic_code" VARCHAR(50) NOT NULL UNIQUE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "initiative_id" UUID NOT NULL REFERENCES "initiatives"("id") ON DELETE CASCADE,
  "entity_id" UUID NOT NULL REFERENCES "entities"("id"),
  "department" VARCHAR(100),
  "target_week" VARCHAR(100),
  "sprints_count_target" INT DEFAULT 2,
  "next_task_seq" INT DEFAULT 1 NOT NULL,
  "status" "public"."epic_status" DEFAULT 'PLANNED' NOT NULL,
  "owner_id" UUID REFERENCES "employees"("id"),
  "target_date" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Sprints table definition & columns
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "sprint_code" VARCHAR(50);
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "employee_id" UUID REFERENCES "employees"("id");
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "epic_id" UUID REFERENCES "epics"("id");
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "reviewing_lead_id" UUID REFERENCES "employees"("id");
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "target_week" VARCHAR(100);
ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "next_task_seq" INT DEFAULT 1 NOT NULL;

ALTER TABLE "sprints" ALTER COLUMN "sprint_code" SET NOT NULL;
ALTER TABLE "sprints" ALTER COLUMN "employee_id" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "sprints" ADD CONSTRAINT "sprints_sprint_code_unique" UNIQUE ("sprint_code");
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;

-- 4. Tasks table definition & columns
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "epic_id" UUID REFERENCES "epics"("id");
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "task_type" "public"."task_type" DEFAULT 'BACKLOG' NOT NULL;

DO $$ BEGIN
  ALTER TABLE "tasks" ADD CONSTRAINT "chk_task_type_lineage" CHECK (
    (task_type = 'EPIC_TASK' AND epic_id IS NOT NULL AND sprint_id IS NULL) OR
    (task_type = 'SPRINT_TASK' AND sprint_id IS NOT NULL AND epic_id IS NULL) OR
    (task_type = 'BACKLOG' AND epic_id IS NULL AND sprint_id IS NULL)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;

-- 5. Entity Counters table columns
ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_initiative_seq" INT DEFAULT 1 NOT NULL;
ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_epic_seq" INT DEFAULT 1 NOT NULL;
ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_sprint_seq" INT DEFAULT 1 NOT NULL;
ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_backlog_task_seq" INT DEFAULT 1 NOT NULL;

-- 6. Meetings table columns
ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "status" "public"."meeting_status" DEFAULT 'SCHEDULED' NOT NULL;
