import { pgTable, integer } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';

/**
 * Single-row global counter table — Step 2 new code formats.
 * Format: PREFIX + 4 zero-padded digits:
 *   - ADMIN    -> ADMN0001
 *   - MANAGER  -> MANA0001
 *   - EMPLOYEE -> TEAM0001
 *   - INITIATIVE -> INIT0001
 *   - EPIC       -> EPIC0001
 *   - EPIC TASK  -> TASK0001
 *   - SPRINT TASK-> STSK0001
 *   - BACKLOG    -> BLOG0001
 *   - SPRINT     -> SPRT0001
 *   - PROJECT    -> PROJ0001
 * Counters are NEVER decremented; deleted records leave gaps (by design).
 */
export const globalCounters = pgTable('global_counters', {
  id: integer('id').primaryKey().default(1), // always 1
  nextAdmnSeq: integer('next_admn_seq').default(1).notNull(),
  nextManaSeq: integer('next_mana_seq').default(1).notNull(),
  nextTeamSeq: integer('next_team_seq').default(1).notNull(),
  nextInitSeq: integer('next_init_seq').default(1).notNull(),
  nextEpicSeq: integer('next_epic_seq').default(1).notNull(),
  nextEpicTaskSeq: integer('next_epic_task_seq').default(1).notNull(),
  nextSprintTaskSeq: integer('next_sprint_task_seq').default(1).notNull(),
  nextBlogTaskSeq: integer('next_blog_task_seq').default(1).notNull(),
  nextSprintSeq: integer('next_sprint_seq').default(1).notNull(),
  nextProjectSeq: integer('next_project_seq').default(1).notNull(),
});

export type GlobalCounters = typeof globalCounters.$inferSelect;

export type GlobalCounterType =
  | 'ADMN'
  | 'MANA'
  | 'TEAM'
  | 'INIT'
  | 'EPIC'
  | 'TASK'
  | 'STSK'
  | 'BLOG'
  | 'SPRT'
  | 'PROJ';

export async function generateNextGlobalCode(
  type: GlobalCounterType,
  executor: any
): Promise<string> {
  let updateObj: any;
  let key: keyof GlobalCounters;
  let prefix: string;

  switch (type) {
    case 'ADMN':
      updateObj = { nextAdmnSeq: sql`${globalCounters.nextAdmnSeq} + 1` };
      key = 'nextAdmnSeq';
      prefix = 'ADMN';
      break;
    case 'MANA':
      updateObj = { nextManaSeq: sql`${globalCounters.nextManaSeq} + 1` };
      key = 'nextManaSeq';
      prefix = 'MANA';
      break;
    case 'TEAM':
      updateObj = { nextTeamSeq: sql`${globalCounters.nextTeamSeq} + 1` };
      key = 'nextTeamSeq';
      prefix = 'TEAM';
      break;
    case 'INIT':
      updateObj = { nextInitSeq: sql`${globalCounters.nextInitSeq} + 1` };
      key = 'nextInitSeq';
      prefix = 'INIT';
      break;
    case 'EPIC':
      updateObj = { nextEpicSeq: sql`${globalCounters.nextEpicSeq} + 1` };
      key = 'nextEpicSeq';
      prefix = 'EPIC';
      break;
    case 'TASK':
      updateObj = { nextEpicTaskSeq: sql`${globalCounters.nextEpicTaskSeq} + 1` };
      key = 'nextEpicTaskSeq';
      prefix = 'TASK';
      break;
    case 'STSK':
      updateObj = { nextSprintTaskSeq: sql`${globalCounters.nextSprintTaskSeq} + 1` };
      key = 'nextSprintTaskSeq';
      prefix = 'STSK';
      break;
    case 'BLOG':
      updateObj = { nextBlogTaskSeq: sql`${globalCounters.nextBlogTaskSeq} + 1` };
      key = 'nextBlogTaskSeq';
      prefix = 'BLOG';
      break;
    case 'SPRT':
      updateObj = { nextSprintSeq: sql`${globalCounters.nextSprintSeq} + 1` };
      key = 'nextSprintSeq';
      prefix = 'SPRT';
      break;
    case 'PROJ':
      updateObj = { nextProjectSeq: sql`${globalCounters.nextProjectSeq} + 1` };
      key = 'nextProjectSeq';
      prefix = 'PROJ';
      break;
  }

  // Ensure row 1 exists
  await executor
    .insert(globalCounters)
    .values({ id: 1 })
    .onConflictDoNothing();

  const [row] = await executor
    .update(globalCounters)
    .set(updateObj)
    .where(eq(globalCounters.id, 1))
    .returning();

  const seq = (row[key] as number) - 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

/**
 * Universal team member code generator.
 * Role prefixes: ADMIN -> ADMN####, MANAGER -> MANA####, EMPLOYEE -> TEAM####
 */
export async function generateEmployeeCode(
  role: string | null | undefined,
  executor: any
): Promise<string> {
  const normalizedRole = (role || 'EMPLOYEE').toUpperCase().trim();
  if (normalizedRole === 'ADMIN') {
    return generateNextGlobalCode('ADMN', executor);
  } else if (normalizedRole === 'MANAGER') {
    return generateNextGlobalCode('MANA', executor);
  } else {
    return generateNextGlobalCode('TEAM', executor);
  }
}
