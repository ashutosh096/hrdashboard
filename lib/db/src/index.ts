import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export { eq, ne, and, or, sql, lt, lte, gt, gte, asc, desc } from 'drizzle-orm';

export * from './schema/entities.js';
export * from './schema/departments.js';
export * from './schema/employees.js';
export * from './schema/entity_counters.js';
export * from './schema/users.js';
export * from './schema/invites.js';
export * from './schema/google_tokens.js';
export * from './schema/tasks.js';
export * from './schema/task_notes.js';
export * from './schema/task_checklists.js';
export * from './schema/task_comments.js';
export * from './schema/task_templates.js';
export * from './schema/meetings.js';
export * from './schema/meeting_attendees.js';
export * from './schema/attendance.js';
export * from './schema/announcements.js';
export * from './schema/applications.js';
export * from './schema/audit_logs.js';
export * from './schema/notifications.js';
export * from './schema/initiatives.js';
export * from './schema/epics.js';
export * from './schema/sprints.js';

const DEFAULT_DB_URL = 'postgresql://postgres.qlnghemivzcyazvtndhv:Hrdash%40123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const connectionString = process.env.DATABASE_URL || DEFAULT_DB_URL;
const isRemoteDb = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

const pool = new pg.Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool);
