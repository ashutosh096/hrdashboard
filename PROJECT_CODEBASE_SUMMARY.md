# EHM-Climagro OS — Full Project Codebase & Technical Specification

> **Platform Name**: EHM-Climagro OS (HR, Operations & Deliverables Management System)  
> **Entities Supported**: `ehmconsultancy` and `climagroanalytics`  
> **Target Audience**: Management Team, Team Leads, Employees  

---

## 📋 Executive Overview

**EHM-Climagro OS** is an enterprise-grade HR, Attendance, Operations, and Sprint Deliverable Management platform designed for cross-entity team collaboration between **ehmconsultancy** and **climagroanalytics**.

### Key System Capabilities:
1. **Role-Based Access Control (RBAC)**:
   - **Manager / Admin Portal**: Full oversight, task assignment (Individual & Partner Team tasks), employee management, delay warnings, and submission reviews.
   - **Employee Portal**: Dedicated dashboard with assigned deliverables, Google Meet links, locked daily attendance marking, and task progress updates.
2. **Attendance & Presence Tracking**:
   - Single-employee monthly presence table (`August 2026`).
   - Stat cards: **PRESENT** (`22`), **ABSENT** (`0`), **HALF DAY** (`0`), **LEAVE** (`0`).
   - Mark Attendance Modal with **Half Day Shift Slots** (*First Half Morning* vs *Second Half Afternoon*) and **Locked Submission Confirmation** (*Are you sure to submit? Once submitted, attendance is locked for today*).
   - Real-time synchronization with **Office Today** live presence grid.
3. **Task & Deliverable Management**:
   - Kanban board with Auto Task IDs (`EHM-MAR-ADH-672`, `CAG-DEV-SPR-101`).
   - Strict employee-level task scoping (employees only see tasks assigned to them).
   - **Send Delay Alert 🚨** action for managers with top warning banner on employee dashboard.
   - **Submission Review Modal** for managers to inspect exact Canva / Drive links & daily standup notes filled by employees.
4. **Team & Partner Tasks (`/team-tasks`)**:
   - Multi-select partner team dropdown (`Priya Sharma + Rahul Verma`).
   - Displays joint partner avatars, reviewing lead, and partner standup notes.
5. **Applications Management**:
   - Track job/work applications with Reviewing Lead assignments.
   - Employee form pre-locked to logged-in user (`Priya Sharma`).
   - Status updates (`Done ✅`, `In Progress 🔄`, `Pending ⏳`, `Delayed ⚠️`) with mandatory **Reason for Pending/Delay** input fields.
6. **Notification System & Security**:
   - Red unread count badge on header bell icon (`3`).
   - Live dropdown popup for realtime alerts, task submissions, and meeting notices.
   - **Strict DB Authentication**: User lookup via PostgreSQL `users` table with `bcrypt.compare()` hash verification (all demo fallback logins removed).
   - **Zero TypeScript Errors**: 100% verified with `tsc --noEmit`.

---

## 🔑 Database Authentication Credentials

| Role | User Account | Auth Security | Access Rights |
| :--- | :--- | :--- | :--- |
| **Manager / Admin** | `admin@ehm-climagro.com` | bcrypt hash check via DB `users` table | Full workspace access, Add Employee, Assign Task, Delay Alerts, Submission Reviews, Export Reports |
| **Employee** | `employee@ehm-climagro.com` | bcrypt hash check via DB `users` table | Employee Portal Dashboard, My Deliverables, Locked Daily Attendance, My Applications, Team Tasks |

---

## 🛠️ Complete Technology Stack

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript** | UI Component Architecture (0 TS errors) |
| **Build Tool & Server** | **Vite 6** | Fast HMR dev server & asset bundling |
| **Styling & Theme** | **Tailwind CSS v4** | Utility-first styling & custom HSL color tokens |
| **Iconography** | **Lucide React** | Modern vector icon library |
| **Routing** | **Wouter** | Lightweight hooks-based SPA router |
| **State & Data** | **TanStack React Query (v5)** + **React Context API** | Caching, server-state sync & global auth/entity state |
| **Toast Alerts** | **Sonner** | Interactive notification popups |
| **Backend API** | **Node.js** + **Express.js v5** | RESTful API server running on port `5000` |
| **Database & ORM** | **PostgreSQL** + **Drizzle ORM** | Type-safe SQL schema & relational data management |
| **Authentication** | **JWT (JSON Web Tokens)** + **BcryptJS** | Real DB User Authentication & encrypted tokens |
| **Email Dispatch** | **Resend API** | Automated onboarding & invite emails |

---

## 📁 Project Directory Structure

```
c:\hrdashboard\artifacts\hr-dashboard\
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx               # Primary navigation bar with EHM-Climagro OS branding
│   │   ├── Navbar.tsx                # Header capsule with red notification badge & profile modal
│   │   ├── EmployeeDashboardView.tsx # Employee Portal dashboard with top delay warning banner
│   │   ├── MarkAttendanceModal.tsx   # Daily attendance marking with locked confirmation
│   │   ├── TaskAssignModal.tsx       # Task assignment with Individual vs Partner Multi-Select
│   │   ├── TaskUpdateModal.tsx       # Task status & deliverable URL update modal
│   │   └── ProfileModal.tsx          # User profile popup with Logout option
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Authentication state (Manager vs Employee roles)
│   │   └── EntityContext.tsx         # Cross-entity state (ehmconsultancy & climagroanalytics)
│   ├── pages/
│   │   ├── DashboardView.tsx         # Main router view (renders Employee/Manager dashboard)
│   │   ├── TasksView.tsx             # Kanban task board with scoping and delay alert triggers
│   │   ├── TeamTasksView.tsx         # Joint partner deliverables page with partner avatars
│   │   ├── AttendanceView.tsx        # Employee Attendance with 4 Stat Cards
│   │   ├── OfficeTodayView.tsx       # Real-time office presence grid & meeting schedules
│   │   ├── TeamDirectoryView.tsx     # Employee roster (Add Employee hidden for Employees)
│   │   ├── ApplicationsView.tsx      # Applications tracking with pending/delay reason inputs
│   │   ├── AnnouncementsView.tsx     # Company-wide announcements feed for all staff
│   │   └── LoginView.tsx             # Dark cybernetic wave glassmorphism login screen
│   ├── App.tsx                       # Main application router and layout wrapper
│   └── main.tsx                      # Vite React entrypoint
```

---

## ⚙️ Core Application Source Code

### 1. `c:\hrdashboard\artifacts\api-server\src\routes\auth.ts` (DB Auth with Bcrypt)
```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users, eq } from '@workspace/db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hros_jwt_super_secret_key_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
      managedTeamId: user.managedTeamId || undefined,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: userPayload });
  } catch (err) {
    console.error('[AUTH ROUTE ERROR] Login failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
```

---

## 🚀 Verification & Build Status

- **`artifacts/api-server`**: `npx tsc --noEmit` ➔ **PASSED (0 Errors)**
- **`artifacts/hr-dashboard`**: `npx tsc --noEmit` ➔ **PASSED (0 Errors)**
- **Full Codebase Bundle**: [`FULL_CODEBASE_UNABRIDGED.md`](file:///c:/hrdashboard/FULL_CODEBASE_UNABRIDGED.md) (108/108 files verified)
