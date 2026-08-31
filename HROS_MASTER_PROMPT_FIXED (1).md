# 🚀 HROS - Complete AI Master Build Prompt & Architecture Specification

Use this complete prompt specification in any AI coding environment (like Antigravity, Claude, or ChatGPT) to build this exact **Human Resource Operating System (HROS)** application from scratch.

---

## 📋 System Master Prompt (Copy & Paste to AI)

```text
You are an expert full-stack principal architect and senior UI engineer. Build a complete, enterprise-grade, state-of-the-art Human Resource Operating System (HROS) monorepo web application.

### 🏛️ Architecture & Tech Stack Requirements
1. Monorepo Setup:
   - Tooling: pnpm workspaces
   - Backend Artifact: Express.js (v5) TypeScript REST API (`@workspace/api-server`)
   - Frontend Artifact: React 19 + Vite (`@workspace/hr-dashboard`)
   - Database Package: Drizzle ORM + PostgreSQL (`@workspace/db`)
   - Shared Schema & Client: Zod schemas (`@workspace/api-zod`) + React Query hooks (`@workspace/api-client-react`)

2. Frontend Stack & Styling:
   - Framework: React 19 with Vite 7
   - Routing: Wouter (`wouter`) lightweight router
   - Styling: Tailwind CSS v4 + Vanilla CSS custom variables for glassmorphism
   - UI Components: Radix UI primitives, Lucide React icons, Sonner toast notifications
   - Analytics & Charts: Recharts for attendance trends & department metrics
   - State & Data Fetching: TanStack React Query (`@tanstack/react-query`)

3. Backend & Security:
   - API Framework: Express.js with JSON body parser & cookie-parser
   - Database & ORM: PostgreSQL with Drizzle ORM schema declaration & migrations
   - Authentication: JWT tokens (Access + Refresh tokens) stored securely, password hashing with bcryptjs
   - Logging: Pino & Pino-HTTP structured logging
   - Third-party OAuth tokens (e.g. Google Calendar access/refresh tokens): store encrypted in the `google_tokens` table, never in a flat file (`.json`) on disk — required for multi-user support and safe production deployment
   - Secrets (`GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`, etc.): loaded only from environment variables / `.env` (excluded via `.gitignore`), never hardcoded in source
   - Transactional Email: Resend (or Nodemailer + SMTP as fallback) for sending employee invite links, using `RESEND_API_KEY` from environment variables

---

### 🗄️ Database Schemas & Data Entities

Implement the following database models in Drizzle ORM:

1. `users`:
   - `id`: UUID (Primary Key)
   - `email`: string (unique)
   - `password_hash`: string
   - `role`: enum ('ADMIN', 'HR_MANAGER', 'EMPLOYEE')
   - `employee_id`: UUID (nullable foreign key to `employees`)
   - `created_at`, `updated_at`

2. `employees`:
   - `id`: UUID (Primary Key)
   - `first_name`, `last_name`: string
   - `email`: string (unique)
   - `department`: string ('Engineering', 'HR', 'Sales', 'Marketing', 'Operations', 'Finance')
   - `designation`: string
   - `salary`: decimal
   - `joining_date`: timestamp
   - `status`: enum ('ACTIVE', 'ON_LEAVE', 'TERMINATED')
   - `avatar_url`: string (optional)

3. `attendance`:
   - `id`: UUID (Primary Key)
   - `employee_id`: UUID (foreign key)
   - `date`: date
   - `clock_in`: timestamp
   - `clock_out`: timestamp (nullable)
   - `work_mode`: enum ('IN_OFFICE', 'REMOTE', 'HYBRID')
   - `status`: enum ('PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE')
   - `total_hours`: decimal

4. `meetings`:
   - `id`: UUID (Primary Key)
   - `title`: string
   - `description`: text
   - `start_time`, `end_time`: timestamp
   - `location`: string (physical room or 'Google Meet')
   - `google_meet_url`: string (nullable)
   - `organizer_id`: UUID (foreign key)
   - `invitees`: jsonb array of employee IDs
   - `google_event_id`: string (nullable, unique — used to upsert/dedupe synced Google Calendar events)
   - `source`: enum ('INTERNAL', 'GOOGLE_CALENDAR') default 'INTERNAL'

9. `invites`:
   - `id`: UUID (Primary Key)
   - `email`: string
   - `token`: string (unique, cryptographically random, used in the invite link)
   - `role`: enum ('ADMIN', 'HR_MANAGER', 'EMPLOYEE')
   - `employee_id`: UUID (foreign key to `employees`, the pre-created employee record this invite activates)
   - `status`: enum ('PENDING', 'ACCEPTED', 'EXPIRED')
   - `expires_at`: timestamp (e.g. 7 days from creation)
   - `created_at`: timestamp
   - Note: `users.status` should also gain a `PENDING` value alongside `ACTIVE`/`INACTIVE`, so a user row can exist (created by the admin) before the employee has accepted their invite and set up authentication.

10. `google_tokens`:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (foreign key to `users`, unique)
   - `access_token`: string (encrypted at rest)
   - `refresh_token`: string (encrypted at rest)
   - `expiry`: timestamp
   - `created_at`, `updated_at`
   - Note: replaces the flat-file `google-tokens.json` approach — OAuth tokens must live in the database, encrypted, never in a plaintext file, so the app works with multiple users and survives redeploys.

5. `tasks`:
   - `id`: UUID (Primary Key)
   - `title`: string
   - `description`: text
   - `priority`: enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
   - `status`: enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
   - `assignee_id`: UUID (foreign key)
   - `creator_id`: UUID (foreign key)
   - `due_date`: timestamp

6. `announcements`:
   - `id`: UUID (Primary Key)
   - `title`: string
   - `content`: text
   - `priority`: enum ('NORMAL', 'IMPORTANT', 'URGENT')
   - `is_pinned`: boolean
   - `target_department`: string ('ALL' or specific department)
   - `created_at`: timestamp

7. `applications`:
   - `id`: UUID (Primary Key)
   - `employee_id`: UUID (foreign key)
   - `type`: enum ('LEAVE', 'REMOTE_WORK', 'REIMBURSEMENT', 'EQUIPMENT')
   - `reason`: text
   - `status`: enum ('PENDING', 'APPROVED', 'REJECTED')
   - `start_date`, `end_date`: timestamp (nullable)
   - `reviewed_by`: UUID (nullable foreign key)

8. `audit_logs`:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID
   - `action`: string
   - `details`: jsonb
   - `created_at`: timestamp

---

### 🔗 Employee Invite & Google Calendar Auto-Link Flow

Implement this end-to-end flow so that adding an employee results in them receiving a dashboard link by email, and signing in with that same Google account automatically links their personal Google Calendar/Meet:

1. **Admin adds employee** (`POST /api/employees`):
   - Creates a row in `employees`.
   - Creates a matching row in `users` with `status: 'PENDING'` and no `password_hash` yet.
   - Creates a row in `invites` with a random token, `status: 'PENDING'`, `expires_at` = now + 7 days.
   - Sends an email (via the Transactional Email service) to the employee containing a link:
     `https://yourapp.com/accept-invite?token={token}`

2. **Employee opens the invite link** (`GET /accept-invite?token=...` on the frontend):
   - Frontend calls `GET /api/invites/:token` to validate the token (checks it exists, isn't expired, isn't already accepted).
   - If valid, shows two options: "Set a password" or **"Continue with Google"**.

3. **Employee chooses "Continue with Google"**:
   - Frontend redirects to `GET /api/auth/google?inviteToken={token}`.
   - Server stores the invite token in the OAuth `state` parameter so it survives the redirect round-trip.
   - Google shows its consent screen requesting Calendar access (same scopes as the existing Calendar integration).

4. **Google redirects back** (`GET /api/auth/google/callback?code=...&state={inviteToken}`):
   - Server exchanges `code` for `access_token` + `refresh_token`.
   - Server re-validates the invite token from `state`, and confirms the email Google returned matches the invited employee's email (prevents someone accepting another person's invite).
   - Server activates the account: sets `users.status = 'ACTIVE'`, links `users.employee_id`.
   - Server saves the tokens into `google_tokens`, keyed to this specific `user_id`.
   - Server marks the `invites` row as `status: 'ACCEPTED'`.
   - Server issues the JWT access + refresh tokens and redirects to `/dashboard?welcome=true`.

5. **Result**: From this point on, `/api/meetings/sync` for this user reads their own row in `google_tokens`, so their personal Google Calendar and Google Meet links stay synced — independent of any other employee's calendar.

**Edge cases to handle**:
- Invite token expired → show a "Request a new invite" screen, admin can trigger `POST /api/invites/:id/resend`.
- Employee's Google account email doesn't match the invited email → reject with a clear error, don't activate the account.
- Employee already has an account → invite link should just redirect to normal login.

---

### 🎨 Key Frontend Pages & Core Features

1. Overview Dashboard (`/`):
   - Executive summary cards: Total Employees, Attendance Rate %, Pending Tasks, Today's Meetings, Active Announcements.
   - Interactive Recharts line chart showing weekly attendance trends.
   - Donut chart displaying employee distribution across departments.
   - Quick-action panel (Clock-in, Schedule Meeting, New Task).

2. Attendance Management (`/attendance`):
   - 1-Click Clock-In / Clock-Out modal with Work Mode selector (In-Office, Remote, Hybrid).
   - Real-time work hour counter.
   - Filterable attendance history log table with status badges (Present, Late, Absent, On-Leave).

3. "Office Today" Presence (`/office-today`):
   - Live visual grid of employees present in-office vs remote vs absent today.
   - Search bar and department filter tags.

4. Team Directory (`/team`):
   - Employee roster grid and table views with detailed metadata.
   - Add/Edit employee modal forms with validation.

5. Meeting Scheduler (`/meetings`):
   - Upcoming & past meeting list with avatar stacks for invitees.
   - Integration with Google Meet link auto-generation (`meet.google.com/...`).
   - Time-slot validation to prevent double-booking.

6. Task Manager (`/tasks`):
   - Kanban board / list view grouped by status (Pending, In Progress, Completed).
   - Priority indicators (Urgent red, High orange, Medium blue, Low grey).

7. Salary & Payroll (`/salary`):
   - Employee compensation list with base salary, allowances, deductions, and net pay calculations.

8. Leave & Applications (`/applications`):
   - Application submit form for employees (Leave, Remote Work, Reimbursement).
   - Manager approval workflow buttons (Approve / Reject) with status updates.

9. Company Bulletin (`/announcements`):
   - Post news feed with Pinned notices at the top and urgency badges.

10. Accept Invite (`/accept-invite`):
    - Reads the `token` query param, validates it against `GET /api/invites/:token`.
    - Shows the employee's name/email (read-only) and two setup options: "Set a password" (standard form) or "Continue with Google" (redirects into the OAuth flow described above, which also links their Calendar).
    - Handles expired/invalid token states with a clear message and a "Request new invite" action (visible to the employee, which pings their admin, or a direct resend if they have access).

---

### 💅 UI/UX Design System Guidelines
- Design Aesthetic: Premium dark mode with subtle glassmorphic backdrop filters (`backdrop-filter: blur(12px)`), neon emerald (`#10B981`) and electric violet (`#6366F1`) accents.
- Responsive Layout: Sidebar navigation with collapsible mobile support.
- Micro-animations: Smooth Framer Motion transitions for card entrances, modals, and tab switches.
- Zero Placeholders: Include mock seed data. Auto-seed a dev-only admin account using values from environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) with safe fallback defaults (e.g. `admin@example.com` / a randomly generated password printed once to the server console on first run) — never hardcode a real email or password in source code, prompts, or seed scripts.
```

---

## 📁 Monorepo File Structure Reference

```text
hros/
├── artifacts/
│   ├── api-server/         # Express backend (Controllers, Routes, Auth)
│   │   ├── src/
│   │   │   ├── routes/     # attendance.ts, tasks.ts, meetings.ts, etc.
│   │   │   ├── index.ts
│   │   │   └── build.mjs
│   │   └── package.json
│   ├── hr-dashboard/       # Vite + React 19 Frontend
│   │   ├── src/
│   │   │   ├── pages/      # dashboard.tsx, attendance.tsx, meetings.tsx, etc.
│   │   │   ├── components/ # layout, ui components
│   │   │   ├── contexts/   # auth-context.tsx
│   │   │   └── App.tsx
│   │   └── package.json
├── lib/
│   ├── db/                 # Drizzle ORM Schemas & Migration Config
│   │   └── src/schema/     # users.ts, employees.ts, attendance.ts, etc.
│   ├── api-zod/            # Zod Validation schemas
│   └── api-client-react/   # Autogenerated API React hooks
├── pnpm-workspace.yaml     # Monorepo configuration
├── package.json
└── README.md
```
