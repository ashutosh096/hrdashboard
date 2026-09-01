import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';

export const sprintStatusEnum = pgEnum('sprint_status', ['PLANNED', 'ACTIVE', 'COMPLETED']);

export const sprints = pgTable('sprints', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  name: varchar('name', { length: 100 }).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: sprintStatusEnum('status').default('PLANNED').notNull(),
  goal: text('goal'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
