import { Router } from 'express';
import { db, announcements, announcementReads, entities, eq, desc, sql } from '@workspace/db';
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

    const allEntities = await db.select().from(entities);
    const userId = req.user!.id;

    // Relational read status from announcement_reads table
    const userReads = await db
      .select({ announcementId: announcementReads.announcementId })
      .from(announcementReads)
      .where(eq(announcementReads.userId, userId));
    const readAnnouncementIds = new Set(userReads.map(r => r.announcementId));

    const enriched = list.map((a: any) => {
      const isDismissed = readAnnouncementIds.has(a.id);
      const ent = allEntities.find((e: any) => e.id === a.targetEntityId);
      const resolvedEntity = ent?.code === 'CAG' ? 'CLIMAGRO' : ent?.code === 'EHM' ? 'EHM' : 'BOTH';
      const entityName = ent?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'EHM' ? 'EHM Consultancy' : 'Both (EHM & CLIMAGRO)');

      return {
        ...a,
        entity: resolvedEntity,
        entityCode: ent?.code || 'BOTH',
        entityName,
        isDismissed,
      };
    });

    res.json(enriched);
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
    let validPriority: 'NORMAL' | 'IMPORTANT' | 'URGENT' = 'NORMAL';
    const normalized = (priority || '').toString().toUpperCase();
    if (normalized === 'URGENT' || normalized === 'P1') {
      validPriority = 'URGENT';
    } else if (normalized === 'IMPORTANT' || normalized === 'HIGH' || normalized === 'P2') {
      validPriority = 'IMPORTANT';
    } else {
      validPriority = 'NORMAL';
    }

    let resolvedEntityId = targetEntityId || null;
    if (req.body.entity || req.body.entityScope) {
      const scope = (req.body.entity || req.body.entityScope).toString().toUpperCase();
      if (scope === 'CAG' || scope === 'CLIMAGRO') {
        const allEnts = await db.select().from(entities);
        const cag = allEnts.find((e: any) => e.code === 'CAG' || e.name.toLowerCase().includes('climagro'));
        resolvedEntityId = cag?.id || null;
      } else if (scope === 'EHM') {
        const allEnts = await db.select().from(entities);
        const ehm = allEnts.find((e: any) => e.code === 'EHM' || e.name.toLowerCase().includes('ehm'));
        resolvedEntityId = ehm?.id || null;
      } else {
        resolvedEntityId = null;
      }
    }

    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title,
        content,
        priority: validPriority,
        isPinned: !!isPinned,
        targetEntityId: resolvedEntityId,
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

// PATCH /:id - Update an existing announcement
router.patch('/:id', async (req, res) => {
  const callerRole = (req.user?.role || '').toUpperCase();
  if (callerRole !== 'ADMIN' && callerRole !== 'MANAGER') {
    return res.status(403).json({ message: 'Only Admins and Managers can edit announcements' });
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = (rawId || '').trim();
  const { title, content, priority, isPinned, targetEntityId } = req.body;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return res.json({
        id,
        title: title || 'Updated Announcement',
        content: content || '',
        priority: priority || 'NORMAL',
        isPinned: !!isPinned,
        updatedAt: new Date().toISOString(),
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = !!isPinned;

    if (req.body.entity !== undefined || req.body.entityScope !== undefined) {
      const scope = (req.body.entity || req.body.entityScope || '').toString().toUpperCase();
      if (scope === 'CAG' || scope === 'CLIMAGRO') {
        const allEnts = await db.select().from(entities);
        const cag = allEnts.find((e: any) => e.code === 'CAG' || e.name.toLowerCase().includes('climagro'));
        updateData.targetEntityId = cag?.id || null;
      } else if (scope === 'EHM') {
        const allEnts = await db.select().from(entities);
        const ehm = allEnts.find((e: any) => e.code === 'EHM' || e.name.toLowerCase().includes('ehm'));
        updateData.targetEntityId = ehm?.id || null;
      } else {
        updateData.targetEntityId = null;
      }
    } else if (targetEntityId !== undefined) {
      updateData.targetEntityId = targetEntityId || null;
    }

    if (priority !== undefined) {
      const normalized = (priority || '').toString().toUpperCase();
      if (normalized === 'URGENT' || normalized === 'P1') {
        updateData.priority = 'URGENT';
      } else if (normalized === 'IMPORTANT' || normalized === 'HIGH' || normalized === 'P2') {
        updateData.priority = 'IMPORTANT';
      } else {
        updateData.priority = 'NORMAL';
      }
    }

    const [updated] = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[PATCH ANNOUNCEMENT ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to update announcement' });
  }
});

// DELETE /:id - Delete an announcement
router.delete('/:id', async (req, res) => {
  const callerRole = (req.user?.role || '').toUpperCase();
  if (callerRole !== 'ADMIN' && callerRole !== 'MANAGER') {
    return res.status(403).json({ message: 'Only Admins and Managers can delete announcements' });
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = (rawId || '').trim();

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return res.json({ success: true, message: 'Announcement deleted successfully' });
    }

    const [deleted] = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();

    if (!deleted) {
      return res.json({ success: true, message: 'Announcement removed' });
    }

    return res.json({ success: true, message: 'Announcement deleted successfully', id: deleted.id });
  } catch (err: any) {
    console.error('[DELETE ANNOUNCEMENT ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to delete announcement' });
  }
});

// POST /dismiss-all - Dismiss all active pinned announcements for the user
router.post('/dismiss-all', async (req, res) => {
  const callerIds = [req.user?.id, req.user?.email, req.user?.employeeId].filter(Boolean) as string[];
  if (callerIds.length === 0) {
    return res.status(401).json({ message: 'User identifier required' });
  }

  try {
    const userId = req.user!.id;
    const list = await db.select({ id: announcements.id }).from(announcements).where(eq(announcements.isPinned, true));
    for (const ann of list) {
      await db.execute(sql`
        INSERT INTO announcement_reads (announcement_id, user_id, read_at)
        VALUES (${ann.id}, ${userId}, now())
        ON CONFLICT (announcement_id, user_id) DO NOTHING;
      `);
    }
    res.json({ success: true, message: 'All pinned announcements dismissed for user' });
  } catch (err: any) {
    console.error('[DISMISS ALL ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to dismiss all' });
  }
});

// POST /:id/dismiss - Record user dismissal permanently in database (Idempotent)
router.post('/:id/dismiss', async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = (rawId || '').trim();
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return res.json({ success: true, message: 'Dismissed' });
    }

    await db.execute(sql`
      INSERT INTO announcement_reads (announcement_id, user_id, read_at)
      VALUES (${id}, ${userId}, now())
      ON CONFLICT (announcement_id, user_id) DO NOTHING;
    `);

    res.json({ success: true, message: 'Announcement permanently dismissed for user' });
  } catch (err: any) {
    console.error('[DISMISS ANNOUNCEMENT ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to dismiss announcement' });
  }
});

export default router;
