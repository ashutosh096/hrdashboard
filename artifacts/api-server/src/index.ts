import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import tasksRouter from './routes/tasks.js';
import employeesRouter from './routes/employees.js';
import meetingsRouter from './routes/meetings.js';
import attendanceRouter from './routes/attendance.js';
import announcementsRouter from './routes/announcements.js';
import applicationsRouter from './routes/applications.js';
import reportsRouter from './routes/reports.js';
import initiativesRouter from './routes/initiatives.js';
import epicsRouter from './routes/epics.js';
import sprintsRouter from './routes/sprints.js';
import { startSyncCron } from './jobs/sync-cron.js';
import { startDigestCron } from './jobs/digest-cron.js';
import { startOverdueCheckCron } from './jobs/overdue-check-cron.js';
import { runSeed } from './db/seed.js';

import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/initiatives', initiativesRouter);
app.use('/api/epics', epicsRouter);
app.use('/api/sprints', sprintsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HROS API Server v2', timestamp: new Date().toISOString() });
});

// Serve frontend static assets & SPA fallback (Express 5 path-to-regexp compatible)
const frontendDistPath = path.resolve(process.cwd(), 'artifacts/hr-dashboard/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = path.join(frontendDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      service: 'EHM-Climagro OS API Server v2',
      status: 'online 🚀',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        tasks: '/api/tasks',
        employees: '/api/employees',
      },
    });
  });
}

// Run background jobs
startSyncCron();
startDigestCron();
startOverdueCheckCron();
runSeed().catch(console.error);

app.listen(PORT, () => {
  console.log(`🚀 [HROS API SERVER] Express server running on http://localhost:${PORT}`);
});
