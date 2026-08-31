import { pgTable, uuid, varchar, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const meetingSourceEnum = pgEnum('meeting_source', ['INTERNAL', 'GOOGLE_CALENDAR']);

export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: varchar('location', { length: 255 }).default('Google Meet').notNull(),
  googleMeetUrl: varchar('google_meet_url', { length: 500 }),
  organizerId: uuid('organizer_id').references(() => employees.id).notNull(),
  invitees: jsonb('invitees').default([]).notNull(), // array of employee IDs
  googleEventId: varchar('google_event_id', { length: 255 }).unique(),
  source: meetingSourceEnum('source').default('INTERNAL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
