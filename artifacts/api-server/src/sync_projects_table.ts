import { db, sql } from '@workspace/db';

async function run() {
  console.log('Ensuring projects table exists in Postgres...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      entity TEXT NOT NULL DEFAULT 'EHM',
      entity_name TEXT,
      category TEXT NOT NULL DEFAULT 'Technology & Systems',
      lead TEXT NOT NULL DEFAULT 'Dr. Harshit Mishra',
      team JSONB DEFAULT '[]'::jsonb,
      budget TEXT DEFAULT '$45,000',
      start_date TEXT DEFAULT '2026-09-01',
      target_date TEXT DEFAULT '2026-12-15',
      status TEXT NOT NULL DEFAULT 'Planning',
      priority TEXT NOT NULL DEFAULT 'High',
      tech_stack TEXT DEFAULT 'React, Node.js, Python, GIS',
      milestones_count INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      checkpoints JSONB DEFAULT '[]'::jsonb,
      comments JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
    );
  `);
  console.log('✅ projects table verified and created successfully without any data loss!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error creating projects table:', err);
  process.exit(1);
});
