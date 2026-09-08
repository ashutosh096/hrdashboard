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
   - **Level 2: Feature Epics (`EpicsSubView.tsx`)**:
     - Short atomic ID format: `{ENTITY}-I{seq2}-EP{seq2}` (e.g. `EHM-I01-EP01`).
     - Nests under parent Initiative. Includes `next_task_seq` counter for scoped task numbering resetting at `T001`.
   - **Level 3: Personal Sprints (`SprintsView.tsx` & `SprintsSubView.tsx`)**:
     - Short atomic ID format: `{ENTITY}-E{seq2}-W{weekNum}` (e.g. `EHM-E01-W1`).
     - Personal 1-to-1 container assigned to a single employee owner (`sprints.employee_id NOT NULL`).
     - Includes `next_task_seq` counter for scoped sprint task numbering resetting at `T001`.
   - **Level 4: Deliverable Tasks (`TasksView.tsx` & `TaskAssignModal.tsx`)**:
     - **Epic Task**: `{ENTITY}-I{seq2}-EP{seq2}-T{seq3}` (e.g. `EHM-I01-EP01-T001`). Auto-derives parent `initiative_id` from parent epic.
     - **Sprint Task**: `{ENTITY}-E{seq2}-W{weekNum}-T{seq3}` (e.g. `EHM-E01-W1-T001`). Multi-employee assignments clone tasks per assignee linked via `group_task_id`.
     - **Backlog Task**: `{ENTITY}-T{seq3}` (e.g. `EHM-T001`).
     - **Immutable Task Codes**: Reassigning a task's epic or sprint updates the foreign keys only, keeping `task_code` immutable.

2. **100% Live Database API Wiring (Zero Mock Data)**:
   - All components (`DashboardView.tsx`, `PerformanceView.tsx`, `AttendanceView.tsx`, `MeetingsView.tsx`, `SearchModal.tsx`, `TaskAnalyticsPanel.tsx`) fetch real records from Express API endpoints (`/api/employees`, `/api/tasks`, `/api/attendance`, `/api/meetings`, `/api/reports`).
   - Completion velocity rates are calculated dynamically from database counts and hard-capped at $\le 100\%$.

3. **Supabase PostgreSQL & Official Drizzle Migration**:
   - Official checked-in Drizzle migration: [`lib/db/drizzle/0004_agile_schema_alignment.sql`](file:///c:/hrdashboard/lib/db/drizzle/0004_agile_schema_alignment.sql).
   - Enforced database constraints (`NOT NULL UNIQUE` on `initiative_code` and `sprint_code`, `NOT NULL` on `employee_id`).
   - Symmetric DB `CHECK` constraint `chk_task_type_lineage` ensuring `task_type` strictly matches foreign key states (`EPIC_TASK`, `SPRINT_TASK`, `BACKLOG`).

4. **Security & Middleware Protection**:
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
- **Drizzle Migration**: `0004_agile_schema_alignment.sql` **APPLIED SUCCESSFULLY**
- **Monorepo Build Command**: `pnpm build` ➔ **PASSED (0 Errors across all 5 workspace projects)**
- **Full Codebase Bundle**: [`FULL_CODEBASE_UNABRIDGED.md`](file:///c:/hrdashboard/FULL_CODEBASE_UNABRIDGED.md)
