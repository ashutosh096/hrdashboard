import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { employees } from './employees.js';

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  authorId: uuid('author_id').references(() => employees.id),
  authorName: text('author_name'),
  content: text('content').notNull(),
  isSystemLog: boolean('is_system_log').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
