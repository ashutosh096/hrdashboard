import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';
import { userRoleEnum } from './users.js';

export const inviteStatusEnum = pgEnum('invite_status', ['PENDING', 'ACCEPTED', 'EXPIRED']);

export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').default('EMPLOYEE').notNull(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  status: inviteStatusEnum('status').default('PENDING').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
