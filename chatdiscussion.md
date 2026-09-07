# HROS (Human Resource Operating System) — Complete Chat & System Architecture Reference

> **File:** `chatdiscussion.md`  
> **Repository:** EHM-Climagro OS (`c:\hrdashboard`)  
> **Last Updated:** September 3, 2026  

---

## 1. Executive Summary & Overview

**EHM-Climagro OS** (HROS) is an enterprise-grade HR, Attendance, Operations, Sprint Deliverable, Agile Milestone, and Meeting Management platform designed for cross-entity collaboration between **ehmconsultancy** and **climagroanalytics**.

This document serves as a comprehensive reference of all user requests, architectural decisions, technical fixes, database schema updates, API integrations, and UI enhancements implemented during this development trajectory.

---

## 2. Full Chronological History of User Requests & Solutions

### Phase 1: Frontend-to-Backend Connection & Core Wiring
* **User Directive**: Connect the disconnected frontend mock arrays to the real Node.js/Express API server.
* **Fixes Applied**:
  - `AuthContext.tsx`: Replaced mock `setTimeout` login with real `POST /api/auth/login` via `@workspace/api-client-react`. Restored JWT session from `localStorage.getItem('hros_token')`.
  - `LoginView.tsx`: Integrated real authentication flow with error toast alerts.
  - Connected `EmployeeDashboardView`, `TasksView`, `MeetingsView`, `AnnouncementsView`, `AttendanceView`, and `TeamDirectoryView` to live Express API endpoints.

---

### Phase 2: Supabase PostgreSQL Schema & Enum Fixes
* **Issue Reported**: Toast error `column "status" of relation "meetings" does not exist` when creating meetings or running Google Calendar sync.
* **Root Cause**: Local Drizzle migration files (`0002_silky_onslaught.sql`, `0003_fair_sue_storm.sql`) were generated locally but had not been executed on the live Supabase database.
* **Solution**:
  - Created `lib/db/src/apply-db-schema.ts` DDL execution script.
  - Applied the following PostgreSQL DDL schema updates directly to Supabase:
    - Added `DELAYED` and `BLOCKED` values to `task_status` enum.
    - Created `meeting_status` enum (`SCHEDULED`, `CANCELLED`).
    - Added `GOOGLE_CALENDAR_IMPORTED` value to `meeting_source` enum.
    - Added `status` column to `meetings` table (`DEFAULT 'SCHEDULED' NOT NULL`).
  - Added robust environment variable fallback paths in `lib/db/src/index.ts` to ensure database connections succeed regardless of package execution directory.

---

### Phase 3: Real Two-Way Google Calendar Sync & Google Meet Integration
* **Issues Reported**:
  1. Google Calendar sync was returning 0 imported events.
  2. Clicking "Join Google Meet" opened `https://meet.google.com/hros-1234` which gave Google Meet error: `"Invalid video call name."`.
  3. Events created on Google Calendar secondary calendars (e.g. `ehm testing`) were not appearing in HROS.
  4. Timezone offset mismatch when creating meetings.
* **Root Causes & Solutions**:
  - **OAuth Requirement**: Without a connected Google OAuth token in `google_tokens` table, mock links were generated. Added validation in `routes/meetings.ts` requiring connected Google OAuth before meeting creation.
  - **Real Meet Links**: Integrated Google Calendar REST API (`POST /v3/calendars/primary/events?conferenceDataVersion=1`) to automatically generate working Google Meet video room codes (e.g. `https://meet.google.com/abc-defg-hij`).
  - **Timezone Support**: Added `userTimeZone` resolution (`Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'`) to `start` and `end` event objects in Google Calendar API payloads.
  - **Multi-Calendar Sync**: Updated `services/calendar-sync.ts` to query `users/me/calendarList` API first, discovering **ALL primary and secondary calendars owned by the user**, importing events across all calendars.
  - **Expanded Sync Window**: Expanded sync window from 30 days past to 60 days future (`timeMin` / `timeMax`).

---

### Phase 4: Meetings Feed UX & Filtering Improvements
* **User Directives**:
  1. Add top filter toolbar for Today's, Tomorrow's, Past 7 Days, and Recurring meetings.
  2. Prevent automatic sync toasts from popping up on page load/navigation.
  3. Don't show repeating series cards cluttering "All Meetings".
* **Solutions Implemented**:
  - **UX Loading Feedback**: Added `isSyncing` and `isConnecting` state handlers with spinning icons (`<RefreshCw className="animate-spin" />`) and disabled button states to prevent double-clicking.
  - **Silent Auto-Fetch**: Removed `handleSync()` toast trigger from `useEffect` mount. Page opens run silent background sync without popping up UI toasts.
  - **5 Meeting Filter Rules**:
    1. **All Meetings (`ALL`)**: Shows all distinct single meetings, but **deduplicates repeating series meetings** (showing 1 representative card per title).
    2. **Today's Meetings (`TODAY`)**: Shows all meetings starting today (`YYYY-MM-DD`).
    3. **Tomorrow's Meetings (`TOMORROW`)**: Shows all meetings starting tomorrow.
    4. **Past 7 Days (`PAST`)**: Shows meetings that ended in the last 7 days.
    5. **Recurring / Series (`RECURRING`)**: Shows all occurrences of repeating series meetings (like all instances of "Company Call").

---

### Phase 5: Employee Invitations & Setup Link System
* **User Directive**: Ensure an invitation email goes to new employees with the dashboard setup URL upon addition.
* **Solutions Implemented**:
  - `routes/employees.ts`: `POST /api/employees` returns `{ employee, inviteToken, inviteLink: ${appUrl}/accept-invite?token=${inviteToken} }`.
  - `TeamDirectoryView.tsx`: Displays an **Invitation Link Modal** upon employee creation featuring a **"Copy Link"** button for sharing via WhatsApp, Slack, or Email.
  - `services/email.ts`: Dispatches Resend onboarding email (`from: 'HROS <onboarding@resend.dev>'`) and logs the full invitation URL in bold green server logs.

---

### Phase 6: Vector SVG Male & Female Avatar System
* **User Directive**: Replace all external photo URLs (Unsplash) with clean vector SVG logo avatars for Male and Female.
* **Solution Implemented**:
  - Created `src/utils/avatars.ts` with Data URI SVG vector logo avatars (`MALE_AVATAR` and `FEMALE_AVATAR`).
  - Implemented `getAvatarByName(name)` helper to automatically map names to vector avatars.
  - Updated `TeamDirectoryView.tsx`, `OfficeTodayView.tsx`, `TeamTasksView.tsx`, `Navbar.tsx`, `ProfileModal.tsx`, and `ScheduleWidget.tsx`.

---

### Phase 7: Full Agile Hierarchy & Product Backlog System
* **User Directives & Requirements**:
  1. **Strategic Initiatives Form & View (`InitiativesSubView.tsx`)**:
     - Form fields: Title, Brand/Entity (`ehmconsultancy`, `climagroanalytics`), Department (`Marketing`, `Sales`, `Product & Tech`, `Operations & Delivery`, `Grants & Governance`), Sub-Department/Track, Target Deliverable Metric, Target Month (`Month 1`, `Month 2`, `Month 3`), Epics division count (`1` to `8`).
     - Default View: Closed/collapsed by default (`expandedId = null`).
     - Status confirmation popup dialog before updating status (`PLANNED`, `IN_PROGRESS` ➔ `ACTIVE`, `DONE` ➔ `DONE`).
     - **Archive Mode & Auto-Archiving**: Marking an initiative as `DONE` automatically moves it to **Archive Mode** (`Archive (N)` toggle button).
     - **Explicit Brand / Entity Badge**: Displays `🏢 climagroanalytics` / `🏢 ehmconsultancy` badge on each initiative card.
     - **Dynamic Adaptive Epics Sizing**: 1-6 epics scale adaptively across 1 row (`grid-cols-1` to `grid-cols-6`), 7+ epics wrap to row 2.

  2. **Feature Epics Form & View (`EpicsSubView.tsx`)**:
     - Parent Initiative dropdown sorted alphabetically (`[CAG-INIT-001] Title`).
     - Form fields: Parent Initiative, Epic Title, Department, Target Week, Description, Target Sprints Count.
     - Compact Card Layout & Ordering:
       - Top Bar: Parent Initiative Badge `⚡ [CAG-INIT-001] Make a full application for cityadapt.ai` on left, Status Badge (`PLANNED`, `IN_PROGRESS`, `DONE`), Eye Button (`👁️`), and Edit Button (`✏️`) on top right.
       - Second Line: Epic Code Badge `CAG-EPIC-001` and Epic Title `Frontend`.
       - Third Line: Department (`Product & Tech`) and Target Week (`Week 1 (Days 1–7)`).
     - **Hanging TASKS Clothesline UI**: Animated hanging clothespin stringer displaying assigned **Hanging TASKS** (`[CAG-EPIC-001-TSK-01] Initial Setup`).
     - **Middle Pop Card Details Modal**: Clicking Eye button (`👁️`) opens a centered middle pop card displaying all epic details, linked tasks, and an embedded **`✏️ Edit Epic`** button.
     - **Scalable Toolbar for 50+ Epics**: Real-time Search Bar, Status Filter Pills (`All`, `Planned`, `In Progress`, `Done`), and `Cards` vs `Compact Table` view switcher.

  3. **Standalone Sprints Page (`SprintsView.tsx` & `SprintsSubView.tsx`)**:
     - Main left Sidebar under **WORK**: Renamed **Tasks** ➔ **`Product Backlog`** (`/tasks`), added standalone **`Sprints`** (`/sprints`).
     - Parent Epic dropdown sorted alphabetically (`[CAG-EPIC-001] Title`).
     - Form fields: Parent Epic, Sprint Title, Target Week, Department, Assigned To employee, Reviewing Lead, Description / Goal.

  4. **Product Backlog Tasks (`TasksView.tsx` & `TaskAssignModal.tsx`)**:
     - Product Backlog top segmented tab switcher contains 3 tabs: `🎯 Initiatives`, `⚡ Epics`, and `📋 Tasks` (Sprints tab removed from `/tasks`).
     - Parent Sprint dropdown sorted alphabetically (`[CAG-SPR-001] Name`).
     - Form fields: Parent Sprint, Task Title, Department, Assigned To employee, Target Date, Description, Reviewing Lead.

---

## 3. Database Schema Overview (`@workspace/db`)

| Table Name | Description | Key Enums & Columns |
| :--- | :--- | :--- |
| `users` | User credentials & session tokens | `role` (`ADMIN`, `MANAGER`, `EMPLOYEE`), `employeeId` |
| `employees` | Employee roster & details | `employeeCode` (`EHM-EMP01`), `entityId`, `departmentId`, `designation` |
| `initiatives` | Level 1 Strategic Initiatives | `initiativeCode` (`CAG-INIT-001`), `entityId`, `departmentId`, `subDepartment`, `targetMonth`, `epicsCountTarget`, `targetDeliverableMetric`, `status` (`PLANNED`, `ACTIVE`, `DONE`) |
| `epics` | Level 2 Feature Epics | `epicCode` (`CAG-EPIC-001`), `initiativeId`, `department`, `targetWeek`, `sprintsCountTarget`, `status` |
| `sprints` | Level 3 Agile Sprints | `sprintCode` (`EHM-EMP01-SPR-01`), `epicId`, `reviewingLeadId`, `department`, `targetWeek` |
| `tasks` | Level 4 Backlog Tasks | `taskCode` (`EHM-EMP01-001`), `sprintId`, `reviewingLeadId`, `department`, `status` (`TODO`, `IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`, `DELAYED`, `BLOCKED`) |
| `entity_counters` | Atomic sequence counters | `entityId`, `nextInitiativeSeq`, `nextEpicSeq` |
| `meetings` | Scheduled & imported meetings | `status` (`SCHEDULED`, `CANCELLED`), `source` (`GOOGLE_CALENDAR`, `GOOGLE_CALENDAR_IMPORTED`), `googleMeetUrl`, `googleEventId` |
| `google_tokens` | User Google OAuth 2.0 tokens | `accessToken`, `refreshToken`, `expiresAt` |
| `invites` | Pending account setup invites | `token`, `role`, `status` (`PENDING`, `ACCEPTED`), `expiresAt` |

---

## 4. Environment Configuration (`artifacts/api-server/.env`)

```env
# Supabase PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres.qlnghemivzcyazvtndhv:Hrdash%40123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# Server Configuration
PORT=5000
APP_URL="http://localhost:5173"

# JWT & Security Secrets
JWT_SECRET="hros_jwt_super_secret_key_2026"
TOKEN_ENCRYPTION_KEY="hros_token_encryption_secret_key_32bytes!"

# Third-Party Integrations
RESEND_API_KEY="re_123456789_your_resend_key"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
```

---

## 5. Verification & Monorepo Build Command

To verify complete TypeScript & Vite compilation across all workspace packages:

```bash
pnpm build
```

**Result:** `PASSED (0 errors across all 5 workspace projects)`.
