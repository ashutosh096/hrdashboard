import { Router } from 'express';

const router = Router();

let attendanceList = [
  { id: 'att-1', employeeName: 'Priya Sharma', date: '2026-08-31', clockIn: '09:02 AM', clockOut: '06:15 PM', workMode: 'IN_OFFICE', status: 'PRESENT', totalHours: '9.2' },
  { id: 'att-2', employeeName: 'Rahul Verma', date: '2026-08-31', clockIn: '09:45 AM', clockOut: '06:30 PM', workMode: 'HYBRID', status: 'LATE', totalHours: '8.75' },
  { id: 'att-3', employeeName: 'Anita Desai', date: '2026-08-31', clockIn: '08:55 AM', clockOut: null, workMode: 'IN_OFFICE', status: 'PRESENT', totalHours: '7.5' },
  { id: 'att-4', employeeName: 'Vikram Mehta', date: '2026-08-31', clockIn: '10:15 AM', clockOut: '02:30 PM', workMode: 'REMOTE', status: 'HALF_DAY', totalHours: '4.25' },
];

router.get('/', (req, res) => {
  res.json(attendanceList);
});

router.post('/clock-in', (req, res) => {
  const { workMode, employeeName } = req.body;
  const newClockIn = {
    id: `att-${Date.now()}`,
    employeeName: employeeName || 'Priya Sharma',
    date: new Date().toISOString().split('T')[0],
    clockIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    clockOut: null,
    workMode: workMode || 'IN_OFFICE',
    status: 'PRESENT',
    totalHours: '0.0',
  };
  attendanceList.unshift(newClockIn);
  res.status(201).json(newClockIn);
});

router.post('/clock-out', (req, res) => {
  if (attendanceList.length > 0 && !attendanceList[0].clockOut) {
    attendanceList[0].clockOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    attendanceList[0].totalHours = '8.5';
  }
  res.json(attendanceList[0] || { message: 'Clocked out' });
});

export default router;
