import { pgTable, uuid, varchar, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const passwordResetOtps = pgTable(
  'password_reset_otps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    otpHash: varchar('otp_hash', { length: 255 }).notNull(),
    attempts: integer('attempts').default(0).notNull(),
    verified: boolean('verified').default(false).notNull(),
    resetToken: varchar('reset_token', { length: 255 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_password_reset_otps_email').on(table.email),
  ]
);
