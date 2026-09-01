import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';
import { employees } from './employees.js';
import { sprints } from './sprints.js';
import { initiatives } from './initiatives.js';

export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = pgEnum('task_status', ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskCode: varchar('task_code', { length: 50 }).notNull().unique(), // e.g. EHM-EMP01-002, CAG-DEV-SPR-101
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  sprintWeek: varchar('sprint_week', { length: 50 }), // Nullable now since we have sprintId FK
  sprintId: uuid('sprint_id').references(() => sprints.id),
  initiativeId: uuid('initiative_id').references(() => initiatives.id),
  storyPoints: integer('story_points'),
  assigneeId: uuid('assignee_id').references(() => employees.id).notNull(),
  creatorId: uuid('creator_id').references(() => employees.id).notNull(),
  reviewingLeadId: uuid('reviewing_lead_id').references(() => employees.id),
  deliverableUrl: varchar('deliverable_url', { length: 500 }),
  parentTaskId: uuid('parent_task_id'),
  groupTaskId: uuid('group_task_id'), // UUID linking cloned group tasks
  status: taskStatusEnum('status').default('TODO').notNull(),
  priority: taskPriorityEnum('priority').default('MEDIUM').notNull(),
  dueDate: timestamp('due_date').notNull(),
  dependencyTaskId: uuid('dependency_task_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
