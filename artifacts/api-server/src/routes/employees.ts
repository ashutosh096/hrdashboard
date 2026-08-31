import { Router } from 'express';
import crypto from 'node:crypto';
import { sendInviteEmail } from '../services/email.js';

const router = Router();

let employeesList = [
  { id: 'emp-1', firstName: 'Priya', lastName: 'Sharma', email: 'priya@ehm.com', entityCode: 'EHM', department: 'Marketing', designation: 'Senior Brand Strategist', salary: 95000, status: 'ACTIVE', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'emp-2', firstName: 'Rahul', lastName: 'Verma', email: 'rahul@cliagro.com', entityCode: 'CAG', department: 'Engineering', designation: 'IoT Systems Architect', salary: 115000, status: 'ACTIVE', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'emp-3', firstName: 'Anita', lastName: 'Desai', email: 'anita@ehm.com', entityCode: 'EHM', department: 'Operations', designation: 'Operations Manager', salary: 105000, status: 'ACTIVE', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: 'emp-4', firstName: 'Vikram', lastName: 'Mehta', email: 'vikram@cliagro.com', entityCode: 'CAG', department: 'Finance', designation: 'Lead Financial Analyst', salary: 98000, status: 'ACTIVE', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
];

router.get('/', (req, res) => {
  const entity = (req.query.entity as string) || 'ALL';
  const filtered = entity === 'ALL' ? employeesList : employeesList.filter(e => e.entityCode === entity);
  res.json(filtered);
});

router.post('/', async (req, res) => {
  const { firstName, lastName, email, entityCode, department, designation, salary } = req.body;
  const newEmp = {
    id: `emp-${Date.now()}`,
    firstName,
    lastName,
    email,
    entityCode: entityCode || 'EHM',
    department: department || 'Engineering',
    designation: designation || 'Specialist',
    salary: salary || 85000,
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  };
  employeesList.push(newEmp);

  // Generate invite token & send invite email via Resend
  const inviteToken = crypto.randomBytes(32).toString('hex');
  await sendInviteEmail(email, inviteToken, `${firstName} ${lastName}`);

  res.status(201).json({ employee: newEmp, inviteToken });
});

export default router;
