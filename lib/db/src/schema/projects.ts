import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  entity: text('entity').notNull().default('EHM'), // 'EHM' | 'CAG'
  entityName: text('entity_name'),
  category: text('category').notNull().default('Technology & Systems'),
  lead: text('lead').notNull().default('Dr. Harshit Mishra'),
  team: jsonb('team').$type<string[]>().default([]),
  budget: text('budget').default('$45,000'),
  startDate: text('start_date').default('2026-09-01'),
  targetDate: text('target_date').default('2026-12-15'),
  status: text('status').notNull().default('Planning'), // 'Planning' | 'Active' | 'In Review' | 'Completed'
  priority: text('priority').notNull().default('High'), // 'Low' | 'Medium' | 'High' | 'Urgent'
  techStack: text('tech_stack').default('React, Node.js, Python, GIS'),
  milestonesCount: integer('milestones_count').default(0),
  description: text('description').default(''),
  checkpoints: jsonb('checkpoints').$type<{ id: string; title: string; isCompleted: boolean }[]>().default([]),
  comments: jsonb('comments').$type<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
