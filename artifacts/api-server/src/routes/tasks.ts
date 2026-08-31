import { Router } from 'express';
import crypto from 'node:crypto';

const router = Router();

// In-memory tasks collection initialized with real HROS data
let tasksList = [
  {
    id: 't-1',
    taskCode: 'EHM-MAR-ADH-672',
    title: 'Brand Refresh Assets & Social Kit',
    description: 'Create high-res SVG vectors and banner graphics for EHM social channels.',
    entityCode: 'EHM',
    departmentCode: 'MAR',
    sprintWeek: 'Sprint 35',
    assigneeName: 'Priya Sharma',
    assigneeId: 'emp-1',
    reviewingLeadName: 'Sanjay Kapoor',
    deliverableUrl: 'https://drive.google.com/file/d/ehm-brand-v2',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: '2026-09-02',
    notes: [{ id: 'n-1', author: 'Sanjay Kapoor', content: 'Approved vector assets.', createdAt: '2026-08-30' }],
    checklists: [{ id: 'c-1', itemText: 'Logo variants', isCompleted: true }, { id: 'c-2', itemText: 'Banner sizes', isCompleted: true }],
  },
  {
    id: 't-2',
    taskCode: 'CAG-DEV-SPR-101',
    title: 'IoT Sensor API Gateway v2',
    description: 'Implement WebSocket listener for CliAgro sensor telemetry.',
    entityCode: 'CAG',
    departmentCode: 'DEV',
    sprintWeek: 'Sprint 35',
    assigneeName: 'Rahul Verma',
    assigneeId: 'emp-2',
    reviewingLeadName: 'Ananya Rao',
    deliverableUrl: 'https://github.com/cliagro/sensor-gateway',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: '2026-09-04',
    notes: [{ id: 'n-2', author: 'Rahul Verma', content: 'WebSocket endpoint connected.', createdAt: '2026-08-31' }],
    checklists: [{ id: 'c-3', itemText: 'Auth handler', isCompleted: true }, { id: 'c-4', itemText: 'Load test 1k conn', isCompleted: false }],
  },
  {
    id: 't-3',
    taskCode: 'EHM-OPS-PROC-412',
    title: 'Q3 Vendor Procurement Audit',
    description: 'Compile vendor compliance docs and contract renewals.',
    entityCode: 'EHM',
    departmentCode: 'OPS',
    sprintWeek: 'Sprint 36',
    assigneeName: 'Anita Desai',
    assigneeId: 'emp-3',
    reviewingLeadName: 'Sanjay Kapoor',
    deliverableUrl: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-09-08',
    notes: [],
    checklists: [{ id: 'c-5', itemText: 'Collect contracts', isCompleted: false }],
  },
];

router.get('/', (req, res) => {
  const entity = (req.query.entity as string) || 'ALL';
  const filtered = entity === 'ALL' ? tasksList : tasksList.filter(t => t.entityCode === entity);
  res.json(filtered);
});

router.post('/', (req, res) => {
  const body = req.body;
  const entity = body.entityCode || 'EHM';
  const dept = body.departmentCode || 'MAR';
  const seq = Math.floor(100 + Math.random() * 900);
  const taskCode = `${entity}-${dept}-ADH-${seq}`;

  const newTask = {
    id: crypto.randomUUID(),
    taskCode,
    title: body.title || 'Untitled Task',
    description: body.description || '',
    entityCode: entity,
    departmentCode: dept,
    sprintWeek: body.sprintWeek || 'Sprint 35',
    assigneeName: body.assigneeName || 'Priya Sharma',
    assigneeId: body.assigneeId || 'emp-1',
    reviewingLeadName: body.reviewingLeadName || 'Admin Lead',
    deliverableUrl: body.deliverableUrl || '',
    status: body.status || 'TODO',
    priority: body.priority || 'MEDIUM',
    dueDate: body.dueDate || new Date().toISOString().split('T')[0],
    notes: [],
    checklists: [],
  };

  tasksList.unshift(newTask);
  res.status(201).json(newTask);
});

router.post('/:id/notes', (req, res) => {
  const { id } = req.params;
  const { content, author } = req.body;
  const task = tasksList.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const note = { id: crypto.randomUUID(), author: author || 'User', content, createdAt: new Date().toISOString() };
  task.notes.push(note);
  res.json(note);
});

export default router;
