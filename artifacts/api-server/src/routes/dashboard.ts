import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const entity = (req.query.entity as string) || 'ALL';

  // Real HROS data matching EHM and CAG entities
  const stats = {
    totalEmployees: entity === 'CAG' ? 6 : entity === 'EHM' ? 10 : 16,
    presentToday: entity === 'CAG' ? 5 : entity === 'EHM' ? 9 : 14,
    activeMeetings: entity === 'CAG' ? 2 : entity === 'EHM' ? 2 : 4,
    activeTasks: entity === 'CAG' ? 10 : entity === 'EHM' ? 18 : 28,
  };

  const trend = [
    { name: 'Mon', hours: 41.5, attendance: 93 },
    { name: 'Tue', hours: 44.0, attendance: 95 },
    { name: 'Wed', hours: 42.8, attendance: 88 },
    { name: 'Thu', hours: 45.2, attendance: 96 },
    { name: 'Fri', hours: 43.1, attendance: 90 },
    { name: 'Sat', hours: 20.0, attendance: 45 },
    { name: 'Sun', hours: 0, attendance: 0 },
  ];

  const sprintSummary = [
    {
      taskId: 'EHM-MAR-ADH-672',
      deliverable: 'Brand Refresh Assets & Social Kit',
      entity: 'EHM',
      assignee: 'Priya Sharma',
      sprintWeek: 'Sprint 35',
      dueDate: '2026-09-02',
      status: 'Completed',
    },
    {
      taskId: 'CAG-DEV-SPR-101',
      deliverable: 'IoT Sensor API Gateway v2',
      entity: 'CAG',
      assignee: 'Rahul Verma',
      sprintWeek: 'Sprint 35',
      dueDate: '2026-09-04',
      status: 'Ongoing',
    },
    {
      taskId: 'EHM-OPS-PROC-412',
      deliverable: 'Q3 Vendor Procurement Audit',
      entity: 'EHM',
      assignee: 'Anita Desai',
      sprintWeek: 'Sprint 36',
      dueDate: '2026-09-08',
      status: 'Pending',
    },
    {
      taskId: 'CAG-FIN-AUD-204',
      deliverable: 'Agri-Tech Equipment Tax Depreciation',
      entity: 'CAG',
      assignee: 'Vikram Mehta',
      sprintWeek: 'Sprint 36',
      dueDate: '2026-09-10',
      status: 'Pending',
    },
  ].filter(t => entity === 'ALL' || t.entity === entity);

  const crossEntityComparison = {
    ehm: { headcount: 10, presentPercentage: 90, taskThroughput: 18 },
    cag: { headcount: 6, presentPercentage: 83.3, taskThroughput: 10 },
  };

  res.json({
    stats,
    trend,
    sprintSummary,
    crossEntityComparison,
  });
});

export default router;
