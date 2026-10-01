import { db, notifications, sql, eq, and, isNull, inArray } from '@workspace/db';

export const MAX_NOTIFICATIONS_LIMIT = 100;

/**
 * Ensures that the notifications table never exceeds `max` records (default 100).
 * If there are more than 100, the oldest notifications are automatically deleted.
 */
export async function pruneNotificationsToLimit(max = MAX_NOTIFICATIONS_LIMIT, executor: any = db): Promise<void> {
  try {
    await executor.execute(sql`
      DELETE FROM notifications 
      WHERE id NOT IN (
        SELECT id FROM notifications 
        ORDER BY created_at DESC 
        LIMIT ${max}
      )
    `);
  } catch (err) {
    console.error('[PRUNE NOTIFICATIONS ERROR]:', err);
  }
}

/**
 * Inserts a notification and automatically trims the total count to <= 100.
 */
export async function insertNotification(
  data: {
    userId: string;
    type: string;
    payload?: any;
    readAt?: Date | null;
  },
  executor: any = db
) {
  const [created] = await executor
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type,
      payload: data.payload || {},
      readAt: data.readAt || null,
    })
    .returning();

  // Enforce max 100 notifications limit: if 101 comes, oldest is removed
  await pruneNotificationsToLimit(MAX_NOTIFICATIONS_LIMIT, executor);

  return created;
}
