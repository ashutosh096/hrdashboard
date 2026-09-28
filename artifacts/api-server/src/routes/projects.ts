import { Router } from 'express';
import { db, projects, employees, tasks, eq, desc, sql, and, or, inArray } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/projects - Fetch list of projects with server-side filtering & pagination
router.get('/', async (req, res) => {
  try {
    const {
      page,
      pageSize,
      limit,
      paginate,
      entity,
      status,
      lead,
      subTab,
      search,
    } = req.query;

    const isPaginatedRequest =
      paginate === 'true' ||
      page !== undefined ||
      pageSize !== undefined ||
      limit !== undefined ||
      entity !== undefined ||
      status !== undefined ||
      lead !== undefined ||
      subTab !== undefined ||
      search !== undefined;

    const conditions: any[] = [];

    // 0. Employee Scoping: If user is EMPLOYEE, restrict to projects where they are lead, team member, or have assigned tasks
    const isEmployee = req.user?.role === 'EMPLOYEE';
    if (isEmployee) {
      const userEmail = (req.user?.email || '').toLowerCase().trim();
      const userEmpId = req.user?.employeeId || req.user?.id;

      let empName = '';
      let empCode = '';
      if (userEmpId || userEmail) {
        const [emp] = await db
          .select()
          .from(employees)
          .where(
            userEmpId
              ? eq(employees.id, userEmpId)
              : eq(sql`LOWER(${employees.email})`, userEmail)
          )
          .limit(1);

        if (emp) {
          empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase();
          empCode = (emp.employeeCode || '').toLowerCase();
        }
      }

      // Collect project IDs where this employee has tasks assigned
      const linkedTaskProjects = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(
          and(
            sql`${tasks.projectId} IS NOT NULL`,
            or(
              userEmpId ? eq(tasks.assigneeId, userEmpId) : sql`false`,
              userEmpId ? eq(tasks.creatorId, userEmpId) : sql`false`
            )
          )
        );

      const linkedProjectIds = linkedTaskProjects
        .map(t => t.projectId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      const empOrConditions = [];
      if (empName) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${empName}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${empName}%`})`);
      }
      if (empCode) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${empCode}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${empCode}%`})`);
      }
      if (userEmail) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${userEmail}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${userEmail}%`})`);
      }
      if (userEmpId) {
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE member = ${userEmpId})`);
      }
      if (linkedProjectIds.length > 0) {
        empOrConditions.push(inArray(projects.id, linkedProjectIds));
      }

      if (empOrConditions.length > 0) {
        conditions.push(or(...empOrConditions));
      } else {
        conditions.push(sql`1 = 0`);
      }
    }

    // 1. Entity Filter
    if (entity && entity !== 'ALL') {
      const entUpper = String(entity).toUpperCase().trim();
      if (entUpper === 'CAG' || entUpper === 'CLIMAGRO') {
        conditions.push(sql`UPPER(${projects.entity}) IN ('CAG', 'CLIMAGRO', 'COMMON')`);
      } else if (entUpper === 'EHM') {
        conditions.push(sql`UPPER(${projects.entity}) IN ('EHM', 'COMMON')`);
      }
    }

    // 2. SubTab (Active vs Archived)
    if (subTab === 'ARCHIVED') {
      conditions.push(sql`UPPER(${projects.status}) IN ('COMPLETED', 'ARCHIVED')`);
    } else if (subTab === 'ACTIVE') {
      conditions.push(sql`UPPER(${projects.status}) NOT IN ('COMPLETED', 'ARCHIVED')`);
    }

    // 3. Status Filter
    if (status && status !== 'ALL') {
      const st = String(status).toUpperCase().trim();
      if (st === 'ACTIVE' || st === 'IN_PROGRESS' || st === 'IN PROGRESS') {
        conditions.push(sql`UPPER(${projects.status}) IN ('ACTIVE', 'IN PROGRESS', 'IN_PROGRESS')`);
      } else if (st === 'PLANNING') {
        conditions.push(sql`UPPER(${projects.status}) = 'PLANNING'`);
      } else if (st === 'IN_REVIEW' || st === 'IN REVIEW' || st === 'REVIEWING') {
        conditions.push(sql`UPPER(${projects.status}) IN ('IN REVIEW', 'IN_REVIEW', 'REVIEWING')`);
      } else if (st === 'COMPLETED' || st === 'ARCHIVED') {
        conditions.push(sql`UPPER(${projects.status}) IN ('COMPLETED', 'ARCHIVED')`);
      } else {
        conditions.push(sql`UPPER(${projects.status}) = ${st}`);
      }
    }

    // 4. Lead Filter
    if (lead && lead !== 'ALL' && typeof lead === 'string' && lead.trim() !== '') {
      conditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${lead.trim().toLowerCase()}%`}`);
    }

    // 5. Search Filter (code, name, category, lead, description)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${projects.code}) LIKE ${searchPattern} OR LOWER(${projects.name}) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.category}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.lead}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.description}, '')) LIKE ${searchPattern})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Stat tiles queries - compute across the entity/role/lead/search scope WITHOUT being restricted by subTab (Active vs Archived)
    const statConditions: any[] = [];
    if (isEmployee) {
      // Re-use employee scoping for stats
      const userEmail = (req.user?.email || '').toLowerCase().trim();
      const userEmpId = req.user?.employeeId || req.user?.id;
      let empName = '';
      let empCode = '';
      if (userEmpId || userEmail) {
        const [emp] = await db
          .select()
          .from(employees)
          .where(
            userEmpId
              ? eq(employees.id, userEmpId)
              : eq(sql`LOWER(${employees.email})`, userEmail)
          )
          .limit(1);
        if (emp) {
          empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase();
          empCode = (emp.employeeCode || '').toLowerCase();
        }
      }
      const linkedTaskProjects = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(
          and(
            sql`${tasks.projectId} IS NOT NULL`,
            or(
              userEmpId ? eq(tasks.assigneeId, userEmpId) : sql`false`,
              userEmpId ? eq(tasks.creatorId, userEmpId) : sql`false`
            )
          )
        );
      const linkedProjectIds = linkedTaskProjects
        .map(t => t.projectId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      const empOrConditions = [];
      if (empName) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${empName}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${empName}%`})`);
      }
      if (empCode) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${empCode}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${empCode}%`})`);
      }
      if (userEmail) {
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${userEmail}%`}`);
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE LOWER(member) LIKE ${`%${userEmail}%`})`);
      }
      if (userEmpId) {
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE member = ${userEmpId})`);
      }
      if (linkedProjectIds.length > 0) {
        empOrConditions.push(inArray(projects.id, linkedProjectIds));
      }
      if (empOrConditions.length > 0) {
        statConditions.push(or(...empOrConditions));
      } else {
        statConditions.push(sql`1 = 0`);
      }
    }

    if (entity && entity !== 'ALL') {
      const entUpper = String(entity).toUpperCase().trim();
      if (entUpper === 'CAG' || entUpper === 'CLIMAGRO') {
        statConditions.push(sql`UPPER(${projects.entity}) IN ('CAG', 'CLIMAGRO', 'COMMON')`);
      } else if (entUpper === 'EHM') {
        statConditions.push(sql`UPPER(${projects.entity}) IN ('EHM', 'COMMON')`);
      }
    }

    if (lead && lead !== 'ALL' && typeof lead === 'string' && lead.trim() !== '') {
      statConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${lead.trim().toLowerCase()}%`}`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      statConditions.push(
        sql`(LOWER(${projects.code}) LIKE ${searchPattern} OR LOWER(${projects.name}) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.category}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.lead}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.description}, '')) LIKE ${searchPattern})`
      );
    }

    const statWhereClause = statConditions.length > 0 ? and(...statConditions) : undefined;

    const statQuery = db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) NOT IN ('COMPLETED', 'ARCHIVED'))`,
      planningOrReview: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) IN ('PLANNING', 'IN REVIEW', 'IN_REVIEW', 'REVIEWING'))`,
      archived: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) IN ('COMPLETED', 'ARCHIVED'))`,
    }).from(projects);

    const [statsRow] = statWhereClause ? await statQuery.where(statWhereClause) : await statQuery;

    const stats = {
      total: Number(statsRow?.total || 0),
      active: Number(statsRow?.active || 0),
      planningOrReview: Number(statsRow?.planningOrReview || 0),
      archived: Number(statsRow?.archived || 0),
    };

    if (!isPaginatedRequest) {
      const allProjects = whereClause
        ? await db.select().from(projects).where(whereClause).orderBy(desc(projects.createdAt))
        : await db.select().from(projects).orderBy(desc(projects.createdAt));
      return res.json(allProjects);
    }

    // Server-Side Pagination with real COUNT(*)
    const targetPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
    const targetPageSize = Math.max(1, Math.min(100, parseInt(String(pageSize || limit || 25), 10) || 25));
    const offset = (targetPage - 1) * targetPageSize;

    const [countRow] = whereClause
      ? await db.select({ count: sql<number>`count(*)` }).from(projects).where(whereClause)
      : await db.select({ count: sql<number>`count(*)` }).from(projects);

    const totalCount = Number(countRow?.count || 0);

    const projectRows = whereClause
      ? await db
          .select()
          .from(projects)
          .where(whereClause)
          .orderBy(desc(projects.createdAt))
          .limit(targetPageSize)
          .offset(offset)
      : await db
          .select()
          .from(projects)
          .orderBy(desc(projects.createdAt))
          .limit(targetPageSize)
          .offset(offset);

    return res.json({
      projects: projectRows,
      totalCount,
      stats,
      page: targetPage,
      pageSize: targetPageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / targetPageSize)),
    });
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
      deliverableUrl,
      milestonesCount,
      description,
      checkpoints,
      comments,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const finalEntity = (entity === 'CAG' ? 'CAG' : entity === 'COMMON' ? 'COMMON' : 'EHM') as any;
    const finalEntityName = entityName || (finalEntity === 'CAG' ? 'climagroanalytics' : finalEntity === 'COMMON' ? 'common' : 'ehmconsultancy');

    // Auto-generate guaranteed unique code if code is missing or already exists in DB
    const allExisting = await db.select({ code: projects.code }).from(projects);
    const existingCodes = new Set(allExisting.map(p => p.code.toLowerCase().trim()));

    let finalCode = (code || '').trim();
    if (!finalCode || existingCodes.has(finalCode.toLowerCase())) {
      const year = new Date().getFullYear();
      let nextNum = allExisting.length + 1;
      let candidate = `${finalEntity}-PRJ-${year}-${String(nextNum).padStart(2, '0')}`;
      while (existingCodes.has(candidate.toLowerCase())) {
        nextNum++;
        candidate = `${finalEntity}-PRJ-${year}-${String(nextNum).padStart(2, '0')}`;
      }
      finalCode = candidate;
    }

    const finalCheckpoints = Array.isArray(checkpoints) ? checkpoints : [];
    const finalTeam = Array.isArray(team) ? team : [];
    const finalComments = Array.isArray(comments) ? comments : [];

    const [created] = await db
      .insert(projects)
      .values({
        code: finalCode,
        name: name.trim(),
        entity: finalEntity,
        entityName: finalEntityName,
        category: category || 'General',
        lead: lead || '',
        team: finalTeam,
        budget: budget || '',
        startDate: startDate || null,
        targetDate: targetDate || null,
        status: status || 'Planning',
        priority: priority || 'Medium',
        techStack: techStack || '',
        deliverableUrl: deliverableUrl || techStack || '',
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
      deliverableUrl,
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
    if (deliverableUrl !== undefined) updatePayload.deliverableUrl = deliverableUrl;
    if (description !== undefined) updatePayload.description = description;
    if (checkpoints !== undefined) {
      updatePayload.checkpoints = checkpoints;
      updatePayload.milestonesCount = Array.isArray(checkpoints) ? checkpoints.length : 0;
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
