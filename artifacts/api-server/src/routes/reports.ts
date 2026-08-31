import { Router } from 'express';

const router = Router();

router.get('/sprint-summary', (req, res) => {
  const format = (req.query.format as string) || 'csv';
  const entity = (req.query.entity as string) || 'ALL';

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sprint-summary-report.csv"');
    const csvContent = `Task ID,Deliverable,Entity,Assignee,Sprint Week,Due Date,Status\nEHM-MAR-ADH-672,Brand Refresh Assets,EHM,Priya Sharma,Sprint 35,2026-09-02,Completed\nCAG-DEV-SPR-101,IoT Sensor API Gateway,CAG,Rahul Verma,Sprint 35,2026-09-04,Ongoing\nEHM-OPS-PROC-412,Q3 Procurement Audit,EHM,Anita Desai,Sprint 36,2026-09-08,Pending\n`;
    return res.send(csvContent);
  }

  res.json({
    reportTitle: 'HROS Sprint & Deliverables Executive Summary',
    generatedAt: new Date().toISOString(),
    entityFilter: entity,
    summaryStats: { totalTasks: 28, completed: 18, inProgress: 7, blocked: 3 },
  });
});

export default router;
