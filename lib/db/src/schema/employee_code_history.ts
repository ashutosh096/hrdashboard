import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const employeeCodeHistory = pgTable('employee_code_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  oldCode: varchar('old_code', { length: 20 }).notNull(),
  newCode: varchar('new_code', { length: 20 }).notNull(),
  oldRole: varchar('old_role', { length: 20 }),
  newRole: varchar('new_role', { length: 20 }),
  changedBy: text('changed_by'),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
});

export type EmployeeCodeHistory = typeof employeeCodeHistory.$inferSelect;
