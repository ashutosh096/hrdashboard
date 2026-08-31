import { pgTable, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.js';
import { employees } from './employees.js';

export const taskChecklists = pgTable('task_checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  itemText: varchar('item_text', { length: 255 }).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedBy: uuid('completed_by').references(() => employees.id),
});
