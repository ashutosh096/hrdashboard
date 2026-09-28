import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { employees } from './employees.js';

export const recordHistoryTable = pgTable(
  'record_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tableName: varchar('table_name', { length: 50 }).notNull(),
    recordId: uuid('record_id').notNull(),
    action: varchar('action', { length: 50 }).notNull(), // CREATED, UPDATED, STATUS_CHANGED, ASSIGNED, DUE_DATE_CHANGED, CLONED, CHILD_ADDED, DELETED
    fieldName: varchar('field_name', { length: 100 }),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    changedById: uuid('changed_by_id').references(() => employees.id, { onDelete: 'set null' }),
    changedByName: text('changed_by_name').notNull(),
    changedAt: timestamp('changed_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_record_history_tbl_rec_time').on(table.tableName, table.recordId, table.changedAt.desc()),
  ]
);

export type RecordHistory = typeof recordHistoryTable.$inferSelect;
export type InsertRecordHistory = typeof recordHistoryTable.$inferInsert;
