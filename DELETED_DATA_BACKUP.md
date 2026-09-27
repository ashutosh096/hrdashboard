# 🗑️ Deleted Test/Regression Data Backup
> Created: 2026-09-28  
> All items below were deleted as regression/test data on 2026-09-28.  
> To restore: run `npx tsx src/restore_deleted_data.ts` from `artifacts/api-server/`

---

## How to Restore

```bash
cd c:\hrdashboard\artifacts\api-server
npx tsx src/restore_deleted_data.ts
```

This will re-insert every row below back into the database exactly as it was.

---

## 1. Initiatives Deleted (0)

| Code | Entity | Status | Title |
|---|---|---|---|

---

## 2. Epics Deleted (0)

| Code | Status | Parent Initiative ID | Title |
|---|---|---|---|

---

## 3. Tasks Deleted (0)

| Code | Type | Status | Priority | Title |
|---|---|---|---|---|

---

## 4. Sprints Deleted (0)

| Code | Status | Name |
|---|---|---|

---

## 5. Employees Deleted (0)

| Code | Name | Email | Designation |
|---|---|---|---|

---

## 6. Announcements Deleted (13)

| Priority | Pinned | Title |
|---|---|---|
| IMPORTANT | No | Company-Wide System Upgrade Notice |
| URGENT | No | Urgent Security Advisory — Rotate API Credentials |
| NORMAL | No | Coffee Machine Restocked on 3rd Floor |
| IMPORTANT | No | Company-Wide System Upgrade Notice |
| URGENT | No | Urgent Security Advisory — Rotate API Credentials |
| NORMAL | No | Coffee Machine Restocked on 3rd Floor |
| NORMAL | No | Audit Test Announcement |
| IMPORTANT | No | Company-Wide System Upgrade Notice |
| URGENT | No | Urgent Security Advisory — Rotate API Credentials |
| NORMAL | No | Coffee Machine Restocked on 3rd Floor |
| IMPORTANT | No | Company-Wide System Upgrade Notice |
| URGENT | No | Urgent Security Advisory — Rotate API Credentials |
| NORMAL | No | Coffee Machine Restocked on 3rd Floor |

---

## 7. Task Checklists Deleted (0)

| Task ID (first 8) | Item Text | Completed |
|---|---|---|

---

## 8. Full JSON Data

The complete row-level JSON for all deleted items is stored in:

```
c:\hrdashboard\DELETED_DATA_BACKUP.json
```

This JSON file is used by the restore script to re-insert everything.

---

> **Last verified:** 2026-09-28 01:26 IST  
> **Deleted by:** Cleanup script (cleanup_test_data.ts)  
> **Backed up from:** DATABASE_BACKUP.json (pre-cleanup snapshot)  
