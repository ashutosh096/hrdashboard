import { Router } from 'express';
import { db, notifications, tasks, eq, and, isNull, sql, lt, or, inArray } from '@workspace/db';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { MAX_NOTIFICATIONS_LIMIT } from '../services/notificationService.js';

const router = Router();
router.use(requireAuth);

/**
 * Auto-cleanup job: deletes read notifications older than 60 days for the user.
 */
async function cleanupOldNotifications(userId: string) {
  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          lt(notifications.createdAt, sixtyDaysAgo)
        )
      );
  } catch (err) {
    console.warn('[NOTIFICATIONS CLEANUP WARNING]:', err);
  }
}

// GET / - Return notifications STRICTLY scoped to the authenticated user (No admin/manager bypass!)
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Trigger non-blocking cleanup of stale notifications
    cleanupOldNotifications(userId).catch(() => { });

    const rawNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(MAX_NOTIFICATIONS_LIMIT);

    // Identify any task notifications that lack a descriptive title/message
    const taskCodesToLookup: string[] = [];
    const taskIdsToLookup: string[] = [];

    for (const n of rawNotifs) {
      const payload = (n.payload as any) || {};
      const isGeneric = !payload.title || payload.title === 'Notification Alert' || !payload.taskTitle;
      if (isGeneric) {
        if (payload.taskCode && typeof payload.taskCode === 'string') taskCodesToLookup.push(payload.taskCode);
        if (payload.taskId && typeof payload.taskId === 'string') taskIdsToLookup.push(payload.taskId);
      }
    }

    // Batch query tasks table to resolve real titles and statuses
    const taskMap = new Map<string, { code: string; title: string; status: string }>();
    if (taskCodesToLookup.length > 0 || taskIdsToLookup.length > 0) {
      try {
        const conditions = [];
        if (taskCodesToLookup.length > 0) conditions.push(inArray(tasks.taskCode, taskCodesToLookup));
        if (taskIdsToLookup.length > 0) conditions.push(inArray(tasks.id, taskIdsToLookup));

        const matchedTasks = await db
          .select({ id: tasks.id, code: tasks.taskCode, title: tasks.title, status: tasks.status })
          .from(tasks)
          .where(or(...conditions));

        for (const t of matchedTasks) {
          if (t.code) taskMap.set(t.code, t);
          if (t.id) taskMap.set(t.id, t);
        }
      } catch (lookupErr) {
        console.warn('[TASK NOTIFICATION ENRICHMENT LOOKUP WARNING]:', lookupErr);
      }
    }

    const formatted = rawNotifs.map(n => {
      const payload = (n.payload as any) || {};
      const resolvedTask =
        (payload.taskCode && taskMap.get(payload.taskCode)) ||
        (payload.taskId && taskMap.get(payload.taskId));

      const taskCode = payload.taskCode || resolvedTask?.code || null;
      const taskTitle = payload.taskTitle || resolvedTask?.title || null;
      const taskStatus = payload.toStatus || payload.status || resolvedTask?.status || null;

      let title = payload.title;
      let message = payload.message;

      // Generate structured, clear title if missing or placeholder
      if (!title || title === 'Notification Alert') {
        if (taskCode && taskTitle) {
          title = `Task [${taskCode}]: ${taskTitle}`;
        } else if (taskCode) {
          title = `Task Assignment: [${taskCode}]`;
        } else if (payload.entityType) {
          title = `${payload.entityType} Alert`;
        } else {
          title = 'Task Assignment Alert';
        }
      }

      // Generate clear, explanatory message if missing or placeholder
      if (!message || message === 'System Notification' || message === 'Notification alert received') {
        const event = payload.eventType || n.type || '';
        if (event.includes('ASSIGN') || n.type?.includes('ASSIGN')) {
          message = taskTitle
            ? `You are assigned to work on [${taskCode || 'Task'}]: "${taskTitle}".`
            : `You are assigned to task [${taskCode || 'item'}]. Click to view and update.`;
        } else if (event.includes('STATUS') || n.type?.includes('STATUS')) {
          message = `Status updated to ${taskStatus || 'in progress'} on [${taskCode || 'Task'}].`;
        } else if (event.includes('COMMENT') || n.type?.includes('COMMENT')) {
          message = `New discussion or comment on [${taskCode || 'Task'}].`;
        } else if (taskCode) {
          message = taskTitle
            ? `Active task in your workflow: "${taskTitle}". Click below to open.`
            : `Notification for task [${taskCode}]. Click below to view details.`;
        } else {
          message = 'You have an active assignment or task update in your workflow.';
        }
      }

      return {
        id: n.id,
        type: n.type,
        userId: n.userId,
        payload: {
          ...payload,
          taskCode,
          taskTitle,
          tagged: true, // User is guaranteed direct stakeholder
        },
        title,
        message,
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

// GET /unread-count - Lightweight badge counter scoped strictly to current user
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

// POST /read-all - Mark all unread notifications read FOR CURRENT USER ONLY
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

// POST /clear-all & DELETE / - Clear all notifications FOR CURRENT USER ONLY
router.post('/clear-all', async (req, res) => {
  try {
    const userId = req.user!.id;
    await db.delete(notifications).where(eq(notifications.userId, userId));
    res.json({ success: true, message: 'All personal notifications cleared successfully' });
  } catch (err) {
    console.error('[NOTIFICATIONS CLEAR ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    await db.delete(notifications).where(eq(notifications.userId, userId));
    res.json({ success: true, message: 'All personal notifications deleted successfully' });
  } catch (err) {
    console.error('[NOTIFICATIONS DELETE ALL ERROR]:', err);
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
});

// POST /:id/read - Mark single notification as read (Strict ownership verification)
router.post('/:id/read', async (req, res) => {
  const rawId = req.params.id;
  const userId = req.user!.id;
  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, rawId), eq(notifications.userId, userId)));
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('[NOTIFICATIONS READ SINGLE ERROR]:', err);
    res.status(500).json({ message: 'Failed to mark notification read' });
  }
});

export default router;
