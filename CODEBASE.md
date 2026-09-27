# HROS — Full Codebase & Database Reference
> Last updated: 2026-09-28 (post regression audit)

---

## 1. Monorepo Structure

```
c:\hrdashboard\
├── artifacts/
│   ├── api-server/          ← Express + Drizzle ORM backend (Node.js)
│   └── hr-dashboard/        ← React + Vite frontend
├── lib/
│   ├── db/                  ← Drizzle schema definitions + DB client (shared)
│   ├── api-client-react/    ← Shared fetch utility + React Query hooks
│   └── api-zod/             ← Zod validation schemas (shared)
├── scripts/                 ← Utility scripts (migrations, seeds)
├── drizzle.config.ts        ← Root drizzle config (points to lib/db)
├── pnpm-workspace.yaml      ← pnpm monorepo workspace config
└── package.json             ← Root package
```

### Startup Commands
```bash
pnpm dev                           # Full stack
cd artifacts/api-server && pnpm dev  # API only (port 3001)
cd artifacts/hr-dashboard && pnpm dev # Frontend only (port 5173)
```

---

## 2. Database — Live State (2026-09-28)

**Database:** PostgreSQL (Neon serverless)
**ORM:** Drizzle ORM
**Total Tables:** 24

### 2.1 All 24 Tables + Row Counts

| # | Table | Rows | Purpose |
|---|---|---|---|
| 1 | announcements | 15 | Company-wide pinned + regular announcements |
| 2 | applications | 0 | Job/HR applications (future) |
| 3 | attendance | 7 | Employee attendance records |
| 4 | audit_logs | 105 | System audit trail |
| 5 | departments | 16 | Departments within entities |
| 6 | employees | 17 | Employee profiles |
| 7 | entities | 3 | Business entities (CAG, EHM, COMMON) |
| 8 | entity_counters | 3 | Atomic sequence counters per entity |
| 9 | epics | 24 | Epics linked to initiatives |
| 10 | google_tokens | 5 | OAuth tokens for Google Calendar sync |
| 11 | initiatives | 20 | Top-level strategic initiatives |
| 12 | invites | 15 | Pending/accepted employee invites |
| 13 | meeting_attendees | 0 | Meeting RSVP records |
| 14 | meetings | 483 | Calendar meetings (synced + manual) |
| 15 | notifications | 146 | In-app notification queue |
| 16 | password_reset_otps | 0 | OTP tokens for password reset |
| 17 | projects | 14 | Team projects (separate from initiatives) |
| 18 | sprints | 10 | Personal employee sprints |
| 19 | task_checklists | 46 | Checklist items (subtasks) within tasks |
| 20 | task_comments | 26 | Comments on tasks |
| 21 | task_notes | 0 | Private notes on tasks |
| 22 | task_templates | 0 | Reusable task templates |
| 23 | tasks | 37 | All tasks (EPIC_TASK, SPRINT_TASK, PROJECT_TASK) |
| 24 | users | 18 | Auth user accounts |

### 2.2 Entities (3 rows)

| Name | Code | ID |
|---|---|---|
| Climagro Analytics | CAG | ebbf77f7-c1ac-423d-a29d-8db50beac25f |
| EHM & CLIMAGRO (COMMON) | COMMON | 539ba160-88b8-4fdd-a5ef-39c09c97516a |
| EHM Consultancy | EHM | 886d7680-6a7c-482e-ae61-159ec359f881 |

### 2.3 User Role Breakdown (18 users)

| Role | Count |
|---|---|
| ADMIN | 7 |
| EMPLOYEE | 11 |

Note: No MANAGER role users currently in DB. MANAGER is schema-defined and middleware-enforced.

### 2.4 Core Data Hierarchy

```
Entity (CAG / EHM / COMMON)
  └── Initiative  [initiativeCode: CAG-I01, EHM-I01]
        └── Epic  [epicCode: CAG-I01-EP01]
              └── Task (EPIC_TASK)  [taskCode: CAG-I01-EP01-T001]
                    ├── task_checklists
                    ├── task_comments
                    └── task_notes

Employee
  └── Sprint  [sprintCode: EHM-E01-W1]
        └── Task (SPRINT_TASK)  [taskCode: EHM-E01-W1-T001]

Project
  └── Task (PROJECT_TASK)
```

### 2.5 Key Schema Constraints

tasks.taskType enum: EPIC_TASK | SPRINT_TASK | PROJECT_TASK
tasks.status enum:   BACKLOG | IN_PROGRESS | DONE | REVIEW | BLOCKED | PLANNED
tasks.priority enum: URGENT | HIGH | MEDIUM | LOW

IMPORTANT — enum cast required for UPPER():
  UPPER(tasks.priority::text) IN ('URGENT','P1')   -- correct
  UPPER(tasks.priority) IN ('URGENT')              -- error 42883

initiatives.status enum: PLANNED | ACTIVE | DONE
  (IN_PROGRESS and ACTIVE both map to ACTIVE, COMPLETED maps to DONE)

announcements.priority: NORMAL | IMPORTANT | URGENT
  (input LOW is normalized to NORMAL by the route)

Initiative DELETE: sets epics.initiativeId=null + tasks.initiativeId=null,
  then deletes ONLY the initiative row (no cascade-delete of children).

Sprint DELETE: cascade-deletes all linked tasks + their checklists/comments/notes.

---

## 3. API Server

Location: artifacts/api-server/
Port: 3001
Framework: Express.js + TypeScript
Auth: JWT Bearer tokens via middleware/auth.ts

### 3.1 Route Files

| File | Mount | RBAC |
|---|---|---|
| routes/auth.ts | /api/auth | Public (login, OTP) + requireAuth (me, refresh) |
| routes/initiatives.ts | /api/initiatives | ADMIN + MANAGER (read/write) |
| routes/epics.ts | /api/epics | ADMIN + MANAGER |
| routes/tasks.ts | /api/tasks | All auth |
| routes/sprints.ts | /api/sprints | Read: all auth; Write: ADMIN+MANAGER |
| routes/projects.ts | /api/projects | All auth; scoped by team membership for employees |
| routes/employees.ts | /api/employees | ADMIN+MANAGER write; all auth read |
| routes/announcements.ts | /api/announcements | ADMIN write; all auth read+dismiss |
| routes/notifications.ts | /api/notifications | All auth (own notifications only) |
| routes/meetings.ts | /api/meetings | All auth |
| routes/attendance.ts | /api/attendance | All auth |
| routes/dashboard.ts | /api/dashboard | All auth |
| routes/reports.ts | /api/reports | All auth |
| routes/applications.ts | /api/applications | ADMIN |

### 3.2 Tasks Endpoint — Filters

GET /api/tasks supports:
  ?paginate=true          → returns { totalCount, tasks, totalPages }
  ?page=1&pageSize=5      → pagination
  ?priority=URGENT|P1    → priority filter (with enum cast fix)
  ?status=BACKLOG        → status filter (with enum cast fix)
  ?search=keyword        → ILIKE search across title, taskCode, description
  ?employeeId=uuid       → filter by assignee
  ?epicId=uuid           → filter by parent epic
  ?initiativeId=uuid     → filter by initiative
  ?projectId=uuid        → filter by project
  ?entityCode=CAG|EHM|COMMON → entity filter

### 3.3 Services & Middleware

middleware/auth.ts       → requireAuth (JWT validate), requireRole([roles])
services/email.ts        → sendTaskAssignedEmail, sendDelayRequestEmail
services/googleCalendar.ts → OAuth2 client, event sync, token refresh

---

## 4. Frontend (React + Vite)

Location: artifacts/hr-dashboard/
Port: 5173
Framework: React 18 + Vite + TypeScript
Routing: React Router v6

### 4.1 Pages

| File | Route | Description |
|---|---|---|
| LoginView.tsx | /login | Login form |
| AcceptInviteView.tsx | /accept-invite | Invite acceptance + password set |
| DashboardView.tsx | / | Stats, sprint summary, attendance |
| TasksView.tsx | /tasks | Tasks (filters, search 300ms debounce, pagination, group-by-epic, initiatives/epics/sprints tabs) |
| SprintsView.tsx | /sprints | Sprint shell (delegates to SprintsSubView) |
| MeetingsView.tsx | /meetings | Meetings + Google Calendar sync |
| TeamDirectoryView.tsx | /team | Employee directory |
| ApplicationsView.tsx | /applications | Job applications (ADMIN) |
| AnnouncementsView.tsx | /announcements | Announcements feed |
| NotificationsView.tsx | /notifications | Notification feed + mark-read |
| PerformanceView.tsx | /performance | Analytics |
| AttendanceView.tsx | /attendance | Attendance |
| OfficeTodayView.tsx | /office-today | Who is in office |
| SalaryView.tsx | /salary | Salary (ADMIN) |

### 4.2 Key Components

| Component | Purpose |
|---|---|
| Sidebar.tsx | Nav sidebar, role-gated menu |
| Navbar.tsx | Top bar: notifications, profile, search |
| InitiativesSubView.tsx | Initiatives tab — full CRUD |
| EpicsSubView.tsx | Epics tab — full CRUD |
| SprintsSubView.tsx | Sprints tab — full CRUD + sprint task management |
| TaskAssignModal.tsx | Create/assign task modal |
| TaskUpdateModal.tsx | Full task edit modal |
| TaskCloneModal.tsx | Clone task + checklists |
| PinnedAnnouncementBanner.tsx | Auto-dismissable pinned announcement banner |
| EmployeeDashboardView.tsx | Employee own-tasks + sprint view |
| SearchModal.tsx | Global search (Cmd+K) |
| ProfileModal.tsx | Profile edit modal |
| ForgotPasswordModal.tsx | OTP password reset flow |
| CalendarPicker.tsx | Date picker |
| SearchableSelect.tsx | Searchable dropdown |
| MarkAttendanceModal.tsx | Attendance marking |

### 4.3 Contexts & Utils

| File | Purpose |
|---|---|
| contexts/AuthContext.tsx | Auth state (user, role, employeeId); login/logout |
| utils/entityUtils.ts | Entity code/name resolution |
| utils/dateUtils.ts | Date formatting |

---

## 5. Shared Libraries (lib/)

### 5.1 lib/db/ — Schema + DB Client

Exports from lib/db/src/index.ts:
  db            — Drizzle client (Neon HTTP adapter)
  All table refs: users, employees, entities, departments, initiatives,
    epics, tasks, sprints, projects, taskChecklists, taskComments,
    taskNotes, taskTemplates, announcements, notifications, invites,
    meetings, meetingAttendees, attendance, googleTokens, entityCounters,
    auditLogs, applications, passwordResetOtps
  Operators: eq, and, or, inArray, sql, asc, desc, isNull, isNotNull

### 5.2 lib/api-client-react/ — HTTP + React Query

Exports:
  fetchApi<T>(endpoint, options)          — base HTTP with JWT auth + cache
  getCachedApi<T>(endpoint, maxAgeMs)    — timestamp-aware read (null if stale)
  setCachedApi<T>(endpoint, data)        — write with timestamp
  clearApiCache(prefix?)                  — invalidate on mutation
  useDashboardData(entityCode?)          — React Query hook
  useTasks(entityCode?)                  — React Query hook
  useCreateTask()                        — mutation hook
  useMeetings()                          — React Query hook
  useEmployees(entityCode?)              — React Query hook

Cache behavior:
  CACHE_TTL_MS = 60000ms (60 seconds)
  GET requests: deduplication via inFlightRequests Map
  Mutation (POST/PUT/DELETE): auto-invalidates cache for that route prefix

### 5.3 lib/api-zod/ — Zod Validation Schemas

Input validation schemas used in API server.

---

## 6. Code Generation Logic

All entity codes generated atomically via entity_counters table:

Pattern: INSERT ... ON CONFLICT DO NOTHING
         UPDATE ... SET seq = seq + 1 RETURNING *
         Code = entityCode + prefix + paddedSeq

Initiative: CAG-I22, EHM-I21    (nextInitiativeSeq)
Epic:       CAG-I22-EP20         (nextEpicSeq, derived from parent initiative code)
Sprint:     COM-ADM02-W1-11      (nextSprintSeq, derived from employeeCode + targetWeek)
Task:       CAG-I22-EP20-T001    (nextTaskSeq on parent epic/sprint)

---

## 7. Known Bugs Fixed (Regression-Confirmed)

Fix 1 — Initiative Delete (no cascade):
  File: routes/initiatives.ts DELETE /:id
  Was: deletes epics, sprints, tasks, checklists, comments, notes
  Now: epics.initiativeId = null, tasks.initiativeId = null, delete only initiative row

Fix 2 — Task Filter Enum Cast:
  File: routes/tasks.ts GET /
  Was: UPPER(tasks.priority) — PostgreSQL error 42883
  Now: UPPER(tasks.priority::text) — explicit cast for enum columns

Fix 3 — Cache Age Check:
  File: lib/api-client-react/src/index.ts
  Was: getCachedApi() returned data regardless of age
  Now: accepts maxAgeMs param; returns null if stale

Fix 4 — Stale-While-Revalidate:
  Files: TasksView.tsx, DashboardView.tsx
  Was: setLoading(true) unconditionally on mount
  Now: checks cache first; shows cached data immediately; background refetch

Fix 5 — Sprint Task Epic Field:
  File: SprintsSubView.tsx
  Was: sprint tasks inherited epicId from parent scope
  Now: sprint tasks have epicId: null unless explicitly linked

---

## 8. Environment Variables

API Server (.env):
  DATABASE_URL        — Neon PostgreSQL connection string
  JWT_SECRET          — JWT signing secret
  JWT_REFRESH_SECRET  — Refresh token secret
  SMTP_USER           — Optional SMTP email
  SMTP_PASS           — Optional SMTP password
  RESEND_API_KEY      — Optional Resend email service
  GOOGLE_CLIENT_ID    — Google Calendar OAuth
  GOOGLE_CLIENT_SECRET
  GOOGLE_REDIRECT_URI

Frontend (.env):
  VITE_API_URL=http://localhost:3001

---

## 9. Regression Test Suite

Runner: artifacts/api-server/src/e2e_regression_runner.ts
Run:    npx tsx src/e2e_regression_runner.ts

36-step coverage:
  Part 1 (Steps 1-5):   Core hierarchy CREATE
  Part 2 (Steps 6-10):  Edit integrity (mutations do not wipe children)
  Part 3 (Steps 11-14): Sprints
  Part 4 (Steps 15-17): Notifications
  Part 5 (Steps 18-21): Announcements
  Part 6 (Steps 22-24): Employee invite flow
  Part 7 (Steps 25-28): RBAC scoping
  Part 8 (Steps 29-33): Filters, search, pagination, group-by-epic
  Part 9 (Steps 34-36): Row-count reconciliation + orphan integrity check

Last run: 2026-09-27 — 36/36 PASS — Zero orphans — All deltas reconciled
