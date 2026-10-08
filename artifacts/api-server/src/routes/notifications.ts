import { Router } from 'express';
import { db, notifications, eq, and, isNull, sql, lt } from '@workspace/db';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * Deletes read notifications older than 60 days for a single user.
 * Non-blocking; errors are logged but never surface to the caller.
 */
async function cleanupOldReadNotifications(userId: string) {
  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          lt(notifications.createdAt, sixtyDaysAgo),
          sql`${notifications.readAt} IS NOT NULL`   // Only delete READ ones
        )
      );
  } catch (err) {
    console.warn('[NOTIFICATIONS CLEANUP]:', err);
  }
}

/**
 * GET /api/notifications
 *
 * Returns ALL notifications (read + unread) for the authenticated user only.
 * Used by the full Notifications history page.
 * STRICT: WHERE user_id = req.user.id — zero role exceptions. No admin bypass.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Non-blocking background cleanup of stale read notifications
    cleanupOldReadNotifications(userId).catch(() => {});

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    const formatted = rows.map(n => {
      const payload = (n.payload as any) || {};
      return {
        id: n.id,
        type: n.type,
        userId: n.userId,
        payload,
        title: payload.title || n.type,
        message: payload.message || '',
        isRead: !!n.readAt,
        readAt: n.readAt,
        createdAt: n.createdAt,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('[NOTIFICATIONS GET ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread
 *
 * Returns ONLY unread notifications for the authenticated user.
 * Used by the slide-in tray and toast queue.
 */
router.get('/unread', async (req, res) => {
  try {
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    const formatted = rows.map(n => {
      const payload = (n.payload as any) || {};
      return {
        id: n.id,
        type: n.type,
        userId: n.userId,
        payload,
        title: payload.title || n.type,
        message: payload.message || '',
        isRead: false,
        readAt: null,
        createdAt: n.createdAt,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('[NOTIFICATIONS UNREAD GET ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch unread notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 *
 * Lightweight badge counter — returns only { unreadCount: number }.
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user!.id;
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

    res.json({ unreadCount: result?.count || 0 });
  } catch (err) {
    console.error('[NOTIFICATIONS UNREAD COUNT ERROR]:', err);
    res.status(500).json({ message: 'Failed to get unread count', unreadCount: 0 });
  }
});

/**
 * POST /api/notifications/:id/read
 *
 * Marks a single notification as read. Double-checked: WHERE id AND user_id
 * so a user can never mark another user's notification as read.
 */
router.post('/:id/read', async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    res.json({ success: true });
  } catch (err) {
    console.error('[NOTIFICATIONS READ SINGLE ERROR]:', err);
    res.status(500).json({ message: 'Failed to mark notification read' });
  }
});

/**
 * POST /api/notifications/read-all
 *
 * Marks ALL unread notifications as read for the current user only.
 */
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user!.id;
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[NOTIFICATIONS READ ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to mark notifications read' });
  }
});

/**
 * POST /api/notifications/clear-all
 * DELETE /api/notifications
 *
 * Deletes all notifications for the current user only.
 * This is a destructive operation and will remove the full history.
 */
router.post('/clear-all', async (req, res) => {
  try {
    const userId = req.user!.id;
    await db.delete(notifications).where(eq(notifications.userId, userId));
    res.json({ success: true, message: 'All personal notifications cleared' });
  } catch (err) {
    console.error('[NOTIFICATIONS CLEAR ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    await db.delete(notifications).where(eq(notifications.userId, userId));
    res.json({ success: true, message: 'All personal notifications deleted' });
  } catch (err) {
    console.error('[NOTIFICATIONS DELETE ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
});

export default router;
