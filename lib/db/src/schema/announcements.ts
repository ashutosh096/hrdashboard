import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';

export const announcementPriorityEnum = pgEnum('announcement_priority', ['NORMAL', 'IMPORTANT', 'URGENT']);

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  priority: announcementPriorityEnum('priority').default('NORMAL').notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  targetEntityId: uuid('target_entity_id').references(() => entities.id), // nullable, null = all entities
  seenBy: jsonb('seen_by').default([]).notNull(), // array of user IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
