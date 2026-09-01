import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';

export const entityCounters = pgTable('entity_counters', {
  entityId: uuid('entity_id').primaryKey().references(() => entities.id),
  nextEmployeeSeq: integer('next_employee_seq').default(1).notNull(),
});
