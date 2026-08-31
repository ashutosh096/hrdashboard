import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MANAGER', 'EMPLOYEE']);
export const userStatusEnum = pgEnum('user_status', ['PENDING', 'ACTIVE', 'INACTIVE']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }), // nullable for pending invites
  role: userRoleEnum('role').default('EMPLOYEE').notNull(),
  status: userStatusEnum('status').default('PENDING').notNull(),
  employeeId: uuid('employee_id').references(() => employees.id),
  managedTeamId: uuid('managed_team_id'), // optional scoping for managers
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
