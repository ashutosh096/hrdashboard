import { pgTable, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { meetings } from './meetings.js';
import { employees } from './employees.js';

export const responseStatusEnum = pgEnum('response_status', ['PENDING', 'ACCEPTED', 'DECLINED']);

export const meetingAttendees = pgTable('meeting_attendees', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id').references(() => meetings.id).notNull(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  responseStatus: responseStatusEnum('response_status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
