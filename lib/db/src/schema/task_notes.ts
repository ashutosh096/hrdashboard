import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { employees } from './employees.js';

export const taskNotes = pgTable('task_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  authorId: uuid('author_id').references(() => employees.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
