import { Router } from 'express';
import { db, projects, eq, desc } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/projects - Fetch list of all projects
router.get('/', async (req, res) => {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    res.json(allProjects);
  } catch (err: any) {
    console.error('[FETCH PROJECTS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch projects', error: err?.message });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      entity,
      entityName,
      category,
      lead,
      team,
      budget,
      startDate,
      targetDate,
      status,
      priority,
      techStack,
      milestonesCount,
      description,
      checkpoints,
      comments,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const finalEntity = (entity === 'CAG' ? 'CAG' : 'EHM') as 'EHM' | 'CAG';
    const finalEntityName = entityName || (finalEntity === 'CAG' ? 'climagroanalytics' : 'ehmconsultancy');

    // Generate unique code if not provided
    let finalCode = code;
    if (!finalCode || !finalCode.trim()) {
      const year = new Date().getFullYear();
      const existingCount = await db.select().from(projects);
      finalCode = `${finalEntity}-PRJ-${year}-${String(existingCount.length + 1).padStart(2, '0')}`;
    }

    const defaultCheckpoints = [
      { id: `c-${Date.now()}-1`, title: 'Requirement Spec Approval', isCompleted: false },
      { id: `c-${Date.now()}-2`, title: 'Environment & Tech Stack Setup', isCompleted: false },
      { id: `c-${Date.now()}-3`, title: 'Core Deliverables Implementation', isCompleted: false },
      { id: `c-${Date.now()}-4`, title: 'QA & Final Project Delivery', isCompleted: false },
    ];

    const finalCheckpoints = Array.isArray(checkpoints) && checkpoints.length > 0 ? checkpoints : defaultCheckpoints;
    const finalTeam = Array.isArray(team) ? team : [];
    const finalComments = Array.isArray(comments) ? comments : [];

    const [created] = await db
      .insert(projects)
      .values({
        code: finalCode,
        name: name.trim(),
        entity: finalEntity,
        entityName: finalEntityName,
        category: category || 'Technology & Systems',
        lead: lead || req.user?.email || 'Dr. Harshit Mishra',
        team: finalTeam,
        budget: budget || '$45,000',
        startDate: startDate || '2026-09-01',
        targetDate: targetDate || '2026-12-15',
        status: status || 'Planning',
        priority: priority || 'High',
        techStack: techStack || 'React, Node.js, Python, GIS',
        milestonesCount: finalCheckpoints.length,
        description: description || '',
        checkpoints: finalCheckpoints,
        comments: finalComments,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE PROJECT ERROR]:', err);
    res.status(500).json({ message: 'Failed to create project', error: err?.message });
  }
});

// PATCH /api/projects/:id - Update an existing project
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      entity,
      entityName,
      category,
      lead,
      team,
      budget,
      startDate,
      targetDate,
      status,
      priority,
      techStack,
      milestonesCount,
      description,
      checkpoints,
      comments,
    } = req.body;

    const [existing] = await db.select().from(projects).where(eq(projects.id, id));
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (code !== undefined) updatePayload.code = code;
    if (name !== undefined) updatePayload.name = name.trim();
    if (entity !== undefined) updatePayload.entity = entity;
    if (entityName !== undefined) updatePayload.entityName = entityName;
    if (category !== undefined) updatePayload.category = category;
    if (lead !== undefined) updatePayload.lead = lead;
    if (team !== undefined) updatePayload.team = team;
    if (budget !== undefined) updatePayload.budget = budget;
    if (startDate !== undefined) updatePayload.startDate = startDate;
    if (targetDate !== undefined) updatePayload.targetDate = targetDate;
    if (status !== undefined) updatePayload.status = status;
    if (priority !== undefined) updatePayload.priority = priority;
    if (techStack !== undefined) updatePayload.techStack = techStack;
    if (description !== undefined) updatePayload.description = description;
    if (checkpoints !== undefined) {
      updatePayload.checkpoints = checkpoints;
      updatePayload.milestonesCount = checkpoints.length;
    }
    if (comments !== undefined) updatePayload.comments = comments;

    const [updated] = await db
      .update(projects)
      .set(updatePayload)
      .where(eq(projects.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE PROJECT ERROR]:', err);
    res.status(500).json({ message: 'Failed to update project', error: err?.message });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.select().from(projects).where(eq(projects.id, id));
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await db.delete(projects).where(eq(projects.id, id));
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('[DELETE PROJECT ERROR]:', err);
    res.status(500).json({ message: 'Failed to delete project', error: err?.message });
  }
});

export default router;
