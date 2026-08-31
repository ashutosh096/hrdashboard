import { pgTable, uuid, date, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const workModeEnum = pgEnum('work_mode', ['IN_OFFICE', 'REMOTE', 'HYBRID']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT']);

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  date: date('date').notNull(),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  workMode: workModeEnum('work_mode').default('IN_OFFICE').notNull(),
  status: attendanceStatusEnum('status').default('PRESENT').notNull(),
  totalHours: decimal('total_hours', { precision: 5, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
