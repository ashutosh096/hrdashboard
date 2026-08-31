import { pgTable, uuid, varchar, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';

export const employeeStatusEnum = pgEnum('employee_status', ['ACTIVE', 'TERMINATED']);

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  designation: varchar('designation', { length: 255 }).notNull(),
  salary: decimal('salary', { precision: 12, scale: 2 }).notNull(),
  joiningDate: timestamp('joining_date').notNull(),
  status: employeeStatusEnum('status').default('ACTIVE').notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
