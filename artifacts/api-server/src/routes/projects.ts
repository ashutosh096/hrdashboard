import { Router } from 'express';
import { db, projects, employees, tasks, epics, users, generateNextGlobalCode, eq, desc, sql, and, or, inArray, recordHistory } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';
import { dispatchNotification } from '../services/notificationDispatcher.js';

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
    const statConditions: any[] = [];

    // 0. Employee Scoping: Strict ID & Linkage Filtering whenever logged in as EMPLOYEE
    const isEmployee = req.user?.role === 'EMPLOYEE';
    if (isEmployee) {
      const userEmail = (req.user?.email || '').toLowerCase().trim();
      const userEmpId = req.user?.employeeId;
      const userId = req.user?.id;

      let empName = '';
      let empCode = '';
      let targetEmpId = userEmpId;

      if (targetEmpId || userEmail) {
        const [emp] = await db
          .select()
          .from(employees)
          .where(
            targetEmpId
              ? eq(employees.id, targetEmpId)
              : eq(sql`LOWER(${employees.email})`, userEmail)
          )
          .limit(1);

        if (emp) {
          targetEmpId = emp.id;
          empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase();
          empCode = (emp.employeeCode || '').toLowerCase();
        }
      }

      // Collect project IDs where this employee has tasks assigned, created, or lead-reviewed
      const linkedTaskProjects = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(
          and(
            sql`${tasks.projectId} IS NOT NULL`,
            or(
              targetEmpId ? eq(tasks.assigneeId, targetEmpId) : sql`false`,
              targetEmpId ? eq(tasks.creatorId, targetEmpId) : sql`false`,
              targetEmpId ? eq(tasks.reviewingLeadId, targetEmpId) : sql`false`
            )
          )
        );

      // Collect project IDs where this employee has epics owned or created
      const linkedEpicProjects = await db
        .select({ projectId: epics.projectId })
        .from(epics)
        .where(
          and(
            sql`${epics.projectId} IS NOT NULL`,
            or(
              targetEmpId ? eq(epics.ownerId, targetEmpId) : sql`false`,
              targetEmpId ? eq(epics.createdById, targetEmpId) : sql`false`
            )
          )
        );

      const linkedProjectIds = Array.from(
        new Set([
          ...linkedTaskProjects.map(t => t.projectId),
          ...linkedEpicProjects.map(e => e.projectId),
        ])
      ).filter((id): id is string => typeof id === 'string' && id.length > 0);

      const empOrConditions: any[] = [];
      if (targetEmpId) {
        // Strict ID check in projects.team JSONB array
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE member = ${targetEmpId})`);
        // Created by employee
        empOrConditions.push(eq(projects.createdById, targetEmpId));
        // Lead matches employee ID
        empOrConditions.push(sql`LOWER(${projects.lead}) LIKE ${`%${targetEmpId}%`}`);
      }
      if (userId && userId !== targetEmpId) {
        empOrConditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(${projects.team}, '[]'::jsonb)) AS member WHERE member = ${userId})`);
      }
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
      if (linkedProjectIds.length > 0) {
        empOrConditions.push(inArray(projects.id, linkedProjectIds));
      }

      if (empOrConditions.length > 0) {
        const empClause = or(...empOrConditions);
        conditions.push(empClause);
        statConditions.push(empClause);
      } else {
        conditions.push(sql`1 = 0`);
        statConditions.push(sql`1 = 0`);
      }
    }

    // 1. Entity Filter
    if (entity && entity !== 'ALL') {
      const entUpper = String(entity).toUpperCase().trim();
      const entityCond =
        entUpper === 'CAG' || entUpper === 'CLIMAGRO'
          ? sql`UPPER(${projects.entity}) IN ('CAG', 'CLIMAGRO', 'COMMON')`
          : entUpper === 'EHM'
            ? sql`UPPER(${projects.entity}) IN ('EHM', 'COMMON')`
            : undefined;
      if (entityCond) {
        conditions.push(entityCond);
        statConditions.push(entityCond);
      }
    }

    // 2. SubTab (Active vs Archived) - Applied to list query only, NOT stat tiles
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
      const leadCond = sql`LOWER(${projects.lead}) LIKE ${`%${lead.trim().toLowerCase()}%`}`;
      conditions.push(leadCond);
      statConditions.push(leadCond);
    }

    // 5. Search Filter (code, name, category, lead, description)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      const searchCond = sql`(LOWER(${projects.code}) LIKE ${searchPattern} OR LOWER(${projects.name}) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.category}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.lead}, '')) LIKE ${searchPattern} OR LOWER(COALESCE(${projects.description}, '')) LIKE ${searchPattern})`;
      conditions.push(searchCond);
      statConditions.push(searchCond);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const statWhereClause = statConditions.length > 0 ? and(...statConditions) : undefined;

    // Stat tiles queries - compute across the entity/role/lead/search scope WITHOUT being restricted by subTab (Active vs Archived)
    const statQuery = db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) NOT IN ('COMPLETED', 'ARCHIVED'))`,
        planningOrReview: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) IN ('PLANNING', 'IN REVIEW', 'IN_REVIEW', 'REVIEWING'))`,
        archived: sql<number>`count(*) FILTER (WHERE UPPER(${projects.status}) IN ('COMPLETED', 'ARCHIVED'))`,
      })
      .from(projects);

    const [statsRow] = statWhereClause ? await statQuery.where(statWhereClause) : await statQuery;

    const stats = {
      total: Number(statsRow?.total || 0),
      active: Number(statsRow?.active || 0),
      planningOrReview: Number(statsRow?.planningOrReview || 0),
      archived: Number(statsRow?.archived || 0),
    };

    // Helper to format project rows with resolved employee names & IDs
    const allEmpsForFormat = await db.select().from(employees);
    const empIdToNameMap = new Map<string, string>();
    for (const e of allEmpsForFormat) {
      empIdToNameMap.set(e.id, `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode || e.email);
    }

    const formatProjectRows = (rows: any[]) => {
      return rows.map((p) => {
        const rawTeam: string[] = Array.isArray(p.team) ? p.team : [];
        const teamNames: string[] = [];
        const teamIds: string[] = [];
        for (const m of rawTeam) {
          if (!m) continue;
          if (empIdToNameMap.has(m)) {
            teamIds.push(m);
            teamNames.push(empIdToNameMap.get(m)!);
          } else {
            teamIds.push(m);
            teamNames.push(m);
          }
        }
        return {
          ...p,
          team: teamNames,
          teamIds,
        };
      });
    };

    if (!isPaginatedRequest) {
      const allProjects = whereClause
        ? await db.select().from(projects).where(whereClause).orderBy(sql`LOWER(${projects.name}) ASC`)
        : await db.select().from(projects).orderBy(sql`LOWER(${projects.name}) ASC`);
      const formatted = formatProjectRows(allProjects);
      formatted.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      return res.json(formatted);
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

    const formattedRows = formatProjectRows(projectRows);
    formattedRows.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

    return res.json({
      projects: formattedRows,
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

    const allEmpsForTeam = await db.select().from(employees);
    const normalizedTeamIds: string[] = [];
    for (const member of finalTeam) {
      if (!member) continue;
      const matched = allEmpsForTeam.find(
        (e) =>
          e.id === member ||
          `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase() === String(member).trim().toLowerCase() ||
          e.employeeCode?.toLowerCase() === String(member).trim().toLowerCase() ||
          e.email?.toLowerCase() === String(member).trim().toLowerCase()
      );
      if (matched) {
        if (!normalizedTeamIds.includes(matched.id)) normalizedTeamIds.push(matched.id);
      } else {
        if (!normalizedTeamIds.includes(member)) normalizedTeamIds.push(member);
      }
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
          team: normalizedTeamIds,
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

    // Notify team members + all Admins on project creation
    const allEmps = await db.select().from(employees);
    const targetMemberEmpIds: string[] = [];
    if (created.lead) {
      const matchedLead = allEmps.find(e => e.id === created.lead || `${e.firstName} ${e.lastName}`.trim().toLowerCase() === String(created.lead).trim().toLowerCase());
      if (matchedLead) targetMemberEmpIds.push(matchedLead.id);
    }
    if (Array.isArray(created.team)) {
      for (const member of created.team) {
        const matched = allEmps.find(e => e.id === member || `${e.firstName} ${e.lastName}`.trim().toLowerCase() === String(member).trim().toLowerCase());
        if (matched) targetMemberEmpIds.push(matched.id);
      }
    }

    const caller = await getCallerInfo(req.user);
    dispatchNotification({
      entity: {
        entityType: 'PROJECT',
        entityId: created.id,
        entityCode: created.code,
        title: created.name,
        assigneeEmployeeIds: Array.from(new Set(targetMemberEmpIds)),
        reviewingLeadEmployeeId: null,
        creatorEmployeeId: req.user?.employeeId,
      },
      actorUserId: req.user!.id,
      actorName: caller.callerName,
      eventType: 'CREATED',
      title: created.name,
      message: `New Project '${created.name}' created by ${caller.callerName || 'a team member'}`,
    });

    const empIdToNameMap = new Map<string, string>();
    for (const e of allEmps) {
      empIdToNameMap.set(e.id, `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode || e.email);
    }
    const formattedCreated = {
      ...created,
      team: (created.team || []).map((m: string) => empIdToNameMap.get(m) || m),
      teamIds: created.team || [],
    };

    res.status(201).json(formattedCreated);
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
      const isLead = (callerEmpId && leadLower.includes(callerEmpId)) || (callerNameLower && leadLower.includes(callerNameLower)) || (callerEmpId && (existingCheck as any).leadId === callerEmpId);
      const rawTeam: string[] = Array.isArray(existingCheck.team) ? (existingCheck.team as string[]) : [];
      const isTeamMember = (callerEmpId && rawTeam.includes(callerEmpId)) || (callerNameLower && rawTeam.some((t: string) => t.toLowerCase().includes(callerNameLower)));
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
      if (team !== undefined) {
        const rawTeam = Array.isArray(team) ? team : [];
        const allEmpsForTeam = await db.select().from(employees);
        const normalizedTeamIds: string[] = [];
        for (const member of rawTeam) {
          if (!member) continue;
          const matched = allEmpsForTeam.find(
            (e) =>
              e.id === member ||
              `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase() === String(member).trim().toLowerCase() ||
              e.employeeCode?.toLowerCase() === String(member).trim().toLowerCase() ||
              e.email?.toLowerCase() === String(member).trim().toLowerCase()
          );
          if (matched) {
            if (!normalizedTeamIds.includes(matched.id)) normalizedTeamIds.push(matched.id);
          } else {
            if (!normalizedTeamIds.includes(member)) normalizedTeamIds.push(member);
          }
        }
        updatePayload.team = normalizedTeamIds;
      }
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

    // Project update notifications:
    // Notify team members + all Admins on significant changes (status, lead, team, name)
    const caller = await getCallerInfo(req.user);
    let whatChanged = '';
    if (status !== undefined && status !== existingCheck.status) {
      whatChanged = `status changed to ${status}`;
    } else if (lead !== undefined && lead !== existingCheck.lead) {
      whatChanged = `lead changed to ${lead}`;
    } else if (name !== undefined && name !== existingCheck.name) {
      whatChanged = 'name updated';
    } else if (team !== undefined) {
      const oldTeam: string[] = Array.isArray(existingCheck.team) ? (existingCheck.team as string[]) : [];
      const newTeamIds = (team as string[]).filter(memberId => !oldTeam.includes(memberId));
      if (newTeamIds.length > 0) {
        whatChanged = 'team members updated';
      }
    }

    if (whatChanged) {
      const allEmps = await db.select().from(employees);
      const targetMemberEmpIds: string[] = [];
      const leadVal = updated?.lead || existingCheck.lead;
      if (leadVal) {
        const matchedLead = allEmps.find(e => e.id === leadVal || `${e.firstName} ${e.lastName}`.trim().toLowerCase() === String(leadVal).trim().toLowerCase());
        if (matchedLead) targetMemberEmpIds.push(matchedLead.id);
      }
      const teamArr = updated?.team || existingCheck.team;
      if (Array.isArray(teamArr)) {
        for (const member of teamArr) {
          const matched = allEmps.find(e => e.id === member || `${e.firstName} ${e.lastName}`.trim().toLowerCase() === String(member).trim().toLowerCase());
          if (matched) targetMemberEmpIds.push(matched.id);
        }
      }

      dispatchNotification({
        entity: {
          entityType: 'PROJECT',
          entityId: updated.id,
          entityCode: updated.code,
          title: updated.name,
          assigneeEmployeeIds: Array.from(new Set(targetMemberEmpIds)),
          reviewingLeadEmployeeId: null,
          creatorEmployeeId: req.user?.employeeId,
        },
        actorUserId: req.user!.id,
        actorName: caller.callerName,
        eventType: 'STATUS_CHANGED',
        title: updated.name,
        message: `Project '${updated.name}' updated by ${caller.callerName || 'a team member'}: ${whatChanged}`,
        extraPayload: { whatChanged },
      });
    }

    const allEmpsAfterUpdate = await db.select().from(employees);
    const empIdToNameMap = new Map<string, string>();
    for (const e of allEmpsAfterUpdate) {
      empIdToNameMap.set(e.id, `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.employeeCode || e.email);
    }
    const formattedUpdated = {
      ...updated,
      team: (updated.team || []).map((m: string) => empIdToNameMap.get(m) || m),
      teamIds: updated.team || [],
    };

    res.json(formattedUpdated);
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
