# EHM-Climagro OS — Full Project Codebase & Technical Specification

> **Platform Name**: EHM-Climagro OS (HR, Operations, Agile Deliverables & Meeting Management System)  
> **Entities Supported**: `ehmconsultancy` and `climagroanalytics`  
> **Target Audience**: Management Team, Team Leads, Employees  

---

## 📋 Executive Overview

**EHM-Climagro OS** is an enterprise-grade HR, Attendance, Operations, Sprint Deliverable, Agile Hierarchy, and Meeting Management platform designed for cross-entity team collaboration between **ehmconsultancy** and **climagroanalytics**.

### Key System Capabilities:

1. **Full 4-Level Agile Hierarchy (Initiatives ➔ Epics ➔ Sprints ➔ Tasks)**:
   - **Level 1: Strategic Initiatives (`InitiativesSubView.tsx`)**:
     - Concurrency-safe atomic sequence generation: `CAG-INIT-001` or `EHM-INIT-001`.
     - Form fields: Title, Brand/Entity (`ehmconsultancy`, `climagroanalytics`), Department (`Marketing`, `Sales`, `Product & Tech`, `Operations & Delivery`, `Grants & Governance`), Sub-Department/Track, Target Deliverable Metric, Target Month (`Month 1`, `Month 2`, `Month 3`), Epics division count (`1` to `8`).
     - **Default Closed View**: Closed/collapsed by default (`expandedId = null`).
     - **Archive Mode & Auto-Archiving**: Marking an initiative as `DONE` automatically moves it to **Archive Mode** (`Archive (N)` toggle button).
     - **Explicit Brand / Entity Badge**: Displays `🏢 climagroanalytics` / `🏢 ehmconsultancy` badge on each initiative card.
     - **Status Confirmation Popup Modal**: Confirmation dialog before status updates.
     - **Dynamic Adaptive Epics Sizing**: 1-6 epics scale adaptively across 1 row (`grid-cols-1` to `grid-cols-6`), 7+ epics wrap to row 2.
   - **Level 2: Feature Epics (`EpicsSubView.tsx`)**:
     - Parent Initiative dropdown sorted alphabetically (`[CAG-INIT-001] Title`).
     - Compact Card Layout & Ordering:
       - Top Bar: Parent Initiative Badge `⚡ [CAG-INIT-001] Title` on left, Status Badge (`PLANNED`, `IN_PROGRESS`, `DONE`), Eye Button (`👁️`), and Edit Button (`✏️`) on top right.
       - Second Line: Epic Code Badge `CAG-EPIC-001` and Epic Title `Frontend`.
       - Third Line: Department (`Product & Tech`) and Target Week (`Week 1 (Days 1–7)`).
     - **Hanging TASKS Clothesline UI**: Animated hanging clothespin stringer displaying assigned **Hanging TASKS** (`[CAG-EPIC-001-TSK-01] Initial Setup`).
     - **Middle Pop Card Details Modal**: Clicking Eye button (`👁️`) opens a centered middle pop card displaying all epic details, linked tasks, and an embedded **`✏️ Edit Epic`** button.
     - **Scalable Toolbar for 50+ Epics**: Real-time Search Bar, Status Filter Pills (`All`, `Planned`, `In Progress`, `Done`), and `Cards` vs `Compact Table` view switcher.
   - **Level 3: Standalone Sprints (`SprintsView.tsx` & `SprintsSubView.tsx`)**:
     - Dedicated page mounted at `/sprints` accessible via Sidebar under **WORK ➔ Sprints**.
     - Alphabetically sorted Parent Epic dropdown (`[CAG-EPIC-001] Title`).
     - Form fields: Parent Epic, Sprint Title, Target Week, Department, Assigned To employee, Reviewing Lead, Goal.
   - **Level 4: Product Backlog Tasks (`TasksView.tsx` & `TaskAssignModal.tsx`)**:
     - Top segmented tab switcher on Product Backlog (`/tasks`): `🎯 Initiatives`, `⚡ Epics`, `📋 Tasks`.
     - Alphabetically sorted Parent Sprint dropdown (`[CAG-SPR-001] Name`).
     - Form fields: Parent Sprint, Task Title, Department, Assigned To employee, Target Date, Description, Reviewing Lead.

2. **Frontend-to-Backend End-to-End Real API Wiring**:
   - `AuthContext.tsx`: Real `POST /api/auth/login` authentication via `fetchApi` with `localStorage.setItem('hros_token', token)` JWT session restoration on app load.
   - `LoginView.tsx`: Real API error handling with live error toasts.
   - `EmployeeDashboardView.tsx`: Live deliverable tasks (`GET /api/tasks`) and meetings (`GET /api/meetings`).
   - `TasksView.tsx`: Live Kanban board (`GET /api/tasks` & `POST /api/tasks`).
   - `MeetingsView.tsx`: Live Google Calendar sync & meeting scheduling (`GET/POST /api/meetings` & `GET /api/meetings/sync`).
   - `AnnouncementsView.tsx`: Live company bulletin feed (`GET/POST /api/announcements`).
   - `AttendanceView.tsx`: Live attendance tracking (`GET /api/attendance` & `POST /api/attendance/clock-in`).
   - `TeamDirectoryView.tsx`: Live employee roster (`GET/POST /api/employees`).

3. **Google OAuth 2.0 & Calendar API Integration**:
   - `SettingsView.tsx` passes logged-in `userId` (`/api/auth/google?userId=${user.id}`).
   - Real OAuth callback handler (`/google/callback`) exchanging code for `access_token` and `refresh_token`.
   - `google_tokens` table persistence & automatic token refresh via `refreshAccessToken(userId)`.
   - Google Meet link creation on Google Calendar API (`POST /calendars/primary/events?conferenceDataVersion=1`).

4. **Security & Middleware Protection**:
   - `requireAuth` applied across all protected routes (`employees.ts`, `tasks.ts`, `meetings.ts`, `attendance.ts`, `announcements.ts`, `applications.ts`, `reports.ts`, `dashboard.ts`, `initiatives.ts`, `epics.ts`, `sprints.ts`).
   - `requireRole(['ADMIN', 'MANAGER'])` applied to POST/PUT on `/api/employees`, `/api/tasks`, `/api/initiatives`, `/api/epics`, `/api/sprints`.

5. **Supabase PostgreSQL & Drizzle Schema v2**:
   - Live **Supabase Transaction Pooler (port 6543)** database connection.
   - **Atomic Sequence Generation**:
     - Employees: `EHM-EMP01`
     - Initiatives: `CAG-INIT-001`
     - Epics: `CAG-EPIC-001`
     - Sprints: `EHM-EMP01-SPR-01`
     - Tasks: `EHM-EMP01-001`

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
- **Monorepo Build Command**: `pnpm build` ➔ **PASSED (0 Errors across all 5 workspace projects)**
- **Full Codebase Bundle**: [`FULL_CODEBASE_UNABRIDGED.md`](file:///c:/hrdashboard/FULL_CODEBASE_UNABRIDGED.md)
