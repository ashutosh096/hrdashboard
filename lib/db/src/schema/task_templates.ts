import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';
import { employees } from './employees.js';
import { taskPriorityEnum } from './tasks.js';

export const taskTemplates = pgTable('task_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  defaultTitlePattern: varchar('default_title_pattern', { length: 255 }).notNull(),
  defaultChecklistItems: jsonb('default_checklist_items').default([]).notNull(), // array of strings
  defaultPriority: taskPriorityEnum('default_priority').default('MEDIUM').notNull(),
  createdBy: uuid('created_by').references(() => employees.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
