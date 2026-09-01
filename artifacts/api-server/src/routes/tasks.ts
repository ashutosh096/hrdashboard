import { Router } from 'express';
import crypto from 'node:crypto';
import { db, tasks, employees, entities, sprints, eq, sql } from '@workspace/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const allTasks = await db.select().from(tasks);
    res.json(allTasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, assigneeId, creatorId, departmentId, sprintId, initiativeId, storyPoints, priority, status, dueDate, deliverableUrl } = req.body;

  try {
    const newTask = await db.transaction(async (tx) => {
      // 1. Resolve Assignee & their entityId
      let targetAssigneeId = assigneeId;
      if (!targetAssigneeId) {
        const [firstEmp] = await tx.select().from(employees).limit(1);
        targetAssigneeId = firstEmp?.id;
      }

      const [assignee] = await tx
        .select({
          id: employees.id,
          entityId: employees.entityId,
          departmentId: employees.departmentId,
          employeeCode: employees.employeeCode,
        })
        .from(employees)
        .where(eq(employees.id, targetAssigneeId));

      if (!assignee) {
        throw new Error(`Assignee employee not found for ID: ${targetAssigneeId}`);
      }

      // 2. Fetch entityCode using Assignee's own entityId
      const [entity] = await tx
        .select({ code: entities.code })
        .from(entities)
        .where(eq(entities.id, assignee.entityId));

      if (!entity) {
        throw new Error(`Entity not found for ID: ${assignee.entityId}`);
      }

      const entityCode = entity.code; // "EHM" or "CAG"

      // 3. Atomically increment taskSeqCounter on Assignee
      const [updatedEmp] = await tx
        .update(employees)
        .set({ taskSeqCounter: sql`${employees.taskSeqCounter} + 1` })
        .where(eq(employees.id, assignee.id))
        .returning();

      // Format taskCode (e.g. "EHM-EMP01-002")
      const empShortCode = updatedEmp.employeeCode.replace(/^[^-]+-/, ''); // "EMP01"
      const seqPadded = String(updatedEmp.taskSeqCounter).padStart(3, '0');
      const taskCode = `${entityCode}-${empShortCode}-${seqPadded}`;

      // 4. Resolve sprintWeek text from sprintId if available
      let sprintWeekStr = req.body.sprintWeek;
      if (!sprintWeekStr && sprintId) {
        const [sprint] = await tx.select({ name: sprints.name }).from(sprints).where(eq(sprints.id, sprintId));
        if (sprint) sprintWeekStr = sprint.name;
      }
      if (!sprintWeekStr) {
        sprintWeekStr = status === 'BACKLOG' ? 'Backlog' : 'Sprint 35';
      }

      // 5. Resolve creator ID
      let targetCreatorId = creatorId;
      if (!targetCreatorId) {
        targetCreatorId = assignee.id;
      }

      // 6. Insert Task enforcing assignee.entityId
      const [createdTask] = await tx
        .insert(tasks)
        .values({
          taskCode,
          title: title || 'Untitled Task',
          description: description || '',
          entityId: assignee.entityId, // Derived directly from Assignee!
          departmentId: departmentId || assignee.departmentId,
          sprintWeek: sprintWeekStr,
          sprintId: sprintId || null,
          initiativeId: initiativeId || null,
          storyPoints: storyPoints ? Number(storyPoints) : null,
          assigneeId: assignee.id,
          creatorId: targetCreatorId,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
          deliverableUrl: deliverableUrl || null,
        })
        .returning();

      return createdTask;
    });

    res.status(201).json(newTask);
  } catch (err: any) {
    console.error('[TASK ASSIGNMENT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create task' });
  }
});

export default router;
