import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { initiatives } from './initiatives.js';
import { employees } from './employees.js';

export const epicStatusEnum = pgEnum('epic_status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED']);

export const epics = pgTable('epics', {
  id: uuid('id').primaryKey().defaultRandom(),
  epicCode: varchar('epic_code', { length: 50 }).notNull().unique(), // e.g. EHM-EPIC-001
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  initiativeId: uuid('initiative_id').references(() => initiatives.id).notNull(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  department: varchar('department', { length: 100 }),
  targetWeek: varchar('target_week', { length: 100 }),
  sprintsCountTarget: integer('sprints_count_target').default(2),
  status: epicStatusEnum('status').default('PLANNED').notNull(),
  ownerId: uuid('owner_id').references(() => employees.id),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
