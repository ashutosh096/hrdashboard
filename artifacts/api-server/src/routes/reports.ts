import { Router } from 'express';
import { db, tasks, employees, entities, sprints, eq } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/sprint-summary', async (req, res) => {
  const format = (req.query.format as string) || 'json';
  const entityFilter = (req.query.entity as string) || 'ALL';

  try {
    const allTasks = await db.select().from(tasks);
    const allEmployees = await db.select().from(employees);
    const allEntities = await db.select().from(entities);

    let filtered = allTasks;
    if (entityFilter !== 'ALL') {
      const ent = allEntities.find(e => e.code.toUpperCase() === entityFilter.toUpperCase());
      if (ent) {
        filtered = allTasks.filter(t => t.entityId === ent.id);
      }
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sprint-summary-report.csv"');

      let csv = 'Task ID,Title,Entity,Assignee,Task Type,Due Date,Status\n';
      for (const t of filtered) {
        const emp = allEmployees.find(e => e.id === t.assigneeId);
        const ent = allEntities.find(e => e.id === t.entityId);
        const assigneeName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned';
        const entityCode = ent?.code || 'EHM';
        const dueDateStr = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '';
        const titleClean = (t.title || '').replace(/"/g, '""');

        csv += `"${t.taskCode}","${titleClean}","${entityCode}","${assigneeName}","${t.taskType}","${dueDateStr}","${t.status}"\n`;
      }
      return res.send(csv);
    }

    const totalTasks = filtered.length;
    const completed = filtered.filter(t => t.status === 'DONE').length;
    const inProgress = filtered.filter(t => t.status === 'IN_PROGRESS' || t.status === 'TODO').length;
    const blocked = filtered.filter(t => t.status === 'BLOCKED' || t.status === 'DELAYED').length;

    res.json({
      reportTitle: 'HROS Sprint & Deliverables Executive Summary',
      generatedAt: new Date().toISOString(),
      entityFilter,
      summaryStats: {
        totalTasks,
        completed,
        inProgress,
        blocked,
        completionRate: totalTasks > 0 ? Math.min(100, Math.round((completed / totalTasks) * 100)) : 0,
      },
      tasks: filtered.map(t => {
        const emp = allEmployees.find(e => e.id === t.assigneeId);
        return {
          ...t,
          assigneeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned',
        };
      }),
    });
  } catch (err: any) {
    console.error('[REPORTS ERROR]:', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;
