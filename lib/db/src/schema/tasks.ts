import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { departments } from './departments.js';
import { employees } from './employees.js';
import { sprints } from './sprints.js';
import { initiatives } from './initiatives.js';
import { epics } from './epics.js';
import { projects } from './projects.js';

export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = pgEnum('task_status', ['PLANNED', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'TO_REVIEW', 'DONE', 'DELAYED', 'BLOCKED', 'CANCELLED']);
export const taskTypeEnum = pgEnum('task_type', ['SPRINT_TASK', 'EPIC_TASK', 'BACKLOG']);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskCode: varchar('task_code', { length: 50 }).notNull().unique(), // e.g. EHM-I01-EP01-T001, EHM-E01-W1-T001
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    entityId: uuid('entity_id').references(() => entities.id).notNull(),
    departmentId: uuid('department_id').references(() => departments.id).notNull(),
    taskType: taskTypeEnum('task_type').default('BACKLOG').notNull(),
    sprintWeek: varchar('sprint_week', { length: 50 }), // Nullable now since we have sprintId FK
    sprintId: uuid('sprint_id').references(() => sprints.id),
    initiativeId: uuid('initiative_id').references(() => initiatives.id),
    epicId: uuid('epic_id').references(() => epics.id),
    projectId: uuid('project_id').references(() => projects.id),
    storyPoints: integer('story_points'),
    assigneeId: uuid('assignee_id').references(() => employees.id),
    assigneeIds: jsonb('assignee_ids').$type<string[]>().default([]),
    creatorId: uuid('creator_id').references(() => employees.id).notNull(),
    reviewingLeadId: uuid('reviewing_lead_id').references(() => employees.id),
    reviewingLeadIds: jsonb('reviewing_lead_ids').$type<string[]>().default([]),
    deliverableUrl: varchar('deliverable_url', { length: 500 }),
    deliverableLinks: jsonb('deliverable_links').$type<{ name: string; url: string; note?: string }[]>().default([]),
    parentTaskId: uuid('parent_task_id'),
    groupTaskId: uuid('group_task_id'), // UUID linking cloned group tasks
    status: taskStatusEnum('status').default('TODO').notNull(),
    priority: taskPriorityEnum('priority').default('MEDIUM').notNull(),
    dueDate: timestamp('due_date'),
    dependencyTaskId: uuid('dependency_task_id'),
    waitingOn: varchar('waiting_on', { length: 255 }).default('None (Self)'),
    createdById: uuid('created_by_id').references(() => employees.id, { onDelete: 'set null' }),
    createdByName: text('created_by_name'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_tasks_created_at').on(table.createdAt),
    index('idx_tasks_assignee_id').on(table.assigneeId),
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_priority').on(table.priority),
    index('idx_tasks_epic_id').on(table.epicId),
    index('idx_tasks_deleted_at').on(table.deletedAt),
  ]
);

