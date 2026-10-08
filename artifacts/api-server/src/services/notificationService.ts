import { db, notifications, sql, eq, and, isNull } from '@workspace/db';

export const MAX_NOTIFICATIONS_PER_USER = 100;

/**
 * Prunes the OLDEST notifications for a specific user once they exceed MAX_NOTIFICATIONS_PER_USER.
 * Scoped per-user — never touches another user's rows.
 */
export async function pruneNotificationsForUser(userId: string, executor: any = db): Promise<void> {
  try {
    await executor.execute(sql`
      DELETE FROM notifications
      WHERE id IN (
        SELECT id FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        OFFSET ${MAX_NOTIFICATIONS_PER_USER}
      )
    `);
  } catch (err) {
    console.error('[PRUNE NOTIFICATIONS (PER-USER) ERROR]:', err);
  }
}

/**
 * Inserts a single notification row for the given userId (must be users.id, NOT employees.id).
 * After insert, prunes oldest rows for that user to keep limit at MAX_NOTIFICATIONS_PER_USER.
 */
export async function insertNotification(
  data: {
    userId: string;   // MUST be users.id — the canonical user account UUID
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

  // Per-user prune: keep at most MAX_NOTIFICATIONS_PER_USER rows per user
  await pruneNotificationsForUser(data.userId, executor);

  return created;
}

// Legacy export — kept only for calendar-reconnect cron which still uses it;
// it should be migrated to insertNotification directly.
export const MAX_NOTIFICATIONS_LIMIT = MAX_NOTIFICATIONS_PER_USER;

/**
 * @deprecated Use pruneNotificationsForUser(userId) instead.
 * This global prune is retained solely to avoid breaking the digest-cron import chain.
 */
export async function pruneNotificationsToLimit(max = MAX_NOTIFICATIONS_PER_USER, executor: any = db): Promise<void> {
  console.warn('[PRUNE NOTIFICATIONS] Global prune called — this is deprecated. Use pruneNotificationsForUser(userId) instead.');
}
