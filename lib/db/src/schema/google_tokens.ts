import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const googleTokens = pgTable('google_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  accessToken: varchar('access_token', { length: 2048 }).notNull(), // encrypted at rest
  refreshToken: varchar('refresh_token', { length: 2048 }).notNull(), // encrypted at rest
  expiry: timestamp('expiry').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
