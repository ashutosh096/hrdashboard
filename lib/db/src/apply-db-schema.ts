import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: 'C:/hrdashboard/artifacts/api-server/.env' });
dotenv.config({ path: 'C:/hrdashboard/.env' });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in env');
    process.exit(1);
  }

  console.log('Connecting to Supabase Database to apply DDL schema changes...');

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    console.log('1. Creating epic_status enum...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."epic_status" AS ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('2. Adding initiative_code to initiatives table...');
    await client.query(`
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "initiative_code" VARCHAR(50);
    `);

    console.log('3. Creating epics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "epics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "epic_code" VARCHAR(50) NOT NULL UNIQUE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "initiative_id" UUID NOT NULL REFERENCES "initiatives"("id") ON DELETE CASCADE,
        "entity_id" UUID NOT NULL REFERENCES "entities"("id"),
        "status" "public"."epic_status" DEFAULT 'PLANNED' NOT NULL,
        "owner_id" UUID REFERENCES "employees"("id"),
        "target_date" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('4. Updating sprints table with sprint_code, employee_id, and epic_id...');
    await client.query(`
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "sprint_code" VARCHAR(50);
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "employee_id" UUID REFERENCES "employees"("id");
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "epic_id" UUID REFERENCES "epics"("id");
    `);

    console.log('5. Updating tasks table with epic_id...');
    await client.query(`
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "epic_id" UUID REFERENCES "epics"("id");
    `);

    console.log('6. Updating entity_counters table with next_initiative_seq, next_epic_seq, next_sprint_seq...');
    await client.query(`
      ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_initiative_seq" INT DEFAULT 1 NOT NULL;
      ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_epic_seq" INT DEFAULT 1 NOT NULL;
      ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_sprint_seq" INT DEFAULT 1 NOT NULL;
    `);

    console.log('7. Updating initiatives table with department_id, sub_department, target_month, epics_count_target, and target_deliverable_metric...');
    await client.query(`
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "department_id" UUID REFERENCES "departments"("id");
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "sub_department" VARCHAR(100);
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "target_month" VARCHAR(100);
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "epics_count_target" INT DEFAULT 3;
      ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "target_deliverable_metric" TEXT;
    `);

    console.log('8. Updating epics table with department, target_week, and sprints_count_target...');
    await client.query(`
      ALTER TABLE "epics" ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);
      ALTER TABLE "epics" ADD COLUMN IF NOT EXISTS "target_week" VARCHAR(100);
      ALTER TABLE "epics" ADD COLUMN IF NOT EXISTS "sprints_count_target" INT DEFAULT 2;
    `);

    console.log('9. Updating sprints table with reviewing_lead_id, department, and target_week...');
    await client.query(`
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "reviewing_lead_id" UUID REFERENCES "employees"("id");
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "department" VARCHAR(100);
      ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "target_week" VARCHAR(100);
    `);

    console.log('✅ SUPABASE POSTGRESQL AGILE SCHEMA SUCCESSFULLY UPDATED!');
  } catch (err) {
    console.error('Schema Migration Error:', err);
  } finally {
    await client.end();
  }
}

run();
