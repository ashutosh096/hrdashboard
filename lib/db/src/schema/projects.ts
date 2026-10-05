import { pgTable, text, timestamp, integer, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    entity: text('entity').notNull().default('EHM'), // 'EHM' | 'CAG'
    entityName: text('entity_name'),
    category: text('category').notNull().default('Technology & Systems'),
    lead: text('lead').default(''),
    team: jsonb('team').$type<string[]>().default([]),
    budget: text('budget'),
    startDate: text('start_date'),
    targetDate: text('target_date'),
    status: text('status').notNull().default('Planning'), // 'Planning' | 'Active' | 'In Review' | 'Completed'
    priority: text('priority').notNull().default('High'), // 'Low' | 'Medium' | 'High' | 'Urgent'
    techStack: text('tech_stack').default(''),
    deliverableUrl: text('deliverable_url').default(''),
    milestonesCount: integer('milestones_count').default(0),
    description: text('description').default(''),
    checkpoints: jsonb('checkpoints').$type<{ id: string; title: string; isCompleted: boolean }[]>().default([]),
    comments: jsonb('comments').$type<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>().default([]),
    deletedAt: timestamp('deleted_at'),
    createdById: uuid('created_by_id').references(() => employees.id, { onDelete: 'set null' }),
    createdByName: text('created_by_name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_projects_created_at').on(table.createdAt),
    index('idx_projects_entity').on(table.entity),
    index('idx_projects_status').on(table.status),
    index('idx_projects_deleted_at').on(table.deletedAt),
  ]
);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

