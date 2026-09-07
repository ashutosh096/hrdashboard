import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';
import { employees } from './employees.js';
import { epics } from './epics.js';

export const sprintStatusEnum = pgEnum('sprint_status', ['PLANNED', 'ACTIVE', 'COMPLETED']);

export const sprints = pgTable('sprints', {
  id: uuid('id').primaryKey().defaultRandom(),
  sprintCode: varchar('sprint_code', { length: 50 }).notNull().unique(), // e.g. EHM-EMP01-SPR-01
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(), // Personal sprint owner
  epicId: uuid('epic_id').references(() => epics.id),
  reviewingLeadId: uuid('reviewing_lead_id').references(() => employees.id),
  department: varchar('department', { length: 100 }),
  targetWeek: varchar('target_week', { length: 100 }),
  name: varchar('name', { length: 100 }).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: sprintStatusEnum('status').default('PLANNED').notNull(),
  goal: text('goal'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
