import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { entities } from './entities.js';

export const entityCounters = pgTable('entity_counters', {
  entityId: uuid('entity_id').primaryKey().references(() => entities.id),
  nextEmployeeSeq: integer('next_employee_seq').default(1).notNull(),
  nextInitiativeSeq: integer('next_initiative_seq').default(1).notNull(),
  nextEpicSeq: integer('next_epic_seq').default(1).notNull(),
  nextSprintSeq: integer('next_sprint_seq').default(1).notNull(),
  nextBacklogTaskSeq: integer('next_backlog_task_seq').default(1).notNull(),
});
