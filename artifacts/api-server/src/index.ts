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
import projectsRouter from './routes/projects.js';
import { startSyncCron } from './jobs/sync-cron.js';
import { startDigestCron } from './jobs/digest-cron.js';
import { startOverdueCheckCron } from './jobs/overdue-check-cron.js';
import { db, sql } from '@workspace/db';

import notificationsRouter from './routes/notifications.js';
import historyRouter from './routes/history.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Safe non-destructive table initialization & schema migration on startup
async function ensureTablesExist() {
  try {
    // 1. Projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        entity TEXT NOT NULL DEFAULT 'EHM',
        entity_name TEXT,
        category TEXT NOT NULL DEFAULT 'Technology & Systems',
        lead TEXT NOT NULL DEFAULT 'Dr. Harshit Mishra',
        team JSONB DEFAULT '[]'::jsonb,
        budget TEXT,
        start_date TEXT,
        target_date TEXT,
        status TEXT NOT NULL DEFAULT 'Planning',
        priority TEXT NOT NULL DEFAULT 'High',
        tech_stack TEXT DEFAULT 'React, Node.js, Python, GIS',
        milestones_count INTEGER DEFAULT 0,
        description TEXT DEFAULT '',
        checkpoints JSONB DEFAULT '[]'::jsonb,
        comments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
      );
    `);

    // 2. Epics table schema non-destructive updates (nullable initiative_id + project_id column)
    await db.execute(sql`
      DO $$ 
      BEGIN
        -- Make initiative_id optional (nullable)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'epics' AND column_name = 'initiative_id' AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE epics ALTER COLUMN initiative_id DROP NOT NULL;
        END IF;

        -- Ensure project_id column exists on epics
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'epics' AND column_name = 'project_id'
        ) THEN
          ALTER TABLE epics ADD COLUMN project_id UUID REFERENCES projects(id);
        END IF;

        -- Ensure project_id column exists on tasks
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'project_id'
        ) THEN
          ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id);
        END IF;

        -- Ensure deliverable_url column exists on projects
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'deliverable_url'
        ) THEN
          ALTER TABLE projects ADD COLUMN deliverable_url TEXT DEFAULT '';
        END IF;

        -- Ensure checkpoints column exists on projects
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'checkpoints'
        ) THEN
          ALTER TABLE projects ADD COLUMN checkpoints JSONB DEFAULT '[]'::jsonb;
        END IF;

        -- Ensure comments column exists on projects
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'comments'
        ) THEN
          ALTER TABLE projects ADD COLUMN comments JSONB DEFAULT '[]'::jsonb;
        END IF;

        -- Ensure tasks.due_date is nullable
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'due_date' AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE tasks ALTER COLUMN due_date DROP NOT NULL;
        END IF;

        -- Ensure projects date/budget columns have no hardcoded defaults
        ALTER TABLE projects ALTER COLUMN budget DROP DEFAULT;
        ALTER TABLE projects ALTER COLUMN start_date DROP DEFAULT;
        ALTER TABLE projects ALTER COLUMN target_date DROP DEFAULT;
      END $$;
    `);

    console.log('✅ [DATABASE] Schema verified & non-destructive migrations completed on startup.');
  } catch (err) {
    console.error('[DATABASE STARTUP NOTICE]:', err);
  }
}
ensureTablesExist();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Handle body-parser JSON syntax errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload format' });
  }
  next(err);
});

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
app.use('/api/projects', projectsRouter);
app.use('/api/history', historyRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HROS API Server v2', timestamp: new Date().toISOString() });
});

// Global API error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[UNHANDLED EXPRESS ERROR]:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({ message: err?.message || 'Internal Server Error' });
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 [HROS API SERVER] Express server running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
