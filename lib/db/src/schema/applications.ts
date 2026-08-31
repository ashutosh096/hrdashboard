import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const applicationTypeEnum = pgEnum('application_type', ['REMOTE_WORK', 'REIMBURSEMENT', 'EQUIPMENT']);
export const applicationStatusEnum = pgEnum('application_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  type: applicationTypeEnum('type').notNull(),
  reason: text('reason').notNull(),
  status: applicationStatusEnum('status').default('PENDING').notNull(),
  reviewedBy: uuid('reviewed_by').references(() => employees.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
