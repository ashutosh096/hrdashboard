import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { initiatives } from './initiatives.js';
import { projects } from './projects.js';
import { employees } from './employees.js';

export const epicStatusEnum = pgEnum('epic_status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED']);

export const epics = pgTable('epics', {
  id: uuid('id').primaryKey().defaultRandom(),
  epicCode: varchar('epic_code', { length: 50 }).notNull().unique(), // e.g. EHM-EPIC-001
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  initiativeId: uuid('initiative_id').references(() => initiatives.id), // optional parent initiative
  projectId: uuid('project_id').references(() => projects.id), // optional parent project
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  department: varchar('department', { length: 100 }),
  targetWeek: varchar('target_week', { length: 100 }),
  sprintsCountTarget: integer('sprints_count_target').default(2),
  nextTaskSeq: integer('next_task_seq').default(1).notNull(),
  status: epicStatusEnum('status').default('PLANNED').notNull(),
  ownerId: uuid('owner_id').references(() => employees.id),
  assignedTo: text('assigned_to'),  // JSON array of employee names (ADMIN/MANAGER only)
  createdById: uuid('created_by_id').references(() => employees.id, { onDelete: 'set null' }),
  createdByName: text('created_by_name'),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Epic = typeof epics.$inferSelect;
export type InsertEpic = typeof epics.$inferInsert;
