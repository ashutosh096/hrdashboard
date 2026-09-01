import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';
import { employees } from './employees.js';

export const initiativeStatusEnum = pgEnum('initiative_status', ['PLANNED', 'ACTIVE', 'DONE']);

export const initiatives = pgTable('initiatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: initiativeStatusEnum('status').default('PLANNED').notNull(),
  ownerId: uuid('owner_id').references(() => employees.id),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
