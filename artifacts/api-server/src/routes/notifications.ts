import { Router } from 'express';
import { db, notifications, eq } from '@workspace/db';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const isManagerOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';

    let rawNotifs;
    if (isManagerOrAdmin) {
      rawNotifs = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt));
    } else {
      rawNotifs = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user!.id))
        .orderBy(desc(notifications.createdAt));
    }

    const formatted = rawNotifs.map(n => {
      const payload = (n.payload as any) || {};
      const isDirectUser = n.userId === req.user!.id;
      const isTaggedUser = Array.isArray(payload.taggedUserIds) && payload.taggedUserIds.includes(req.user!.id);
      const isAssigneeUser = payload.assigneeId === req.user!.id || (req.user!.employeeId && payload.assigneeId === req.user!.employeeId);
      const tagged = isDirectUser || isTaggedUser || isAssigneeUser || payload.tagged === true;

      return {
        id: n.id,
        type: n.type,
        userId: n.userId,
        payload: {
          ...payload,
          tagged,
        },
        title: payload.title || 'Notification Alert',
        message: payload.message || payload.title || 'System Notification',
        isRead: !!n.readAt,
        readAt: n.readAt,
        createdAt: n.createdAt,
      };
    });

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
