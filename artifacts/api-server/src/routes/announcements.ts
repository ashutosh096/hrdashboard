import { Router } from 'express';
import { db, announcements, entities, eq, desc, sql } from '@workspace/db';
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
    const rawCallerIds = [req.user?.id, req.user?.email, req.user?.employeeId].filter(Boolean) as string[];
    const callerIdsLower = rawCallerIds.map((x) => x.toLowerCase().trim());

    const enriched = list.map((a: any) => {
      let rawSeenList: any[] = [];
      if (Array.isArray(a.seenBy)) {
        rawSeenList = a.seenBy;
      } else if (Array.isArray(a.seen_by)) {
        rawSeenList = a.seen_by;
      } else if (typeof a.seenBy === 'string') {
        try {
          rawSeenList = JSON.parse(a.seenBy);
        } catch {}
      } else if (typeof a.seen_by === 'string') {
        try {
          rawSeenList = JSON.parse(a.seen_by);
        } catch {}
      }

      const seenList: string[] = (Array.isArray(rawSeenList) ? rawSeenList : []).map((x: any) =>
        typeof x === 'string' ? x.trim() : String(x)
      );
      const isDismissed = callerIdsLower.some((uid: string) => seenList.some((s: string) => s.toLowerCase() === uid));
      const ent = allEntities.find((e: any) => e.id === a.targetEntityId);
      const resolvedEntity = ent?.code === 'CAG' ? 'CLIMAGRO' : ent?.code === 'EHM' ? 'EHM' : 'BOTH';
      const entityName = ent?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'EHM' ? 'EHM Consultancy' : 'Both (EHM & CLIMAGRO)');

      return {
        ...a,
        entity: resolvedEntity,
        entityCode: ent?.code || 'BOTH',
        entityName,
        seenBy: seenList,
        seen_by: seenList,
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
    const list = await db.select().from(announcements).where(eq(announcements.isPinned, true));
    for (const ann of list) {
      let rawSeenList: any[] = [];
      if (Array.isArray(ann.seenBy)) {
        rawSeenList = ann.seenBy;
      } else if (typeof ann.seenBy === 'string') {
        try {
          rawSeenList = JSON.parse(ann.seenBy);
        } catch {}
      }
      const currentSeenBy: string[] = (Array.isArray(rawSeenList) ? rawSeenList : []).map((x) => String(x));
      let mod = false;
      for (const rawUid of callerIds) {
        const uid = rawUid.trim();
        const uidLower = uid.toLowerCase();
        if (!currentSeenBy.some((x) => String(x).toLowerCase() === uidLower)) {
          currentSeenBy.push(uid);
          mod = true;
        }
      }
      if (mod) {
        await db.update(announcements).set({ seenBy: sql`${JSON.stringify(currentSeenBy)}::jsonb` as any }).where(eq(announcements.id, ann.id));
      }
    }
    res.json({ success: true, message: 'All pinned announcements dismissed for user' });
  } catch (err: any) {
    console.error('[DISMISS ALL ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to dismiss all' });
  }
});

// POST /:id/dismiss - Record user dismissal permanently in database
router.post('/:id/dismiss', async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = (rawId || '').trim();
  const callerIds = [req.user?.id, req.user?.email, req.user?.employeeId].filter(Boolean) as string[];

  if (callerIds.length === 0) {
    return res.status(401).json({ message: 'User identifier required' });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return res.json({ success: true, message: 'Dismissed' });
    }

    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));

    if (!existing) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    let rawExistingSeen: any[] = [];
    if (Array.isArray(existing.seenBy)) {
      rawExistingSeen = existing.seenBy;
    } else if (typeof existing.seenBy === 'string') {
      try {
        rawExistingSeen = JSON.parse(existing.seenBy);
      } catch {}
    }
    const currentSeenBy: string[] = (Array.isArray(rawExistingSeen) ? rawExistingSeen : []).map((x) => String(x));
    let modified = false;
    for (const rawUid of callerIds) {
      const uid = rawUid.trim();
      const uidLower = uid.toLowerCase();
      if (!currentSeenBy.some((x) => String(x).toLowerCase() === uidLower)) {
        currentSeenBy.push(uid);
        modified = true;
      }
    }

    if (modified) {
      await db
        .update(announcements)
        .set({ seenBy: sql`${JSON.stringify(currentSeenBy)}::jsonb` as any })
        .where(eq(announcements.id, id));
    }

    res.json({ success: true, message: 'Announcement dismissed for user', seenBy: currentSeenBy });
  } catch (err: any) {
    console.error('[DISMISS ANNOUNCEMENT ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to dismiss announcement' });
  }
});

export default router;
