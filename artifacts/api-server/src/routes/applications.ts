import { Router } from 'express';

const router = Router();

let applicationsList = [
  { id: 'app-1', employeeName: 'Priya Sharma', type: 'REMOTE_WORK', reason: 'Onsite brand client photoshoot in Mumbai', status: 'APPROVED', createdAt: '2026-08-28' },
  { id: 'app-2', employeeName: 'Rahul Verma', type: 'EQUIPMENT', reason: 'High-performance IoT telemetry testing kit', status: 'PENDING', createdAt: '2026-08-30' },
  { id: 'app-3', employeeName: 'Anita Desai', type: 'REIMBURSEMENT', reason: 'Q3 Vendor audit travel & logistics expenses', status: 'PENDING', createdAt: '2026-08-31' },
];

router.get('/', (req, res) => {
  res.json(applicationsList);
});

router.post('/', (req, res) => {
  const { type, reason, employeeName } = req.body;
  if (!['REMOTE_WORK', 'REIMBURSEMENT', 'EQUIPMENT'].includes(type)) {
    return res.status(400).json({ message: 'Invalid application type. Allowed: REMOTE_WORK, REIMBURSEMENT, EQUIPMENT' });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    employeeName: employeeName || 'Priya Sharma',
    type,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString().split('T')[0],
  };

  applicationsList.unshift(newApp);
  res.status(201).json(newApp);
});

export default router;
