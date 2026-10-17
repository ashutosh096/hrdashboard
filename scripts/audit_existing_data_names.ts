import { db, tasks, sprints, epics, initiatives, projects, employees } from '@workspace/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return UUID_REGEX.test(str.trim());
}

async function audit() {
  const allEmployees = await db.select().from(employees);
  const employeeIdSet = new Set(allEmployees.map(e => e.id));

  console.log('=== AUDITING EXISTING DATA FOR NAMES IN PERSON FIELDS ===');

  // 1. TASKS
  // Fields: assigneeId, assigneeIds, reviewingLeadId, reviewingLeadIds
  const allTasks = await db.select().from(tasks);
  const tasksWithNames: any[] = [];
  for (const t of allTasks) {
    let hasName = false;
    const reasons: string[] = [];
    if (t.assigneeId && !isUUID(t.assigneeId)) {
      hasName = true;
      reasons.push(`assigneeId="${t.assigneeId}"`);
    }
    if (Array.isArray(t.assigneeIds)) {
      for (const a of t.assigneeIds) {
        if (a && !isUUID(a)) {
          hasName = true;
          reasons.push(`assigneeIds contains "${a}"`);
        }
      }
    }
    if (t.reviewingLeadId && !isUUID(t.reviewingLeadId)) {
      hasName = true;
      reasons.push(`reviewingLeadId="${t.reviewingLeadId}"`);
    }
    if (Array.isArray(t.reviewingLeadIds)) {
      for (const r of t.reviewingLeadIds) {
        if (r && !isUUID(r)) {
          hasName = true;
          reasons.push(`reviewingLeadIds contains "${r}"`);
        }
      }
    }
    if (hasName) {
      tasksWithNames.push({
        id: t.id,
        code: t.taskCode,
        title: t.title,
        assigneeId: t.assigneeId,
        assigneeIds: t.assigneeIds,
        reviewingLeadId: t.reviewingLeadId,
        reasons,
      });
    }
  }

  // 2. SPRINTS
  // Fields: employeeId, reviewingLeadId
  const allSprints = await db.select().from(sprints);
  const sprintsWithNames: any[] = [];
  for (const s of allSprints) {
    let hasName = false;
    const reasons: string[] = [];
    if (s.employeeId && !isUUID(s.employeeId)) {
      hasName = true;
      reasons.push(`employeeId="${s.employeeId}"`);
    }
    if (s.reviewingLeadId && !isUUID(s.reviewingLeadId)) {
      hasName = true;
      reasons.push(`reviewingLeadId="${s.reviewingLeadId}"`);
    }
    if (hasName) {
      sprintsWithNames.push({
        id: s.id,
        code: s.sprintCode,
        title: s.name,
        employeeId: s.employeeId,
        reviewingLeadId: s.reviewingLeadId,
        reasons,
      });
    }
  }

  // 3. EPICS
  // Fields: ownerId, assignedTo
  const allEpics = await db.select().from(epics);
  const epicsWithNames: any[] = [];
  for (const e of allEpics) {
    let hasName = false;
    const reasons: string[] = [];
    if (e.ownerId && !isUUID(e.ownerId)) {
      hasName = true;
      reasons.push(`ownerId="${e.ownerId}"`);
    }
    if (e.assignedTo) {
      let parsed = e.assignedTo;
      try {
        parsed = JSON.parse(e.assignedTo);
      } catch {}
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && !isUUID(item)) {
            hasName = true;
            reasons.push(`assignedTo contains name "${item}"`);
          }
        }
      } else if (typeof parsed === 'string' && !isUUID(parsed)) {
        hasName = true;
        reasons.push(`assignedTo="${parsed}"`);
      }
    }
    if (hasName) {
      epicsWithNames.push({
        id: e.id,
        code: e.epicCode,
        title: e.title,
        ownerId: e.ownerId,
        assignedTo: e.assignedTo,
        reasons,
      });
    }
  }

  // 4. INITIATIVES
  // Fields: ownerId
  const allInitiatives = await db.select().from(initiatives);
  const initiativesWithNames: any[] = [];
  for (const init of allInitiatives) {
    let hasName = false;
    const reasons: string[] = [];
    if (init.ownerId && !isUUID(init.ownerId)) {
      hasName = true;
      reasons.push(`ownerId="${init.ownerId}"`);
    }
    if (hasName) {
      initiativesWithNames.push({
        id: init.id,
        code: init.initiativeCode,
        title: init.title,
        ownerId: init.ownerId,
        reasons,
      });
    }
  }

  // 5. PROJECTS
  // Fields: lead, team
  const allProjects = await db.select().from(projects);
  const projectsWithNames: any[] = [];
  for (const p of allProjects) {
    let hasName = false;
    const reasons: string[] = [];
    if (p.lead && !isUUID(p.lead)) {
      hasName = true;
      reasons.push(`lead="${p.lead}"`);
    }
    if (Array.isArray(p.team)) {
      for (const m of p.team) {
        if (m && !isUUID(m)) {
          hasName = true;
          reasons.push(`team member="${m}"`);
        }
      }
    }
    if (hasName) {
      projectsWithNames.push({
        id: p.id,
        code: p.code,
        name: p.name,
        lead: p.lead,
        team: p.team,
        reasons,
      });
    }
  }

  console.log('\n--- SUMMARY COUNTS ---');
  console.log(`Tasks with names instead of UUIDs: ${tasksWithNames.length} (out of ${allTasks.length} total)`);
  console.log(`Sprints with names instead of UUIDs: ${sprintsWithNames.length} (out of ${allSprints.length} total)`);
  console.log(`Epics with names instead of UUIDs: ${epicsWithNames.length} (out of ${allEpics.length} total)`);
  console.log(`Initiatives with names instead of UUIDs: ${initiativesWithNames.length} (out of ${allInitiatives.length} total)`);
  console.log(`Projects with names instead of UUIDs: ${projectsWithNames.length} (out of ${allProjects.length} total)`);

  console.log('\n--- SAMPLE ROWS (UP TO 3 PER TABLE) ---');
  console.log('\nTASKS Samples:', JSON.stringify(tasksWithNames.slice(0, 3), null, 2));
  console.log('\nSPRINTS Samples:', JSON.stringify(sprintsWithNames.slice(0, 3), null, 2));
  console.log('\nEPICS Samples:', JSON.stringify(epicsWithNames.slice(0, 3), null, 2));
  console.log('\nINITIATIVES Samples:', JSON.stringify(initiativesWithNames.slice(0, 3), null, 2));
  console.log('\nPROJECTS Samples:', JSON.stringify(projectsWithNames.slice(0, 3), null, 2));

  process.exit(0);
}

audit().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
