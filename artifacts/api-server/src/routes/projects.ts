import { Router } from 'express';
import { db, projects, employees, tasks, generateNextGlobalCode, eq, desc, sql, and, or, inArray, recordHistory } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';

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

    // 0. Employee Scoping: Restrict only when specifically requesting personal/assigned sub-tab
    const isEmployee = req.user?.role === 'EMPLOYEE';
    const isMyProjectsOnly = isEmployee && (subTab === 'MY_PROJECTS' || subTab === 'ASSIGNED');
    if (isMyProjectsOnly) {
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
        ? await db.select().from(projects).where(whereClause).orderBy(sql`LOWER(${projects.name}) ASC`)
        : await db.select().from(projects).orderBy(sql`LOWER(${projects.name}) ASC`);
      allProjects.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
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
          .orderBy(sql`LOWER(${projects.name}) ASC`)
          .limit(targetPageSize)
          .offset(offset)
      : await db
          .select()
          .from(projects)
          .orderBy(sql`LOWER(${projects.name}) ASC`)
          .limit(targetPageSize)
          .offset(offset);

    projectRows.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

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
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const {
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
      description,
      checkpoints,
      comments,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const finalEntity = (entity === 'CAG' ? 'CAG' : entity === 'COMMON' ? 'COMMON' : 'EHM') as any;
    const finalEntityName = entityName || (finalEntity === 'CAG' ? 'climagroanalytics' : finalEntity === 'COMMON' ? 'common' : 'ehmconsultancy');

    const finalCheckpoints = Array.isArray(checkpoints) ? checkpoints : [];
    const finalTeam = Array.isArray(team) ? team : [];
    const finalComments = Array.isArray(comments) ? comments : [];

    const rawProjLinks = req.body.deliverableLinks;
    let finalProjDeliverableLinks: { name: string; url: string; note?: string }[] = [];
    if (Array.isArray(rawProjLinks) && rawProjLinks.length > 0) {
      finalProjDeliverableLinks = rawProjLinks.map((item: any) => {
        if (typeof item === 'string') return { name: 'Deliverable Link', url: item, note: '' };
        return { name: item.name || 'Deliverable Link', url: item.url || '', note: item.note || '' };
      }).filter((item: any) => Boolean(item.url));
    } else if (deliverableUrl && typeof deliverableUrl === 'string') {
      finalProjDeliverableLinks = deliverableUrl.split(/[,;\n]/).map(u => u.trim()).filter(Boolean).map(u => ({ name: 'Deliverable Link', url: u, note: '' }));
    }

    const created = await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);

      // Server ALWAYS generates code with generateNextGlobalCode('PROJ'). Ignore any client-supplied code.
      const finalCode = await generateNextGlobalCode('PROJ', tx);

      const [newProj] = await tx
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
          deliverableUrl: finalProjDeliverableLinks.map(l => l.url).join(', ') || deliverableUrl || techStack || '',
          deliverableLinks: finalProjDeliverableLinks,
          milestonesCount: finalCheckpoints.length,
          description: description || '',
          checkpoints: finalCheckpoints,
          comments: finalComments,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: caller.employeeId,
          createdByName: caller.callerName,
        })
        .returning();

      // Record history
      await recordHistory(tx, {
        tableName: 'projects',
        recordId: newProj.id,
        action: 'CREATED',
        changes: [{ field: 'name', old: null, new: newProj.name }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      return newProj;
    });

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

    const userRole = (req.user?.role || '').toUpperCase();
    const isManagerOrAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

    const [existingCheck] = await db.select().from(projects).where(eq(projects.id, id));
    if (!existingCheck) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isManagerOrAdmin) {
      const callerInfo = await getCallerInfo(req.user);
      const callerNameLower = (callerInfo.callerName || '').toLowerCase().trim();
      const callerEmpId = callerInfo.employeeId;
      const leadLower = (existingCheck.lead || '').toLowerCase().trim();
      const isLead = (callerNameLower && leadLower.includes(callerNameLower)) || (callerEmpId && (existingCheck as any).leadId === callerEmpId);
      const isTeamMember = Array.isArray(existingCheck.team) && callerNameLower && existingCheck.team.some((t: string) => t.toLowerCase().includes(callerNameLower));
      const isCreator = callerEmpId && (existingCheck as any).createdById === callerEmpId;

      if (!isLead && !isTeamMember && !isCreator) {
        return res.status(403).json({ message: 'Access denied. You must be assigned to this project or be an Admin/Manager to edit it.' });
      }
    }

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

    const updated = await db.transaction(async (tx) => {
      const existing = existingCheck;

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
      if (budget !== undefined && budget !== null && String(budget).trim() !== '') {
        updatePayload.budget = budget;
      }
      if (startDate !== undefined) updatePayload.startDate = startDate || null;
      if (targetDate !== undefined) updatePayload.targetDate = targetDate || null;
      if (status !== undefined) updatePayload.status = status;
      if (priority !== undefined) updatePayload.priority = priority;
      if (techStack !== undefined) updatePayload.techStack = techStack;
      if (req.body.deliverableLinks !== undefined) {
        updatePayload.deliverableLinks = req.body.deliverableLinks;
        updatePayload.deliverableUrl = Array.isArray(req.body.deliverableLinks)
          ? req.body.deliverableLinks.map((l: any) => l.url || l).filter(Boolean).join(', ')
          : deliverableUrl;
      } else if (deliverableUrl !== undefined) {
        updatePayload.deliverableUrl = deliverableUrl;
      }
      if (description !== undefined) updatePayload.description = description;
      if (checkpoints !== undefined) {
        updatePayload.checkpoints = checkpoints;
        updatePayload.milestonesCount = Array.isArray(checkpoints) ? checkpoints.length : 0;
      }
      if (comments !== undefined) updatePayload.comments = comments;

      const [updatedProj] = await tx
        .update(projects)
        .set(updatePayload)
        .where(eq(projects.id, id))
        .returning();

      // Record history
      const caller = await getCallerInfo(req.user, tx);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const [key, newVal] of Object.entries(updatePayload)) {
        if (key === 'updatedAt') continue;
        const oldVal = (existing as any)[key];

        if (key === 'comments') {
          const oldList = Array.isArray(oldVal) ? oldVal : [];
          const newList = Array.isArray(newVal) ? newVal : [];
          if (newList.length > oldList.length) {
            const added = newList[newList.length - 1];
            changes.push({
              field: 'comments',
              old: null,
              new: added?.content || 'New comment added',
            });
          }
          continue;
        }
        if (key.toLowerCase() === 'updatedat' || key.toLowerCase() === 'updated_at' || key.toLowerCase() === 'createdat' || key.toLowerCase() === 'created_at') continue;

        const oldStr = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal ?? '');
        const newStr = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal ?? '');
        if (oldStr !== newStr) {
          if (oldStr.trim() === newStr.trim()) continue;
          if (key.toLowerCase().includes('date') || oldVal instanceof Date || newVal instanceof Date) {
            const d1 = oldStr ? oldStr.split('T')[0] : '';
            const d2 = newStr ? newStr.split('T')[0] : '';
            if (d1 === d2) continue;
          }
          changes.push({ field: key, old: oldVal, new: newVal });
        }
      }

      if (changes.length > 0) {
        await recordHistory(tx, {
          tableName: 'projects',
          recordId: id,
          action: 'UPDATED',
          changes,
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      return updatedProj;
    });

    if (!updated) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE PROJECT ERROR]:', err);
    res.status(500).json({ message: 'Failed to update project', error: err?.message });
  }
});

// DELETE /api/projects/:id - Delete a project (ADMIN ONLY)
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const id = req.params.id as string;
    const [existing] = await db.select().from(projects).where(eq(projects.id, id));
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await recordHistory(tx, {
        tableName: 'projects',
        recordId: id,
        action: 'DELETED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      await tx.delete(projects).where(eq(projects.id, id));
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('[DELETE PROJECT ERROR]:', err);
    res.status(500).json({ message: 'Failed to delete project', error: err?.message });
  }
});

export default router;
