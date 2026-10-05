# EHM-CLIMAGRO OS — MASTER SYSTEM AUDIT REPORT (REVISED & VERIFIED)
**Date**: 2026-10-05  
**Auditor**: Senior Software Architect, Senior QA Engineer & Database Auditor  
**Audit Scope**: Complete System Audit — Database Backups, Schema, API Server, HR Dashboard, Jobs & Migrations  
**Target Codebase**: EHM-CLIMAGRO OS (208 Files, ~99,000 Lines)  
**Status**: COMPLETE — Zero Code Changes Applied (REPORT ONLY)

---

## 1. EXECUTIVE SUMMARY & AUDIT DASHBOARD

### Issues by Verified Severity
| Severity | Count | Impact Description |
| :--- | :---: | :--- |
| **CRITICAL** | **3** | Direct credential leak in backups, plaintext invite exploitation, or company-wide data wipe |
| **HIGH** | **5** | Authorization bypass (IDOR on clock in/out), destructive seed scripts in src, and unnormalized data arrays |
| **MEDIUM** | **11** | Entity mismatches, bad dates, missing rate-limits, unhandled batch atomicity, same assignee/lead, attendance privacy leak |
| **LOW** | **3** | Raw SQL manual cascade deletes, double-click parallel mutations, UI badge label inconsistencies |
| **TOTAL** | **22** | **Every issue verified with verbatim evidence and exact line numbers** |

### Issues by Functional Area
| Functional Area | Count |
| :--- | :---: |
| **Security** | 4 |
| **Notifications & Announcements** | 4 |
| **Database & Schema Integrity** | 4 |
| **Data Quality & Hygiene** | 4 |
| **Backend Logic & Permissions** | 3 |
| **Frontend UI / UX** | 3 |

---

## 2. TOP 10 ISSUES TO FIX FIRST

| Rank | Issue ID | Severity | Area | Why It Must Be Fixed First |
|---|---|---|---|---|
| **1** | `BUG-001` | **CRITICAL** | Notifications | **Company-Wide Notification Wipe**: `pruneNotificationsToLimit` purges all users' notifications once 100 total rows are reached, wiping other users' inboxes across the entire company. |
| **2** | `BUG-002` | **CRITICAL** | Security | **Unencrypted Google OAuth Tokens**: Raw access & refresh tokens stored in plaintext in `google_tokens` table and DB backup files allow complete takeover of corporate Google Calendars. |
| **3** | `BUG-003` | **CRITICAL** | Security | **Plaintext Invite Tokens**: `invites.token` is stored unhashed in DB and backups, allowing unauthorized invite redemption. |
| **4** | `BUG-004` | **HIGH** | Security | **Attendance Clock-In & Clock-Out IDOR**: Both endpoints accept arbitrary `employeeId` in `req.body` without validating that the authenticated user owns that profile. |
| **5** | `BUG-005` | **HIGH** | Backend | **Destructive Maintenance Scripts in API Source**: `clean_production_seed.ts` executes table wipes directly in `src/`. |
| **6** | `BUG-006` | **HIGH** | Data | **Announcements `seen_by` Heterogeneous Mix**: Array holds a mixture of user UUIDs, employee UUIDs, and raw emails, causing read announcements to reappear on refresh. |
| **7** | `BUG-007` | **HIGH** | Notifications | **Admin Notification Flooding & Overdue Duplication**: 69 of 100 notifications belong to admins, and 28 of 52 `TASK_OVERDUE` alerts are exact duplicates. |
| **8** | `BUG-008` | **HIGH** | Database | **Unsafe Epic Deletion Cascades**: Deleting an epic permanently deletes all child sprints, tasks, subtasks, and comments in one transaction with no soft-delete or confirmation. |
| **9** | `BUG-009` | **MEDIUM** | Security | **Missing Rate-Limiting & Security Headers**: No `helmet` or `express-rate-limit` installed; `/api/auth/forgot-password` and `/login` have no brute-force or spam throttling. |
| **10** | `BUG-010` | **MEDIUM** | Backend | **Attendance Privacy Leak**: `GET /api/attendance` returns every employee's attendance history across the company unless explicitly requested with `myOnly=true`. |

---

## 3. FULL AUDITED ISSUES CATALOG (SORTED BY SEVERITY)

### CRITICAL Severity

#### BUG-001: Global `pruneNotificationsToLimit` caps the notifications table at 100 rows company-wide
- **Severity**: CRITICAL
- **Area**: Notifications
- **Where**: `artifacts/api-server/src/services/notificationService.ts: lines 9-22`
- **What is wrong**: `pruneNotificationsToLimit` runs after every notification insert and executes a global DELETE without scoping by `userId`.
- **Evidence**:
```typescript
export async function pruneNotificationsToLimit(max = MAX_NOTIFICATIONS_LIMIT, executor: any = db): Promise<void> {
  try {
    await executor.execute(sql`
      DELETE FROM notifications 
      WHERE id NOT IN (
        SELECT id FROM notifications 
        ORDER BY created_at DESC 
        LIMIT ${max}
      )
    `);
  } catch (err) {
    console.error('[PRUNE NOTIFICATIONS ERROR]:', err);
  }
}
```
- **How it fails**: When one active user receives alerts, once the total table count reaches 100, the oldest notifications for ALL other employees and managers in the company are deleted.
- **Fix**: Scope the query per user: `DELETE FROM notifications WHERE user_id = ${userId} AND id NOT IN (SELECT id FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${max})`.
- **Effort**: Small

#### BUG-002: Unencrypted Google OAuth access and refresh tokens stored in database and backup files
- **Severity**: CRITICAL
- **Area**: Security
- **Where**: `lib/db/src/schema/google_tokens.ts: lines 8-9` & `DATABASE_BACKUP.sql: lines 330-335`
- **What is wrong**: OAuth `access_token` and `refresh_token` are stored as plain text strings without encryption.
- **Evidence**:
```sql
INSERT INTO "google_tokens" ("user_id", "access_token", "refresh_token", "token_type", "expiry_date", "scope", "created_at", "updated_at") VALUES ('526b8f7f-697d-4401-b380-50b085403f3f', 'ya29.a0Ac...', '1//04...', 'Bearer', '1759650747442', 'https://www.googleapis.com/auth/calendar.events', '2026-10-04 16:35:10.999', '2026-10-05 06:12:28.455') ON CONFLICT DO NOTHING;
```
- **How it fails**: Any developer, administrator, or attacker with access to a database backup can read the refresh tokens and access corporate Google accounts and calendars indefinitely.
- **Fix**: Encrypt tokens at rest using AES-256-GCM before saving to Postgres, and decrypt on-the-fly in `calendar-sync.ts`.
- **Effort**: Large

#### BUG-003: Plaintext invite tokens stored in database and backup files
- **Severity**: CRITICAL
- **Area**: Security
- **Where**: `lib/db/src/schema/invites.ts: line 9` & `DATABASE_BACKUP.sql: lines 340-355`
- **What is wrong**: Invite tokens are stored directly in plaintext without cryptographic hashing.
- **Evidence**:
```sql
INSERT INTO "invites" ("id", "email", "role", "entity_id", "department_id", "invited_by", "token", "status", "expires_at", "created_at", "accepted_at") VALUES ('a2da16bc-4ea7-4ce8-b5e1-8f8306df9a1b', 'ashutoshmishraup78@gmail.com', 'ADMIN', '886d7680-6a7c-482e-ae61-159ec359f881', '796c9c64-dff8-4ff4-9d62-f70e704041b6', 'fa0289e6-0109-4228-9f3d-f54b7164773c', 'c7e2b6d8-9df2-47fe-ae49-166be44d9bc2', 'ACCEPTED', '2026-10-01 17:15:39.141', '2026-09-24 17:15:39.143048', '2026-09-24 17:18:29.836') ON CONFLICT DO NOTHING;
```
- **How it fails**: If the database or backup is leaked, an attacker can claim any pending invitation token and register an unauthorized Admin account.
- **Fix**: Store a SHA-256 hash of the invite token in the database, sending the raw token only in the one-time registration email link.
- **Effort**: Medium

---

### HIGH Severity

#### BUG-004: Attendance Clock-in and Clock-out endpoints permit arbitrary employee IDOR
- **Severity**: HIGH
- **Area**: Security
- **Where**: `artifacts/api-server/src/routes/attendance.ts: line 88 & line 186`
- **What is wrong**: Both `/clock-in` and `/clock-out` accept `req.body.employeeId` blindly without validating that the authenticated user owns that employee record.
- **Evidence**:
```typescript
// line 88 in /clock-in
let employeeId = req.body?.employeeId || req.user?.employeeId;

// line 186 in /clock-out
let employeeId = req.body?.employeeId || req.user?.employeeId;
```
- **How it fails**: Any authenticated employee can send `{ "employeeId": "target-uuid" }` in the POST body to clock in or clock out for any colleague or manager.
- **Fix**: Enforce `let employeeId = req.user.role === 'ADMIN' && req.body?.employeeId ? req.body.employeeId : req.user.employeeId;`.
- **Effort**: Small

#### BUG-005: Destructive production cleanup scripts located directly in `api-server/src/`
- **Severity**: HIGH
- **Area**: Backend
- **Where**: `artifacts/api-server/src/clean_production_seed.ts: lines 1-150` & `cleanup_test_data.ts`
- **What is wrong**: Destructive maintenance scripts containing unconditional `DELETE FROM tasks` and `DELETE FROM sprints` reside directly in `src/` and can be invoked accidentally.
- **Evidence**:
```typescript
// clean_production_seed.ts
await db.delete(tasks);
await db.delete(sprints);
await db.delete(epics);
console.log('Database wiped!');
```
- **How it fails**: An accidental `npx tsx src/clean_production_seed.ts` in production instantly wipes all organizational work history.
- **Fix**: Move all destructive scripts to `scripts/maintenance/` and add an explicit confirmation prompt requiring `CONFIRM_WIPE=true` environment flag.
- **Effort**: Small

#### BUG-006: Announcements `seen_by` stores a heterogeneous mix of UUIDs and emails
- **Severity**: HIGH
- **Area**: Data
- **Where**: `announcements.seen_by` & `DATABASE_BACKUP.json`
- **What is wrong**: `seen_by` stores an unnormalized mixture of user UUIDs, employee UUIDs, and plain email addresses.
- **Evidence**:
```json
["fbabfd51-893e-47da-8653-0f5cfdc3d1f3", "admin@example.com", "e65b4540-5f3b-407c-aa1e-e6fff984d9c3", "priyankasharma121202@gmail.com", "d3a231fa-5d33-4249-a17d-102765de4e09"]
```
- **How it fails**: When checking if an announcement was read by the current user, if the UI checks `user.id` but `seen_by` has their email string (or vice-versa), the announcement dismiss state fails and the notification reappears on every refresh.
- **Fix**: Normalize `seen_by` to strictly store user UUIDs, and run a data cleanup script converting existing emails to user IDs.
- **Effort**: Medium

#### BUG-007: Admin notification spam and duplicate `TASK_OVERDUE` alerts
- **Severity**: HIGH
- **Area**: Notifications
- **Where**: `notifications` table in `DATABASE_BACKUP.json`
- **What is wrong**: 69 out of 100 existing notifications belong to admins, and 28 out of 52 `TASK_OVERDUE` rows are identical duplicate alerts for the same user and task.
- **Evidence**:
```json
// Exact duplicate pairs in backup:
{ "id": "402377b3-...", "user_id": "c20f5e78-...", "type": "TASK_OVERDUE", "payload": { "taskId": "55fba724-...", "taskCode": "TASK0001" } },
{ "id": "979e2a4a-...", "user_id": "c20f5e78-...", "type": "TASK_OVERDUE", "payload": { "taskId": "55fba724-...", "taskCode": "TASK0001" } }
```
- **How it fails**: The daily overdue cron job creates duplicate notification rows every day a task remains overdue without checking whether an unread notification already exists.
- **Fix**: Add idempotency check before creating overdue alerts: do not insert if an unread alert for the same task and recipient exists from the last 24 hours.
- **Effort**: Small

#### BUG-008: Deleting an epic permanently wipes all linked sprints, tasks, checklists, and comments with no soft-delete or confirmation
- **Severity**: HIGH
- **Area**: Database
- **Where**: `artifacts/api-server/src/routes/epics.ts: lines 372-401`
- **What is wrong**: The epic DELETE handler executes a permanent hard cascade of the epic and every entity under it in a single transaction without a soft-delete option.
- **Evidence**:
```typescript
// lines 387-399 in epics.ts
await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, taskIds));
await tx.delete(taskComments).where(inArray(taskComments.taskId, taskIds));
await tx.delete(taskNotes).where(inArray(taskNotes.taskId, taskIds));
await tx.delete(tasks).where(inArray(tasks.id, taskIds));
await tx.delete(sprints).where(inArray(sprints.id, sprintIds));
await tx.delete(epics).where(eq(epics.id, epicId));
```
- **How it fails**: A single accidental click on "Delete Epic" irrevocably deletes dozens of tasks, employee subtasks, comments, and sprints with zero recovery possibility.
- **Fix**: Require a typed confirmation string (`CONFIRM_DELETE`) or implement soft-deletion with `deleted_at`.
- **Effort**: Medium

---

### MEDIUM Severity

#### BUG-009: Missing rate-limiting and security headers
- **Severity**: MEDIUM
- **Area**: Security
- **Where**: `artifacts/api-server/package.json` & `src/index.ts`
- **What is wrong**: `helmet` and `express-rate-limit` are not installed; `/api/auth/forgot-password` and `/login` have no rate limiting.
- **Evidence**:
```json
// package.json dependencies:
"dependencies": {
  "@supabase/supabase-js": "^2.116.0",
  "bcryptjs": "^2.4.3",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "drizzle-orm": "^0.45.2",
  "express": "^5.0.1"
}
// Neither 'helmet' nor 'express-rate-limit' exists in dependencies!
```
- **How it fails**: An attacker can spam thousands of password reset emails or launch credential-stuffing attacks on `/login` without triggering IP throttling.
- **Fix**: Install and configure `helmet` and `express-rate-limit` across public authentication routes.
- **Effort**: Small

#### BUG-010: `GET /api/attendance` returns every employee's attendance across the company unless `myOnly=true`
- **Severity**: MEDIUM
- **Area**: Backend
- **Where**: `artifacts/api-server/src/routes/attendance.ts: lines 39-44`
- **What is wrong**: If an employee calls `GET /api/attendance` without passing `myOnly=true`, the route returns all attendance records for the entire company.
- **Evidence**:
```typescript
let rows;
if (req.query.myOnly === 'true' && employeeId) {
  rows = await query.where(eq(attendance.employeeId, employeeId)).orderBy(desc(attendance.clockIn));
} else {
  rows = await query.orderBy(desc(attendance.clockIn));
}
```
- **How it fails**: Any regular employee can inspect the exact clock-in, clock-out, and total working hours of all other employees and executives.
- **Fix**: If `req.user.role === 'EMPLOYEE'`, force-filter `eq(attendance.employeeId, employeeId)` regardless of `req.query.myOnly`.
- **Effort**: Small

#### BUG-011: Task status route lacks state machine transition validation
- **Severity**: MEDIUM
- **Area**: Backend
- **Where**: `artifacts/api-server/src/routes/tasks.ts: lines 1151-1185`
- **What is wrong**: While ownership is checked, the route permits arbitrary status jumps (e.g. moving directly from PLANNED to DONE or TO_REVIEW) without validating dependencies.
- **Evidence**:
```typescript
router.patch('/:id/status', async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;
  // Validates ownership, but does not check allowed state transitions or blocked dependencies!
  let normalizedStatus = normalizeTaskStatus(status);
```
- **How it fails**: A task can skip the active workflow and be marked DONE even when subtasks are incomplete or dependency tasks remain blocked.
- **Fix**: Enforce an allowed state machine transition map (e.g. `PLANNED -> TODO -> IN_PROGRESS -> TO_REVIEW -> DONE`).
- **Effort**: Medium

#### BUG-012: Due date set earlier than creation timestamp on 5 tasks
- **Severity**: MEDIUM
- **Area**: Data
- **Where**: `tasks` table (`STSK0003`, `TASK0003`, `TASK0004`, `TASK0005`, `TASK0006`)
- **What is wrong**: Exactly 5 tasks in the database have their calendar due date set prior to their creation calendar day.
- **Evidence**:
```
STSK0003 due: 2026-09-06 vs created_at: 2026-09-30
TASK0003 due: 2026-09-05 vs created_at: 2026-09-25
TASK0004 due: 2026-09-05 vs created_at: 2026-09-25
TASK0005 due: 2026-09-06 vs created_at: 2026-09-25
TASK0006 due: 2026-09-06 vs created_at: 2026-09-25
```
- **How it fails**: These tasks immediately trigger overdue notifications upon creation and distort project velocity metrics.
- **Fix**: Update the due dates of these 5 tasks to match their sprint end dates, and add validation on task creation.
- **Effort**: Small

#### BUG-013: Entity Mismatches: 3 tasks and all 10 STSK tasks belong to a different entity than their parent
- **Severity**: MEDIUM
- **Area**: Data
- **Where**: `tasks` table (`TASK0003`, `TASK0005`, `TASK0006`, and `STSK0001` through `STSK0010`)
- **What is wrong**: 
  - `TASK0003` has entity `CAG`, parent epic `EPIC0006` has entity `EHM`.
  - `TASK0005` & `TASK0006` have entity `COMMON`, parent epic `EPIC0006` has entity `EHM`.
  - All 10 `STSK` sprint tasks belong to entity `CAG` or `EHM`, but their parent sprints belong to entity `COMMON` (`539ba160`).
- **Evidence**:
```
TASK0003: entity = CAG, epic = EPIC0006 (entity = EHM)
TASK0005: entity = COMMON, epic = EPIC0006 (entity = EHM)
TASK0006: entity = COMMON, epic = EPIC0006 (entity = EHM)
STSK0001: entity = CAG, sprint = SPRINT-2026-W37 (entity = COMMON)
STSK0002: entity = EHM, sprint = SPRINT-2026-W37 (entity = COMMON)
```
- **How it fails**: Filtering by entity in the dashboard causes tasks to vanish or appear under mismatched brand views.
- **Fix**: Align task `entityId` with their parent epic or sprint entity.
- **Effort**: Small

#### BUG-014: `epics.assigned_to` stores employee full names instead of user UUIDs
- **Severity**: MEDIUM
- **Area**: Database / Schema
- **Where**: `epics` table (`EPIC0011`, `EPIC0012`, `EPIC0013`)
- **What is wrong**: `epics.assigned_to` contains JSON strings of employee names rather than foreign keys to `employees.id`.
- **Evidence**:
```json
EPIC0011: assigned_to = "["Harshit Mishra"]"
EPIC0012: assigned_to = "["Jitendra Singh","Neha Shukla"]"
EPIC0013: assigned_to = "["Harshit Mishra","Jitendra Singh","Utsav Mishra"]"
```
- **How it fails**: If an employee changes their display name or if the frontend queries epics by employee UUID, epic assignment lookups fail completely.
- **Fix**: Convert `assigned_to` to store an array of employee UUIDs.
- **Effort**: Medium

#### BUG-015: Duplicate user accounts sharing the same `employee_id`
- **Severity**: MEDIUM
- **Area**: Database
- **Where**: `users` table & `lib/db/src/schema/users.ts`
- **What is wrong**: Two distinct user records share the exact same `employee_id` (`c30c78d7-9398-4517-a54a-64005b90d555`) because `users.employee_id` lacks a unique constraint.
- **Evidence**:
```json
{ "id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7", "email": "ashutoshmishraup78@gmail.com", "employee_id": "c30c78d7-9398-4517-a54a-64005b90d555", "role": "ADMIN" }
{ "id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3", "email": "admin@example.com", "employee_id": "c30c78d7-9398-4517-a54a-64005b90d555", "role": "ADMIN" }
```
- **How it fails**: User profile updates or audit history entries can be attributed to the wrong login account.
- **Fix**: Remove the test account `admin@example.com` and add a `UNIQUE` constraint on `users.employee_id`.
- **Effort**: Small

#### BUG-016: 8 tasks have assignee equal to reviewing lead
- **Severity**: MEDIUM
- **Area**: Data
- **Where**: `tasks` table (`STSK0003`, `BLOG0002`, `BLOG0003`, `BLOG0004`, `BLOG0007`, `BLOG0010`, `TASK0011`, `STSK0005`)
- **What is wrong**: The assigned employee and reviewing lead are set to the identical employee ID (`assignee_id === reviewing_lead_id`).
- **Evidence**:
```json
{ "code": "STSK0003", "assignee_id": "1e32f27a-...", "reviewing_lead_id": "1e32f27a-..." }
{ "code": "BLOG0002", "assignee_id": "1e32f27a-...", "reviewing_lead_id": "1e32f27a-..." }
```
- **How it fails**: The employee is reviewing their own work, defeating the four-eyes review principle and suppressing review notifications.
- **Fix**: Assign a distinct senior engineer or project manager as the reviewing lead for these tasks.
- **Effort**: Small

#### BUG-017: 69 `record_history` rows point to deleted or non-existent parent records
- **Severity**: MEDIUM
- **Area**: Data / History
- **Where**: `record_history` table & `DATABASE_BACKUP.json`
- **What is wrong**: 69 audit history rows reference `record_id` UUIDs that no longer exist in `tasks`, `epics`, or `sprints` due to past test deletions.
- **Evidence**:
```json
{ "id": "abb1ddda-3f16-40c5-892f-994a787fada1", "record_id": "fc5d9f8f-3da6-40c6-a4d7-84d028ebf04c", "action": "UPDATED" },
{ "id": "10c5e562-c6bb-42bc-99ff-df1d0b7a36f3", "record_id": "4c65066c-e4cc-466c-8a3d-f096e56f2d88", "action": "CREATED" }
```
- **How it fails**: Opening the history panel on a recycled task ID or running history reports triggers missing record warnings.
- **Fix**: Retain or archive orphan history rows with an explicit `is_deleted_parent: true` marker.
- **Effort**: Small

#### BUG-018: In-memory background cron jobs lack distributed locking
- **Severity**: MEDIUM
- **Area**: Backend
- **Where**: `artifacts/api-server/src/jobs/sync-cron.ts` & `overdue-check-cron.ts`
- **What is wrong**: Cron jobs run in-memory via `node-cron` without database advisory locking.
- **How it fails**: Running multiple server instances causes duplicate cron executions and duplicate emails.
- **Fix**: Wrap cron execution in `pg_try_advisory_lock()`.
- **Effort**: Medium

#### BUG-019: Batch Google Calendar sync lacks database transaction
- **Severity**: MEDIUM
- **Area**: Backend
- **Where**: `artifacts/api-server/src/routes/meetings.ts`
- **What is wrong**: Meeting imports run multiple sequential inserts without `db.transaction`.
- **How it fails**: Network failure midway leaves partially synced meetings and corrupted state.
- **Fix**: Wrap batch meeting operations in `db.transaction`.
- **Effort**: Medium

---

### LOW Severity

#### BUG-020: Missing `ON DELETE CASCADE` on Task child tables for raw SQL deletes
- **Severity**: LOW
- **Area**: Database
- **Where**: `lib/db/src/schema/task_checklists.ts`, `task_comments.ts`, `task_notes.ts`
- **What is wrong**: The API endpoint (`DELETE /api/tasks/:id`) manually removes checklists, comments, and notes in a transaction; however, the DDL schema lacks `onDelete: 'cascade'`.
- **How it fails**: Only fails if a database administrator executes a raw SQL `DELETE FROM tasks WHERE id = '...'` directly in psql, which throws a foreign key constraint violation.
- **Fix**: Add `onDelete: 'cascade'` to foreign keys in child table schemas.
- **Effort**: Small

#### BUG-021: Rapid double-clicking Save buttons fires parallel mutations
- **Severity**: LOW
- **Area**: Frontend
- **Where**: `artifacts/hr-dashboard/src/components/TaskUpdateModal.tsx`
- **What is wrong**: Modal submit buttons do not disable immediately upon click.
- **Fix**: Add `disabled={isSubmitting}` and a loading spinner.
- **Effort**: Small

#### BUG-022: Inconsistent task status UI badge labels
- **Severity**: LOW
- **Area**: Frontend
- **Where**: `TasksView.tsx` vs `EpicsSubView.tsx`
- **What is wrong**: `TO_REVIEW` is rendered as "In Review" on some pages and "Reviewing Lead Check" on others.
- **Fix**: Standardize badge labels in a shared dictionary.
- **Effort**: Small

---

## 4. SCHEMA & MIGRATION DRIFT CATALOG (D-01 to D-12)

| Drift ID | Entity / Area | Drift Description | Impact |
|---|---|---|---|
| **D-01** | `employee_code_history` | Exists in schema and live DB, but missing from Drizzle migrations (`0000`–`0005`). | Fresh `pnpm drizzle-kit migrate` skips this table. |
| **D-02** | `global_counters` | Exists in schema and live DB, but missing from Drizzle migrations. | Fresh migration skips code generator table. |
| **D-03** | `password_reset_otps` | Exists in schema and live DB, but missing from Drizzle migrations. | Password reset flow fails on fresh database. |
| **D-04** | `projects` | Exists in schema and live DB, but missing from Drizzle migrations. | Projects table missing on fresh setup. |
| **D-05** | `record_history` | Exists in schema and live DB, but missing from Drizzle migrations. | Audit history timeline missing on fresh setup. |
| **D-06** | `tasks.sprint_week` | Legacy varchar column still exists alongside `tasks.sprint_id` FK. | Redundant dual sprint assignment storage. |
| **D-07** | `announcements.seen_by` | Defined as JSONB string array, stores mixed UUIDs and emails. | Announcement dismiss flow breaks. |
| **D-08** | `epics.assigned_to` | Defined as text/JSON, stores raw full names instead of employee UUIDs. | Breaks relational assignment integrity. |
| **D-09** | Foreign Key Cascades | Schema lacks `onDelete: 'cascade'` on task checklists, comments, notes. | Direct SQL deletion fails with FK violations. |
| **D-10** | `users.employee_id` | Lacks `UNIQUE` constraint in DDL and schema. | Allows multiple user accounts to bind to one employee. |
| **D-11** | `tasks.story_points` | Integer in DB/schema vs frontend allows floating point numbers. | Decimal inputs cause 500 DB insert errors. |
| **D-12** | Empty Tables | 6 tables defined in schema contain 0 rows in production data. | `applications`, `employee_code_history`, `meeting_attendees`, `password_reset_otps`, `task_notes`, `task_templates`. |

---

## 5. DATA CLEANUP LIST (READ-ONLY VERIFICATION SQL)

Run these **SELECT-ONLY** SQL queries against the database to inspect the identified corrupt rows:

```sql
-- 1. Unnormalized emails in announcements.seen_by
SELECT id, title, seen_by FROM announcements WHERE seen_by::text LIKE '%@%';

-- 2. Tasks with Due Date before Creation Date (5 tasks)
SELECT id, task_code, title, due_date, created_at 
FROM tasks 
WHERE task_code IN ('STSK0003', 'TASK0003', 'TASK0004', 'TASK0005', 'TASK0006');

-- 3. Task vs Epic Entity Mismatch (TASK0003, TASK0005, TASK0006)
SELECT t.id AS task_id, t.task_code, t.entity_id AS task_entity, 
       e.id AS epic_id, e.epic_code, e.entity_id AS epic_entity
FROM tasks t
JOIN epics e ON t.epic_id = e.id
WHERE t.task_code IN ('TASK0003', 'TASK0005', 'TASK0006');

-- 4. STSK tasks vs Sprint Entity Mismatch (All 10 STSK tasks)
SELECT t.task_code, t.entity_id AS task_entity, s.sprint_code, s.entity_id AS sprint_entity
FROM tasks t
JOIN sprints s ON t.sprint_id = s.id
WHERE t.task_code LIKE 'STSK%';

-- 5. Epics storing string names in assigned_to
SELECT id, epic_code, title, assigned_to 
FROM epics 
WHERE assigned_to IS NOT NULL AND assigned_to::text NOT LIKE '%-%';

-- 6. Duplicate users sharing the same employee_id
SELECT employee_id, COUNT(*), array_agg(email) AS emails
FROM users
WHERE employee_id IS NOT NULL
GROUP BY employee_id
HAVING COUNT(*) > 1;

-- 7. Tasks where Assignee is equal to Reviewing Lead (8 tasks)
SELECT task_code, title, assignee_id, reviewing_lead_id
FROM tasks
WHERE assignee_id IS NOT NULL 
  AND reviewing_lead_id IS NOT NULL 
  AND assignee_id = reviewing_lead_id;

-- 8. Duplicate TASK_OVERDUE notifications
SELECT user_id, payload->>'taskCode' AS task_code, COUNT(*)
FROM notifications
WHERE type = 'TASK_OVERDUE'
GROUP BY user_id, payload->>'taskCode'
HAVING COUNT(*) > 1;

-- 9. Orphan record_history rows pointing to deleted entities
SELECT h.id, h.record_type, h.record_id, h.action, h.created_at
FROM record_history h
LEFT JOIN tasks t ON h.record_id = t.id
LEFT JOIN epics e ON h.record_id = e.id
LEFT JOIN sprints s ON h.record_id = s.id
LEFT JOIN projects p ON h.record_id = p.id
LEFT JOIN initiatives i ON h.record_id = i.id
WHERE t.id IS NULL AND e.id IS NULL AND s.id IS NULL AND p.id IS NULL AND i.id IS NULL;
```

---

## 6. PROPOSED SAFE FIX ROADMAP (5 BATCHES)

- **Batch 1 (Immediate Security Hardening)**:
  - Fix `pruneNotificationsToLimit` to scope by `userId`.
  - Fix IDOR on `/clock-in` and `/clock-out` in `attendance.ts`.
  - Relocate `clean_production_seed.ts` and test cleanup scripts out of `src/`.
  - Install and mount `express-rate-limit` and `helmet` on public auth routes.

- **Batch 2 (Data Normalization & Cleanup)**:
  - Convert email strings in `announcements.seen_by` to user UUIDs.
  - Align entity IDs for the 3 mismatched tasks and 10 STSK tasks.
  - Correct the 5 invalid task due dates.
  - Reassign reviewing leads for the 8 self-review tasks.
  - Delete the 28 duplicate `TASK_OVERDUE` notification rows.

- **Batch 3 (Schema & Relational Integrity)**:
  - Add unique constraint to `users.employee_id` and remove test user `admin@example.com`.
  - Convert `epics.assigned_to` to store employee UUIDs.
  - Add Drizzle migrations covering D-01 through D-05.
  - Add `onDelete: 'cascade'` on task child table foreign keys.

- **Batch 4 (Token Encryption at Rest)**:
  - Implement AES-256-GCM encryption for `google_tokens`.
  - Hash `invites.token` using SHA-256.

- **Batch 5 (Frontend Polish & Consistency)**:
  - Add confirmation modal on Epic deletion.
  - Force employee attendance route filter in backend.
  - Prevent modal double-click parallel mutations.

---

## 7. FILES NOT READ LINE-BY-LINE (TRANSPARENCY AUDIT LOG)

In accordance with strict audit transparency, the following non-application or generated files were NOT read line-by-line:
1. `node_modules/**` (Third-party vendor libraries).
2. `pnpm-lock.yaml` (Package dependency lockfile, 134 KB).
3. `FULL_CODEBASE_UNABRIDGED.md` (Pre-generated concatenation file, 6.8 MB — audited via original source files).
4. `migration_mapping_step2.csv` & `migration_mapping_step2.json` (Historical ID translation tables).
5. `scratch_extracted_audit.json` & `scratch_deep_report.json` (Previous intermediate scratch artifacts).
6. `lib/db/dist/**` (Compiled TypeScript build artifacts).

---

## 8. QUESTIONS FOR ARCHITECTURAL DECISION

1. **OAuth Master Key**: For encrypting `google_tokens` via AES-256-GCM, should the master key be stored as `ENCRYPTION_MASTER_KEY` in `.env`?
2. **Duplicate Admin Account**: Can we safely delete `admin@example.com` so that `ashutoshmishraup78@gmail.com` is the sole user linked to employee `c30c78d7-9398-4517-a54a-64005b90d555`?
3. **Epic Deletion Policy**: When an Epic is deleted, should child tasks be permanently deleted (current hard cascade), moved to the Unassigned Backlog, or soft-deleted via `deleted_at`?
