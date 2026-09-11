# EHM-Climagro OS — Full Project Codebase & Technical Specification

> **Platform Name**: EHM-Climagro OS (HR, Operations, Agile Deliverables & Meeting Management System)  
> **Entities Supported**: `ehmconsultancy` and `climagroanalytics`  
> **Target Audience**: Management Team, Team Leads, Employees  

---

## 📋 Executive Overview

**EHM-Climagro OS** is an enterprise-grade HR, Attendance, Operations, Sprint Deliverable, Agile Hierarchy, and Meeting Management platform designed for cross-entity team collaboration between **ehmconsultancy** and **climagroanalytics**.

### Key System Capabilities:

1. **Full 4-Level Agile Hierarchy & Lineage Model (Initiatives ➔ Epics ➔ Sprints ➔ Tasks)**:
   - **Level 1: Strategic Initiatives (`InitiativesSubView.tsx`)**:
     - Short atomic ID format: `{ENTITY}-I{seq2}` (e.g. `EHM-I01`, `CAG-I01`).
     - Form fields: Title, Brand/Entity (`ehmconsultancy`, `climagroanalytics`), Department, Sub-Department/Track, Target Deliverable Metric, Target Month, Epics division count (`1` to `8`).
     - Includes inline `☑ Make Clone / Duplicate Copy` checkbox with template selector.
   - **Level 2: Feature Epics (`EpicsSubView.tsx`)**:
     - Short atomic ID format: `{ENTITY}-I{seq2}-EP{seq2}` (e.g. `EHM-I01-EP01`).
     - Nests under parent Initiative. Includes `next_task_seq` counter for scoped task numbering resetting at `T001`.
     - Includes inline `☑ Make Clone / Duplicate Copy` checkbox with template selector.
   - **Level 3: Personal Sprints (`SprintsSubView.tsx`)**:
     - 6-column Kanban Board View (`BACKLOG`, `PLANNED`, `TODO`, `IN_PROGRESS`, `TO_REVIEW`, `DONE`).
     - Product Backlog and Planned columns stay visible across all sprint week filters.
     - Includes HTML5 Drag-and-Drop (sliding cards between columns) and status dropdown transitions.
     - Status transition workflows:
       - **Shift to Planned**: Triggers confirmation modal (*"Are you sure you want to shift task to Planned?"*).
       - **Assign Task & Configure Sprint Parameters**: Moving from Backlog/Planned to active columns opens assignment modal (Assignee, Reviewing Lead, Sprint Week, Due Date, Priority).
     - Dedicated `👁 View` button on task cards to open details pop-up modal.
     - Includes inline `☑ Make Clone / Duplicate Copy` checkbox inside sprint task creation form.
   - **Level 4: Deliverable Tasks (`TasksView.tsx` & `TaskAssignModal.tsx`)**:
     - **Epic Task**: `{ENTITY}-I{seq2}-EP{seq2}-T{seq3}` (e.g. `EHM-I01-EP01-T001`). Auto-derives parent `initiative_id` from parent epic.
     - **Sprint Task**: `{ENTITY}-E{seq2}-W{weekNum}-T{seq3}` (e.g. `EHM-E01-W1-T001`). Multi-employee assignments clone tasks per assignee linked via `group_task_id`.
     - **Backlog Task**: `{ENTITY}-T{seq3}` (e.g. `EHM-T001`).
     - **Immutable Task Codes**: Reassigning a task's epic or sprint updates the foreign keys only, keeping `task_code` immutable.
     - Includes inline `☑ Make Clone / Duplicate Copy` checkbox inside task creation form.

2. **Dashboard & Performance Operations (`DashboardView.tsx` & `EmployeeDashboardView.tsx`)**:
   - Clean, header workspace status banner (removed clocked in/clock out text widget).
   - 5 Featured Responsive KPI Tiles:
     1. **Today's Tasks & Pending**
     2. **Active Sprint Cycles**
     3. **Google Meetings Scheduled**
     4. **Deliverable Completion Rate**
     5. **Completed Tasks**
   - Interactive Detail Pop-up Modals: Clicking any tile opens a big responsive pop-up modal with complete details, tasks, meeting links, or completion deliverables.
   - Customizable Analytics View: Dropdown selector to switch between **Sprint Velocity & Quality Trend**, **Priority Distribution**, and **Daily Sprint Completion Pacing**.

3. **100% Live Database API Wiring (Zero Mock Data)**:
   - All components fetch real records from Express API endpoints (`/api/employees`, `/api/tasks`, `/api/initiatives`, `/api/epics`, `/api/sprints`, `/api/attendance`, `/api/meetings`, `/api/reports`).
   - Completion velocity rates are calculated dynamically from database counts and hard-capped at $\le 100\%$.

4. **Supabase PostgreSQL & Official Drizzle Migration**:
   - Official checked-in Drizzle migration: [`lib/db/drizzle/0004_agile_schema_alignment.sql`](file:///c:/hrdashboard/lib/db/drizzle/0004_agile_schema_alignment.sql).
   - Enforced database constraints (`NOT NULL UNIQUE` on `initiative_code` and `sprint_code`, `NOT NULL` on `employee_id`).
   - Symmetric DB `CHECK` constraint `chk_task_type_lineage` ensuring `task_type` strictly matches foreign key states (`EPIC_TASK`, `SPRINT_TASK`, `BACKLOG`).

5. **Security & Middleware Protection**:
   - `requireAuth` applied across all protected backend routes.
   - `requireRole(['ADMIN', 'MANAGER'])` applied to POST/PUT on `/api/employees`, `/api/tasks`, `/api/initiatives`, `/api/epics`, `/api/sprints`.

---

## 🔑 Database Authentication Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin / Manager** | `admin@example.com` | `admin123` | Full workspace access, Add Employee, Assign Task, Delay Alerts, Submission Reviews, Create/Edit Initiatives, Epics & Sprints |

---

## 🛠️ Complete Technology Stack

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript** | UI Component Architecture (0 TS errors) |
| **Build Tool & Server** | **Vite 6** | Fast HMR dev server & asset bundling |
| **Styling & Theme** | **Tailwind CSS v4** | Utility-first styling & custom HSL color tokens (75% font-size density) |
| **Iconography** | **Lucide React** | Modern vector icon library |
| **Routing** | **Wouter** | Lightweight hooks-based SPA router |
| **State & Data** | **TanStack React Query (v5)** + **React Context API** | Caching, server-state sync & global auth/entity state |
| **Backend API** | **Node.js** + **Express.js v5** | RESTful API server running on port `5000` / `10000` |
| **Database & ORM** | **Supabase PostgreSQL** + **Drizzle ORM** | Type-safe SQL schema & relational data management |
| **Third-Party Integrations** | **Google Calendar API v3** + **Resend API** | OAuth 2.0 Meet link generation & notification emails |

---

## 🚀 Verification & Build Status

- **Supabase Connection**: Verified (`SELECT 1` ➔ `connected: 1, current_database: "postgres"`)
- **TypeScript Compilation**: `npx tsc --noEmit` ➔ **PASSED (0 Errors)**
- **GitHub Push Status**: Pushed to `origin/main` (`https://github.com/ashutosh096/hrdashboard.git`)
- **Full Codebase Bundle**: [`FULL_CODEBASE_UNABRIDGED.md`](file:///c:/hrdashboard/FULL_CODEBASE_UNABRIDGED.md)
