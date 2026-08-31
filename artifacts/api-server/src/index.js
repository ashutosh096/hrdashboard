import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import tasksRouter from './routes/tasks.js';
import employeesRouter from './routes/employees.js';
import meetingsRouter from './routes/meetings.js';
import attendanceRouter from './routes/attendance.js';
import announcementsRouter from './routes/announcements.js';
import applicationsRouter from './routes/applications.js';
import reportsRouter from './routes/reports.js';
import { startSyncCron } from './jobs/sync-cron.js';
import { startDigestCron } from './jobs/digest-cron.js';
import { runSeed } from './db/seed.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/reports', reportsRouter);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'HROS API Server v2', timestamp: new Date().toISOString() });
});
// Run background jobs
startSyncCron();
startDigestCron();
runSeed().catch(console.error);
app.listen(PORT, () => {
    console.log(`🚀 [HROS API SERVER] Express server running on http://localhost:${PORT}`);
});
