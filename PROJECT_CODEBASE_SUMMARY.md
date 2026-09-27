# HROS Project — Quick Reference Summary
> Last updated: 2026-09-28

## Stack
- Backend: Express.js + TypeScript + Drizzle ORM (Neon PostgreSQL)
- Frontend: React 18 + Vite + TypeScript + React Router v6
- Shared libs: lib/db (schema), lib/api-client-react (HTTP+cache), lib/api-zod (validation)
- Package manager: pnpm monorepo

## Ports
- API: http://localhost:3001
- Frontend: http://localhost:5173

## Database (24 tables, Neon PostgreSQL)
Live counts as of 2026-09-28:
  users=18 (ADMIN:7, EMPLOYEE:11)
  employees=17
  initiatives=20
  epics=24
  tasks=37
  task_checklists=46
  task_comments=26
  sprints=10
  announcements=15
  notifications=146
  meetings=483
  projects=14
  invites=15
  attendance=7
  audit_logs=105
  entities=3 (CAG, EHM, COMMON)
  departments=16

## Core Hierarchy
Entity → Initiative (CAG-I22) → Epic (CAG-I22-EP20) → Task (CAG-I22-EP20-T001)
Employee → Sprint (COM-E01-W1) → Task (COM-E01-W1-T001)

## Code Generation (via entity_counters atomic increment)
- Initiative: {entityCode}-I{seq}
- Epic:       {parentInitiativeCode}-EP{seq}
- Sprint:     {employeeCode}-W{week}-{seq}
- Task:       {parentCode}-T{seq padded 3}

## Key Fixes (regression-confirmed)
1. Initiative delete: detaches epics/tasks (null FK), does NOT cascade-delete
2. Task filter enum cast: UPPER(tasks.priority::text) required for PostgreSQL
3. Cache maxAge check: getCachedApi(endpoint, maxAgeMs) returns null if stale
4. Stale-while-revalidate: pages show cache instantly, refetch in background
5. Sprint task epicId: standalone sprint tasks have epicId=null

## API Routes Summary
POST   /api/auth/login
POST   /api/auth/accept-invite
GET    /api/auth/me
GET    /api/initiatives     (ADMIN+MANAGER)
POST   /api/initiatives     (ADMIN+MANAGER)
DELETE /api/initiatives/:id (ADMIN)
GET    /api/epics            (ADMIN+MANAGER)
POST   /api/epics            (ADMIN+MANAGER)
GET    /api/tasks            (all auth, paginated, filtered)
POST   /api/tasks            (all auth)
POST   /api/tasks/:id/clone  (all auth)
POST   /api/tasks/:id/comments (all auth)
PUT    /api/tasks/:id/checklists/:cid (all auth)
GET    /api/sprints          (all auth)
POST   /api/sprints          (ADMIN+MANAGER)
DELETE /api/sprints/:id      (ADMIN+MANAGER, cascade-deletes tasks)
GET    /api/employees        (all auth)
POST   /api/employees/invite (ADMIN+MANAGER)
GET    /api/announcements    (all auth)
POST   /api/announcements/:id/dismiss (all auth)
GET    /api/notifications    (all auth, own only)
PATCH  /api/notifications/:id/read (all auth)
GET    /api/dashboard        (all auth)
GET    /api/meetings         (all auth)
GET    /api/projects         (all auth, scoped by team for employees)

## Regression Test
File: artifacts/api-server/src/e2e_regression_runner.ts
Run:  npx tsx src/e2e_regression_runner.ts
Last: 2026-09-27 — 36/36 PASS — 0 orphans
Full report: REGRESSION_AUDIT_REPORT.md
