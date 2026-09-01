import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });

export { eq, and, or, sql } from 'drizzle-orm';

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
export * from './schema/task_templates.js';
export * from './schema/meetings.js';
export * from './schema/meeting_attendees.js';
export * from './schema/attendance.js';
export * from './schema/announcements.js';
export * from './schema/applications.js';
export * from './schema/audit_logs.js';
export * from './schema/notifications.js';
export * from './schema/initiatives.js';
export * from './schema/sprints.js';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/hros_db';
const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool);
