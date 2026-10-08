import { pgTable, uuid, varchar, text, timestamp, bigint, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const backupTriggerEnum = pgEnum('backup_trigger', ['MANUAL', 'CRON']);
export const backupStatusEnum = pgEnum('backup_status', ['SUCCESS', 'FAILED']);

export const backupHistory = pgTable('backup_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).default(0).notNull(),
  triggerType: backupTriggerEnum('trigger_type').notNull(),
  status: backupStatusEnum('status').notNull(),
  verificationResult: jsonb('verification_result').$type<any>().default([]),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BackupHistoryRecord = typeof backupHistory.$inferSelect;
export type InsertBackupHistoryRecord = typeof backupHistory.$inferInsert;
