import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(), // 'MAR', 'DEV', 'OPS', 'HR', 'FIN'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
