import { Router } from 'express';
import { db, notifications, eq } from '@workspace/db';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const userNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt));

    const formatted = userNotifs.map(n => ({
      id: n.id,
      type: n.type,
      payload: n.payload || {},
      title: (n.payload as any)?.title || 'Notification Alert',
      message: (n.payload as any)?.message || (n.payload as any)?.title || 'System Notification',
      isRead: !!n.readAt,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[NOTIFICATIONS ROUTE ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.post('/read-all', async (req, res) => {
  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.userId, req.user!.id));

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[NOTIFICATIONS READ ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to mark notifications read' });
  }
});

export default router;
