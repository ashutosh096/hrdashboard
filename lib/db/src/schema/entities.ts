import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const entities = pgTable('entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 10 }).notNull().unique(), // 'EHM', 'CAG'
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
