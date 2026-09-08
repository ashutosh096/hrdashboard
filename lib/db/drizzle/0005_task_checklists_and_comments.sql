-- 0005_task_checklists_and_comments.sql
-- Migration adding sort_order and completed_at to task_checklists, and creating task_comments table

ALTER TABLE "task_checklists" ADD COLUMN IF NOT EXISTS "sort_order" INT DEFAULT 1 NOT NULL;
ALTER TABLE "task_checklists" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP;
ALTER TABLE "task_checklists" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW() NOT NULL;

CREATE TABLE IF NOT EXISTS "task_comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" UUID NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "author_id" UUID REFERENCES "employees"("id"),
  "author_name" VARCHAR(255),
  "content" TEXT NOT NULL,
  "is_system_log" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);
