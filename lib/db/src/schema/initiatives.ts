import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';
import { employees } from './employees.js';

export const initiativeStatusEnum = pgEnum('initiative_status', ['PLANNED', 'ACTIVE', 'DONE']);

export const initiatives = pgTable('initiatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  initiativeCode: varchar('initiative_code', { length: 50 }).notNull().unique(), // e.g. EHM-INIT-001
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  subDepartment: varchar('sub_department', { length: 100 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetMonth: varchar('target_month', { length: 100 }), // e.g. Month 1 (Weeks 1–4)
  epicsCountTarget: integer('epics_count_target').default(3),
  targetDeliverableMetric: text('target_deliverable_metric'),
  status: initiativeStatusEnum('status').default('PLANNED').notNull(),
  ownerId: uuid('owner_id').references(() => employees.id),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
