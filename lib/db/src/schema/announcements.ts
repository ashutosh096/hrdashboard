import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { users } from './users.js';

export const announcementPriorityEnum = pgEnum('announcement_priority', ['NORMAL', 'IMPORTANT', 'URGENT']);

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  priority: announcementPriorityEnum('priority').default('NORMAL').notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  targetEntityId: uuid('target_entity_id').references(() => entities.id), // nullable, null = all entities
  createdBy: uuid('created_by').references(() => users.id),
  seenBy: jsonb('seen_by').default([]).notNull(), // legacy seen array
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const announcementReads = pgTable('announcement_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  announcementId: uuid('announcement_id').references(() => announcements.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('announcement_reads_ann_user_unique').on(table.announcementId, table.userId),
]);
