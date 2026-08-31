# HROS — Master Build Prompt (v2, Advanced)

Paste this entire document into your AI coding tool to scaffold/extend the HROS codebase. This supersedes `HROS_MASTER_PROMPT_FIXED.md` — it keeps everything that document got right (schema fixes, invite flow, encrypted token storage) and adds the full v2 feature set below.

This is an **internal office tool** for one client, ~15–16 total users across two entities. Build for that scale — not a public SaaS product. No multi-tenant abstraction, no enterprise infra, no compliance UI.

---

## 1. What HROS Is

A single internal HR + operations platform covering two company entities — **EHM** and **CliAgro** — with three user roles: **Admin** (you, the developer/owner), **Manager** (2–4 people), and **Employee** (9–12 people). Modules: Dashboard, Attendance, Meetings (Google Calendar/Meet synced), Office Today (live presence), Announcements, Tasks/Sprints, Salary, Applications, Team.

---

## 2. Tech Stack (final)

**Frontend**
- React 19 + Vite 7
- Routing: Wouter
- Styling: Tailwind CSS v4 + custom CSS variables
- UI: Radix UI primitives, Lucide React icons, Sonner (toasts)
- Charts: Recharts
- Data/state: TanStack React Query
- Animations: Framer Motion

**Backend**
- Express.js v5 (TypeScript)
- Auth: custom JWT (access + refresh tokens) + bcryptjs — **not** Supabase Auth (see rationale below)
- Logging: Pino + Pino-HTTP
- Email: Resend (free tier, 3,000/mo — plenty at this scale)

**Database / Realtime / Storage — Supabase (free tier)**
- PostgreSQL (via Supabase) + Drizzle ORM for schema/migrations
- **Supabase Realtime** — powers live presence status, live Kanban updates, live notifications (subscribing to Postgres table changes). Replaces any need for a separate Socket.IO/Redis setup.
- **Supabase Storage** — MOM documents, meeting transcripts, employee avatars, deliverable file uploads
- **`pg_cron`** (Supabase) — scheduled Google Calendar sync jobs, daily digest triggers. No job queue (BullMQ/Redis) needed at this volume.

**Google Integration**
- Google Calendar API v3 + per-user Google OAuth 2.0 (offline access, refresh tokens)
- Google OAuth consent screen stays in **Testing** mode with your ~16 users added as test users — no need for Google's verification review (that's only required past 100 users)

**Monorepo**
- pnpm workspaces
- Shared Zod schemas (`@workspace/api-zod`)
- Auto-generated React Query hooks (`@workspace/api-client-react`)

**Hosting (free/near-free)**
- Backend: Render (free or hobby tier ~$7/mo to avoid spin-down)
- Frontend: Vercel free tier
- Database/Realtime/Storage: Supabase free tier
- Email: Resend free tier

**Why custom auth, not Supabase Auth:** Supabase Auth's Google provider gives identity only, not the Calendar API scopes/refresh tokens needed for Meet sync — you'd still need a separate `google_tokens` table and OAuth flow regardless. The existing custom invite/JWT design already handles this correctly, so it stays as-is rather than being replaced.

---

## 3. Roles, Entities & Access Model

### Roles (3-tier)
1. **Admin** — full visibility and control across both entities, all managers, all employees. Created manually (not through the invite flow) — this is you.
2. **Manager** (2–4 total) — has their own login credentials and profile. Can:
   - Assign tasks to individual employees or to a **group** of employees at once
   - See and manage only **their own team's** employees and tasks (scoped — Manager A cannot see Manager B's team by default)
   - View their team's attendance, presence, and task throughput
3. **Employee** (9–12 total) — has their own login. Can:
   - See only their own tasks, mark them In Progress / Done
   - See their own attendance, salary/payslip, meetings
   - See company-wide Announcements and Team Directory

### Entities
- Two hardcoded entities: **EHM** and **CliAgro** (no generic "add new company" system — just these two, hardcoded in schema/config)
- Every employee, manager, task, and meeting belongs to one entity
- A **top-header entity switcher/filter** lets Admin/Managers toggle between EHM view, CliAgro view, or a combined cross-entity view

### RBAC implementation
- JWT includes `role`, `entityId`, and (for managers) `managedTeamId` claims
- Express middleware: `requireRole()`, `requireEntityAccess()`, `requireTeamScope()` — centralized, not scattered ad hoc checks
- Enforce manager scoping at the query level (managers' API calls are automatically filtered to their team's employee IDs)

---

## 4. Employee & Manager Onboarding

Reuse the existing invite flow design, applied to both Managers and Employees:

1. Admin (or Manager, for their own team) adds a person via **Add Employee** modal → creates `employees` row + `users` row (`status: PENDING`, no password) + `invites` row (random token, 7-day expiry) → invite email sent via Resend with dashboard link `/accept-invite?token=...`
2. Person opens link → frontend validates token via `GET /api/invites/:token`
3. They set a password **and/or** click "Continue with Google" (auth method decision below)
4. **On first login**, they are prompted with a clear consent step: *"Allow HROS to sync your Google Calendar and Meet so meetings show up automatically."* This is a distinct, explicit step — not bundled silently into login.
5. Google OAuth flow (`/api/auth/google?inviteToken=...`) → callback verifies the Google account email matches the invited email → activates user, saves tokens to `google_tokens` (encrypted, keyed to `user_id`), marks invite `ACCEPTED`, issues JWTs
6. From then on, that person's calendar/meetings sync independently — each person's `google_tokens` row is private to them

**Auth method decision:** Keep **password + optional Google OAuth** (not Google-only), since Calendar sync consent is separate from login itself, and you don't want a single Google outage or a lost Google account to lock someone out of viewing their tasks/salary.

---

## 5. Google Calendar / Meet Integration

Extends the existing `GOOGLE_CALENDAR_INTEGRATION_GUIDE_FIXED.md` design (which is architecturally correct) with these v2 additions:

- **Per-user sync**, not a single global "Connect Google Calendar" button — each employee/manager has their own sync, driven by their own `google_tokens` row
- **Two-way visibility**: meetings created *inside* HROS sync out to Google Calendar + generate a Meet link (as already built — see the "Schedule New Meeting" modal with "Add to Google Calendar" / "Generate Google Meet link" toggles). Meetings created *directly in Google Calendar* that include an HROS employee as a guest sync *into* HROS automatically via the existing upsert-by-`googleEventId` logic.
- **Live presence derivation**: when a synced meeting is currently active (`now` between event start/end) for a given user, their presence status in **Office Today** / **Team** automatically shows **"In Meeting — until [time]"**. This clears automatically when the meeting ends — no manual toggle.
- **Sync trigger**: `pg_cron` scheduled sync every few minutes per active user (lightweight polling — no webhook/push complexity needed at this scale) plus a manual "Sync Calendar" button as fallback
- **Meeting → Task linking**: from a meeting's detail view, a follow-up action item can be converted directly into a task with one click, pre-filling entity/attendee context

---

## 6. Task & Sprint System (Advanced)

### Data model additions
- `entities` (EHM, CliAgro — seeded, not user-creatable)
- `departments` (per entity — e.g. Marketing, Engineering)
- `tasks` table gains: `brandEntityId`, `departmentId`, `taskId` (auto-generated per entity, pattern `{ENTITY}-{DEPT}-{TYPE}-{SEQ}`, e.g. `EHM-MAR-ADH-672`), `sprintWeek`, `parentTaskId` (nullable, for subtasks), `assigneeId`, `reviewingLeadId`, `deliverableUrl`, `status` (`TODO` / `IN_PROGRESS` / `DONE`), `priority`, `dueDate`, `dependencyTaskId` (nullable "Waiting On"), `groupTaskId` (nullable — links copies of a group-assigned task together)
- `task_notes` — progress notes / standup-style comments, timestamped, author-tagged (append-only log, not a single overwritable field)
- `task_checklists` — optional subtasks/checklist items within a task (e.g. Design / Copy / Dev / QA)
- `task_templates` — reusable task shapes for recurring deliverable types, pre-filling entity/department/checklist

### Assign Task modal (matches your reference screenshots)
Fields: Brand/Entity, Department, Task ID (auto-generated, editable), Target Sprint Week, Task Title/Deliverable Name, Assignee (single) **or** multi-select for group assignment, Reviewing Lead, Deliverable URL (optional).

### Group assignment behavior
When a manager assigns the same task to 2–3 employees at once:
- Each employee gets their **own independent task row** (same `groupTaskId`, separate `assigneeId` and `status`)
- On each employee's **Team/profile page**, the group task is visibly tagged as shared (e.g. "Also assigned to: Priya, Rahul")
- Each person marks **their own copy** Done independently — one person finishing doesn't auto-complete the others'

### Task Details / edit modal (matches your reference screenshot)
Fields: Brand/Entity (locked), Parent Task ID (locked), editable Deliverable name, 1-click reassign Assignee dropdown, Reviewing Lead, Deliverable URL, Status dropdown, Dependency/"Waiting On" dropdown, append-only Progress Notes thread, "Save Changes & Sync" button.

### Kanban board
- Columns: To Do / In Progress / Done
- Drag-and-drop between columns
- WIP limit indicator per employee (visual warning, not a hard block) so managers can spot overload
- Overdue tasks get a red badge directly on the card, visible without opening it

### Sprint reporting
- Exportable weekly/sprint summary per entity and per department: tasks completed / in-progress / blocked
- Cross-entity comparison view: EHM vs CliAgro side by side — headcount, task throughput, attendance %

---

## 7. Dashboard & Navigation — Visual Design Direction

Adopt the **layout and visual language** of the reference design (light theme, green accent, clean card-based UI) while keeping all actual HROS data/entities — do **not** reuse its placeholder content (no "Nova Creative Team," no Orion/Zenith/Helios, no Zoom).

### Sidebar
- Top: logo mark + "HR OS" wordmark (keep existing purple-indigo brand accent, or shift to the green accent from the reference — client's call, flag this as an open choice)
- **Entity switcher** directly below the logo, styled like the reference's team/workspace switcher dropdown — toggles between EHM / CliAgro / Both
- Nav items with icon + label, active state highlighted, matching the reference's clean spacing and rounded active-pill style: Dashboard, Attendance, Meetings, Office Today, Announcements, Tasks, Salary, Applications, Team
- Bottom: user profile chip (avatar, name, role) + logout, as already built

### Top header
- Global search bar (search across tasks, employees, meetings, announcements) styled like the reference's "Search ⌘K" bar
- Notification bell (live, Supabase Realtime-backed)
- Profile avatar

### Role-specific home screens
- **Admin dashboard**: company-wide stat cards (adapt reference's stat-card row style) — Total Employees, Present Today, Active Meetings, Active Tasks — plus the cross-entity comparison panel
- **Manager dashboard**: their team's sprint progress, workload distribution, today's schedule
- **Employee dashboard**: a **"My Day" widget** — today's meetings + today's due tasks in one glance (styled like the reference's "Schedule" panel with Meetings/Task tabs)

### Dashboard panels (styled per reference, HROS content)
- Stat card row (top): reuse reference's card style — icon chip, big number, label
- Main chart panel (reference's "Weekly Revenue" chart slot): repurpose as **Attendance/Task Completion Trends** — line/area chart, Recharts
- Schedule panel with tabs (reference's Meetings/Task tabs): shows today's meetings and today's tasks, "View Detail" links
- Summary table at bottom (reference's "Project Progress Summary" table): repurpose as **Sprint/Task Summary** — Task/Project name, entity, status badges (Completed / Ongoing / Pending, styled with the same colored pill treatment)

---

## 8. Feature List — Explicit Scope

### In scope (v2)
- 3-tier roles (Admin/Manager/Employee) with manager-to-team scoping
- Two hardcoded entities (EHM, CliAgro) with header switcher + cross-entity comparison
- Employee/Manager invite → credential + link email → first-login Google Calendar/Meet consent step
- Per-user Google Calendar/Meet sync, two-way (HROS↔Google)
- Live presence status derived from active meetings (auto-clears)
- Advanced task system: auto Task IDs per entity, sprint weeks, dependencies, group assignment, subtasks/checklists, task templates, append-only progress notes
- Kanban with drag-and-drop + WIP visual limits + overdue flags
- Meeting → Task conversion
- Role-specific dashboards + "My Day" widget for employees
- Global search across tasks/employees/meetings/announcements
- Daily digest notification (lightweight, via Resend) — "You have N tasks due this week"
- Pinned announcements + read receipts ("seen by")
- Exportable weekly/sprint summary per entity/department
- Supabase Realtime-backed live notifications and live Kanban updates

### Explicitly out of scope (client decision)
- Geo/IP/WiFi-based auto check-in
- Leave application + approval workflow
- Timesheet / hours-logged tracking
- Multi-tenant "add new company" system (entities are hardcoded to EHM/CliAgro)
- Google OAuth production verification (staying in Testing mode is fine at this user count)

---

## 9. Open Decisions Still Needed From Client

1. Sidebar accent color — keep current purple-indigo brand, or adopt the reference's green accent?
2. Should Managers ever see other Managers' teams (read-only), or stay fully siloed?
3. Confirm auth method: password + optional Google OAuth (recommended), not Google-only.

---

## 10. Build Order Suggestion

1. Extend schema: `entities`, `departments`, role/scoping fields on `users`, extended `tasks` fields, `task_notes`, `task_checklists`, `task_templates`, `notifications`
2. Wire up Supabase (Postgres connection via Drizzle, Realtime channels, Storage buckets)
3. RBAC middleware + entity/team scoping
4. Rebuild Task system (Assign Task modal, Task Details modal, Kanban, group assignment)
5. Entity switcher + cross-entity comparison dashboard
6. Per-user Google Calendar sync + live presence derivation
7. Role-specific dashboards with reference-styled panels
8. Global search, daily digest, pinned announcements/read receipts
9. Meeting → Task linking
10. Polish pass: WIP indicators, overdue badges, export/reporting views
