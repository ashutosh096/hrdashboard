import { db, employees, users, tasks, sprints, projects, epics, eq, or, and, sql, isNull } from '@workspace/db';

async function checkVisibility(userEmail: string) {
  const [user] = await db.select().from(users).where(eq(users.email, userEmail));
  const [emp] = await db.select().from(employees).where(eq(employees.id, user.employeeId!));

  console.log(`\n=== CHECKING VISIBILITY FOR: ${emp.firstName} ${emp.lastName} (${user.email}, Role: ${user.role}) ===`);
  const targetEmpId = emp.id;

  // 1. PROJECTS (Simulate GET /api/projects employee scoping)
  // Employee scoping: linked through tasks, epics, or lead/team membership
  const linkedTaskProjects = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(
      and(
        sql`${tasks.projectId} IS NOT NULL`,
        or(
          eq(tasks.assigneeId, targetEmpId),
          eq(tasks.creatorId, targetEmpId),
          eq(tasks.reviewingLeadId, targetEmpId)
        )
      )
    );

  const linkedEpicProjects = await db
    .select({ projectId: epics.projectId })
    .from(epics)
    .where(
      and(
        sql`${epics.projectId} IS NOT NULL`,
        or(
          eq(epics.ownerId, targetEmpId),
          eq(epics.createdById, targetEmpId)
        )
      )
    );

  const linkedProjectIds = Array.from(
    new Set([
      ...linkedTaskProjects.map((r) => r.projectId).filter(Boolean),
      ...linkedEpicProjects.map((r) => r.projectId).filter(Boolean),
    ])
  ) as string[];

  const allProjects = await db.select().from(projects).where(isNull(projects.deletedAt));
  const visibleProjects = allProjects.filter(p => {
    const isDirectMember = (p.lead === targetEmpId) || (Array.isArray(p.team) && p.team.includes(targetEmpId));
    const isLinked = linkedProjectIds.includes(p.id);
    return isDirectMember || isLinked;
  });

  // 2. TASKS (Simulate GET /api/tasks employee scoping)
  const allTasks = await db.select().from(tasks).where(isNull(tasks.deletedAt));
  const visibleTasks = allTasks.filter(t => {
    const isAssignee = t.assigneeId === targetEmpId || (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(targetEmpId));
    const isCreator = t.creatorId === targetEmpId;
    const isReviewer = t.reviewingLeadId === targetEmpId || (Array.isArray(t.reviewingLeadIds) && t.reviewingLeadIds.includes(targetEmpId));
    return isAssignee || isCreator || isReviewer;
  });

  // 3. SPRINT TASKS (Tasks that belong to a sprint where employee is assigned)
  const visibleSprintTasks = visibleTasks.filter(t => t.sprintId !== null);

  // 4. Isolation Check: Are there any other people's tasks/projects leaked?
  const otherTasks = visibleTasks.filter(t => 
    t.assigneeId !== targetEmpId && 
    !(Array.isArray(t.assigneeIds) && t.assigneeIds.includes(targetEmpId)) &&
    t.creatorId !== targetEmpId &&
    t.reviewingLeadId !== targetEmpId &&
    !(Array.isArray(t.reviewingLeadIds) && t.reviewingLeadIds.includes(targetEmpId))
  );

  console.log(`Visible Projects Count: ${visibleProjects.length}`);
  console.log(`Visible Projects:`, visibleProjects.map(p => `[${p.code}] ${p.name}`));
  console.log(`Visible Tasks Count: ${visibleTasks.length}`);
  console.log(`Visible Sprint Tasks Count: ${visibleSprintTasks.length}`);
  console.log(`Leaked / Unrelated Tasks Count: ${otherTasks.length}`);

  return {
    employeeName: `${emp.firstName} ${emp.lastName}`,
    email: user.email,
    projectsCount: visibleProjects.length,
    tasksCount: visibleTasks.length,
    sprintTasksCount: visibleSprintTasks.length,
    leakedCount: otherTasks.length,
  };
}

async function run() {
  await checkVisibility('officialutkarshmishra01@gmail.com');
  await checkVisibility('priyankasharma121202@gmail.com');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
