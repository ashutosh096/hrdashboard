import { Router } from 'express';
import { db, announcements, desc } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET / - Return all announcements for all authenticated roles
router.get('/', async (req, res) => {
  try {
    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    res.json(list);
  } catch (err) {
    console.error('[GET ANNOUNCEMENTS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// POST / - Require ADMIN or MANAGER role to create an announcement
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { title, content, priority, isPinned, targetEntityId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title,
        content,
        priority: priority || 'NORMAL',
        isPinned: !!isPinned,
        targetEntityId: targetEntityId || null,
        createdBy: req.user?.id || null,
        seenBy: [],
      })
      .returning();

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error('[POST ANNOUNCEMENT ERROR]:', err);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
});

export default router;
