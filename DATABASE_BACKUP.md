# Comprehensive HR Dashboard System & Database Backup

> **Backup Date & Time:** 9/28/2026, 21:50:50 (2026-09-28T16:20:50.136Z)
> **Scope:** Complete Database snapshot including all Team Members, Initiatives, Epics, Tasks, Sprints, Meetings, Announcements, Projects, Checklists, Notes, Comments, and System entities.
> **Total Tables Backed Up:** 26
> **Status:** All changes remain strictly on localhost with zero data loss.

## Table Summary Index

| Table Name | Record Count | Status |
|---|:---:|---|
| **`announcements`** | **1** | ✅ Backed up successfully |
| **`applications`** | **0** | ✅ Backed up successfully |
| **`attendance`** | **7** | ✅ Backed up successfully |
| **`audit_logs`** | **125** | ✅ Backed up successfully |
| **`departments`** | **16** | ✅ Backed up successfully |
| **`employee_code_history`** | **0** | ✅ Backed up successfully |
| **`employees`** | **13** | ✅ Backed up successfully |
| **`entities`** | **3** | ✅ Backed up successfully |
| **`entity_counters`** | **3** | ✅ Backed up successfully |
| **`epics`** | **9** | ✅ Backed up successfully |
| **`global_counters`** | **1** | ✅ Backed up successfully |
| **`google_tokens`** | **5** | ✅ Backed up successfully |
| **`initiatives`** | **8** | ✅ Backed up successfully |
| **`invites`** | **11** | ✅ Backed up successfully |
| **`meeting_attendees`** | **0** | ✅ Backed up successfully |
| **`meetings`** | **403** | ✅ Backed up successfully |
| **`notifications`** | **172** | ✅ Backed up successfully |
| **`password_reset_otps`** | **0** | ✅ Backed up successfully |
| **`projects`** | **13** | ✅ Backed up successfully |
| **`sprints`** | **3** | ✅ Backed up successfully |
| **`task_checklists`** | **4** | ✅ Backed up successfully |
| **`task_comments`** | **2** | ✅ Backed up successfully |
| **`task_notes`** | **0** | ✅ Backed up successfully |
| **`task_templates`** | **0** | ✅ Backed up successfully |
| **`tasks`** | **19** | ✅ Backed up successfully |
| **`users`** | **14** | ✅ Backed up successfully |
| **TOTAL RECORDS** | **832** | **Complete Dataset** |

---

## 📋 Table: `announcements` (1 records)

### Formatted View Preview

| id | title | content | priority | is_pinned | target_entity_id | seen_by | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1cf7b9e3-97bb-469d-97b8-d3341392312c | Work From Home  - 26 September | Hi everyone,  Due to the heavy rain foreca... | IMPORTANT | true | *null* | `["c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",` | 2026-09-25 16:46:20.650954 |

### Complete Field Data & Records (`announcements`)

```json
[
  {
    "id": "1cf7b9e3-97bb-469d-97b8-d3341392312c",
    "title": "Work From Home  - 26 September",
    "content": "Hi everyone,\n\nDue to the heavy rain forecast for Kanpur tomorrow, we will be working from home tomorrow, 26 September, for everyone’s safety and to avoid unnecessary travel.\n\nPlease remain available during regular working hours and continue with your planned tasks and meetings as usual.\n\nStay safe and take care.",
    "priority": "IMPORTANT",
    "is_pinned": true,
    "target_entity_id": null,
    "seen_by": [
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "ashutoshmishraup78@gmail.com",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "harshit@ehmconsultancy.co.in",
      "6df0b051-0183-414d-96df-b32a19a24cf2",
      "ashutoshmishraup78@mpgi.edu.in",
      "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
      "admin@example.com",
      "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
      "neha@ehmconsultancy.co.in",
      "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "dubey.pranshu@gmail.com",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "created_at": "2026-09-25 16:46:20.650954",
    "created_by": "fa0289e6-0109-4228-9f3d-f54b7164773c"
  }
]
```

---

## 📋 Table: `applications` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `attendance` (7 records)

### Formatted View Preview

| id | employee_id | date | clock_in | clock_out | work_mode | status | total_hours |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 86c7702d-470d-4b6a-91d9-ae6fa5575d79 | 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | 2026-09-24 | 2026-09-24 05:13:07.018 | *null* | REMOTE | PRESENT | 0.00 |
| 393b1941-1162-4933-82bd-2e022b4e0c81 | 1e32f27a-d641-40ff-923c-05fef4836c10 | 2026-09-24 | 2026-09-24 08:17:52.527 | *null* | REMOTE | PRESENT | 0.00 |
| 13a59489-4a24-48b3-a166-45fc0e02f66a | 67f526ba-afcf-4ec0-bf41-da1468bfb816 | 2026-09-24 | 2026-09-24 08:33:40.606 | *null* | REMOTE | PRESENT | 0.00 |
| cec12f04-f53c-4aac-a2b4-2b7cfba6066a | 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | 2026-09-25 | 2026-09-25 04:36:54.513 | *null* | REMOTE | PRESENT | 8.00 |
| 4de93948-d68e-4ea5-b63d-72f2237510ac | 1e32f27a-d641-40ff-923c-05fef4836c10 | 2026-09-25 | 2026-09-25 17:56:08.324 | *null* | REMOTE | PRESENT | 8.00 |
| c3e1e89f-3394-4fd4-9e0c-677b14223551 | 1e32f27a-d641-40ff-923c-05fef4836c10 | 2026-09-26 | 2026-09-26 04:06:18.1 | *null* | REMOTE | PRESENT | 8.00 |
| 82dada0c-6038-4bb7-b8df-796ca3ff0206 | 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | 2026-09-26 | 2026-09-26 07:08:05.432 | *null* | REMOTE | PRESENT | 8.00 |

### Complete Field Data & Records (`attendance`)

```json
[
  {
    "id": "86c7702d-470d-4b6a-91d9-ae6fa5575d79",
    "employee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "date": "2026-09-24",
    "clock_in": "2026-09-24 05:13:07.018",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "0.00",
    "created_at": "2026-09-24 05:13:07.053465"
  },
  {
    "id": "393b1941-1162-4933-82bd-2e022b4e0c81",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "date": "2026-09-24",
    "clock_in": "2026-09-24 08:17:52.527",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "0.00",
    "created_at": "2026-09-24 08:17:52.567779"
  },
  {
    "id": "13a59489-4a24-48b3-a166-45fc0e02f66a",
    "employee_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "date": "2026-09-24",
    "clock_in": "2026-09-24 08:33:40.606",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "0.00",
    "created_at": "2026-09-24 08:33:40.644038"
  },
  {
    "id": "cec12f04-f53c-4aac-a2b4-2b7cfba6066a",
    "employee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "date": "2026-09-25",
    "clock_in": "2026-09-25 04:36:54.513",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "8.00",
    "created_at": "2026-09-25 04:36:54.547253"
  },
  {
    "id": "4de93948-d68e-4ea5-b63d-72f2237510ac",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "date": "2026-09-25",
    "clock_in": "2026-09-25 17:56:08.324",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "8.00",
    "created_at": "2026-09-25 17:56:08.362724"
  },
  {
    "id": "c3e1e89f-3394-4fd4-9e0c-677b14223551",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "date": "2026-09-26",
    "clock_in": "2026-09-26 04:06:18.1",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "8.00",
    "created_at": "2026-09-26 04:06:18.130737"
  },
  {
    "id": "82dada0c-6038-4bb7-b8df-796ca3ff0206",
    "employee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "date": "2026-09-26",
    "clock_in": "2026-09-26 07:08:05.432",
    "clock_out": null,
    "work_mode": "REMOTE",
    "status": "PRESENT",
    "total_hours": "8.00",
    "created_at": "2026-09-26 07:08:05.469888"
  }
]
```

---

## 📋 Table: `audit_logs` (125 records)

### Formatted View Preview

| id | user_id | action | details | created_at |
| --- | --- | --- | --- | --- |
| 29f13ac3-5d36-43ff-8933-9a4d64e3e5f1 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit_dev_17` | 2026-09-21 20:08:15.360596 |
| a4fb3b5f-ee3d-436e-9ae9-7b0375ddcc0e | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"audit_mgr_179` | 2026-09-21 20:08:17.92751 |
| edd851d9-c52e-4467-9f9f-6aa9da73943d | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"34b07117-236f-462f-a02f-9` | 2026-09-21 20:08:19.535425 |
| 3e135d8f-e3db-494b-8b01-ad57a63b844d | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Sarah Connor","employeeId":"34b` | 2026-09-21 20:08:35.316567 |
| 0b0cf5a1-2165-4383-931b-304609b9a8eb | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit_dev_17` | 2026-09-21 20:10:01.144243 |
| 50161d5c-680b-4c94-bf9e-c470d107dd86 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"audit_mgr_179` | 2026-09-21 20:10:03.384617 |
| 6e639ecd-c55a-433f-b08e-92ff9b559cf1 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"e039ea3a-8011-49c6-ac6b-7` | 2026-09-21 20:10:05.044254 |
| 8f938e90-29aa-4564-b3f1-37c1304f32c5 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit_dev_17` | 2026-09-21 20:11:08.337305 |
| 18febfcc-8a04-40cc-9065-7c039f2a74c3 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"audit_mgr_179` | 2026-09-21 20:11:10.672585 |
| b248c542-ede4-4883-a2db-178667accde3 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"9298a860-ff50-43fd-95bc-3` | 2026-09-21 20:11:12.332153 |
| 05440dde-ebf3-4e81-b353-fc6f4fb3c3d2 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Sarah Connor","employeeId":"929` | 2026-09-21 20:11:30.563739 |
| e9e174f7-3658-4fa4-b74d-ab7ed0441aea | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Marcus Wright","employeeId":"f1` | 2026-09-21 20:11:33.803759 |
| 32ee2cb4-81f6-47a9-aa0c-4ca1bb749dcd | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"temp.alpha@l` | 2026-09-21 20:18:37.200679 |
| 6d421320-e46f-4724-8778-d95285d6d05a | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"temp.beta@li` | 2026-09-21 20:18:39.50091 |
| 13015f08-303e-47e1-aa91-6edb9b734fe1 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"2111c5aa-2f28-4c89-8d54-e` | 2026-09-21 20:18:40.210724 |
| 81728c26-2718-4cbf-a0b4-2cd8d6ae0b94 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"ea0d78a3-8ffd-4ff8-bc6d-5` | 2026-09-21 20:18:41.010784 |
| b2fad867-bbf9-4b65-9a79-53fb767d0f45 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Temp Alpha","employeeId":"2111c` | 2026-09-21 20:18:44.510208 |
| 30d82c02-2f6b-408e-b0be-d72d5b29a55c | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Temp Beta","employeeId":"ea0d78` | 2026-09-21 20:18:47.7901 |
| 86ee432e-91a5-4cb3-b5b3-d557e9f837de | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"temp.alpha@l` | 2026-09-21 20:19:27.171442 |
| ec1d657b-2087-41a2-83a4-ab0de9fe7f90 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"temp.beta@li` | 2026-09-21 20:19:29.521208 |
| 098decb9-8995-4140-b146-ddbaf36c105e | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"57141114-f3d7-4c6d-83aa-7` | 2026-09-21 20:19:30.241547 |
| a946edcc-ceb7-4cc1-93d0-2c9c29ff975d | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_UPDATED | `{"employeeId":"d6a492b0-b53c-4e77-9b11-0` | 2026-09-21 20:19:30.960891 |
| 485f4e18-9491-4fe7-9508-5dd3459c30ab | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Temp Alpha","employeeId":"57141` | 2026-09-21 20:19:34.450731 |
| 6db3403a-efc4-435c-a54d-4397260fc0f4 | 10a8581e-7021-45ce-921c-72c571ef4d49 | EMPLOYEE_DELETED | `{"name":"Temp Beta","employeeId":"d6a492` | 2026-09-21 20:19:37.871128 |
| 2ac88d4f-c5dc-4e14-a9d2-92646fbb53aa | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"ashutoshmish` | 2026-09-21 20:38:39.870776 |
| f8c58b5f-94ae-42ce-855f-0a290c00c5bd | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"1e32f` | 2026-09-22 05:20:00.026245 |
| 4090c793-0ab5-4768-9d6e-fb87def79f83 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"Eustace ","employeeId":"259d9b3` | 2026-09-22 05:20:13.207833 |
| 891d26c8-3904-4d51-bd77-334ef50e3f28 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"a9918` | 2026-09-22 05:20:47.117074 |
| da0199ec-7163-435d-90e8-6911e984ecb8 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"ashutoshmishr` | 2026-09-22 05:27:18.381885 |
| f4e376a2-bfe1-4c61-a8cc-344ff4ce2636 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"1e32f27` | 2026-09-22 05:33:42.038057 |
| ae9be262-d2ed-4f3b-bafe-014006a5c258 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"1e32f` | 2026-09-22 05:34:01.57231 |
| 51abbdc5-c065-4560-b95c-510c749e069a | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"1e32f` | 2026-09-22 05:34:04.04037 |
| fff1b6de-639d-4008-968e-f02e6649b2ea | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit.market` | 2026-09-22 05:37:15.155042 |
| 9d2f3217-39c9-4186-b87e-df688f462022 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit.financ` | 2026-09-22 05:37:20.111923 |
| 7dbe6993-31a8-44c2-9e08-f2475d7bd4bd | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"EMPLOYEE","employeeId":"00c6` | 2026-09-22 05:37:22.58586 |
| 1327c7ba-86bf-49b1-8830-e33a5a6280d2 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"AuditTest OperationsLead","empl` | 2026-09-22 05:37:28.414378 |
| a10e1788-c66f-44da-9fe1-a10ebf53a9c8 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"AuditTest FinanceAnalyst","empl` | 2026-09-22 05:37:31.810879 |
| b53dc335-75e0-4cca-a198-21ec722d3244 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit.market` | 2026-09-22 05:40:01.997255 |
| 9d224dc9-42fd-4971-ada3-d01cb731b89c | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit.financ` | 2026-09-22 05:40:05.488142 |
| d31187d1-9a72-4e04-adf2-07a3367c704f | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"EMPLOYEE","employeeId":"117c` | 2026-09-22 05:40:07.160202 |
| 43cdcc82-d472-456c-be21-c8722d746723 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"AuditTest OperationsLead","empl` | 2026-09-22 05:40:12.239763 |
| 0a380199-8f4a-4274-8da3-9fd457cc14ac | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"AuditTest FinanceAnalyst","empl` | 2026-09-22 05:40:15.071155 |
| 4cf2a804-ab7f-4518-907d-90d24f417bff | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 05:46:25.231028 |
| bb3c8a8d-8828-4337-b9ba-fea6e57c1a80 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 05:46:37.425565 |
| 9a776513-762b-4d04-9575-9450b55d04c6 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"CAG-MGR01","newRole":"MANAGE` | 2026-09-22 05:59:41.825069 |
| 2b44bc1f-18ea-43ec-bf9f-0be0c4d085cb | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR07","newRole":"MANAGE` | 2026-09-22 05:59:43.351661 |
| a8cc51d1-d8c5-4c1c-b74c-d7f7cdf66e38 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 06:01:45.677018 |
| e18cd980-cad1-4d0f-b646-10255770d2d9 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 06:02:05.120243 |
| e5f7293a-c46b-4a89-8b08-e0394eb9544b | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 06:02:35.063404 |
| 19da8cab-040d-4f33-ba88-3fdc992ba042 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR04","newRole":"MANAGE` | 2026-09-22 06:02:44.100741 |
| 8abcf5b1-c9fd-44bb-b8e7-6b19d3d1abc3 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-EMP01","newRole":"EMPLOY` | 2026-09-22 06:02:53.458474 |
| d2ecb478-9153-4f72-a866-c4788aba36f2 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"COM-MGR01","newRole":"MANAGE` | 2026-09-22 06:06:07.540448 |
| 8845fdc6-f578-4f07-803f-6f303ffec4bd | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"CAG-MGR01","newRole":"MANAGE` | 2026-09-22 06:06:09.125782 |
| 61709d9b-241c-450a-be86-0b75fa03263c | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR04","newRole":"MANAGE` | 2026-09-22 06:06:10.642504 |
| 492666c7-9128-43df-bab0-1640341e3ddd | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"COM-MGR01","newRole":"MANAGE` | 2026-09-22 06:30:42.178285 |
| 67f11d0c-658d-435b-936b-c52e033aea87 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"1e32f` | 2026-09-22 06:30:57.683341 |
| 2362342a-32ac-4416-8f95-cdd597038c73 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-EMP01","newRole":"EMPLOY` | 2026-09-22 06:31:12.997523 |
| 86c07f8c-25ea-4f95-81d8-f108827a411a | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.emp.179` | 2026-09-22 06:52:16.269697 |
| dc2841c3-9543-4d6f-b9dc-98bb0a39ad63 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.emp.179` | 2026-09-22 06:53:22.465158 |
| 05f5639d-d2b2-40a3-b566-7c0ac176ec83 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.emp.179` | 2026-09-22 06:54:03.699992 |
| 7d6a27e5-abb3-4655-8af6-31779f8c18d0 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"Rahul Verma","employeeId":"28c1` | 2026-09-22 06:54:16.569229 |
| 2844d2e8-a07e-432a-81e9-3203e24919c9 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"ashutoshmish` | 2026-09-22 07:18:11.19324 |
| 5a19819d-cba4-46c2-a51b-93b5a6e915a8 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR04","newRole":"MANAGE` | 2026-09-22 07:19:39.443582 |
| 36ebb5eb-e663-4d84-91f8-9295da538e33 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"Pranshu Dubey","employeeId":"c3` | 2026-09-22 07:22:24.439182 |
| 5fdf7070-85fe-4851-be24-4f696fc1b499 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"ADMIN","email":"dubey.pranshu@g` | 2026-09-22 07:29:59.026697 |
| 50dedae8-0faf-4150-8142-292975becec4 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"67f526b` | 2026-09-22 08:08:12.958958 |
| 36690136-69e9-407c-9e59-7165efa2a724 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.employe` | 2026-09-22 11:23:15.717786 |
| d305fb91-3ae8-4906-87e2-83879741eb36 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR05","newRole":"MANAGE` | 2026-09-22 11:23:18.753763 |
| 5c4226da-291b-49cb-b835-97a0df0b612c | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Vikram Sharma","employeeId":"3b` | 2026-09-22 11:23:35.629296 |
| da94ba0d-480d-4839-83dc-8f1828a9376d | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.employe` | 2026-09-22 11:23:50.117567 |
| 6b0c984a-f447-4b1d-8a44-6b9f03e32dcd | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR05","newRole":"MANAGE` | 2026-09-22 11:23:51.910897 |
| 3067d311-9d80-4a29-8e1b-0c2426a854f3 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Vikram Sharma","employeeId":"7f` | 2026-09-22 11:24:07.086166 |
| 8516742a-89f3-4c84-bc35-434a9b15b851 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"test.employe` | 2026-09-22 11:30:36.692851 |
| 25d73259-f83f-4e0f-b96c-6e5c922fd4aa | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_UPDATED | `{"newCode":"EHM-MGR05","newRole":"MANAGE` | 2026-09-22 11:30:39.410225 |
| fe805bb4-0acb-4807-83b4-5196471f2ad7 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Vikram Sharma","employeeId":"f1` | 2026-09-22 11:30:54.028049 |
| 0f971be1-4d2c-49a8-add7-0f0b71f7a359 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | EMPLOYEE_UPDATED | `{"newCode":"COM-ADM02","newRole":"ADMIN"` | 2026-09-22 15:23:25.819077 |
| 49d0035a-3afa-491c-b0c3-24913bc6a531 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | EMPLOYEE_DELETED | `{"name":"Rahul Verma","employeeId":"d638` | 2026-09-22 15:24:14.269741 |
| 7a710fef-ac52-41ae-b6a5-fee26a487a72 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | EMPLOYEE_DELETED | `{"name":"Rahul Verma","employeeId":"b991` | 2026-09-22 15:24:37.67078 |
| 35fea6a5-85a8-4694-9ec2-7c575b77decc | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | EMPLOYEE_DELETED | `{"name":"Eustace ","employeeId":"462c234` | 2026-09-22 15:25:01.950511 |
| 28631951-5619-408c-91d7-3cda9717e6dc | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 16:49:57.132569 |
| c8822a50-f63d-4280-9881-0a7ca80d0101 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newCode":"COM-ADM03","newRole":"ADMIN"` | 2026-09-22 16:50:08.709719 |
| 4bc09709-ede4-4c20-8472-a3812c312f81 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-22 16:50:23.535325 |
| 38e654b9-f229-45e5-aed3-317973087a77 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_DELETED | `{"name":"ashu ","employeeId":"999abbe5-e` | 2026-09-22 16:50:35.666377 |
| 0a619894-b01f-4dd0-bffd-638bdc796d8e | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"ashutoshmish` | 2026-09-23 05:22:19.551711 |
| 98e62106-9ceb-4510-a061-1ada84a4a8a2 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_CREATED | `{"role":"ADMIN","email":"neha@ehmconsult` | 2026-09-23 06:42:53.757315 |
| 0b0a88b5-8346-4314-8202-5c09d5834d62 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"1e32f27` | 2026-09-23 07:10:36.240803 |
| d4f25d08-204a-481b-b129-0a5470eccdfe | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"newCode":"COM-ADM05","newRole":"ADMIN"` | 2026-09-23 07:12:21.422506 |
| 8e7a7572-ea4d-4e08-9234-8e38484ad603 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"2d18f81` | 2026-09-23 07:12:44.493362 |
| da323bf7-1709-436f-b676-edf8fac17222 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"67f526b` | 2026-09-23 07:40:46.340835 |
| c339bb3d-e778-420a-8245-7750dbe4813e | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"ADMIN","email":"jitendra@ehmcon` | 2026-09-23 09:22:01.137207 |
| adc85298-eddd-4c87-acdf-60da8d6267e3 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"prernashukla` | 2026-09-23 09:23:07.345866 |
| 688b6d00-fc46-435c-b784-b89077982094 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"priyankashar` | 2026-09-23 09:24:20.119819 |
| 82229769-ef34-44f2-af0c-59d5cd8d0b2a | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"shreyanshsil` | 2026-09-23 09:25:17.530164 |
| b044fdf4-26e0-4a82-a895-2df9f7332c7b | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"officialutka` | 2026-09-24 05:48:56.261332 |
| 1b4ec7ad-7ea5-409a-b72e-62dd89806433 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"tarul@ehmcon` | 2026-09-25 17:57:23.34817 |
| cf55b5ae-f963-450d-84d7-19aa56dac9f7 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"neeraj@ehmco` | 2026-09-25 17:58:04.573499 |
| ac6b84b4-50f8-4559-8d82-f7cb811a26ab | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"newRole":"ADMIN","employeeId":"c30c78d` | 2026-09-25 18:40:54.584713 |
| 1d98c163-c151-4e25-b47c-8796def3f359 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"regression.q` | 2026-09-27 19:19:09.206641 |
| 16fb19f7-0995-4888-a1d0-6a935dc728f7 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"employeeId":"0fb0b14d-aa81-4b92-8b8d-7` | 2026-09-27 19:19:15.452143 |
| 9fbad8a5-1be9-4e69-86d2-2dec61ecd44d | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"regression.q` | 2026-09-27 19:20:52.132709 |
| 5fe03427-1c59-46b3-9aae-7cb4324d12aa | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"employeeId":"98f120da-1442-495c-98d4-1` | 2026-09-27 19:20:57.442454 |
| 123e2a3e-8b1f-4240-86b4-2c575b799efd | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"regression.q` | 2026-09-27 19:22:36.627593 |
| 3f4cae53-f078-460a-86d5-6d89635236c8 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"employeeId":"cd81fc76-9699-4f82-adab-3` | 2026-09-27 19:22:40.694716 |
| 53aac173-7ae9-456b-b96e-052dcde0d2f7 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"regression.q` | 2026-09-27 19:25:07.137017 |
| 2bbdf25c-d458-409e-b8a4-d6a6489dfada | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"employeeId":"6b92d4a9-8fea-42a1-ae0d-1` | 2026-09-27 19:25:11.877534 |
| 23754b28-5a6b-4846-8ec9-7098ff6bcbe6 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"regression.q` | 2026-09-27 20:13:58.66231 |
| ff3484d9-a5b5-4af0-857a-c005addb8bb1 | fa0289e6-0109-4228-9f3d-f54b7164773c | EMPLOYEE_UPDATED | `{"employeeId":"e23878a5-f868-46c1-bd68-c` | 2026-09-27 20:14:02.922466 |
| e4ac9da1-01a3-4d8a-94f5-ff7475ad0fe2 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"step2.test.1` | 2026-09-28 09:38:59.813938 |
| 17fe9c45-5ebc-4c5f-bd53-2855ff441eba | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"step2.test.1` | 2026-09-28 09:39:43.167268 |
| c67fcfe8-c68b-43b8-86f2-874d5b146281 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"56b5d` | 2026-09-28 09:39:44.86819 |
| a630438f-0b66-4839-a83b-ec0d16373c0e | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"step2.test.1` | 2026-09-28 09:41:30.997077 |
| 27b1cb10-5a1a-466a-83dd-e57385a987ac | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"bebd6` | 2026-09-28 09:41:32.741786 |
| a803e9e0-ec39-4499-aeb4-6642778b1e22 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"step2.test.1` | 2026-09-28 09:43:24.698585 |
| 9ff5c8dc-51ff-4ea1-800f-4e00362cb43b | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_UPDATED | `{"newRole":"MANAGER","employeeId":"f5f4c` | 2026-09-28 09:43:26.661138 |
| f82ba0d7-7bac-49d4-bb66-4d6b1b72e788 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | EMPLOYEE_DELETED | `{"name":"StepTwo Tester","employeeId":"f` | 2026-09-28 09:43:45.43373 |
| 73ae73b7-e204-481f-9e2a-b737c37c478b | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit_dev_17` | 2026-09-28 09:44:08.222497 |
| 800f29c8-115a-404b-9378-5a4e5d3e1f76 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"audit_mgr_179` | 2026-09-28 09:44:11.16821 |
| a46ad37f-917a-4a95-a817-9573135fdc12 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_UPDATED | `{"employeeId":"c63693a9-31ea-4896-baf2-f` | 2026-09-28 09:44:13.245093 |
| 4788830f-0872-413a-a8c6-2b9162207e2f | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Sarah Connor","employeeId":"c63` | 2026-09-28 09:44:35.925794 |
| 7b3addf0-ece5-4c39-9fd2-76e6f556636b | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Marcus Wright","employeeId":"52` | 2026-09-28 09:44:40.374839 |
| 13d83c34-046c-4954-b633-2c1b5f19fb18 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"EMPLOYEE","email":"audit_dev_17` | 2026-09-28 09:45:59.865145 |
| 0e8c83ae-9eae-433d-9e64-69fa5f897c29 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_CREATED | `{"role":"MANAGER","email":"audit_mgr_179` | 2026-09-28 09:46:02.570432 |
| 42fa386e-d5a5-45db-8312-150953bfbe79 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_UPDATED | `{"employeeId":"fe14f229-9227-41e4-80bc-e` | 2026-09-28 09:46:04.560897 |
| c33611a7-f3c2-4af0-84ff-7e733900b0be | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Sarah Connor","employeeId":"fe1` | 2026-09-28 09:46:26.023131 |
| 73377eec-36e0-4446-8cd9-cf5b13a1f1f2 | fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | EMPLOYEE_DELETED | `{"name":"Marcus Wright","employeeId":"19` | 2026-09-28 09:46:29.503712 |

### Complete Field Data & Records (`audit_logs`)

```json
[
  {
    "id": "29f13ac3-5d36-43ff-8933-9a4d64e3e5f1",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit_dev_1790021292764@example.com",
      "employeeId": "34b07117-236f-462f-a02f-9a2e6a99242a"
    },
    "created_at": "2026-09-21 20:08:15.360596"
  },
  {
    "id": "a4fb3b5f-ee3d-436e-9ae9-7b0375ddcc0e",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "audit_mgr_1790021292764@example.com",
      "employeeId": "917c61b3-12dc-4f6a-afc3-feba3a71eff4"
    },
    "created_at": "2026-09-21 20:08:17.92751"
  },
  {
    "id": "edd851d9-c52e-4467-9f9f-6aa9da73943d",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "34b07117-236f-462f-a02f-9a2e6a99242a",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:08:19.535425"
  },
  {
    "id": "3e135d8f-e3db-494b-8b01-ad57a63b844d",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Sarah Connor",
      "employeeId": "34b07117-236f-462f-a02f-9a2e6a99242a",
      "deletedEmail": "audit_dev_1790021292764@example.com"
    },
    "created_at": "2026-09-21 20:08:35.316567"
  },
  {
    "id": "0b0cf5a1-2165-4383-931b-304609b9a8eb",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit_dev_1790021398686@example.com",
      "employeeId": "e039ea3a-8011-49c6-ac6b-72e32ecf5e9b"
    },
    "created_at": "2026-09-21 20:10:01.144243"
  },
  {
    "id": "50161d5c-680b-4c94-bf9e-c470d107dd86",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "audit_mgr_1790021398686@example.com",
      "employeeId": "e8bc304e-0ecc-4164-b965-d7bcb0c90c8e"
    },
    "created_at": "2026-09-21 20:10:03.384617"
  },
  {
    "id": "6e639ecd-c55a-433f-b08e-92ff9b559cf1",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "e039ea3a-8011-49c6-ac6b-72e32ecf5e9b",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:10:05.044254"
  },
  {
    "id": "8f938e90-29aa-4564-b3f1-37c1304f32c5",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit_dev_1790021465846@example.com",
      "employeeId": "9298a860-ff50-43fd-95bc-3b618d4d0ab7"
    },
    "created_at": "2026-09-21 20:11:08.337305"
  },
  {
    "id": "18febfcc-8a04-40cc-9065-7c039f2a74c3",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "audit_mgr_1790021465846@example.com",
      "employeeId": "f1aec85f-9173-48cd-af70-6f508a7b3621"
    },
    "created_at": "2026-09-21 20:11:10.672585"
  },
  {
    "id": "b248c542-ede4-4883-a2db-178667accde3",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "9298a860-ff50-43fd-95bc-3b618d4d0ab7",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:11:12.332153"
  },
  {
    "id": "05440dde-ebf3-4e81-b353-fc6f4fb3c3d2",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Sarah Connor",
      "employeeId": "9298a860-ff50-43fd-95bc-3b618d4d0ab7",
      "deletedEmail": "audit_dev_1790021465846@example.com"
    },
    "created_at": "2026-09-21 20:11:30.563739"
  },
  {
    "id": "e9e174f7-3658-4fa4-b74d-ab7ed0441aea",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Marcus Wright",
      "employeeId": "f1aec85f-9173-48cd-af70-6f508a7b3621",
      "deletedEmail": "audit_mgr_1790021465846@example.com"
    },
    "created_at": "2026-09-21 20:11:33.803759"
  },
  {
    "id": "32ee2cb4-81f6-47a9-aa0c-4ca1bb749dcd",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "temp.alpha@lifecycle-test.com",
      "employeeId": "2111c5aa-2f28-4c89-8d54-eb25fae9fb52"
    },
    "created_at": "2026-09-21 20:18:37.200679"
  },
  {
    "id": "6d421320-e46f-4724-8778-d95285d6d05a",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "temp.beta@lifecycle-test.com",
      "employeeId": "ea0d78a3-8ffd-4ff8-bc6d-5930609ee276"
    },
    "created_at": "2026-09-21 20:18:39.50091"
  },
  {
    "id": "13015f08-303e-47e1-aa91-6edb9b734fe1",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "2111c5aa-2f28-4c89-8d54-eb25fae9fb52",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:18:40.210724"
  },
  {
    "id": "81728c26-2718-4cbf-a0b4-2cd8d6ae0b94",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "ea0d78a3-8ffd-4ff8-bc6d-5930609ee276",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:18:41.010784"
  },
  {
    "id": "b2fad867-bbf9-4b65-9a79-53fb767d0f45",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Temp Alpha",
      "employeeId": "2111c5aa-2f28-4c89-8d54-eb25fae9fb52",
      "deletedEmail": "temp.alpha@lifecycle-test.com"
    },
    "created_at": "2026-09-21 20:18:44.510208"
  },
  {
    "id": "30d82c02-2f6b-408e-b0be-d72d5b29a55c",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Temp Beta",
      "employeeId": "ea0d78a3-8ffd-4ff8-bc6d-5930609ee276",
      "deletedEmail": "temp.beta@lifecycle-test.com"
    },
    "created_at": "2026-09-21 20:18:47.7901"
  },
  {
    "id": "86ee432e-91a5-4cb3-b5b3-d557e9f837de",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "temp.alpha@lifecycle-test.com",
      "employeeId": "57141114-f3d7-4c6d-83aa-73c4e6081cec"
    },
    "created_at": "2026-09-21 20:19:27.171442"
  },
  {
    "id": "ec1d657b-2087-41a2-83a4-ab0de9fe7f90",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "temp.beta@lifecycle-test.com",
      "employeeId": "d6a492b0-b53c-4e77-9b11-0dbd4c68da8d"
    },
    "created_at": "2026-09-21 20:19:29.521208"
  },
  {
    "id": "098decb9-8995-4140-b146-ddbaf36c105e",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "57141114-f3d7-4c6d-83aa-73c4e6081cec",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:19:30.241547"
  },
  {
    "id": "a946edcc-ceb7-4cc1-93d0-2c9c29ff975d",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "d6a492b0-b53c-4e77-9b11-0dbd4c68da8d",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-21 20:19:30.960891"
  },
  {
    "id": "485f4e18-9491-4fe7-9508-5dd3459c30ab",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Temp Alpha",
      "employeeId": "57141114-f3d7-4c6d-83aa-73c4e6081cec",
      "deletedEmail": "temp.alpha@lifecycle-test.com"
    },
    "created_at": "2026-09-21 20:19:34.450731"
  },
  {
    "id": "6db3403a-efc4-435c-a54d-4397260fc0f4",
    "user_id": "10a8581e-7021-45ce-921c-72c571ef4d49",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Temp Beta",
      "employeeId": "d6a492b0-b53c-4e77-9b11-0dbd4c68da8d",
      "deletedEmail": "temp.beta@lifecycle-test.com"
    },
    "created_at": "2026-09-21 20:19:37.871128"
  },
  {
    "id": "2ac88d4f-c5dc-4e14-a9d2-92646fbb53aa",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "ashutoshmishraup78@gmail.com",
      "employeeId": "16ea6f43-8221-4b0b-8a91-ab3cc539563e"
    },
    "created_at": "2026-09-21 20:38:39.870776"
  },
  {
    "id": "f8c58b5f-94ae-42ce-855f-0a290c00c5bd",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation"
      ]
    },
    "created_at": "2026-09-22 05:20:00.026245"
  },
  {
    "id": "4090c793-0ab5-4768-9d6e-fb87def79f83",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Eustace ",
      "employeeId": "259d9b38-70bc-40fe-9ef4-53b6c5613bb5",
      "deletedEmail": "eustace@climagro.com"
    },
    "created_at": "2026-09-22 05:20:13.207833"
  },
  {
    "id": "891d26c8-3904-4d51-bd77-334ef50e3f28",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation"
      ]
    },
    "created_at": "2026-09-22 05:20:47.117074"
  },
  {
    "id": "da0199ec-7163-435d-90e8-6911e984ecb8",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "ashutoshmishraup78@mpgi.edu.in",
      "employeeId": "141f69ae-4b06-42b1-b868-924c79a2fae9"
    },
    "created_at": "2026-09-22 05:27:18.381885"
  },
  {
    "id": "f4e376a2-bfe1-4c61-a8cc-344ff4ce2636",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation"
      ]
    },
    "created_at": "2026-09-22 05:33:42.038057"
  },
  {
    "id": "ae9be262-d2ed-4f3b-bafe-014006a5c258",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:34:01.57231"
  },
  {
    "id": "51abbdc5-c065-4560-b95c-510c749e069a",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:34:04.04037"
  },
  {
    "id": "fff1b6de-639d-4008-968e-f02e6649b2ea",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit.marketing@ehmconsultancy.com",
      "employeeId": "00c68adf-9a95-494d-a0df-5d9ab819cdc8"
    },
    "created_at": "2026-09-22 05:37:15.155042"
  },
  {
    "id": "9d2f3217-39c9-4186-b87e-df688f462022",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit.finance@ehmconsultancy.com",
      "employeeId": "04ea6f70-94b8-48f7-97e0-e87f9a57362d"
    },
    "created_at": "2026-09-22 05:37:20.111923"
  },
  {
    "id": "7dbe6993-31a8-44c2-9e08-f2475d7bd4bd",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "EMPLOYEE",
      "employeeId": "00c68adf-9a95-494d-a0df-5d9ab819cdc8",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:37:22.58586"
  },
  {
    "id": "1327c7ba-86bf-49b1-8830-e33a5a6280d2",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "AuditTest OperationsLead",
      "employeeId": "00c68adf-9a95-494d-a0df-5d9ab819cdc8",
      "deletedEmail": "audit.marketing@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 05:37:28.414378"
  },
  {
    "id": "a10e1788-c66f-44da-9fe1-a10ebf53a9c8",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "AuditTest FinanceAnalyst",
      "employeeId": "04ea6f70-94b8-48f7-97e0-e87f9a57362d",
      "deletedEmail": "audit.finance@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 05:37:31.810879"
  },
  {
    "id": "b53dc335-75e0-4cca-a198-21ec722d3244",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit.marketing@ehmconsultancy.com",
      "employeeId": "117c22e6-76e4-4bc9-bcf4-999a695ab8a9"
    },
    "created_at": "2026-09-22 05:40:01.997255"
  },
  {
    "id": "9d224dc9-42fd-4971-ada3-d01cb731b89c",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit.finance@ehmconsultancy.com",
      "employeeId": "edad794f-322f-4409-a22d-bef92cceddfc"
    },
    "created_at": "2026-09-22 05:40:05.488142"
  },
  {
    "id": "d31187d1-9a72-4e04-adf2-07a3367c704f",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "EMPLOYEE",
      "employeeId": "117c22e6-76e4-4bc9-bcf4-999a695ab8a9",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:40:07.160202"
  },
  {
    "id": "43cdcc82-d472-456c-be21-c8722d746723",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "AuditTest OperationsLead",
      "employeeId": "117c22e6-76e4-4bc9-bcf4-999a695ab8a9",
      "deletedEmail": "audit.marketing@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 05:40:12.239763"
  },
  {
    "id": "0a380199-8f4a-4274-8da3-9fd457cc14ac",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "AuditTest FinanceAnalyst",
      "employeeId": "edad794f-322f-4409-a22d-bef92cceddfc",
      "deletedEmail": "audit.finance@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 05:40:15.071155"
  },
  {
    "id": "4cf2a804-ab7f-4518-907d-90d24f417bff",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:46:25.231028"
  },
  {
    "id": "bb3c8a8d-8828-4337-b9ba-fea6e57c1a80",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:46:37.425565"
  },
  {
    "id": "9a776513-762b-4d04-9575-9450b55d04c6",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "CAG-MGR01",
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:59:41.825069"
  },
  {
    "id": "2b44bc1f-18ea-43ec-bf9f-0be0c4d085cb",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR07",
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 05:59:43.351661"
  },
  {
    "id": "a8cc51d1-d8c5-4c1c-b74c-d7f7cdf66e38",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:01:45.677018"
  },
  {
    "id": "e18cd980-cad1-4d0f-b646-10255770d2d9",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:02:05.120243"
  },
  {
    "id": "e5f7293a-c46b-4a89-8b08-e0394eb9544b",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:02:35.063404"
  },
  {
    "id": "19da8cab-040d-4f33-ba88-3fdc992ba042",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR04",
      "newRole": "MANAGER",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:02:44.100741"
  },
  {
    "id": "8abcf5b1-c9fd-44bb-b8e7-6b19d3d1abc3",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-EMP01",
      "newRole": "EMPLOYEE",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:02:53.458474"
  },
  {
    "id": "d2ecb478-9153-4f72-a866-c4788aba36f2",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "COM-MGR01",
      "newRole": "MANAGER",
      "employeeId": "c31f714f-eea5-4bd9-afbe-fd7c3b9b0e19",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:06:07.540448"
  },
  {
    "id": "8845fdc6-f578-4f07-803f-6f303ffec4bd",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "CAG-MGR01",
      "newRole": "MANAGER",
      "employeeId": "c31f714f-eea5-4bd9-afbe-fd7c3b9b0e19",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:06:09.125782"
  },
  {
    "id": "61709d9b-241c-450a-be86-0b75fa03263c",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR04",
      "newRole": "MANAGER",
      "employeeId": "c31f714f-eea5-4bd9-afbe-fd7c3b9b0e19",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:06:10.642504"
  },
  {
    "id": "492666c7-9128-43df-bab0-1640341e3ddd",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "COM-MGR01",
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:30:42.178285"
  },
  {
    "id": "67f11d0c-658d-435b-936b-c52e033aea87",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:30:57.683341"
  },
  {
    "id": "2362342a-32ac-4416-8f95-cdd597038c73",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-EMP01",
      "newRole": "EMPLOYEE",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 06:31:12.997523"
  },
  {
    "id": "86c07f8c-25ea-4f95-81d8-f108827a411a",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.emp.1790059932927@ehmconsultancy.com",
      "employeeId": "b9910a93-b0e6-41e9-bc43-38577fb57f10"
    },
    "created_at": "2026-09-22 06:52:16.269697"
  },
  {
    "id": "dc2841c3-9543-4d6f-b9dc-98bb0a39ad63",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.emp.1790059999111@ehmconsultancy.com",
      "employeeId": "d63851f2-9085-42d2-9a14-2b78a9b48767"
    },
    "created_at": "2026-09-22 06:53:22.465158"
  },
  {
    "id": "05f5639d-d2b2-40a3-b566-7c0ac176ec83",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.emp.1790060040401@ehmconsultancy.com",
      "employeeId": "28c15f4d-9789-4d71-8114-9c88aa01f8a7"
    },
    "created_at": "2026-09-22 06:54:03.699992"
  },
  {
    "id": "7d6a27e5-abb3-4655-8af6-31779f8c18d0",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Rahul Verma",
      "employeeId": "28c15f4d-9789-4d71-8114-9c88aa01f8a7",
      "deletedEmail": "test.emp.1790060040401@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 06:54:16.569229"
  },
  {
    "id": "2844d2e8-a07e-432a-81e9-3203e24919c9",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "ashutoshmishraup78@mpgi.edu.in",
      "employeeId": "999abbe5-e14a-49ac-8e35-8aed58f20923"
    },
    "created_at": "2026-09-22 07:18:11.19324"
  },
  {
    "id": "5a19819d-cba4-46c2-a51b-93b5a6e915a8",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR04",
      "newRole": "MANAGER",
      "employeeId": "999abbe5-e14a-49ac-8e35-8aed58f20923",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 07:19:39.443582"
  },
  {
    "id": "36ebb5eb-e663-4d84-91f8-9295da538e33",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Pranshu Dubey",
      "employeeId": "c31f714f-eea5-4bd9-afbe-fd7c3b9b0e19",
      "deletedEmail": "dubey.pranshu@gmail.com"
    },
    "created_at": "2026-09-22 07:22:24.439182"
  },
  {
    "id": "5fdf7070-85fe-4851-be24-4f696fc1b499",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "ADMIN",
      "email": "dubey.pranshu@gmail.com",
      "employeeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    },
    "created_at": "2026-09-22 07:29:59.026697"
  },
  {
    "id": "50dedae8-0faf-4150-8142-292975becec4",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 08:08:12.958958"
  },
  {
    "id": "36690136-69e9-407c-9e59-7165efa2a724",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.employee.1790076193822@example.com",
      "employeeId": "3b05440a-accc-4981-8715-1f0289a05116"
    },
    "created_at": "2026-09-22 11:23:15.717786"
  },
  {
    "id": "d305fb91-3ae8-4906-87e2-83879741eb36",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR05",
      "newRole": "MANAGER",
      "employeeId": "3b05440a-accc-4981-8715-1f0289a05116",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "employeeCode"
      ]
    },
    "created_at": "2026-09-22 11:23:18.753763"
  },
  {
    "id": "5c4226da-291b-49cb-b835-97a0df0b612c",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Vikram Sharma",
      "employeeId": "3b05440a-accc-4981-8715-1f0289a05116",
      "deletedEmail": "test.employee.1790076193822@example.com"
    },
    "created_at": "2026-09-22 11:23:35.629296"
  },
  {
    "id": "da94ba0d-480d-4839-83dc-8f1828a9376d",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.employee.1790076228152@example.com",
      "employeeId": "7fa5984f-83ab-4cd3-9b7a-0465ee6e1aab"
    },
    "created_at": "2026-09-22 11:23:50.117567"
  },
  {
    "id": "6b0c984a-f447-4b1d-8a44-6b9f03e32dcd",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR05",
      "newRole": "MANAGER",
      "employeeId": "7fa5984f-83ab-4cd3-9b7a-0465ee6e1aab",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "employeeCode"
      ]
    },
    "created_at": "2026-09-22 11:23:51.910897"
  },
  {
    "id": "3067d311-9d80-4a29-8e1b-0c2426a854f3",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Vikram Sharma",
      "employeeId": "7fa5984f-83ab-4cd3-9b7a-0465ee6e1aab",
      "deletedEmail": "test.employee.1790076228152@example.com"
    },
    "created_at": "2026-09-22 11:24:07.086166"
  },
  {
    "id": "8516742a-89f3-4c84-bc35-434a9b15b851",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "test.employee.1790076634781@example.com",
      "employeeId": "f19764dc-2484-442b-bb58-1538fe01cdfe"
    },
    "created_at": "2026-09-22 11:30:36.692851"
  },
  {
    "id": "25d73259-f83f-4e0f-b96c-6e5c922fd4aa",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "EHM-MGR05",
      "newRole": "MANAGER",
      "employeeId": "f19764dc-2484-442b-bb58-1538fe01cdfe",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "designation",
        "employeeCode"
      ]
    },
    "created_at": "2026-09-22 11:30:39.410225"
  },
  {
    "id": "fe805bb4-0acb-4807-83b4-5196471f2ad7",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Vikram Sharma",
      "employeeId": "f19764dc-2484-442b-bb58-1538fe01cdfe",
      "deletedEmail": "test.employee.1790076634781@example.com"
    },
    "created_at": "2026-09-22 11:30:54.028049"
  },
  {
    "id": "0f971be1-4d2c-49a8-add7-0f0b71f7a359",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "COM-ADM02",
      "newRole": "ADMIN",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 15:23:25.819077"
  },
  {
    "id": "49d0035a-3afa-491c-b0c3-24913bc6a531",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Rahul Verma",
      "employeeId": "d63851f2-9085-42d2-9a14-2b78a9b48767",
      "deletedEmail": "test.emp.1790059999111@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 15:24:14.269741"
  },
  {
    "id": "7a710fef-ac52-41ae-b6a5-fee26a487a72",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Rahul Verma",
      "employeeId": "b9910a93-b0e6-41e9-bc43-38577fb57f10",
      "deletedEmail": "test.emp.1790059932927@ehmconsultancy.com"
    },
    "created_at": "2026-09-22 15:24:37.67078"
  },
  {
    "id": "35fea6a5-85a8-4694-9ec2-7c575b77decc",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Eustace ",
      "employeeId": "462c2349-e7a9-487d-90a8-6105376c8c7f",
      "deletedEmail": "eustace@climagro.com"
    },
    "created_at": "2026-09-22 15:25:01.950511"
  },
  {
    "id": "28631951-5619-408c-91d7-3cda9717e6dc",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 16:49:57.132569"
  },
  {
    "id": "c8822a50-f63d-4280-9881-0a7ca80d0101",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "COM-ADM03",
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 16:50:08.709719"
  },
  {
    "id": "4bc09709-ede4-4c20-8472-a3812c312f81",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-22 16:50:23.535325"
  },
  {
    "id": "38e654b9-f229-45e5-aed3-317973087a77",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "ashu ",
      "employeeId": "999abbe5-e14a-49ac-8e35-8aed58f20923",
      "deletedEmail": "ashutoshmishraup78@mpgi.edu.in"
    },
    "created_at": "2026-09-22 16:50:35.666377"
  },
  {
    "id": "0a619894-b01f-4dd0-bffd-638bdc796d8e",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "ashutoshmishraup78@mpgi.edu.in",
      "employeeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d"
    },
    "created_at": "2026-09-23 05:22:19.551711"
  },
  {
    "id": "98e62106-9ceb-4510-a061-1ada84a4a8a2",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "ADMIN",
      "email": "neha@ehmconsultancy.co.in",
      "employeeId": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e"
    },
    "created_at": "2026-09-23 06:42:53.757315"
  },
  {
    "id": "0b0a88b5-8346-4314-8202-5c09d5834d62",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-23 07:10:36.240803"
  },
  {
    "id": "d4f25d08-204a-481b-b129-0a5470eccdfe",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newCode": "COM-ADM05",
      "newRole": "ADMIN",
      "employeeId": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "employeeCode",
        "departmentId"
      ]
    },
    "created_at": "2026-09-23 07:12:21.422506"
  },
  {
    "id": "8e7a7572-ea4d-4e08-9234-8e38484ad603",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-23 07:12:44.493362"
  },
  {
    "id": "da323bf7-1709-436f-b676-edf8fac17222",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-23 07:40:46.340835"
  },
  {
    "id": "c339bb3d-e778-420a-8245-7750dbe4813e",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "ADMIN",
      "email": "jitendra@ehmconsultancy.co.in",
      "employeeId": "62785b3e-f538-4618-a412-436f3c3408f1"
    },
    "created_at": "2026-09-23 09:22:01.137207"
  },
  {
    "id": "adc85298-eddd-4c87-acdf-60da8d6267e3",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "prernashukla566@gmail.com",
      "employeeId": "650517a8-f325-4586-ba41-04b4cdf883de"
    },
    "created_at": "2026-09-23 09:23:07.345866"
  },
  {
    "id": "688b6d00-fc46-435c-b784-b89077982094",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "priyankasharma121202@gmail.com",
      "employeeId": "d3a231fa-5d33-4249-a17d-102765de4e09"
    },
    "created_at": "2026-09-23 09:24:20.119819"
  },
  {
    "id": "82229769-ef34-44f2-af0c-59d5cd8d0b2a",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "shreyanshsiladar@gmail.com",
      "employeeId": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d"
    },
    "created_at": "2026-09-23 09:25:17.530164"
  },
  {
    "id": "b044fdf4-26e0-4a82-a895-2df9f7332c7b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "officialutkarshmishra01@gmail.com",
      "employeeId": "5b817f5a-04bd-4118-9f73-48130750007d"
    },
    "created_at": "2026-09-24 05:48:56.261332"
  },
  {
    "id": "1b4ec7ad-7ea5-409a-b72e-62dd89806433",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "tarul@ehmconsultancy.co.in",
      "employeeId": "e80c26a6-0696-45e5-857f-540ff91058b3"
    },
    "created_at": "2026-09-25 17:57:23.34817"
  },
  {
    "id": "cf55b5ae-f963-450d-84d7-19aa56dac9f7",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "neeraj@ehmconsultancy.co.in",
      "employeeId": "05197216-bf53-4a63-99ac-a9aa60174257"
    },
    "created_at": "2026-09-25 17:58:04.573499"
  },
  {
    "id": "ac6b84b4-50f8-4559-8d82-f7cb811a26ab",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "ADMIN",
      "employeeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-25 18:40:54.584713"
  },
  {
    "id": "1d98c163-c151-4e25-b47c-8796def3f359",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "regression.qa.1790536746821@ehmconsultancy.co.in",
      "employeeId": "0fb0b14d-aa81-4b92-8b8d-79ea209eecff"
    },
    "created_at": "2026-09-27 19:19:09.206641"
  },
  {
    "id": "16fb19f7-0995-4888-a1d0-6a935dc728f7",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "0fb0b14d-aa81-4b92-8b8d-79ea209eecff",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-27 19:19:15.452143"
  },
  {
    "id": "9fbad8a5-1be9-4e69-86d2-2dec61ecd44d",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "regression.qa.1790536849790@ehmconsultancy.co.in",
      "employeeId": "98f120da-1442-495c-98d4-1b190cfa0b3c"
    },
    "created_at": "2026-09-27 19:20:52.132709"
  },
  {
    "id": "5fe03427-1c59-46b3-9aae-7cb4324d12aa",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "98f120da-1442-495c-98d4-1b190cfa0b3c",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-27 19:20:57.442454"
  },
  {
    "id": "123e2a3e-8b1f-4240-86b4-2c575b799efd",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "regression.qa.1790536954216@ehmconsultancy.co.in",
      "employeeId": "cd81fc76-9699-4f82-adab-35aa0ff9a001"
    },
    "created_at": "2026-09-27 19:22:36.627593"
  },
  {
    "id": "3f4cae53-f078-460a-86d5-6d89635236c8",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "cd81fc76-9699-4f82-adab-35aa0ff9a001",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-27 19:22:40.694716"
  },
  {
    "id": "53aac173-7ae9-456b-b96e-052dcde0d2f7",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "regression.qa.1790537104607@ehmconsultancy.co.in",
      "employeeId": "6b92d4a9-8fea-42a1-ae0d-1738ab6a7999"
    },
    "created_at": "2026-09-27 19:25:07.137017"
  },
  {
    "id": "2bbdf25c-d458-409e-b8a4-d6a6489dfada",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "6b92d4a9-8fea-42a1-ae0d-1738ab6a7999",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-27 19:25:11.877534"
  },
  {
    "id": "23754b28-5a6b-4846-8ec9-7098ff6bcbe6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "regression.qa.1790540036207@ehmconsultancy.co.in",
      "employeeId": "e23878a5-f868-46c1-bd68-c914d51e1e23"
    },
    "created_at": "2026-09-27 20:13:58.66231"
  },
  {
    "id": "ff3484d9-a5b5-4af0-857a-c005addb8bb1",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "e23878a5-f868-46c1-bd68-c914d51e1e23",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-27 20:14:02.922466"
  },
  {
    "id": "e4ac9da1-01a3-4d8a-94f5-ff7475ad0fe2",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "step2.test.1790588338546@example.com",
      "employeeId": "a4d9ddb7-a38e-4d6b-a0d3-a5ce28a1915b"
    },
    "created_at": "2026-09-28 09:38:59.813938"
  },
  {
    "id": "17fe9c45-5ebc-4c5f-bd53-2855ff441eba",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "step2.test.1790588381871@example.com",
      "employeeId": "56b5d2fb-3a4d-488c-8773-46a6a9dd6069"
    },
    "created_at": "2026-09-28 09:39:43.167268"
  },
  {
    "id": "c67fcfe8-c68b-43b8-86f2-874d5b146281",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "56b5d2fb-3a4d-488c-8773-46a6a9dd6069",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-28 09:39:44.86819"
  },
  {
    "id": "a630438f-0b66-4839-a83b-ec0d16373c0e",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "step2.test.1790588489865@example.com",
      "employeeId": "bebd620c-9006-4979-94d7-6d4fe6a3e3a2"
    },
    "created_at": "2026-09-28 09:41:30.997077"
  },
  {
    "id": "27b1cb10-5a1a-466a-83dd-e57385a987ac",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "bebd620c-9006-4979-94d7-6d4fe6a3e3a2",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-28 09:41:32.741786"
  },
  {
    "id": "a803e9e0-ec39-4499-aeb4-6642778b1e22",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "step2.test.1790588603613@example.com",
      "employeeId": "f5f4c943-bd5e-49fa-9c51-210c43317218"
    },
    "created_at": "2026-09-28 09:43:24.698585"
  },
  {
    "id": "9ff5c8dc-51ff-4ea1-800f-4e00362cb43b",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "newRole": "MANAGER",
      "employeeId": "f5f4c943-bd5e-49fa-9c51-210c43317218",
      "updatedFields": [
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "designation",
        "entityId",
        "departmentId"
      ]
    },
    "created_at": "2026-09-28 09:43:26.661138"
  },
  {
    "id": "f82ba0d7-7bac-49d4-bb66-4d6b1b72e788",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "StepTwo Tester",
      "employeeId": "f5f4c943-bd5e-49fa-9c51-210c43317218",
      "deletedEmail": "step2.test.1790588603613@example.com"
    },
    "created_at": "2026-09-28 09:43:45.43373"
  },
  {
    "id": "73ae73b7-e204-481f-9e2a-b737c37c478b",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit_dev_1790588647156@example.com",
      "employeeId": "c63693a9-31ea-4896-baf2-f78bcebd099a"
    },
    "created_at": "2026-09-28 09:44:08.222497"
  },
  {
    "id": "800f29c8-115a-404b-9378-5a4e5d3e1f76",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "audit_mgr_1790588647156@example.com",
      "employeeId": "522c31cd-a505-4c72-8117-48fe0cb551ac"
    },
    "created_at": "2026-09-28 09:44:11.16821"
  },
  {
    "id": "a46ad37f-917a-4a95-a817-9573135fdc12",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "c63693a9-31ea-4896-baf2-f78bcebd099a",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-28 09:44:13.245093"
  },
  {
    "id": "4788830f-0872-413a-a8c6-2b9162207e2f",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Sarah Connor",
      "employeeId": "c63693a9-31ea-4896-baf2-f78bcebd099a",
      "deletedEmail": "audit_dev_1790588647156@example.com"
    },
    "created_at": "2026-09-28 09:44:35.925794"
  },
  {
    "id": "7b3addf0-ece5-4c39-9fd2-76e6f556636b",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Marcus Wright",
      "employeeId": "522c31cd-a505-4c72-8117-48fe0cb551ac",
      "deletedEmail": "audit_mgr_1790588647156@example.com"
    },
    "created_at": "2026-09-28 09:44:40.374839"
  },
  {
    "id": "13d83c34-046c-4954-b633-2c1b5f19fb18",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "EMPLOYEE",
      "email": "audit_dev_1790588758917@example.com",
      "employeeId": "fe14f229-9227-41e4-80bc-ef8d7a9634ec"
    },
    "created_at": "2026-09-28 09:45:59.865145"
  },
  {
    "id": "0e8c83ae-9eae-433d-9e64-69fa5f897c29",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_CREATED",
    "details": {
      "role": "MANAGER",
      "email": "audit_mgr_1790588758917@example.com",
      "employeeId": "19fbc17d-3e19-4e4b-81ce-daf19343d3cb"
    },
    "created_at": "2026-09-28 09:46:02.570432"
  },
  {
    "id": "42fa386e-d5a5-45db-8312-150953bfbe79",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_UPDATED",
    "details": {
      "employeeId": "fe14f229-9227-41e4-80bc-ef8d7a9634ec",
      "updatedFields": [
        "updatedAt",
        "designation"
      ]
    },
    "created_at": "2026-09-28 09:46:04.560897"
  },
  {
    "id": "c33611a7-f3c2-4af0-84ff-7e733900b0be",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Sarah Connor",
      "employeeId": "fe14f229-9227-41e4-80bc-ef8d7a9634ec",
      "deletedEmail": "audit_dev_1790588758917@example.com"
    },
    "created_at": "2026-09-28 09:46:26.023131"
  },
  {
    "id": "73377eec-36e0-4446-8cd9-cf5b13a1f1f2",
    "user_id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "action": "EMPLOYEE_DELETED",
    "details": {
      "name": "Marcus Wright",
      "employeeId": "19fbc17d-3e19-4e4b-81ce-daf19343d3cb",
      "deletedEmail": "audit_mgr_1790588758917@example.com"
    },
    "created_at": "2026-09-28 09:46:29.503712"
  }
]
```

---

## 📋 Table: `departments` (16 records)

### Formatted View Preview

| id | entity_id | name | code | created_at |
| --- | --- | --- | --- | --- |
| 2436bb36-d261-4079-a855-8b92497368b1 | 886d7680-6a7c-482e-ae61-159ec359f881 | Human Resources | HR | 2026-09-01 08:40:39.790475 |
| 2203df97-4835-4a95-8fc4-37362392aa23 | 886d7680-6a7c-482e-ae61-159ec359f881 | Finance | FIN | 2026-09-01 08:40:40.07479 |
| d69d24bf-7038-4843-a7c0-1972f4e82e1c | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Human Resources | HR | 2026-09-01 08:40:41.214583 |
| 87df7569-f657-40f7-8074-71ed2694859b | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Finance | FIN | 2026-09-01 08:40:41.498776 |
| e3cdb5e9-74df-45af-8655-9b40491bf1a0 | 886d7680-6a7c-482e-ae61-159ec359f881 | Marketing | MAR | 2026-09-01 08:40:38.936861 |
| c5180e07-fb28-422c-997c-d33a19211aca | 886d7680-6a7c-482e-ae61-159ec359f881 | Sales | SAL | 2026-09-22 05:59:18.581146 |
| 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 | 886d7680-6a7c-482e-ae61-159ec359f881 | Product & Tech | TEC | 2026-09-22 05:59:19.092999 |
| 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 | 886d7680-6a7c-482e-ae61-159ec359f881 | Operations & Delivery | OPS | 2026-09-01 08:40:39.506372 |
| 3a34fcb3-d4b9-4869-84f3-ad28d910f3c9 | 886d7680-6a7c-482e-ae61-159ec359f881 | Grants & Governance | GOV | 2026-09-22 05:59:20.060363 |
| ccc68307-124b-4949-bc03-5769202b23e8 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Marketing | MAR | 2026-09-01 08:40:40.362696 |
| 6dc0facd-88f9-4803-b24c-0f63141455c6 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Sales | SAL | 2026-09-22 05:59:20.864593 |
| 12b0bf2d-8afa-454a-b01a-59c9ceebd280 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Product & Tech | TEC | 2026-09-22 05:59:21.351482 |
| 512dd38f-d56d-42cf-bb44-0ab3949b4524 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Operations & Delivery | OPS | 2026-09-01 08:40:40.930061 |
| 9920fd9f-8981-4851-9710-6e00ea1c323e | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Grants & Governance | GOV | 2026-09-22 05:59:22.322539 |
| baf535d2-ad04-4489-9508-fa13a7eb5e75 | 886d7680-6a7c-482e-ae61-159ec359f881 | Product & Tech | TEC | 2026-09-01 08:40:39.222439 |
| dca5b2f3-f7b0-4caf-bf8c-6fc29e936017 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Product & Tech | TEC | 2026-09-01 08:40:40.646542 |

### Complete Field Data & Records (`departments`)

```json
[
  {
    "id": "2436bb36-d261-4079-a855-8b92497368b1",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Human Resources",
    "code": "HR",
    "created_at": "2026-09-01 08:40:39.790475"
  },
  {
    "id": "2203df97-4835-4a95-8fc4-37362392aa23",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Finance",
    "code": "FIN",
    "created_at": "2026-09-01 08:40:40.07479"
  },
  {
    "id": "d69d24bf-7038-4843-a7c0-1972f4e82e1c",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Human Resources",
    "code": "HR",
    "created_at": "2026-09-01 08:40:41.214583"
  },
  {
    "id": "87df7569-f657-40f7-8074-71ed2694859b",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Finance",
    "code": "FIN",
    "created_at": "2026-09-01 08:40:41.498776"
  },
  {
    "id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Marketing",
    "code": "MAR",
    "created_at": "2026-09-01 08:40:38.936861"
  },
  {
    "id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Sales",
    "code": "SAL",
    "created_at": "2026-09-22 05:59:18.581146"
  },
  {
    "id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Product & Tech",
    "code": "TEC",
    "created_at": "2026-09-22 05:59:19.092999"
  },
  {
    "id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Operations & Delivery",
    "code": "OPS",
    "created_at": "2026-09-01 08:40:39.506372"
  },
  {
    "id": "3a34fcb3-d4b9-4869-84f3-ad28d910f3c9",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Grants & Governance",
    "code": "GOV",
    "created_at": "2026-09-22 05:59:20.060363"
  },
  {
    "id": "ccc68307-124b-4949-bc03-5769202b23e8",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Marketing",
    "code": "MAR",
    "created_at": "2026-09-01 08:40:40.362696"
  },
  {
    "id": "6dc0facd-88f9-4803-b24c-0f63141455c6",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Sales",
    "code": "SAL",
    "created_at": "2026-09-22 05:59:20.864593"
  },
  {
    "id": "12b0bf2d-8afa-454a-b01a-59c9ceebd280",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Product & Tech",
    "code": "TEC",
    "created_at": "2026-09-22 05:59:21.351482"
  },
  {
    "id": "512dd38f-d56d-42cf-bb44-0ab3949b4524",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Operations & Delivery",
    "code": "OPS",
    "created_at": "2026-09-01 08:40:40.930061"
  },
  {
    "id": "9920fd9f-8981-4851-9710-6e00ea1c323e",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Grants & Governance",
    "code": "GOV",
    "created_at": "2026-09-22 05:59:22.322539"
  },
  {
    "id": "baf535d2-ad04-4489-9508-fa13a7eb5e75",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "name": "Product & Tech",
    "code": "TEC",
    "created_at": "2026-09-01 08:40:39.222439"
  },
  {
    "id": "dca5b2f3-f7b0-4caf-bf8c-6fc29e936017",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "name": "Product & Tech",
    "code": "TEC",
    "created_at": "2026-09-01 08:40:40.646542"
  }
]
```

---

## 📋 Table: `employee_code_history` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `employees` (13 records)

### Formatted View Preview

| id | employee_code | task_seq_counter | first_name | last_name | email | entity_id | department_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 67f526ba-afcf-4ec0-bf41-da1468bfb816 | ADMN0004 | 0 | Pranshu | Mohan | dubey.pranshu@gmail.com | 539ba160-88b8-4fdd-a5ef-39c09c97516a | c5180e07-fb28-422c-997c-d33a19211aca |
| c30c78d7-9398-4517-a54a-64005b90d555 | ADMN0001 | 0 | Ashutosh | Mishra | ashutoshmishraup78@gmail.com | 539ba160-88b8-4fdd-a5ef-39c09c97516a | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 |
| 1e32f27a-d641-40ff-923c-05fef4836c10 | ADMN0002 | 0 | Harshit | Mishra | harshit@ehmconsultancy.co.in | 539ba160-88b8-4fdd-a5ef-39c09c97516a | c5180e07-fb28-422c-997c-d33a19211aca |
| a9918b75-cba5-46e9-8bee-e9c536a331cc | ADMN0003 | 0 | Utsav | Mishra | utsav@ehmconsultancy.co.in | 539ba160-88b8-4fdd-a5ef-39c09c97516a | 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 |
| 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | ADMN0005 | 0 | Neha | Shukla | neha@ehmconsultancy.co.in | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 |
| 62785b3e-f538-4618-a412-436f3c3408f1 | ADMN0006 | 0 | Jitendra | Singh | jitendra@ehmconsultancy.co.in | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 |
| e6efb986-4f3d-40ac-bfe7-120fbd9d022d | TEAM0001 | 0 | tester |  | ashutoshmishraup78@mpgi.edu.in | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 |
| 650517a8-f325-4586-ba41-04b4cdf883de | TEAM0002 | 0 | Prerna | Shukla | prernashukla566@gmail.com | ebbf77f7-c1ac-423d-a29d-8db50beac25f | e3cdb5e9-74df-45af-8655-9b40491bf1a0 |
| d3a231fa-5d33-4249-a17d-102765de4e09 | TEAM0003 | 0 | Priyanka | Sharma | priyankasharma121202@gmail.com | 886d7680-6a7c-482e-ae61-159ec359f881 | e3cdb5e9-74df-45af-8655-9b40491bf1a0 |
| bb54d7bc-fbf4-42f9-be0a-2fc090260d7d | TEAM0004 | 0 | Shreyansh | Siladar | shreyanshsiladar@gmail.com | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 |
| 5b817f5a-04bd-4118-9f73-48130750007d | TEAM0005 | 0 | Utkarsh | Mishra | officialutkarshmishra01@gmail.com | 886d7680-6a7c-482e-ae61-159ec359f881 | c5180e07-fb28-422c-997c-d33a19211aca |
| e80c26a6-0696-45e5-857f-540ff91058b3 | TEAM0006 | 0 | Tarul | Sharma | tarul@ehmconsultancy.co.in | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 |
| 05197216-bf53-4a63-99ac-a9aa60174257 | TEAM0007 | 0 | Neeraj | Bapna | neeraj@ehmconsultancy.co.in | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 |

### Complete Field Data & Records (`employees`)

```json
[
  {
    "id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "employee_code": "ADMN0004",
    "task_seq_counter": 0,
    "first_name": "Pranshu",
    "last_name": "Mohan",
    "email": "dubey.pranshu@gmail.com",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "designation": "leadship",
    "salary": null,
    "joining_date": "2026-09-22 07:29:58.047",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-22 07:29:57.540938",
    "updated_at": "2026-09-28 11:30:08.113",
    "phone": "+91 8341815615"
  },
  {
    "id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "employee_code": "ADMN0001",
    "task_seq_counter": 0,
    "first_name": "Ashutosh",
    "last_name": "Mishra",
    "email": "ashutoshmishraup78@gmail.com",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "designation": "employee",
    "salary": "150000.00",
    "joining_date": "2026-01-01 00:00:00",
    "status": "ACTIVE",
    "avatar_url": null,
    "created_at": "2026-09-15 09:56:28.869631",
    "updated_at": "2026-09-25 18:40:54.028",
    "phone": "9696462647"
  },
  {
    "id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "employee_code": "ADMN0002",
    "task_seq_counter": 0,
    "first_name": "Harshit",
    "last_name": "Mishra",
    "email": "harshit@ehmconsultancy.co.in",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "designation": "Leadership",
    "salary": "85000.00",
    "joining_date": "2026-01-01 00:00:00",
    "status": "ACTIVE",
    "avatar_url": null,
    "created_at": "2026-09-21 05:17:14.058049",
    "updated_at": "2026-09-24 08:17:14.402",
    "phone": ""
  },
  {
    "id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "employee_code": "ADMN0003",
    "task_seq_counter": 0,
    "first_name": "Utsav",
    "last_name": "Mishra",
    "email": "utsav@ehmconsultancy.co.in",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "designation": "Leadership",
    "salary": null,
    "joining_date": "2026-01-01 00:00:00",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-21 20:29:17.701256",
    "updated_at": "2026-09-23 07:12:20.839",
    "phone": null
  },
  {
    "id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "employee_code": "ADMN0005",
    "task_seq_counter": 0,
    "first_name": "Neha",
    "last_name": "Shukla",
    "email": "neha@ehmconsultancy.co.in",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "designation": "Leadership",
    "salary": null,
    "joining_date": "2026-09-23 06:42:52.621",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 06:42:52.086039",
    "updated_at": "2026-09-23 07:12:44",
    "phone": null
  },
  {
    "id": "62785b3e-f538-4618-a412-436f3c3408f1",
    "employee_code": "ADMN0006",
    "task_seq_counter": 0,
    "first_name": "Jitendra",
    "last_name": "Singh",
    "email": "jitendra@ehmconsultancy.co.in",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "designation": "Leadership",
    "salary": null,
    "joining_date": "2026-09-23 09:21:59.993",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 09:21:59.433128",
    "updated_at": "2026-09-23 09:21:59.433128",
    "phone": null
  },
  {
    "id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "employee_code": "TEAM0001",
    "task_seq_counter": 0,
    "first_name": "tester",
    "last_name": "",
    "email": "ashutoshmishraup78@mpgi.edu.in",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "designation": "tester ",
    "salary": null,
    "joining_date": "2026-09-23 05:22:18.432",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 05:22:17.887386",
    "updated_at": "2026-09-23 05:22:17.887386",
    "phone": null
  },
  {
    "id": "650517a8-f325-4586-ba41-04b4cdf883de",
    "employee_code": "TEAM0002",
    "task_seq_counter": 0,
    "first_name": "Prerna",
    "last_name": "Shukla",
    "email": "prernashukla566@gmail.com",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-23 09:23:06.462",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 09:23:05.899812",
    "updated_at": "2026-09-23 09:23:05.899812",
    "phone": null
  },
  {
    "id": "d3a231fa-5d33-4249-a17d-102765de4e09",
    "employee_code": "TEAM0003",
    "task_seq_counter": 0,
    "first_name": "Priyanka",
    "last_name": "Sharma",
    "email": "priyankasharma121202@gmail.com",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-23 09:24:19.241",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 09:24:18.71322",
    "updated_at": "2026-09-23 09:24:18.71322",
    "phone": null
  },
  {
    "id": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
    "employee_code": "TEAM0004",
    "task_seq_counter": 0,
    "first_name": "Shreyansh",
    "last_name": "Siladar",
    "email": "shreyanshsiladar@gmail.com",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-23 09:25:16.583",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-23 09:25:16.050851",
    "updated_at": "2026-09-23 09:25:16.050851",
    "phone": null
  },
  {
    "id": "5b817f5a-04bd-4118-9f73-48130750007d",
    "employee_code": "TEAM0005",
    "task_seq_counter": 0,
    "first_name": "Utkarsh",
    "last_name": "Mishra",
    "email": "officialutkarshmishra01@gmail.com",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-24 05:48:55.33",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-24 05:48:54.749932",
    "updated_at": "2026-09-24 05:48:54.749932",
    "phone": null
  },
  {
    "id": "e80c26a6-0696-45e5-857f-540ff91058b3",
    "employee_code": "TEAM0006",
    "task_seq_counter": 0,
    "first_name": "Tarul",
    "last_name": "Sharma",
    "email": "tarul@ehmconsultancy.co.in",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-25 17:57:22.432",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-25 17:57:21.852555",
    "updated_at": "2026-09-25 17:57:21.852555",
    "phone": null
  },
  {
    "id": "05197216-bf53-4a63-99ac-a9aa60174257",
    "employee_code": "TEAM0007",
    "task_seq_counter": 0,
    "first_name": "Neeraj",
    "last_name": "Bapna",
    "email": "neeraj@ehmconsultancy.co.in",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "designation": "Specialist",
    "salary": null,
    "joining_date": "2026-09-25 17:58:03.614",
    "status": "ACTIVE",
    "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "created_at": "2026-09-25 17:58:03.043547",
    "updated_at": "2026-09-25 17:58:03.043547",
    "phone": null
  }
]
```

---

## 📋 Table: `entities` (3 records)

### Formatted View Preview

| id | code | name | created_at |
| --- | --- | --- | --- |
| 886d7680-6a7c-482e-ae61-159ec359f881 | EHM | EHM Consultancy | 2026-09-01 08:40:37.794584 |
| ebbf77f7-c1ac-423d-a29d-8db50beac25f | CAG | Climagro Analytics | 2026-09-01 08:40:38.36828 |
| 539ba160-88b8-4fdd-a5ef-39c09c97516a | COMMON | EHM & CLIMAGRO (COMMON) | 2026-09-22 06:06:06.454955 |

### Complete Field Data & Records (`entities`)

```json
[
  {
    "id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "code": "EHM",
    "name": "EHM Consultancy",
    "created_at": "2026-09-01 08:40:37.794584"
  },
  {
    "id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "code": "CAG",
    "name": "Climagro Analytics",
    "created_at": "2026-09-01 08:40:38.36828"
  },
  {
    "id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "code": "COMMON",
    "name": "EHM & CLIMAGRO (COMMON)",
    "created_at": "2026-09-22 06:06:06.454955"
  }
]
```

---

## 📋 Table: `entity_counters` (3 records)

### Formatted View Preview

| entity_id | next_employee_seq | next_initiative_seq | next_epic_seq | next_sprint_seq | next_backlog_task_seq |
| --- | --- | --- | --- | --- | --- |
| ebbf77f7-c1ac-423d-a29d-8db50beac25f | 4 | 15 | 10 | 3 | 2 |
| 539ba160-88b8-4fdd-a5ef-39c09c97516a | 3 | 1 | 1 | 13 | 14 |
| 886d7680-6a7c-482e-ae61-159ec359f881 | 7 | 17 | 19 | 18 | 8 |

### Complete Field Data & Records (`entity_counters`)

```json
[
  {
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "next_employee_seq": 4,
    "next_initiative_seq": 15,
    "next_epic_seq": 10,
    "next_sprint_seq": 3,
    "next_backlog_task_seq": 2
  },
  {
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "next_employee_seq": 3,
    "next_initiative_seq": 1,
    "next_epic_seq": 1,
    "next_sprint_seq": 13,
    "next_backlog_task_seq": 14
  },
  {
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "next_employee_seq": 7,
    "next_initiative_seq": 17,
    "next_epic_seq": 19,
    "next_sprint_seq": 18,
    "next_backlog_task_seq": 8
  }
]
```

---

## 📋 Table: `epics` (9 records)

### Formatted View Preview

| id | epic_code | title | description | initiative_id | entity_id | status | owner_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1ad8c4c9-43eb-43c2-98b3-9f9242b8c243 | EHM-I16-EP18 | Webinar #1 | Regular Monthly webinar series from our Ex... | aa0d52da-81ba-4437-947f-5ef49cef6546 | 886d7680-6a7c-482e-ae61-159ec359f881 | PLANNED | *null* |
| 4c0dc5be-4780-4940-9877-81dfe0a7b3bf | EPIC0001 | Onboarding Farmer |  | 5a1a0972-fca8-4e26-b647-7a2317af914c | ebbf77f7-c1ac-423d-a29d-8db50beac25f | IN_PROGRESS | *null* |
| 7ac7b3b9-30a1-4a5c-8616-d1a9211927c1 | EPIC0002 | Update CCF Milestone Tracker | Keep CCF's tracker current; notify CCF of ... | 6c199e80-9d32-481f-8bf6-5545190174db | ebbf77f7-c1ac-423d-a29d-8db50beac25f | PLANNED | *null* |
| 2171c90d-838a-43cb-8778-8e17965a4d3d | EPIC0003 | Milestones (all) completion | Deliver all five contract milestones: data... | 6c199e80-9d32-481f-8bf6-5545190174db | ebbf77f7-c1ac-423d-a29d-8db50beac25f | PLANNED | *null* |
| 1cf6c181-50ee-498c-886a-49d075dcc3c5 | EPIC0004 | Reporting and closing | Updates shared to CCF, including catching ... | 6c199e80-9d32-481f-8bf6-5545190174db | ebbf77f7-c1ac-423d-a29d-8db50beac25f | PLANNED | *null* |
| 221faabb-548f-4ed3-96eb-a3bdd7009efe | EPIC0005 | Fact Verification and Baseline data  | https://docs.google.com/spreadsheets/d/1Wx... | 5269eacc-b114-4e4b-873e-0b8d5382ee17 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | IN_PROGRESS | *null* |
| 1024d705-e908-4fbe-81e5-8d5fb8a38c46 | EPIC0006 | Develop 5 Proposals | Complete technically and commercially stru... | 64a0686d-b229-4121-a1d7-349735182587 | 886d7680-6a7c-482e-ae61-159ec359f881 | IN_PROGRESS | *null* |
| d719da74-1f87-48d7-a590-4dcbf4725ec6 | EPIC0007 | International Funding |  | 64a0686d-b229-4121-a1d7-349735182587 | 886d7680-6a7c-482e-ae61-159ec359f881 | PLANNED | *null* |
| d3d70e4d-6a8c-4bcb-b2b7-acca7749c73c | EHM-EPIC-17 | IITK Project - Tender Readiness | IITK tender is going to be live soon.  EHM... | *null* | 886d7680-6a7c-482e-ae61-159ec359f881 | PLANNED | *null* |

### Complete Field Data & Records (`epics`)

```json
[
  {
    "id": "1ad8c4c9-43eb-43c2-98b3-9f9242b8c243",
    "epic_code": "EHM-I16-EP18",
    "title": "Webinar #1",
    "description": "Regular Monthly webinar series from our Experts align with Sales track.",
    "initiative_id": "aa0d52da-81ba-4437-947f-5ef49cef6546",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-28 13:56:26.942255",
    "department": "Marketing",
    "target_week": "Week 1 (Days 1–7)",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "4c0dc5be-4780-4940-9877-81dfe0a7b3bf",
    "epic_code": "EPIC0001",
    "title": "Onboarding Farmer",
    "description": "",
    "initiative_id": "5a1a0972-fca8-4e26-b647-7a2317af914c",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "status": "IN_PROGRESS",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-22 16:41:56.122394",
    "department": "Product & Tech",
    "target_week": "2026-09-26",
    "sprints_count_target": 2,
    "next_task_seq": 9,
    "project_id": null
  },
  {
    "id": "7ac7b3b9-30a1-4a5c-8616-d1a9211927c1",
    "epic_code": "EPIC0002",
    "title": "Update CCF Milestone Tracker",
    "description": "Keep CCF's tracker current; notify CCF of any change or upgrade to milestones; confirm the end date with CCF once milestones are mapped (start date is fixed per contract).",
    "initiative_id": "6c199e80-9d32-481f-8bf6-5545190174db",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 10:26:49.127077",
    "department": "Operations & Delivery",
    "target_week": "Week 1 (Days 1–7)",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "2171c90d-838a-43cb-8778-8e17965a4d3d",
    "epic_code": "EPIC0003",
    "title": "Milestones (all) completion",
    "description": "Deliver all five contract milestones: data pipelines and integration, CropRisk.ai platform, pilot validation (including securing a partner or pilot agreement with an insurer or lender), reporting/outreach workshops, and ongoing monitoring and compliance.",
    "initiative_id": "6c199e80-9d32-481f-8bf6-5545190174db",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 10:27:32.52164",
    "department": "Operations & Delivery",
    "target_week": "Week 1 (Days 1–7)",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "1cf6c181-50ee-498c-886a-49d075dcc3c5",
    "epic_code": "EPIC0004",
    "title": "Reporting and closing",
    "description": "Updates shared to CCF, including catching up on quarterly and mid-term reports already missed, spend tracking and utilisation certificate prep, impact assessment (social and climate indicators), case study, and final dissemination report.",
    "initiative_id": "6c199e80-9d32-481f-8bf6-5545190174db",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 10:29:16.295982",
    "department": "Operations & Delivery",
    "target_week": "Week 1 (Days 1–7)",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "221faabb-548f-4ed3-96eb-a3bdd7009efe",
    "epic_code": "EPIC0005",
    "title": "Fact Verification and Baseline data ",
    "description": "https://docs.google.com/spreadsheets/d/1WxASb-wbaxRqvp6eJotJJpZ56bW-spAr/edit?usp=sharing&ouid=101211382213479128767&rtpof=true&sd=true",
    "initiative_id": "5269eacc-b114-4e4b-873e-0b8d5382ee17",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "status": "IN_PROGRESS",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 19:08:26.984369",
    "department": "Grants & Governance",
    "target_week": "2026-09-25",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "epic_code": "EPIC0006",
    "title": "Develop 5 Proposals",
    "description": "Complete technically and commercially structured proposals.",
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "status": "IN_PROGRESS",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-25 18:15:25.64301",
    "department": "Sales",
    "target_week": "2026-09-26",
    "sprints_count_target": 2,
    "next_task_seq": 7,
    "project_id": null
  },
  {
    "id": "d719da74-1f87-48d7-a590-4dcbf4725ec6",
    "epic_code": "EPIC0007",
    "title": "International Funding",
    "description": "",
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-27 09:58:52.368715",
    "department": "Grants & Governance",
    "target_week": "Week 1 (Days 1–7)",
    "sprints_count_target": 2,
    "next_task_seq": 1,
    "project_id": null
  },
  {
    "id": "d3d70e4d-6a8c-4bcb-b2b7-acca7749c73c",
    "epic_code": "EHM-EPIC-17",
    "title": "IITK Project - Tender Readiness",
    "description": "IITK tender is going to be live soon. \nEHM need partner to participate in the tender\nBiodiversity (Survey+ Carbon Estimation), Water Positive ",
    "initiative_id": null,
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-28 13:28:01.595838",
    "department": "Sales",
    "target_week": "2026-10-09",
    "sprints_count_target": 1,
    "next_task_seq": 1,
    "project_id": null
  }
]
```

---

## 📋 Table: `global_counters` (1 records)

### Formatted View Preview

| id | next_team_seq | next_init_seq | next_epic_seq | next_epic_task_seq | next_sprint_task_seq | next_blog_task_seq | next_sprint_seq |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 8 | 8 | 8 | 10 | 2 | 10 | 4 |

### Complete Field Data & Records (`global_counters`)

```json
[
  {
    "id": 1,
    "next_team_seq": 8,
    "next_init_seq": 8,
    "next_epic_seq": 8,
    "next_epic_task_seq": 10,
    "next_sprint_task_seq": 2,
    "next_blog_task_seq": 10,
    "next_sprint_seq": 4,
    "next_project_seq": 14,
    "next_admn_seq": 7,
    "next_mana_seq": 1
  }
]
```

---

## 📋 Table: `google_tokens` (5 records)

### Formatted View Preview

| id | user_id | access_token | refresh_token | expiry | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| b1c5cada-a1e9-4db2-8f46-939fb9b14831 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | ya29.a0AX07Cmv21PyAn0nn4V7LiAFfn0KUaGhgLGJ... | 1//0ga-Enhdpm8TbCgYIARAAGBASNwF-L9IrkNXl6G... | 2026-09-28 16:31:00.261 | 2026-09-22 10:06:09.132309 | 2026-09-28 15:31:01.261 |
| a94e4ab2-69a1-49f5-b5a2-c76fdd42ebd9 | fa0289e6-0109-4228-9f3d-f54b7164773c | ya29.a0AX07Cmvsj2mnvzg4JwAQnTBJqEGWu9equpF... | 1//0gcEAGUR9t5HyCgYIARAAGBASNwF-L9IrdximeC... | 2026-09-28 16:36:07.995 | 2026-09-22 16:15:49.987595 | 2026-09-28 15:36:08.995 |
| df8651a5-1aa6-4ab0-b916-cf8625e63dd2 | 6df0b051-0183-414d-96df-b32a19a24cf2 | ya29.a0AX07CmsybKMdD-P-v8UIIB4jPT1U-gSUiiK... | 1//0gqD1u-vvgTMECgYIARAAGBASNwF-L9IrsSd5fo... | 2026-09-28 16:41:16.538 | 2026-09-23 05:23:55.080654 | 2026-09-28 15:41:17.538 |
| 8d165b49-6250-45af-8a80-2ad937a943fe | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | ya29.a0AX07Cmv13HtWES513Hi5zhdPScJPMeMlmLG... | 1//0gz82pl3jqQneCgYIARAAGBASNwF-L9Irar00MC... | 2026-09-28 16:51:14.205 | 2026-09-22 08:05:48.962518 | 2026-09-28 15:51:15.205 |
| 809e33a0-4163-47c9-a75c-c9e3961ef8a0 | 526b8f7f-697d-4401-b380-50b085403f3f | ya29.a0AX07Cmu5C9JpxbIGbUVpRVf5MTxHLvJvAWG... | 1//0gHCFrfGn7G7VCgYIARAAGBASNwF-L9Ir_EGkHK... | 2026-09-28 17:06:31.662 | 2026-09-23 10:08:50.875633 | 2026-09-28 16:06:32.662 |

### Complete Field Data & Records (`google_tokens`)

```json
[
  {
    "id": "b1c5cada-a1e9-4db2-8f46-939fb9b14831",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "access_token": "ya29.a0AX07Cmv21PyAn0nn4V7LiAFfn0KUaGhgLGJH4YN2ftw64b1UwNS7kUWcYcBu1UcVtwvpPkwTLsoCIbDAwM2hcofA6jx50Jyl5L4_mDa7g-Kh4szWSJUFs_2ilc018DCXqh8L-aPM6GNBR6M1H3hDoZURMnf9OVKzWC8zC3gkozEOq6Bx2Pn2bZZr-1vXhHpf0nRoHcfAaCgYKAdESARUSFQHGX2MihWFtkNbVnYo4RJ5EGBKPKQ0207",
    "refresh_token": "1//0ga-Enhdpm8TbCgYIARAAGBASNwF-L9IrkNXl6GpoeLtbkiYaMyM35eda7iBaojyGGzq8T9CGmXaUA9ZWPWtouAROPw-JjApUyF8",
    "expiry": "2026-09-28 16:31:00.261",
    "created_at": "2026-09-22 10:06:09.132309",
    "updated_at": "2026-09-28 15:31:01.261"
  },
  {
    "id": "a94e4ab2-69a1-49f5-b5a2-c76fdd42ebd9",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "access_token": "ya29.a0AX07Cmvsj2mnvzg4JwAQnTBJqEGWu9equpFtU4UovoM4hDw01CX4OXVoeRy3GdeCiDt2qTfCyDSJcd_KfmaKnZU1ISdU_PCzqhBMfIni_MrK_2ctqC2W_N4CCjioXr_SqHVHpm5Wik-hKxNI0qcQK-oWmyRvIzJ9HbSS4Lj2U4W95nQp-ik7KzrUEegYkAQgTuBfg-oDaCgYKAT4SARMSFQHGX2MitdgscQ_lJqTc60VsbVqhwQ0207",
    "refresh_token": "1//0gcEAGUR9t5HyCgYIARAAGBASNwF-L9IrdximeCGsM7CCVjwZ45hN7raU0gHNYK9QtTW2gLj98aniW82ag0aNaDzqdgTSTVdMz2o",
    "expiry": "2026-09-28 16:36:07.995",
    "created_at": "2026-09-22 16:15:49.987595",
    "updated_at": "2026-09-28 15:36:08.995"
  },
  {
    "id": "df8651a5-1aa6-4ab0-b916-cf8625e63dd2",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "access_token": "ya29.a0AX07CmsybKMdD-P-v8UIIB4jPT1U-gSUiiKJuy3tCS-M-zk5bRAykxIiQIqGJy01o1pXaOnejes75ODRrUGEvLQ1pN0HV9ITP_GsUB-yil9eZ7vGezqB6GfYylq7r8dvyjzUdMTq5A2GIhgKj5wCjSnqZ6CuDn6Op0hzkJlWsWq806hW04BGd6cZlD2NH1_5YphzbvLnaCgYKAXoSARASFQHGX2Mi7Zg43ZdesBmcFvCi_pSz1w0207",
    "refresh_token": "1//0gqD1u-vvgTMECgYIARAAGBASNwF-L9IrsSd5foHzOBYq9nj_moCmBXQEH9UFsuepM3YZQnqFYo1NSyTgINagofu5wp9eEpITIlE",
    "expiry": "2026-09-28 16:41:16.538",
    "created_at": "2026-09-23 05:23:55.080654",
    "updated_at": "2026-09-28 15:41:17.538"
  },
  {
    "id": "8d165b49-6250-45af-8a80-2ad937a943fe",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "access_token": "ya29.a0AX07Cmv13HtWES513Hi5zhdPScJPMeMlmLG3YfI7lBQ3kWOCDvgihzrxnC7ktIOBsMT3JwIu0uWBE1fBfKHiRGu40x7enAbX9s9OL0cQ_TJH36gkrUi9o-O3LUy_m4vvP7jmYcClWMU1U2iJcQI--NDi-gMmqqGZecnzwoh-1lR3yCbZGTFxd5DxNQNqV7uDWVO1hktbaCgYKAVoSARASFQHGX2MiEWvnBd0lQ-a4qAOsCBxufg0207",
    "refresh_token": "1//0gz82pl3jqQneCgYIARAAGBASNwF-L9Irar00MCg4O6ZtBCTAK_zT9LNNOEWcCILij_OSMjWFHXwwtSecl7ZDIAkQ71kcX-ZegXA",
    "expiry": "2026-09-28 16:51:14.205",
    "created_at": "2026-09-22 08:05:48.962518",
    "updated_at": "2026-09-28 15:51:15.205"
  },
  {
    "id": "809e33a0-4163-47c9-a75c-c9e3961ef8a0",
    "user_id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "access_token": "ya29.a0AX07Cmu5C9JpxbIGbUVpRVf5MTxHLvJvAWGYgbFBUfemwffR2QCtTQX7Gtjl9J3D5RfyBVrio6ji5Rn8WdcBnDFmJbIJf3UQMPzQb2lsyiwiUE0JcvKSp0B-8FeI86h3qaJVsM9jmjvJ5252LQHi4ebP6G0jJkPpTAfXGakMKqpp3emiF6OAbAeWg4p5KtRrJ7A4uO_vaCgYKAecSARUSFQHGX2Mi8i-8xqBXisbtif2GLW2wOg0207",
    "refresh_token": "1//0gHCFrfGn7G7VCgYIARAAGBASNwF-L9Ir_EGkHKeHq5DDgvtA9f5P8bHZ4Xp9RXcvk-BDIbOnbPy9XYFkAfBQeMBYfes2WNQ1t7I",
    "expiry": "2026-09-28 17:06:31.662",
    "created_at": "2026-09-23 10:08:50.875633",
    "updated_at": "2026-09-28 16:06:32.662"
  }
]
```

---

## 📋 Table: `initiatives` (8 records)

### Formatted View Preview

| id | entity_id | title | description | status | owner_id | target_date | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5a1a0972-fca8-4e26-b647-7a2317af914c | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Farm Data collection Application Pilot |  | ACTIVE | *null* | *null* | 2026-09-22 16:39:45.464214 |
| 6c199e80-9d32-481f-8bf6-5545190174db | ebbf77f7-c1ac-423d-a29d-8db50beac25f | CCF Cummins Climate Pitch Polit |  | PLANNED | *null* | *null* | 2026-09-23 10:14:46.32314 |
| 5269eacc-b114-4e4b-873e-0b8d5382ee17 | ebbf77f7-c1ac-423d-a29d-8db50beac25f | Investor-ready and project-funding-ready b... | A verified, data-backed business plan for ... | ACTIVE | *null* | *null* | 2026-09-23 19:03:07.3358 |
| e84d8873-021b-4352-9237-326df82abaf8 | 886d7680-6a7c-482e-ae61-159ec359f881 | Climate & Sustainability Training and courses | Already have ESG modules build for MSME.  ... | PLANNED | *null* | *null* | 2026-09-25 17:32:36.372985 |
| 64a0686d-b229-4121-a1d7-349735182587 | 886d7680-6a7c-482e-ae61-159ec359f881 | Agra City – Proposal Development & Governm... | Develop and position five EHM/ClimAgro pro... | ACTIVE | *null* | *null* | 2026-09-25 17:36:23.132169 |
| a82cc716-4105-48ab-b001-376846d4b91d | ebbf77f7-c1ac-423d-a29d-8db50beac25f | ClimAgro Newsletter/white paper |  | PLANNED | *null* | *null* | 2026-09-26 05:57:56.207983 |
| ee28123a-d039-4512-b11d-3fef0f0a7e1a | ebbf77f7-c1ac-423d-a29d-8db50beac25f | ClimAgro Registration to national & Global... |  | PLANNED | *null* | *null* | 2026-09-26 06:27:14.604647 |
| aa0d52da-81ba-4437-947f-5ef49cef6546 | 886d7680-6a7c-482e-ae61-159ec359f881 | Monthly Webinars  |  | PLANNED | *null* | *null* | 2026-09-28 13:54:01.609414 |

### Complete Field Data & Records (`initiatives`)

```json
[
  {
    "id": "5a1a0972-fca8-4e26-b647-7a2317af914c",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "title": "Farm Data collection Application Pilot",
    "description": "",
    "status": "ACTIVE",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-22 16:39:45.464214",
    "initiative_code": "INIT0001",
    "department_id": null,
    "sub_department": "Operations & Delivery",
    "target_month": "October 2026",
    "epics_count_target": 2,
    "target_deliverable_metric": "Onboarding First Farmer"
  },
  {
    "id": "6c199e80-9d32-481f-8bf6-5545190174db",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "title": "CCF Cummins Climate Pitch Polit",
    "description": "",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 10:14:46.32314",
    "initiative_code": "INIT0002",
    "department_id": null,
    "sub_department": "Operations & Delivery",
    "target_month": "October 2026",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "5269eacc-b114-4e4b-873e-0b8d5382ee17",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "title": "Investor-ready and project-funding-ready business plan",
    "description": "A verified, data-backed business plan for ClimAgro Analytics — built pillar by pillar (Strategy & Positioning, Product, Sales/GTM, Finance, Governance, Funding) on confirmed facts rather than the unreconciled claims in past proposals — ready to use as-is in investor conversations and in project-specific funding applications (CCF/Cummins, NABARD, and future grants)",
    "status": "ACTIVE",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-23 19:03:07.3358",
    "initiative_code": "INIT0003",
    "department_id": null,
    "sub_department": "Grants & Governance",
    "target_month": "September 2026",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "e84d8873-021b-4352-9237-326df82abaf8",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "title": "Climate & Sustainability Training and courses",
    "description": "Already have ESG modules build for MSME. \nStrength partnership with E&ICT academy. jointly pitch to BIRD",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-25 17:32:36.372985",
    "initiative_code": "INIT0004",
    "department_id": null,
    "sub_department": "Marketing",
    "target_month": "October 2026",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "64a0686d-b229-4121-a1d7-349735182587",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "title": "Agra City – Proposal Development & Government Engagement",
    "description": "Develop and position five EHM/ClimAgro proposals for Agra City, engage key government stakeholders, and convert discussions into formal project opportunities.\n\n[Link Description](https://drive.google.com/drive/folders/1FkLcUWbdJfehBQpE20fjDDkMTc4iC0dN?usp=drive_link)",
    "status": "ACTIVE",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-25 17:36:23.132169",
    "initiative_code": "INIT0005",
    "department_id": null,
    "sub_department": "Marketing",
    "target_month": "September 2026",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "a82cc716-4105-48ab-b001-376846d4b91d",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "title": "ClimAgro Newsletter/white paper",
    "description": "",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-26 05:57:56.207983",
    "initiative_code": "INIT0006",
    "department_id": null,
    "sub_department": "Marketing",
    "target_month": "Month 1 (Weeks 1–4)",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "ee28123a-d039-4512-b11d-3fef0f0a7e1a",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "title": "ClimAgro Registration to national & Global Agencies",
    "description": "",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-26 06:27:14.604647",
    "initiative_code": "INIT0007",
    "department_id": null,
    "sub_department": "Sales",
    "target_month": "Month 1 (Weeks 1–4)",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  },
  {
    "id": "aa0d52da-81ba-4437-947f-5ef49cef6546",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "title": "Monthly Webinars ",
    "description": "",
    "status": "PLANNED",
    "owner_id": null,
    "target_date": null,
    "created_at": "2026-09-28 13:54:01.609414",
    "initiative_code": "EHM-I16",
    "department_id": null,
    "sub_department": "Marketing",
    "target_month": "Month 1 (Weeks 1–4)",
    "epics_count_target": 3,
    "target_deliverable_metric": ""
  }
]
```

---

## 📋 Table: `invites` (11 records)

### Formatted View Preview

| id | email | token | role | employee_id | status | expires_at | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 66f37b55-c686-4d7f-b223-b00a577eabc4 | harshit@ehmconsultancy.co.in | e7a0f8d7878793cccfad4a0212baaca7e16392134a... | ADMIN | 1e32f27a-d641-40ff-923c-05fef4836c10 | ACCEPTED | 2026-09-29 15:26:02.308 | 2026-09-22 15:26:02.858687 |
| b5de9a90-49b5-45af-b65f-c5f52e3a79ef | dubey.pranshu@gmail.com | 76da8b518f4ec2bb0594383c19f5ae94d23b1aedd6... | ADMIN | 67f526ba-afcf-4ec0-bf41-da1468bfb816 | ACCEPTED | 2026-09-29 07:29:58.124 | 2026-09-22 07:29:57.540938 |
| 3f298e07-f5b4-4909-9c45-aa5302fca271 | jitendra@ehmconsultancy.co.in | 25397cae8737248b07f0be39c6876f19bdcefa9bbd... | ADMIN | 62785b3e-f538-4618-a412-436f3c3408f1 | PENDING | 2026-09-30 09:22:00.105 | 2026-09-23 09:21:59.433128 |
| caf1869e-fb3a-4df3-b1a9-bfbc6f1b5216 | prernashukla566@gmail.com | 8b9c0a1b5f1763cece9300d98cfba4af59faa029f0... | EMPLOYEE | 650517a8-f325-4586-ba41-04b4cdf883de | ACCEPTED | 2026-09-30 09:23:06.548 | 2026-09-23 09:23:05.899812 |
| 5472a0df-5dcc-4f36-ae67-553d4cd39d12 | shreyanshsiladar@gmail.com | f470219861dcf70a27418e0db3e4932e6a6d288449... | EMPLOYEE | bb54d7bc-fbf4-42f9-be0a-2fc090260d7d | ACCEPTED | 2026-09-30 09:25:16.664 | 2026-09-23 09:25:16.050851 |
| 1dd738ed-5d72-4bf7-9746-c6716ddfc48d | priyankasharma121202@gmail.com | fd33238f7306f810ddc7c09a5e460592100af0963a... | EMPLOYEE | d3a231fa-5d33-4249-a17d-102765de4e09 | ACCEPTED | 2026-09-30 09:24:19.321 | 2026-09-23 09:24:18.71322 |
| 39431639-d6a9-4b61-9792-9587a405b48d | ashutoshmishraup78@mpgi.edu.in | b95e6949c9aeefa43f8b3618cc19e6b0227122dd30... | EMPLOYEE | e6efb986-4f3d-40ac-bfe7-120fbd9d022d | ACCEPTED | 2026-09-30 07:41:13.2 | 2026-09-23 07:41:13.503542 |
| 26897f4c-b505-492f-b90e-e9890ba210aa | neha@ehmconsultancy.co.in | 5d14968d8a392342449892c29a1d5d659ab5a93933... | ADMIN | 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | ACCEPTED | 2026-09-30 06:42:52.707 | 2026-09-23 06:42:52.086039 |
| 53abc49c-33eb-4253-aba5-260ba57f2edf | officialutkarshmishra01@gmail.com | add64013409c75cc766476ebde90702844e6691d5b... | EMPLOYEE | 5b817f5a-04bd-4118-9f73-48130750007d | ACCEPTED | 2026-10-01 05:48:55.425 | 2026-09-24 05:48:54.749932 |
| a4574404-f8bc-49fe-9d79-088f041bfb34 | tarul@ehmconsultancy.co.in | 283633954dd2295a1158d7070e9fa10da625892292... | EMPLOYEE | e80c26a6-0696-45e5-857f-540ff91058b3 | PENDING | 2026-10-02 17:57:22.524 | 2026-09-25 17:57:21.852555 |
| ecb67d50-c860-471c-ae4e-7cdf927f0639 | neeraj@ehmconsultancy.co.in | ef167384dc450fc82ae1beaf1dc115d3e3278a4d4c... | EMPLOYEE | 05197216-bf53-4a63-99ac-a9aa60174257 | PENDING | 2026-10-02 17:58:03.702 | 2026-09-25 17:58:03.043547 |

### Complete Field Data & Records (`invites`)

```json
[
  {
    "id": "66f37b55-c686-4d7f-b223-b00a577eabc4",
    "email": "harshit@ehmconsultancy.co.in",
    "token": "e7a0f8d7878793cccfad4a0212baaca7e16392134a4c2c6f5efe5d821ab4f65f",
    "role": "ADMIN",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "status": "ACCEPTED",
    "expires_at": "2026-09-29 15:26:02.308",
    "created_at": "2026-09-22 15:26:02.858687"
  },
  {
    "id": "b5de9a90-49b5-45af-b65f-c5f52e3a79ef",
    "email": "dubey.pranshu@gmail.com",
    "token": "76da8b518f4ec2bb0594383c19f5ae94d23b1aedd6ed9910a15e10bd245c6fc8",
    "role": "ADMIN",
    "employee_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "status": "ACCEPTED",
    "expires_at": "2026-09-29 07:29:58.124",
    "created_at": "2026-09-22 07:29:57.540938"
  },
  {
    "id": "3f298e07-f5b4-4909-9c45-aa5302fca271",
    "email": "jitendra@ehmconsultancy.co.in",
    "token": "25397cae8737248b07f0be39c6876f19bdcefa9bbdc710ece0e365153ad84439",
    "role": "ADMIN",
    "employee_id": "62785b3e-f538-4618-a412-436f3c3408f1",
    "status": "PENDING",
    "expires_at": "2026-09-30 09:22:00.105",
    "created_at": "2026-09-23 09:21:59.433128"
  },
  {
    "id": "caf1869e-fb3a-4df3-b1a9-bfbc6f1b5216",
    "email": "prernashukla566@gmail.com",
    "token": "8b9c0a1b5f1763cece9300d98cfba4af59faa029f01c708c6d68d3be31eb8551",
    "role": "EMPLOYEE",
    "employee_id": "650517a8-f325-4586-ba41-04b4cdf883de",
    "status": "ACCEPTED",
    "expires_at": "2026-09-30 09:23:06.548",
    "created_at": "2026-09-23 09:23:05.899812"
  },
  {
    "id": "5472a0df-5dcc-4f36-ae67-553d4cd39d12",
    "email": "shreyanshsiladar@gmail.com",
    "token": "f470219861dcf70a27418e0db3e4932e6a6d2884492f533b8eb41ae67ac2efca",
    "role": "EMPLOYEE",
    "employee_id": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
    "status": "ACCEPTED",
    "expires_at": "2026-09-30 09:25:16.664",
    "created_at": "2026-09-23 09:25:16.050851"
  },
  {
    "id": "1dd738ed-5d72-4bf7-9746-c6716ddfc48d",
    "email": "priyankasharma121202@gmail.com",
    "token": "fd33238f7306f810ddc7c09a5e460592100af0963acb5c16b1cb6af23e675205",
    "role": "EMPLOYEE",
    "employee_id": "d3a231fa-5d33-4249-a17d-102765de4e09",
    "status": "ACCEPTED",
    "expires_at": "2026-09-30 09:24:19.321",
    "created_at": "2026-09-23 09:24:18.71322"
  },
  {
    "id": "39431639-d6a9-4b61-9792-9587a405b48d",
    "email": "ashutoshmishraup78@mpgi.edu.in",
    "token": "b95e6949c9aeefa43f8b3618cc19e6b0227122dd30d49ad5e11d541097767266",
    "role": "EMPLOYEE",
    "employee_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "status": "ACCEPTED",
    "expires_at": "2026-09-30 07:41:13.2",
    "created_at": "2026-09-23 07:41:13.503542"
  },
  {
    "id": "26897f4c-b505-492f-b90e-e9890ba210aa",
    "email": "neha@ehmconsultancy.co.in",
    "token": "5d14968d8a392342449892c29a1d5d659ab5a93933e33a7f85d197064b78ba6c",
    "role": "ADMIN",
    "employee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "status": "ACCEPTED",
    "expires_at": "2026-09-30 06:42:52.707",
    "created_at": "2026-09-23 06:42:52.086039"
  },
  {
    "id": "53abc49c-33eb-4253-aba5-260ba57f2edf",
    "email": "officialutkarshmishra01@gmail.com",
    "token": "add64013409c75cc766476ebde90702844e6691d5b7be606fd037178aae678f0",
    "role": "EMPLOYEE",
    "employee_id": "5b817f5a-04bd-4118-9f73-48130750007d",
    "status": "ACCEPTED",
    "expires_at": "2026-10-01 05:48:55.425",
    "created_at": "2026-09-24 05:48:54.749932"
  },
  {
    "id": "a4574404-f8bc-49fe-9d79-088f041bfb34",
    "email": "tarul@ehmconsultancy.co.in",
    "token": "283633954dd2295a1158d7070e9fa10da625892292fa0bdd05a4e5e9fea199a8",
    "role": "EMPLOYEE",
    "employee_id": "e80c26a6-0696-45e5-857f-540ff91058b3",
    "status": "PENDING",
    "expires_at": "2026-10-02 17:57:22.524",
    "created_at": "2026-09-25 17:57:21.852555"
  },
  {
    "id": "ecb67d50-c860-471c-ae4e-7cdf927f0639",
    "email": "neeraj@ehmconsultancy.co.in",
    "token": "ef167384dc450fc82ae1beaf1dc115d3e3278a4d4c21bfc574781b29eb4bc791",
    "role": "EMPLOYEE",
    "employee_id": "05197216-bf53-4a63-99ac-a9aa60174257",
    "status": "PENDING",
    "expires_at": "2026-10-02 17:58:03.702",
    "created_at": "2026-09-25 17:58:03.043547"
  }
]
```

---

## 📋 Table: `meeting_attendees` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `meetings` (403 records)

### Formatted View Preview

| id | title | description | start_time | end_time | location | google_meet_url | organizer_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4093359a-61f1-4b1c-bc47-8ca2d77f1c67 | Office |  | 2026-10-07 18:30:00 | 2026-10-09 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 955f9c88-b754-4d12-a630-41966f8d19ce | EHM Weekly Updates |  | 2026-11-21 06:30:00 | 2026-11-21 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 58cd0f8d-81f1-4ca3-ad29-fe6a03aa39e2 | Office |  | 2026-11-11 18:30:00 | 2026-11-13 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d7a2a9a1-6de6-433b-9702-c04612eb5452 | Office |  | 2026-11-05 18:30:00 | 2026-11-07 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| efa1759d-cc2d-4704-9ce6-81210db44a16 | ClimAgro Weekly Updates |  | 2026-10-10 05:30:00 | 2026-10-10 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9306d0ee-ddbc-4497-b5ae-15375f871f4a | ClimAgro Weekly Updates |  | 2026-10-31 05:30:00 | 2026-10-31 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 1c3a58a2-0d6a-4e2f-8311-10cd5b30f9e8 | Dev call, 9:20 |  | 2026-10-02 03:45:00 | 2026-10-02 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 5414b552-aca6-4af1-8719-6f91cf010e35 | Sales CRM Meeting |  | 2026-10-05 10:30:00 | 2026-10-05 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e11062f9-32d2-4e0a-80dd-726e24e40e6d | Sales CRM Meeting |  | 2026-10-07 10:30:00 | 2026-10-07 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 2fc80734-0e8a-48cd-8ec7-c680058e4256 | Sales CRM Meeting |  | 2026-10-13 10:30:00 | 2026-10-13 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c4b59990-7a86-4c8d-9ea6-5dba304148d1 | Sales CRM Meeting |  | 2026-10-15 10:30:00 | 2026-10-15 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8cf8b451-2685-4e99-8608-bf595bb976cc | Sales CRM Meeting |  | 2026-10-19 10:30:00 | 2026-10-19 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 17d3e67f-eecb-4df1-836b-a8d6e826fd8d | Sales CRM Meeting |  | 2026-10-21 10:30:00 | 2026-10-21 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 097464ad-0893-4cc6-b31e-9d2d5189831a | Sales CRM Meeting |  | 2026-10-09 10:30:00 | 2026-10-09 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e892ab27-5585-4b0a-ad56-30d3e2860a14 | Sales CRM Meeting |  | 2026-10-23 10:30:00 | 2026-10-23 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9cdee7a1-8088-45ac-a45a-7b8be6d255b1 | Company Call |  | 2026-10-23 05:00:00 | 2026-10-23 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 50195ae4-70c0-4dec-b475-d2fe488b9664 | Dev call, 9:20 |  | 2026-09-27 03:45:00 | 2026-09-27 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 1ef35110-279e-4454-9e9b-671ee18e9fcc | Sales CRM Meeting |  | 2026-11-09 10:30:00 | 2026-11-09 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8253c30a-35ee-451a-a59c-1f9d2ed2cdc6 | Sales CRM Meeting |  | 2026-11-11 10:30:00 | 2026-11-11 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c8870aab-00af-4697-811d-07fc2ac1f9f5 | Sales CRM Meeting |  | 2026-11-13 10:30:00 | 2026-11-13 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 93d66e1a-1e9f-4578-b5e6-a915a7bcadaf | Sales CRM Meeting |  | 2026-10-01 10:30:00 | 2026-10-01 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| de066bac-1103-48c3-a843-cdef0ed2413a | Sales CRM Meeting |  | 2026-10-30 10:30:00 | 2026-10-30 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 6f1776c2-8b85-4947-bb8f-bdd5fbde61bc | Sales CRM Meeting |  | 2026-11-03 10:30:00 | 2026-11-03 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 28ad8e92-4616-4c82-9df2-cc8431c5eb9b | Sales CRM Meeting |  | 2026-11-05 10:30:00 | 2026-11-05 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c46e03b4-2405-461f-8ca6-39ce2077d35a | Sales CRM Meeting |  | 2026-11-17 10:30:00 | 2026-11-17 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 668e0917-a0d2-4391-80c6-a4e9e61aaeff | Sales CRM Meeting |  | 2026-11-19 10:30:00 | 2026-11-19 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| f1799957-a56d-4463-984e-4e3c49849289 | Dev call, 9:20 |  | 2026-10-11 03:45:00 | 2026-10-11 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| afca8893-b703-4fd5-b3ea-e6083fbcedda | Dev call, 9:20 |  | 2026-10-13 03:45:00 | 2026-10-13 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 51991b0c-b74a-456e-b1e9-b52403c47fe2 | Dev call, 9:20 |  | 2026-10-04 03:45:00 | 2026-10-04 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e14f8897-52c6-4038-a606-a4e2859d6a9c | Dev call, 9:20 |  | 2026-10-15 03:45:00 | 2026-10-15 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 739926dc-44af-4eb9-afb9-c2c7a4ddcbf8 | Dev call, 9:20 |  | 2026-10-17 03:45:00 | 2026-10-17 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e8cb8e71-e698-402d-9290-079294143e8c | Dev call, 9:20 |  | 2026-10-20 03:45:00 | 2026-10-20 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ad026e4c-8735-459e-af17-570609df6c81 | Dev call, 9:20 |  | 2026-10-22 03:45:00 | 2026-10-22 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 721c4955-f0a0-4766-979e-ae270b370770 | Dev call, 9:20 |  | 2026-10-24 03:45:00 | 2026-10-24 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| df83a1fd-29ff-4c78-b585-00844b3352cd | Dev call, 9:20 |  | 2026-10-26 03:45:00 | 2026-10-26 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 99a8379a-ada0-4e21-9f8e-751704f45d96 | Dev call, 9:20 |  | 2026-10-28 03:45:00 | 2026-10-28 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9b972e3a-0a70-4d95-970d-14d747b73d73 | Dev call, 9:20 |  | 2026-10-30 03:45:00 | 2026-10-30 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ca908b59-9433-4e12-9b14-2246bd4a60c7 | Dev call, 9:20 |  | 2026-11-02 03:45:00 | 2026-11-02 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 58966524-c45a-4fac-a825-2504e983330f | Dev call, 9:20 |  | 2026-11-04 03:45:00 | 2026-11-04 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 38541d41-9ee8-467d-bcd6-af34c7ed4ddf | Dev call, 9:20 |  | 2026-11-06 03:45:00 | 2026-11-06 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8cc621e1-7995-4120-9045-20a85ead4547 | Dev call, 9:20 |  | 2026-10-06 03:45:00 | 2026-10-06 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 4cba93fe-9ef7-4f53-acbf-f73852234f1d | Dev call, 9:20 |  | 2026-10-09 03:45:00 | 2026-10-09 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 2a78a054-6448-4127-960a-01396ba7b113 | Dev call, 9:20 |  | 2026-11-07 03:45:00 | 2026-11-07 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| bc353c2e-e9fa-44a1-acfb-a13b418bfbb4 | Dev call, 9:20 |  | 2026-11-08 03:45:00 | 2026-11-08 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 16d8efd4-f54d-4858-9b6c-4e86ceff2f35 | Dev call, 9:20 |  | 2026-11-10 03:45:00 | 2026-11-10 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7604007d-89b6-43df-a60a-f063e751d887 | Dev call, 9:20 |  | 2026-11-12 03:45:00 | 2026-11-12 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 6087afd7-da2d-4250-975f-d829b22aa7d1 | Dev call, 9:20 |  | 2026-11-15 03:45:00 | 2026-11-15 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e87162ce-0fea-4578-878a-2761a9d15505 | Dev call, 9:20 |  | 2026-11-17 03:45:00 | 2026-11-17 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 464cfde9-1950-4118-a14c-60bc53c6210e | Dev call, 9:20 |  | 2026-11-19 03:45:00 | 2026-11-19 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 04b72f9d-0c93-45f7-a159-72047bd7d7a1 | Dev call, 9:20 |  | 2026-11-21 03:45:00 | 2026-11-21 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a80d8f4e-5736-4185-a93f-b58e5e057288 | Company Call |  | 2026-10-02 05:00:00 | 2026-10-02 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 888edfde-7cc2-42cb-8813-fc04c734f73a | Company Call |  | 2026-11-17 05:00:00 | 2026-11-17 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a1b943c0-4572-4c56-a470-f3f4bf6cb57f | Company Call |  | 2026-11-03 05:00:00 | 2026-11-03 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7f3158bb-b4fa-4388-9f7c-d1b9816f9f41 | Company Call |  | 2026-11-09 05:00:00 | 2026-11-09 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e047f1a3-dd7b-4820-956e-2f8783028279 | Company Call |  | 2026-11-13 05:00:00 | 2026-11-13 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a9d1d0d8-8798-42ea-a4e9-f1e4272357b5 | Company Call |  | 2026-10-09 05:00:00 | 2026-10-09 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 1b936197-1fa1-4785-bc97-f7c5a52f9f83 | Office |  | 2026-09-27 18:30:00 | 2026-09-29 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 36fb323f-79c9-4a4a-966b-6e397da4c544 | Office |  | 2026-11-22 18:30:00 | 2026-11-24 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 0322c4ad-f5bf-4970-8be6-3e3005deee6d | Office |  | 2026-11-01 18:30:00 | 2026-11-03 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c7c9300e-367d-4087-9d8f-188fc5b1b644 | Office |  | 2026-11-08 18:30:00 | 2026-11-10 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6daa74fc-fb36-4ea8-9553-2bae624e5b8c | Office |  | 2026-10-04 18:30:00 | 2026-10-06 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| bfd1cbfa-8446-4ee3-b3b6-670cb7eaef54 | Office |  | 2026-10-11 18:30:00 | 2026-10-13 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 005914d5-98fb-409b-9339-4009f6eb839e | Office |  | 2026-11-15 18:30:00 | 2026-11-17 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 30f26cb9-a93e-48c4-ae0e-4de78ee2a586 | Office |  | 2026-10-25 18:30:00 | 2026-10-27 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| cd065a91-6f29-4d02-b194-08b09f3eb047 | Office |  | 2026-11-09 18:30:00 | 2026-11-11 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a8fb7aff-0c7d-42a6-ae8b-42de43571be7 | Office |  | 2026-10-19 18:30:00 | 2026-10-21 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 4bdcd308-da7f-442c-9324-0b67f0bba7b6 | Company Call |  | 2026-10-08 05:00:00 | 2026-10-08 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9c05b791-3046-49e9-bbab-ed579536c0a3 | hiii |  | 2026-09-28 08:30:00 | 2026-09-28 09:30:00 | Google Meet | https://meet.google.com/knr-chwu-ycd | c30c78d7-9398-4517-a54a-64005b90d555 |
| 06272f8d-851e-4da9-b6e9-95b19c605ba0 | Office |  | 2026-09-29 18:30:00 | 2026-10-01 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 304924a2-d48b-4bb2-85fb-0a3c26e098d5 | Office |  | 2026-11-23 18:30:00 | 2026-11-25 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 312a4a2e-2000-40d6-848c-9f58d7392e62 | Office |  | 2026-10-26 18:30:00 | 2026-10-28 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c7a430ba-1a2c-4228-9a8d-732381939148 | Office |  | 2026-10-06 18:30:00 | 2026-10-08 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a90a5aa8-2aec-415d-98fa-e100741e9da1 | Office |  | 2026-10-13 18:30:00 | 2026-10-15 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b683e6ec-cd8f-4691-a90d-739c137ed87a | Office |  | 2026-11-02 18:30:00 | 2026-11-04 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 1d0f0153-5d8b-49f2-abc6-eb8797278958 | Company Call |  | 2026-10-01 05:00:00 | 2026-10-01 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7d4ee1d1-0cf7-4180-9f57-188faedadf56 | Company Call |  | 2026-10-05 05:00:00 | 2026-10-05 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3164bc96-0cfe-46be-83ac-98f3ad3df4f6 | Office |  | 2026-09-23 18:30:00 | 2026-09-25 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8ab4470f-2f87-4ae4-8e24-96384486092b | Office |  | 2026-09-30 18:30:00 | 2026-10-02 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ff1611a8-fc3f-4135-8736-d9df468eea0c | Office |  | 2026-11-17 18:30:00 | 2026-11-19 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d6983bb0-900d-45c4-b857-324b16aee00d | Company Call |  | 2026-11-19 05:00:00 | 2026-11-19 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3f308b95-5ee0-4055-8144-3ff60c4d2c7b | Marketing Team Discussion |  | 2026-08-31 07:00:00 | 2026-08-31 07:30:00 | Google Meet | https://meet.google.com/ajf-bqpi-tgq | c30c78d7-9398-4517-a54a-64005b90d555 |
| c64924a8-0bea-4226-9228-3e3d2ded317c | Company Call |  | 2026-09-29 05:00:00 | 2026-09-29 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 40938637-b9a4-4c23-a876-d383ac55b7d0 | AI Manthan Discussion  |  | 2026-09-11 11:05:00 | 2026-09-11 11:35:00 | Google Meet | https://meet.google.com/nye-mniz-qyz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 4840b726-994e-4326-a67c-6d4c11eec553 | Avani Sports |  | 2026-10-02 09:15:00 | 2026-10-02 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 0a374b31-993d-446c-b779-1a21c3388872 | Avani Sports |  | 2026-10-05 09:15:00 | 2026-10-05 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c88e3494-d741-4011-b5e9-5973aa0b6687 | Company Call |  | 2026-10-22 05:00:00 | 2026-10-22 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 5bd82f10-33b8-4781-a56c-4202fbb2e404 | Company Call |  | 2026-11-06 05:00:00 | 2026-11-06 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 931caf02-1c81-4010-912a-48a5942df95a | Company Call |  | 2026-11-10 05:00:00 | 2026-11-10 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 906282b3-1078-4918-860f-45789ccbd970 | Company Call |  | 2026-11-12 05:00:00 | 2026-11-12 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 45f3fa92-414d-4b1f-8a6e-ce0867bd845f | Company Call |  | 2026-11-16 05:00:00 | 2026-11-16 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 165d56db-6abe-4ee8-971f-5fd083627ce2 | Company Call |  | 2026-11-20 05:00:00 | 2026-11-20 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| cdb64959-f3ba-4242-94ca-0b1ac83f9a7c | Company Call |  | 2026-10-20 05:00:00 | 2026-10-20 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b122cfd6-f807-450e-bb90-da488c893f1b | Company Call |  | 2026-10-16 05:00:00 | 2026-10-16 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 07e0e357-22c7-408c-92b4-359f11734cbc | Company Call |  | 2026-10-13 05:00:00 | 2026-10-13 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 6252e476-ded6-49f3-a65a-43b20051f0e5 | Company Call |  | 2026-11-05 05:00:00 | 2026-11-05 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 0e2ba332-c71c-4ab5-bff0-893e3c2fcd11 | Company Call |  | 2026-11-02 05:00:00 | 2026-11-02 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 0a98ffc7-b6e0-4102-a8bd-4c22119409cb | Company Call |  | 2026-10-26 05:00:00 | 2026-10-26 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b0e297ab-5e58-4e89-a694-61dc066099c9 | Office |  | 2026-10-08 18:30:00 | 2026-10-10 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 312a3001-7a88-4be7-87ea-9d3713cacc43 | Dev call, 9:20 |  | 2026-09-25 03:45:00 | 2026-09-25 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e8faa5ef-d8ce-451f-9219-22ea8d026f16 | Company Call |  | 2026-10-27 05:00:00 | 2026-10-27 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 26a48ce8-dd80-493f-a40a-6365745b9e6b | ClimAgro Discovery Call between Harshit Mi... | What: ClimAgro Discovery Call between Hars... | 2026-09-21 05:30:00 | 2026-09-21 06:00:00 | Google Meet | https://meet.google.com/img-kyde-xop | c30c78d7-9398-4517-a54a-64005b90d555 |
| c3e9ffd7-35e2-4cc7-be69-678e8982191a | Company Call |  | 2026-10-30 05:00:00 | 2026-10-30 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3560bcb2-e8ad-4747-a51a-bebb23877ed9 | Weekly Progress Call |  | 2026-09-19 09:30:00 | 2026-09-19 10:15:00 | Google Meet | https://meet.google.com/seh-ottt-sbk | c30c78d7-9398-4517-a54a-64005b90d555 |
| a9be8cce-5de6-4101-887b-aca0fed5704a | Office |  | 2026-09-24 18:30:00 | 2026-09-26 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b0d51ffe-517a-4500-bf8a-90c1a6f89d10 | Office |  | 2026-11-18 18:30:00 | 2026-11-20 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8bd79bff-2a62-4e77-9b00-784fc11bdfc1 | Office |  | 2026-10-01 18:30:00 | 2026-10-03 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 05da94ce-8da2-4100-8d00-c7af09525148 | Dev call, 9:20 |  | 2026-09-26 03:45:00 | 2026-09-26 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 14595f68-f682-4f66-b951-3f6c89b21bec | CropRisk Discovery Call between Harshit Mi... | What: CropRisk Discovery Call between Hars... | 2026-09-07 05:30:00 | 2026-09-07 06:00:00 | Google Meet | https://meet.google.com/zbx-mgfa-uyn | c30c78d7-9398-4517-a54a-64005b90d555 |
| e2669376-e666-4904-956f-65e7bd6a5845 | ClimAgro Discovery Call between Harshit Mi... | What: ClimAgro Discovery Call between Hars... | 2026-09-08 08:30:00 | 2026-09-08 09:00:00 | Google Meet | https://meet.google.com/wce-ckvb-ufh | c30c78d7-9398-4517-a54a-64005b90d555 |
| 2fd9b98e-5c16-4194-bfac-276f5c95d7cc | Office |  | 2026-10-09 18:30:00 | 2026-10-11 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2774c148-3c31-41b6-9ebe-22985399919b | Office |  | 2026-11-26 18:30:00 | 2026-11-28 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 1ef79e01-2f36-42dd-86b1-51f70b54891e | Office |  | 2026-10-23 18:30:00 | 2026-10-25 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 61eae544-695c-4ebc-af78-b5e5d286ef33 | Office |  | 2026-09-25 18:30:00 | 2026-09-27 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 89fc9696-b8ab-4119-a3af-e50364b820ed | ClimAgro Weekly Updates |  | 2026-09-26 05:30:00 | 2026-09-26 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8c38e0cf-310a-4cd1-8b39-d41da5a71574 | Proposals (Agra + Sustainability ...) |  | 2026-09-26 09:00:00 | 2026-09-26 09:30:00 | Google Meet | https://meet.google.com/jbs-jskh-vgq | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e7c2a768-d91a-4be2-b8b7-3596af517e82 | Office |  | 2026-11-19 18:30:00 | 2026-11-21 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 44e98baf-d7de-4116-b015-904687f9e04f | Office |  | 2026-10-30 18:30:00 | 2026-11-01 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 5185790d-0280-4af1-ada9-ec603942255b | Office |  | 2026-10-02 18:30:00 | 2026-10-04 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 702c4ebf-0ebc-4d3b-9f41-ad5d300dc6ad | Office |  | 2026-11-12 18:30:00 | 2026-11-14 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 21e3de35-74a0-4b1e-9ad4-676033315919 | Company Call  |  | 2026-09-23 06:00:00 | 2026-09-23 06:15:00 | Google Meet | https://meet.google.com/yke-gktd-gik | c30c78d7-9398-4517-a54a-64005b90d555 |
| 2b297563-1d34-45c8-97e1-52169d8bc467 | ClimIntellio Discovery Call between Harshi... | What: ClimIntellio Discovery Call between ... | 2026-09-08 05:30:00 | 2026-09-08 06:00:00 | Google Meet | https://meet.google.com/gdt-apcv-oxc | c30c78d7-9398-4517-a54a-64005b90d555 |
| bac22414-97ef-4af7-be5d-c3877704eafb | Company Call |  | 2026-08-31 05:00:00 | 2026-08-31 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| f6bd3a94-dbbd-4374-89af-90034876cb48 | Company Call |  | 2026-09-01 05:00:00 | 2026-09-01 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 6a19e5ec-f746-4436-8262-1c258f8408c9 | ClimAgro Weekly Updates |  | 2026-10-17 05:30:00 | 2026-10-17 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8ac3da68-0978-4b09-841b-324965a88908 | Office |  | 2026-11-13 18:30:00 | 2026-11-15 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 09ad534e-576d-4b8d-9c7d-9ed28f330e71 | ClimAgro Weekly Updates |  | 2026-11-07 05:30:00 | 2026-11-07 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| bc1ec592-d67a-43d7-8312-de0e7bd7bcec | Sales CRM Meeting |  | 2026-09-25 10:30:00 | 2026-09-25 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d02e5ada-aac3-4876-a62c-5499eb0766d4 | Office |  | 2026-11-16 18:30:00 | 2026-11-18 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3ddd83e4-7424-485d-b6fc-d1dba632fbe9 | Avani Sports |  | 2026-10-19 09:15:00 | 2026-10-19 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6eb98d8a-6762-4c98-9225-564345b7d040 | ClimAgro Weekly Updates |  | 2026-10-03 05:30:00 | 2026-10-03 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 98f5dadb-395b-4236-9bd1-aee20e57d72e | Office |  | 2026-11-24 18:30:00 | 2026-11-26 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 146e5da4-cdfd-4bae-a768-1dbba096f472 | Sales CRM Meeting |  | 2026-10-14 10:30:00 | 2026-10-14 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9b966cbf-94a3-404c-a063-c01621cabaf9 | Sales CRM Meeting |  | 2026-10-16 10:30:00 | 2026-10-16 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 50322ba6-81b4-4d36-baa7-47f3cefafcf6 | Sales CRM Meeting |  | 2026-10-20 10:30:00 | 2026-10-20 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 41929e04-d40d-42ff-b699-48c0a8f555f8 | Company Call |  | 2026-09-03 05:00:00 | 2026-09-03 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 5bcf55d6-d772-4caf-92a9-0d0229f2ee89 | Sales CRM Meeting |  | 2026-11-06 10:30:00 | 2026-11-06 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ec73a170-2841-45a7-a2b4-90339cbdc4e0 | Sales CRM Meeting |  | 2026-10-29 10:30:00 | 2026-10-29 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a8757565-798e-405f-bbf3-8210cccd0a32 | Sales CRM Meeting |  | 2026-11-02 10:30:00 | 2026-11-02 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 22000ca7-5db1-494d-abd2-56fa28f30f11 | Sales CRM Meeting |  | 2026-11-04 10:30:00 | 2026-11-04 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8250b595-417c-402b-9e41-854facbdf769 | Sales CRM Meeting |  | 2026-10-22 10:30:00 | 2026-10-22 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 0a4bd6b7-f024-41e9-90de-c206a4a84bb2 | Sales CRM Meeting |  | 2026-11-10 10:30:00 | 2026-11-10 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 31a6e8fb-49be-4c77-b280-e49d19631844 | Sales CRM Meeting |  | 2026-11-12 10:30:00 | 2026-11-12 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 2978d2a9-045a-4603-b600-604ea124078e | Sales CRM Meeting |  | 2026-11-16 10:30:00 | 2026-11-16 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 457b9dca-3559-4e52-a942-c1263c3cb861 | Sales CRM Meeting |  | 2026-10-02 10:30:00 | 2026-10-02 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 979c990b-24a1-4b55-aade-39daba830706 | Sales CRM Meeting |  | 2026-10-06 10:30:00 | 2026-10-06 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 36d08fa9-ac5e-4e5c-93ad-e7c82fbd65b6 | Sales CRM Meeting |  | 2026-10-08 10:30:00 | 2026-10-08 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a4f045aa-5be5-4af9-a6ba-a387eea5987b | Sales CRM Meeting |  | 2026-10-27 10:30:00 | 2026-10-27 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e21b45e7-242b-4aad-be64-5c9025907aae | Office |  | 2026-10-16 18:30:00 | 2026-10-18 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 749ff29a-1820-474b-8bd7-a7c72f1de752 | Sales CRM Meeting |  | 2026-10-12 10:30:00 | 2026-10-12 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c40eb1b2-982d-4255-945b-ce8031173c75 | Sales CRM Meeting |  | 2026-11-20 10:30:00 | 2026-11-20 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9dd00b9d-f706-4de8-8b4c-131740b362e2 | Dev call, 9:20 |  | 2026-11-26 03:45:00 | 2026-11-26 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e9e38214-acac-4f47-8bf8-951e42ef4401 | Company Call |  | 2026-09-04 05:00:00 | 2026-09-04 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 952474c8-b6c2-49a8-b02f-6b6393c9f9e3 | Company Call |  | 2026-09-07 05:00:00 | 2026-09-07 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| da044720-d2bd-4d91-bfb7-4894b5e47058 | Company Call |  | 2026-09-08 05:00:00 | 2026-09-08 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 018c8fd8-aafa-4ec1-bb7d-32cc68592b5f | Company Call |  | 2026-09-10 05:00:00 | 2026-09-10 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| aa03f296-139f-4ce8-9919-3c8b927f560f | Company Call |  | 2026-09-11 05:00:00 | 2026-09-11 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| c176bd1d-50a1-4101-a9de-e0b267674755 | Company Call |  | 2026-09-14 05:00:00 | 2026-09-14 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| ad6b804e-0ca3-4dd4-96f0-e73b83e31425 | Office |  | 2026-09-28 18:30:00 | 2026-09-30 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6d321a92-110f-400a-9d02-20d71042efab | Company Call |  | 2026-10-06 05:00:00 | 2026-10-06 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9cd75d93-0bbf-462e-9464-9d288842e735 | Company Call |  | 2026-10-12 05:00:00 | 2026-10-12 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 2de27947-1372-442d-a106-1c9feb1ed32d | Office |  | 2026-11-10 18:30:00 | 2026-11-12 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 72e19a79-8441-41b1-8761-6d448bc1798f | Office |  | 2026-10-21 18:30:00 | 2026-10-23 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c8b3076a-f99c-4836-bec7-429e5fcccd2a | Office |  | 2026-10-29 18:30:00 | 2026-10-31 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| bcd14f87-45f1-4185-821a-a6316cce225c | Company Call |  | 2026-11-27 05:00:00 | 2026-11-27 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 85fe110d-1c97-47f8-a404-3be09cdcb6fb | Dev call, 9:20 |  | 2026-09-29 03:45:00 | 2026-09-29 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 82e8705c-c0ce-46f5-a25e-a7ffd9ebf51c | Dev call, 9:20 |  | 2026-10-08 03:45:00 | 2026-10-08 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e45762ee-f2fb-443b-ae40-2f925884bc37 | Dev call, 9:20 |  | 2026-10-10 03:45:00 | 2026-10-10 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 2c71272c-ae8c-4e47-b0c9-8596b3e36e84 | Dev call, 9:20 |  | 2026-10-14 03:45:00 | 2026-10-14 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9ebcff50-dae1-4702-a594-d7f5eaf28417 | Dev call, 9:20 |  | 2026-10-16 03:45:00 | 2026-10-16 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d1f68ac1-a0ff-45fa-b960-e9792a056155 | Dev call, 9:20 |  | 2026-10-18 03:45:00 | 2026-10-18 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 26f16d37-dd54-4b9f-a8b0-77936e42a220 | Dev call, 9:20 |  | 2026-10-19 03:45:00 | 2026-10-19 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3fb3d0fd-575b-4de4-b0da-a8560b23ea61 | Dev call, 9:20 |  | 2026-09-28 03:45:00 | 2026-09-28 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| fc9c930d-a9b3-405a-b83e-cf97abd7141b | Company Call |  | 2026-09-15 05:00:00 | 2026-09-15 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 38a63c81-5845-47b9-9e88-96d9acd34336 | Company Call |  | 2026-09-17 05:00:00 | 2026-09-17 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| f2410dd3-ab4a-4722-b8b9-03bb4f16aa33 | Company Call |  | 2026-09-18 05:00:00 | 2026-09-18 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| eaca9265-8687-4ba7-9c20-588d0c640ccd | Dev call, 9:20 |  | 2026-10-03 03:45:00 | 2026-10-03 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 086a393d-597e-4ac7-be86-6055cbd48c4c | Dev call, 9:20 |  | 2026-09-30 03:45:00 | 2026-09-30 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 498b813c-a74b-4e4a-b27b-e17d9e9e2681 | Dev call, 9:20 |  | 2026-10-01 03:45:00 | 2026-10-01 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ef83e5fe-196c-4daf-8c1e-1cfc1269f55f | Dev call, 9:20 |  | 2026-10-05 03:45:00 | 2026-10-05 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 28c9e877-2573-480d-a57e-95afa0d9dbc5 | Dev call, 9:20 |  | 2026-10-12 03:45:00 | 2026-10-12 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3af62091-ea07-4268-b4ef-821a72bc6211 | Dev call, 9:20 |  | 2026-10-07 03:45:00 | 2026-10-07 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 5c9f75e8-5a0e-4664-b77e-78fc8f5049a4 | Dev call, 9:20 |  | 2026-10-27 03:45:00 | 2026-10-27 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 25c51a0d-c216-4241-8edc-98f6741cd666 | Office |  | 2026-10-12 18:30:00 | 2026-10-14 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d507b257-a043-4820-bce1-a326a446af0a | Dev call, 9:20 |  | 2026-10-29 03:45:00 | 2026-10-29 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ac57072f-743b-43e9-9b54-6bdc7e31729e | Dev call, 9:20 |  | 2026-10-31 03:45:00 | 2026-10-31 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d6f5beff-d34f-4377-a24c-4c98b13e028b | Dev call, 9:20 |  | 2026-11-01 03:45:00 | 2026-11-01 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b9e1da66-d81c-413f-b97e-75e784388bff | Dev call, 9:20 |  | 2026-11-03 03:45:00 | 2026-11-03 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 602049ab-a7bc-47be-8437-4c3205f8c141 | Dev call, 9:20 |  | 2026-11-05 03:45:00 | 2026-11-05 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b2d5f1b7-5d41-48a0-b7f1-83c136b485c6 | Dev call, 9:20 |  | 2026-11-09 03:45:00 | 2026-11-09 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c093195c-9085-4ab2-b5f7-b7b3c83c213b | Dev call, 9:20 |  | 2026-11-11 03:45:00 | 2026-11-11 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 678f6b32-8934-4e41-8de3-86b61c628cdb | Dev call, 9:20 |  | 2026-11-13 03:45:00 | 2026-11-13 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 44a35838-e3af-4f19-9abe-c94fa24d30b4 | Dev call, 9:20 |  | 2026-11-14 03:45:00 | 2026-11-14 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 84184696-a7e2-4322-8158-85842f6c7046 | Dev call, 9:20 |  | 2026-11-16 03:45:00 | 2026-11-16 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 54c08358-449f-4f92-aca3-544c62a682ae | Dev call, 9:20 |  | 2026-11-18 03:45:00 | 2026-11-18 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 770a10c9-f429-42f5-b7b0-74bf135ad411 | Dev call, 9:20 |  | 2026-11-20 03:45:00 | 2026-11-20 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7574dba7-85b0-4309-b9b3-4bc005e2ea2d | Dev call, 9:20 |  | 2026-10-23 03:45:00 | 2026-10-23 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 72e52cab-1f05-414a-ade7-8ed940de97ac | Dev call, 9:20 |  | 2026-10-25 03:45:00 | 2026-10-25 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 058fcd3f-4a34-4038-b205-24ae58097aab | Dev call, 9:20 |  | 2026-10-21 03:45:00 | 2026-10-21 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e5e42510-27ca-41f3-8c3b-e16799353fbb | Company Call |  | 2026-09-21 05:00:00 | 2026-09-21 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 9c7ad347-8cfb-4be5-b354-1733b2c319ec | School Time |  | 2026-09-28 02:00:00 | 2026-09-28 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 4fbb1bbf-d974-415f-ab8c-9235dfc4aa95 | Company Call |  | 2026-09-22 05:00:00 | 2026-09-22 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 97a2ba17-8850-46f4-9340-65ef5eec6f15 | Company Call |  | 2026-09-24 05:00:00 | 2026-09-24 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 41787735-674e-43d0-82e8-a07c89e21560 | Avani Sports |  | 2026-10-21 09:15:00 | 2026-10-21 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 97d332d2-7d08-4b7e-9ffd-b53a460ce17a | Company Call |  | 2026-09-28 05:00:00 | 2026-09-28 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a3bb4d4c-2346-4f0e-924d-745a72d5d50a | Bharat win Application |  | 2026-08-31 17:00:00 | 2026-08-31 18:00:00 | Google Meet | https://meet.google.com/aco-jcee-amh | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| dc575317-281e-4723-8268-a05dc7392bd9 | School Time |  | 2026-10-05 02:00:00 | 2026-10-05 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| feaefe40-6999-494e-9aa3-118a406b063d | ClimAgro Discovery Call |  | 2026-09-01 05:30:00 | 2026-09-01 06:00:00 | Google Meet | https://meet.google.com/uqo-bynq-eku | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 25c5b02f-d342-4f78-af81-15ddfd41f7ef | CropRisk Discovery Call between Harshit Mi... | What: CropRisk Discovery Call between Hars... | 2026-09-01 10:00:00 | 2026-09-01 10:30:00 | Google Meet | https://meet.google.com/aaq-rypf-msb | c30c78d7-9398-4517-a54a-64005b90d555 |
| a09481e0-2307-45a4-8dc5-229ff280a4c4 | Discussion |  | 2026-09-01 12:30:00 | 2026-09-01 13:00:00 | Google Meet | https://meet.google.com/ahw-varg-xmq | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ad5c0941-8422-46fc-89ea-bb7f0e0eb6cd | School Time |  | 2026-09-29 02:00:00 | 2026-09-29 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 4d9ad7d1-cb8b-4845-a0e2-049fab295bd9 | Agra Proposal |  | 2026-09-28 14:45:00 | 2026-09-28 15:15:00 | Google Meet | https://meet.google.com/qtk-uqgp-nur | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| baf5321d-ffcd-4cb2-b263-440df7bef34c | Company Call |  | 2026-10-15 05:00:00 | 2026-10-15 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d81ed7e0-1662-447e-a1e0-cac5085462f2 | Company Call |  | 2026-10-19 05:00:00 | 2026-10-19 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| cbe9acc1-73f8-49c8-a4e4-20800c39278f | School Time |  | 2026-09-30 02:00:00 | 2026-09-30 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| cabc6d40-2596-4836-96b5-66ee653dfe61 | School Time |  | 2026-10-01 02:00:00 | 2026-10-01 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 76323713-de51-4b8b-94a2-62f3d94b4bc0 | School Time |  | 2026-10-02 02:00:00 | 2026-10-02 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b24e568d-f129-4963-8c94-4ba7b73f3fb1 | Sales CRM Meeting |  | 2026-11-26 10:30:00 | 2026-11-26 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 9fc3b022-96b5-4570-acfd-c89a03138013 | School Time |  | 2026-10-21 02:00:00 | 2026-10-21 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 861d116a-f454-44e7-be5a-12fb07060a7b | School Time |  | 2026-10-13 02:00:00 | 2026-10-13 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b74cbbf1-80e9-4b12-981d-53965f780dfd | School Time |  | 2026-10-15 02:00:00 | 2026-10-15 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| f4c5cd1d-7173-425d-95e1-0f2b04357a21 | School Time |  | 2026-10-16 02:00:00 | 2026-10-16 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8bd3bd1c-ea27-4a8c-a26f-24ff478e34f5 | FW: Closed-door roundtable discussion on A... |    From: mannat.p@energivaventures.com Whe... | 2026-09-02 04:30:00 | 2026-09-02 07:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 28a2d149-40e4-409d-9f1c-56f196793472 | School Time |  | 2026-10-22 02:00:00 | 2026-10-22 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| abc5917c-2fa4-4091-a6ac-8dd36c186381 | Sales Team Discussion  |  | 2026-09-02 14:40:00 | 2026-09-02 15:10:00 | Google Meet | https://meet.google.com/ojs-tzti-jxq | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 494c3ffe-b521-462a-b7c8-67cfb19c011e | School Time |  | 2026-10-23 02:00:00 | 2026-10-23 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 12a33e4c-0f70-470b-a3e6-473480ecfc58 | School Time |  | 2026-10-29 02:00:00 | 2026-10-29 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 714d0113-0f0c-4143-959b-54b051ce3a65 | Startup Expo at UP Startup Samvad 3.0 at L... |  | 2026-09-07 18:30:00 | 2026-09-09 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a6fba09b-c01c-4487-90c4-1edf2cb5d610 | School Time |  | 2026-10-28 02:00:00 | 2026-10-28 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a845a78a-13e4-4045-b26e-75563ed470be | Sales Team Discussion  |  | 2026-09-03 06:00:00 | 2026-09-03 06:30:00 | Google Meet | https://meet.google.com/skn-ybzs-pdw | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c7ab875f-fef7-4c3a-8f2f-e8c0440675e3 | School Time |  | 2026-10-30 02:00:00 | 2026-10-30 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c1fee4b1-514b-416d-8e86-724019fb4a87 | School Time |  | 2026-10-27 02:00:00 | 2026-10-27 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 20d1130a-f7cf-4f7d-8dcd-2e337ef694ec | School Time |  | 2026-10-12 02:00:00 | 2026-10-12 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d0b96570-2a7d-4c36-9d30-cb56037f9b50 | School Time |  | 2026-11-13 02:00:00 | 2026-11-13 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8e675683-3ba4-41fc-8e65-e444bfa60dd6 | School Time |  | 2026-11-09 02:00:00 | 2026-11-09 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ac4bbe2a-b5e1-499e-821e-c7dd2798c1ac | School Time |  | 2026-11-10 02:00:00 | 2026-11-10 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 32c22f86-8af4-4349-a1e0-2abb7e77b45f | School Time |  | 2026-11-11 02:00:00 | 2026-11-11 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| eb1c8311-45cd-4761-9bd7-71a6c36e85b3 | ClimAgro MKT Sept Plan  |  | 2026-09-03 10:15:00 | 2026-09-03 10:45:00 | Google Meet | https://meet.google.com/ghn-marq-bct | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 995db240-33b8-4144-a313-9120e4e509c0 | EHM Weekly Updates |  | 2026-10-03 06:30:00 | 2026-10-03 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 685c3939-b96f-4c67-879b-ae719527b002 | School Time |  | 2026-11-17 02:00:00 | 2026-11-17 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c7955462-41cd-4d36-9929-de44ca9a09fd | School Time |  | 2026-11-20 02:00:00 | 2026-11-20 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 08b809a8-fcfa-4eaf-8090-ef8c7f2305ab | Maps Discussion |  | 2026-09-04 06:30:00 | 2026-09-04 07:00:00 | Google Meet | https://meet.google.com/jwb-uafo-jwo | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6268eec5-4f47-4a04-91da-ef611b6607a3 | Discussion |  | 2026-09-04 08:00:00 | 2026-09-04 08:30:00 | Google Meet | https://meet.google.com/que-crbw-pti | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a955afea-b0db-4363-9514-95f975f22e1c | School Time |  | 2026-11-12 02:00:00 | 2026-11-12 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 63c04696-6cce-4400-b692-ab67c7a58291 | School Time |  | 2026-11-25 02:00:00 | 2026-11-25 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 1cdc83dd-5656-41dc-aa78-156c3b2c666a | School Time |  | 2026-11-26 02:00:00 | 2026-11-26 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 1c275e46-1b32-48f8-8b8e-dd05aa894213 | School Time |  | 2026-11-18 02:00:00 | 2026-11-18 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| e89dc199-8419-42aa-b4eb-276bef166e0f | School Time |  | 2026-11-06 02:00:00 | 2026-11-06 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ede0592b-2f8e-4968-b148-9ef301cff580 | Company Call |  | 2026-09-25 05:00:00 | 2026-09-25 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| d53e72d4-8555-4ae4-b6e2-238978370f02 | Internal Discusson |  | 2026-09-04 15:12:00 | 2026-09-04 16:12:00 | Google Meet | https://meet.google.com/ffc-afud-icw | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| fb596019-02cc-43f0-a417-3ff4baafec6a | Catch up and potential collaborations |  | 2026-09-06 05:30:00 | 2026-09-06 06:30:00 | Google Meet | https://meet.google.com/qvm-xpex-rgk | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| bd681b51-cf8a-4d5b-b33e-28ccbf9478c5 | AI Manthan - CSJMU |  | 2026-09-11 18:30:00 | 2026-09-13 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 7ba22fa6-6982-4b97-8db6-c9d78b693f6f | Agra Proposal |  | 2026-09-11 09:45:00 | 2026-09-11 10:15:00 | Google Meet | https://meet.google.com/ves-wrtq-xkf | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 06c5d44a-5b3d-464f-a820-157bb7c07ce5 | MOU between EHM Consultancy Pvt. Ltd. and ... |  | 2026-09-11 13:15:00 | 2026-09-11 13:45:00 | Google Meet | https://meet.google.com/kgd-thqy-paa | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3752a067-b49e-441f-9bda-c90369286713 | EHM Weekly Updates |  | 2026-09-26 06:30:00 | 2026-09-26 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | c30c78d7-9398-4517-a54a-64005b90d555 |
| bf2e9f1b-7bad-4aa8-9f12-25256d75ac10 | Unlocking Investment Opportunities | You are hosting this event. View the publi... | 2026-09-17 09:30:00 | 2026-09-17 11:00:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 0051bf69-1dd2-455d-a0cb-bba7ef829000 | Internal meeting - Harshit |  | 2026-09-14 08:00:00 | 2026-09-14 08:30:00 | Google Meet | https://meet.google.com/hdm-oyps-hti | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 7072c6d9-4632-4dad-aa46-1bedb7d74724 | Avani Sports |  | 2026-08-31 09:15:00 | 2026-08-31 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| e9eb528e-9676-4ee0-96cd-52a44718fce7 | School Time |  | 2026-11-03 02:00:00 | 2026-11-03 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3b5d0261-f6ff-4365-9e2f-b0fbea09207b | School Time |  | 2026-11-04 02:00:00 | 2026-11-04 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 231c97d5-e507-48a3-9f66-2579080a647c | Avani Sports |  | 2026-09-02 09:15:00 | 2026-09-02 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8e950044-95fb-47ed-832c-f5e198f53f2c | Avani Sports |  | 2026-09-04 09:15:00 | 2026-09-04 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 82ef2f8a-616c-467a-b784-6e72c9f50a30 | Delhi & Agra Proposal  |  | 2026-09-11 11:30:00 | 2026-09-11 12:00:00 | Google Meet | https://meet.google.com/yxw-srym-ewh | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| bc2b8a82-584e-4fda-899d-f68c558debd5 | School Time |  | 2026-10-08 07:45:00 | 2026-10-08 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c5211977-1396-487e-8bff-b70ed8e3c93d | School Time |  | 2026-10-06 07:45:00 | 2026-10-06 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 081c23fa-890f-44ae-b750-a16b5bc7b3a2 | Dev call, 9:20 |  | 2026-11-27 03:45:00 | 2026-11-27 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 58d1f6eb-6718-4956-8074-60da03636b0d | Avani Sports |  | 2026-09-07 09:15:00 | 2026-09-07 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| f16643a4-f669-4c36-afde-25907512852a | Avani Sports |  | 2026-09-09 09:15:00 | 2026-09-09 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b2258683-a3bb-44ba-8139-4935b0272937 | Avani Sports |  | 2026-09-11 09:15:00 | 2026-09-11 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2772b52a-1824-4398-bd32-3358d083cf59 | Avani Sports |  | 2026-09-16 09:15:00 | 2026-09-16 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 4dd34333-c0c1-40cb-9aee-696fa71843d2 | School Time |  | 2026-10-12 07:45:00 | 2026-10-12 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 5cbeb9e5-e355-49c5-8bbb-76d43ed6e384 | School Time |  | 2026-10-13 07:45:00 | 2026-10-13 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 1c461124-5d69-4ce4-a36d-b772637fa099 | Avani Sports |  | 2026-09-18 09:15:00 | 2026-09-18 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 732fd7c8-852c-456b-941f-17cd900a4b9f | Avani Sports |  | 2026-09-21 09:15:00 | 2026-09-21 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a363ad5a-e2f0-4d46-9591-3eecffea4fd7 | Avani Sports |  | 2026-09-23 09:15:00 | 2026-09-23 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8753744a-5f59-4db5-a9e9-a81d041a2b92 | School Time |  | 2026-10-02 07:45:00 | 2026-10-02 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2ae5d8a4-1744-4fa5-9db3-8281eedb00dd | School Time |  | 2026-10-05 07:45:00 | 2026-10-05 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3c234f62-95d1-4827-bab0-59a894d49cc4 | School Time |  | 2026-10-09 07:45:00 | 2026-10-09 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 90e45659-ff09-4daf-8908-4323cfa001e7 | School Time |  | 2026-09-29 07:45:00 | 2026-09-29 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 7b80f968-e08a-4873-8c66-9cfb473e6a1a | School Time |  | 2026-09-30 07:45:00 | 2026-09-30 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 693c5c60-b3e5-44f3-9bb8-66f42c5acd7c | School Time |  | 2026-10-07 07:45:00 | 2026-10-07 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2a612bfc-43be-49de-97d4-65d646e7f02c | School Time |  | 2026-10-30 07:45:00 | 2026-10-30 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 35fc0337-9a34-478a-9434-2377dc7f18e9 | School Time |  | 2026-11-04 07:45:00 | 2026-11-04 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2368d3c6-3218-4b1a-bb63-0db70d226dc7 | School Time |  | 2026-10-27 07:45:00 | 2026-10-27 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| deb40fcb-b7f1-48d8-8c14-5d59b0177417 | School Time |  | 2026-10-29 07:45:00 | 2026-10-29 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| e57a1ae3-0d82-434c-b96e-8a9e4a3ac37b | School Time |  | 2026-10-23 07:45:00 | 2026-10-23 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 0c5de02f-bd25-4685-a62c-03ab824745ac | School Time |  | 2026-11-05 07:45:00 | 2026-11-05 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| e045edae-2b17-4251-b06a-c19408b43e94 | School Time |  | 2026-11-09 07:45:00 | 2026-11-09 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| dc5fc557-b145-4746-b351-3e93a24261c3 | School Time |  | 2026-10-26 07:45:00 | 2026-10-26 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| e32640ac-f235-4d48-bf74-b75221af7dc9 | School Time |  | 2026-11-06 07:45:00 | 2026-11-06 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c0da93d4-d44e-4aa1-9101-b204311386e2 | School Time |  | 2026-10-21 07:45:00 | 2026-10-21 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 747127f0-6825-481e-bab6-845098571550 | Office |  | 2026-10-18 18:30:00 | 2026-10-20 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b266b179-bd50-4ea9-8154-818c858f32f4 | School Time |  | 2026-11-12 07:45:00 | 2026-11-12 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 26a5c3a0-3109-4d1a-b59a-fa3d6b94677c | School Time |  | 2026-10-22 07:45:00 | 2026-10-22 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 760119e7-938b-46c8-a523-6b619109dd82 | Social Analytics discussion meeting  |  | 2026-09-04 09:45:00 | 2026-09-04 10:15:00 | Google Meet | https://meet.google.com/zoq-uxzm-sgc | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| aeb12fb4-2847-4279-af0a-f47ca11ec714 | School Time |  | 2026-11-03 07:45:00 | 2026-11-03 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 9acb3987-7961-4881-a46e-e99dbe3bbee3 | Sales CRM Meeting |  | 2026-11-27 10:30:00 | 2026-11-27 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7faddcae-5eb6-45c0-8b8f-22dc3c976d31 | School Time |  | 2026-11-02 07:45:00 | 2026-11-02 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| f4482ea5-c1ec-4c76-8568-e46b49c1d5fc | CityAdapt |  | 2026-09-14 09:00:00 | 2026-09-14 09:30:00 | Google Meet | https://meet.google.com/zjw-pnaf-jke | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 6dad5388-0a80-4e54-8d8d-e2b10de6c296 | Agra Proposal - Waste Module |  | 2026-09-15 15:30:00 | 2026-09-15 16:00:00 | Google Meet | https://meet.google.com/ckj-axxh-yca | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 99cb23dd-8e50-4ad8-b432-ea249ac31f60 | School Time |  | 2026-11-13 07:45:00 | 2026-11-13 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2b4e2c75-0314-4f66-a0d4-2d73926b2014 | School Time |  | 2026-11-16 07:45:00 | 2026-11-16 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d7492c0d-3e05-4404-8e86-d12f10d0483e | School Time |  | 2026-11-17 07:45:00 | 2026-11-17 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 67778b14-f136-4373-831f-2a54fc4c3285 | School Time |  | 2026-11-20 07:45:00 | 2026-11-20 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 60a3f022-aaa4-4b69-8caf-192d57702bca | School Time |  | 2026-11-24 07:45:00 | 2026-11-24 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| cb4fd2c7-30d3-48ba-9193-4f53a81d95ba | School Time |  | 2026-11-25 07:45:00 | 2026-11-25 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 9d88bb90-180d-4ad3-b29f-aa3f1ad8f76d | School Time |  | 2026-11-26 07:45:00 | 2026-11-26 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| aaffc5a3-effd-4b74-b013-4ffb0dc5bb35 | EHM Weekly Updates |  | 2026-10-10 06:30:00 | 2026-10-10 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b0bd5404-3482-49f1-b83f-1f9522ccbdaf | Sales CRM Meeting |  | 2026-09-16 10:30:00 | 2026-09-16 11:00:00 | Google Meet | https://meet.google.com/cyn-nscu-aym | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ddcd47fe-5f4c-40ad-a418-1474e5568adb | DOMS IITK Delivery & Quotation |  | 2026-09-22 03:30:00 | 2026-09-22 03:45:00 | Google Meet | https://meet.google.com/ghs-ywor-gwp | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 3fe8dc2d-0307-4e98-aee6-3917150b106b | Agra Waste Management - Dashboard and Fina... |  | 2026-09-24 10:45:00 | 2026-09-24 11:15:00 | Google Meet | https://meet.google.com/xjn-xzbg-onz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 7435041c-b9ca-4b10-9b06-41ee35d8b502 | ClimAgro Company call |  | 2026-09-05 05:30:00 | 2026-09-05 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| f77bdaf3-53ff-4baa-9f7c-bd95478db38e | ClimAgro Company call |  | 2026-09-13 05:30:00 | 2026-09-13 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e2dba32f-8472-4a7e-b6e6-f0e4c717d7ff | ClimAgro Company call |  | 2026-09-19 05:30:00 | 2026-09-19 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8efc44f4-c2df-403d-83a4-2542e68e53ef | Vipasana Sunday |  | 2026-09-27 03:30:00 | 2026-09-27 10:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d4164209-77c1-4755-8e3f-78c9dd632e7f | Vipasana Sunday |  | 2026-10-25 03:30:00 | 2026-10-25 10:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 818e89e4-74bc-44c2-9009-1ba23f8f4f01 | Vipasana Sunday |  | 2026-11-22 03:30:00 | 2026-11-22 10:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a52cb8ee-91cf-4333-9d18-b6207cf9a327 | School Time |  | 2026-10-15 07:45:00 | 2026-10-15 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| cf1a93c1-d2fa-4dfe-a19c-0bb316c95698 | School Time |  | 2026-10-08 02:00:00 | 2026-10-08 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d8b76872-d01f-4fc3-858b-e632f79566e3 | Office |  | 2026-10-27 18:30:00 | 2026-10-29 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 9cb95aac-4ddf-41cb-ba80-669314dcb251 | Anamika 3 monthly review |  | 2026-09-26 04:30:00 | 2026-09-26 05:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| cd1ccd50-95bf-4570-a9c7-5c994ab936b8 | Sales CRM Meeting |  | 2026-09-18 10:30:00 | 2026-09-18 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| fa841555-4dc8-428d-b0f0-f4593125629b | Weekly Engineering Sprint Retrospective | Review Q4 migration progress and blockers | 2026-09-28 10:46:20.155 | 2026-09-28 11:16:20.155 | Google Meet | *null* | e6efb986-4f3d-40ac-bfe7-120fbd9d022d |
| 5b546c7a-36f5-4a9f-92a1-8e17a28af699 | Sales CRM Meeting |  | 2026-09-21 10:30:00 | 2026-09-21 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 4a622f93-f75d-4364-b9c9-37857b6811c0 | School Time |  | 2026-11-10 07:45:00 | 2026-11-10 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 64ab4fdc-0d25-4cb5-9b08-2663e19ef7c7 | Sales CRM Meeting |  | 2026-09-22 10:30:00 | 2026-09-22 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 8e421995-82fa-4e97-9e25-6c47df307cc6 | School Time |  | 2026-10-09 02:00:00 | 2026-10-09 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a01a74af-022b-4c7e-a3b1-c7859abf744d | School Time |  | 2026-11-05 02:00:00 | 2026-11-05 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ff85f73c-3b83-407c-a3fa-ad408b00f019 | Sales CRM Meeting |  | 2026-09-23 10:30:00 | 2026-09-23 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| f431ca06-2550-4419-a488-9a7dd7d6e7f9 | Sales CRM Meeting |  | 2026-09-24 10:30:00 | 2026-09-24 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 25e39283-b69b-4e32-9c11-07a640a66057 | School Time |  | 2026-09-28 07:45:00 | 2026-09-28 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 25abeddb-9bcf-4988-90af-c73d55e85b14 | School Time |  | 2026-09-25 02:00:00 | 2026-09-25 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b2a57895-5660-4d9a-8c18-c7822ff5a351 | School Time |  | 2026-10-07 02:00:00 | 2026-10-07 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 667046b0-5207-4a31-b60b-10676bd9aee8 | Office |  | 2026-11-20 18:30:00 | 2026-11-22 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3f025c60-f7fe-49d2-854b-33160e13b2b6 | School Time |  | 2026-10-20 07:45:00 | 2026-10-20 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6fa8e7d1-6739-4e0d-ac63-4df276d78f23 | School Time |  | 2026-11-18 07:45:00 | 2026-11-18 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6bfabae5-6b34-45cf-ab05-bbbe70b864ab | School Time |  | 2026-11-19 07:45:00 | 2026-11-19 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 2d2a30b1-1fd4-441f-9be4-6de21d49a38a | Company Call |  | 2026-11-26 05:00:00 | 2026-11-26 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | c30c78d7-9398-4517-a54a-64005b90d555 |
| 6e5c9902-ac34-4921-aad2-13f0ff59db96 | EHM CRM Meeting |  | 2026-09-28 08:30:00 | 2026-09-28 09:00:00 | Google Meet | https://meet.google.com/nsk-nyao-mph | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 4b86783c-e83a-47c8-84f4-d9def97ee535 | Office |  | 2026-10-15 18:30:00 | 2026-10-17 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 876976f3-fbe9-46d9-9e2c-df2c007bd05f | School Time |  | 2026-09-25 07:45:00 | 2026-09-25 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 5a41e3a2-a8e3-4ea5-bad2-788a150c5d9a | School Time |  | 2026-10-14 02:00:00 | 2026-10-14 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| a2b9a856-3a4f-4de8-ac94-7af636c90f34 | School Time |  | 2026-10-19 02:00:00 | 2026-10-19 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c52d1f99-8918-406c-8e1b-804c8073fda7 | Company Call |  | 2026-10-29 05:00:00 | 2026-10-29 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c372f181-49e8-4495-a9c3-55129033973e | Office |  | 2026-10-05 18:30:00 | 2026-10-07 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 14ec5750-ad11-43e2-9648-86e54a5dcb22 | Office |  | 2026-11-03 18:30:00 | 2026-11-05 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 48dc5bd9-bb81-48b3-9e99-c3d7ddde56d0 | Office |  | 2026-11-04 18:30:00 | 2026-11-06 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 9c85c9f9-5df5-4ca9-8bae-a9ebcb6f2d69 | Office |  | 2026-10-22 18:30:00 | 2026-10-24 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 0c29282b-9c9a-45a7-b542-cb5239c53f6a | School Time |  | 2026-11-02 02:00:00 | 2026-11-02 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d231e0ee-3c69-4080-997b-b9fc1b82cd47 | School Time |  | 2026-10-06 02:00:00 | 2026-10-06 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 4c7ad478-c67b-465a-a190-23c39dfc05d4 | Sales CRM Meeting |  | 2026-11-18 10:30:00 | 2026-11-18 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| afbeeff2-95c9-4cf6-bf12-29bf4c8fe770 | School Time |  | 2026-11-11 07:45:00 | 2026-11-11 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d87d6d89-752b-41a4-a50b-f11a04604d03 | School Time |  | 2026-10-16 07:45:00 | 2026-10-16 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 92ae954f-64d5-4b19-a9c9-0db6ac0c47e6 | Office |  | 2026-11-06 18:30:00 | 2026-11-08 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ee358280-9fac-4dec-81a7-ee390ecd0ae5 | School Time |  | 2026-10-19 07:45:00 | 2026-10-19 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| f07d330b-d28a-40d0-be8f-ac6da3e4de90 | Office |  | 2026-10-20 18:30:00 | 2026-10-22 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 8c48bb6f-9fdf-46a4-a32b-aa59c94c5740 | School Time |  | 2026-10-20 02:00:00 | 2026-10-20 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 30523430-0086-4a0e-bbf8-d9e02d7a0d89 | Office |  | 2026-10-14 18:30:00 | 2026-10-16 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 61a53e29-c82e-4d9f-98ca-20cf31156765 | Hdfc credit card |  | 2026-10-11 04:30:00 | 2026-10-11 05:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 72f6689e-ef4f-4709-8a37-2f889a45bdb6 | School Time |  | 2026-10-01 07:45:00 | 2026-10-01 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 061f92c2-8d81-4647-87bf-496a25e4b2b2 | School Time |  | 2026-10-14 07:45:00 | 2026-10-14 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 53a19edf-3289-46e5-a1e4-b9b1205fc9c8 | School Time |  | 2026-10-28 07:45:00 | 2026-10-28 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ec281635-0e84-4a60-961a-edef182c910d | School Time |  | 2026-11-23 07:45:00 | 2026-11-23 08:15:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 35c623f1-94db-4c11-91a2-418ba23bd6d1 | Office |  | 2026-11-25 18:30:00 | 2026-11-27 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| c08a0f1c-58f6-4712-afaf-66d99850d659 | School Time |  | 2026-10-26 02:00:00 | 2026-10-26 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6f097b96-4aa3-4d32-a863-073850c25c5d | School Time |  | 2026-11-16 02:00:00 | 2026-11-16 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 048c60c4-e3e2-4cfc-bb62-0895b347b7b7 | Sales CRM Meeting |  | 2026-09-29 10:30:00 | 2026-09-29 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| ecace191-717b-4dcc-8c47-fc3d9da4b21a | Sales CRM Meeting |  | 2026-09-30 10:30:00 | 2026-09-30 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 4b6de9e1-0bd4-4ac4-b06a-2b683146fb86 | Sales CRM Meeting |  | 2026-10-28 10:30:00 | 2026-10-28 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| c64d09e3-5053-42d9-8e41-706823c32054 | Office |  | 2026-10-28 18:30:00 | 2026-10-30 18:29:59 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| ced0ef50-15d1-4f0f-9d6c-c210fd8e6698 | Dev call, 9:20 |  | 2026-11-22 03:45:00 | 2026-11-22 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b378a3fc-e102-44fc-b4e1-e3f106875fdb | Weekly Engineering Sprint Retrospective | Review Q4 migration progress and blockers | 2026-09-28 10:44:29.673 | 2026-09-28 11:14:29.673 | Google Meet | *null* | e6efb986-4f3d-40ac-bfe7-120fbd9d022d |
| 769d4a51-bfc8-43f4-9d3f-acc885557adf | School Time |  | 2026-11-19 02:00:00 | 2026-11-19 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 27f22e63-77f1-48ab-b858-690b9e655bd2 | Avani Sports |  | 2026-09-25 09:15:00 | 2026-09-25 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 6a460a13-d4f3-49b2-9cdb-98dd18e2b6df | School Time |  | 2026-11-23 02:00:00 | 2026-11-23 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3f96f94e-34da-44af-969a-7c53acfc104a | School Time |  | 2026-11-24 02:00:00 | 2026-11-24 02:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 3f20e386-6e4b-49e1-a119-e830c14ee3bd | Dev call, 9:20 |  | 2026-11-23 03:45:00 | 2026-11-23 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 23349252-aa81-4a69-9ec6-c3e0a3c145a0 | Hdfc credit card |  | 2026-11-11 04:30:00 | 2026-11-11 05:30:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 58fc405b-5a32-4767-8bb4-c9b6ed9168de | Company Call |  | 2026-11-23 05:00:00 | 2026-11-23 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| bd167100-d0ac-4de8-9307-376376a3bd41 | Avani Sports |  | 2026-09-30 09:15:00 | 2026-09-30 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| d5bbb8be-5f7f-42c1-a3eb-ea266bef5ad9 | Avani Sports |  | 2026-10-07 09:15:00 | 2026-10-07 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 7a49b6e3-a0fe-4bbd-b57e-75db529b9b90 | Avani Sports |  | 2026-10-09 09:15:00 | 2026-10-09 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| b3a4c469-e584-4022-a7ce-93e5dd7446fc | Avani Sports |  | 2026-10-12 09:15:00 | 2026-10-12 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| f5fd804a-81c4-4ef3-83f8-60aaea13b2ad | Sales CRM Meeting |  | 2026-11-23 10:30:00 | 2026-11-23 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| d9cd034b-435f-44b1-b4e8-78f6c9a32c05 | ClimAgro Weekly Updates |  | 2026-11-14 05:30:00 | 2026-11-14 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 0e97ab03-81d6-4459-8c7c-29fedd0922e0 | Avani Sports |  | 2026-10-14 09:15:00 | 2026-10-14 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 07d1c2f3-f790-4cc4-b4c5-838c30f44987 | Sales CRM Meeting |  | 2026-11-24 10:30:00 | 2026-11-24 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 68c6954a-546f-451b-9b1d-f9e71e1c7a9e | Dev call, 9:20 |  | 2026-11-24 03:45:00 | 2026-11-24 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 4cfd003b-22dd-4312-84aa-5909d08bc520 | Kisan Survey demo  |  | 2026-09-25 10:00:00 | 2026-09-25 10:15:00 | Google Meet | https://meet.google.com/yfa-rjba-wob | c30c78d7-9398-4517-a54a-64005b90d555 |
| e22790fa-b83f-4139-a895-ea64dff7580c | EHM Weekly Updates |  | 2026-10-17 06:30:00 | 2026-10-17 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 66b7b911-dd21-48fc-b1d0-1545898a06f0 | ClimAgro Weekly Updates |  | 2026-10-24 05:30:00 | 2026-10-24 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| a5a5ba6a-b1be-43f1-a3b6-ba7ff820b04e | Dev call, 9:20 |  | 2026-11-25 03:45:00 | 2026-11-25 04:15:00 | Google Meet | https://meet.google.com/ger-vadd-qfg | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| da04f780-8761-4f0e-9bc4-ae33d527693b | EHM CRM Demo Meeting |  | 2026-09-28 06:00:00 | 2026-09-28 06:30:00 | Google Meet | https://meet.google.com/sbq-kfnj-zhb | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 185a12d3-15d8-4d02-9350-da3948944c7c | Avani Sports |  | 2026-09-28 09:15:00 | 2026-09-28 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 40d09994-f884-49b6-bb23-94ce83f7e296 | Avani Sports |  | 2026-10-16 09:15:00 | 2026-10-16 09:45:00 | Google Meet | https://www.google.com/calendar/event?eid=... | 1e32f27a-d641-40ff-923c-05fef4836c10 |
| 9ee8ef57-c239-4d8c-adbe-61b2f35e86fe | Sales CRM Meeting |  | 2026-11-25 10:30:00 | 2026-11-25 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| e9d5cbf7-d42f-420d-8a8c-2aeb6205dd10 | EHM Weekly Updates |  | 2026-10-24 06:30:00 | 2026-10-24 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| f33bdae2-d071-4de7-83c8-ac91112c193e | EHM Weekly Updates |  | 2026-11-07 06:30:00 | 2026-11-07 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| f06686e4-7ff3-4802-955f-180477ed6441 | EHM Weekly Updates |  | 2026-11-14 06:30:00 | 2026-11-14 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| b9115e20-637f-4d93-a22c-fd6f17c0d9c3 | EHM Weekly Updates |  | 2026-10-31 06:30:00 | 2026-10-31 07:00:00 | Google Meet | https://meet.google.com/ckr-uwko-tak | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| accb8c5f-6d1b-46a3-88b2-f95e1ba4c7fb | ClimAgro Weekly Updates |  | 2026-11-21 05:30:00 | 2026-11-21 06:15:00 | Google Meet | https://meet.google.com/kni-opev-xfu | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 18c3d014-77b8-4ddf-acf3-83e4c16cfdcd | Company Call |  | 2026-11-24 05:00:00 | 2026-11-24 05:30:00 | Google Meet | https://meet.google.com/yoj-opxb-qdz | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| 415ec00a-130c-4f37-a1e0-e0227b5f288b | Sales CRM Meeting |  | 2026-09-28 10:30:00 | 2026-09-28 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |
| aa15165c-533b-4815-9d5b-b0f511ecdf56 | Sales CRM Meeting |  | 2026-10-26 10:30:00 | 2026-10-26 11:00:00 | Google Meet | https://meet.google.com/ibg-yuxg-qce | 67f526ba-afcf-4ec0-bf41-da1468bfb816 |

### Complete Field Data & Records (`meetings`)

```json
[
  {
    "id": "4093359a-61f1-4b1c-bc47-8ca2d77f1c67",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-07 18:30:00",
    "end_time": "2026-10-09 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjEwMDggaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261008",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:26.641542",
    "status": "CANCELLED"
  },
  {
    "id": "955f9c88-b754-4d12-a630-41966f8d19ce",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-11-21 06:30:00",
    "end_time": "2026-11-21 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261121T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:13.621651",
    "status": "SCHEDULED"
  },
  {
    "id": "58cd0f8d-81f1-4ca3-ad29-fe6a03aa39e2",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-11 18:30:00",
    "end_time": "2026-11-13 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjExMTIgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261112",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:27.483305",
    "status": "CANCELLED"
  },
  {
    "id": "d7a2a9a1-6de6-433b-9702-c04612eb5452",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-05 18:30:00",
    "end_time": "2026-11-07 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjExMDYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261106",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.46924",
    "status": "CANCELLED"
  },
  {
    "id": "efa1759d-cc2d-4704-9ce6-81210db44a16",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-10-10 05:30:00",
    "end_time": "2026-10-10 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261010T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:05.947901",
    "status": "SCHEDULED"
  },
  {
    "id": "9306d0ee-ddbc-4497-b5ae-15375f871f4a",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-10-31 05:30:00",
    "end_time": "2026-10-31 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261031T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:07.385898",
    "status": "SCHEDULED"
  },
  {
    "id": "1c3a58a2-0d6a-4e2f-8311-10cd5b30f9e8",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-02 03:45:00",
    "end_time": "2026-10-02 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261002T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:46.241276",
    "status": "SCHEDULED"
  },
  {
    "id": "5414b552-aca6-4af1-8719-6f91cf010e35",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-05 10:30:00",
    "end_time": "2026-10-05 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261005T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:19.369376",
    "status": "SCHEDULED"
  },
  {
    "id": "e11062f9-32d2-4e0a-80dd-726e24e40e6d",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-07 10:30:00",
    "end_time": "2026-10-07 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261007T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:20.327658",
    "status": "SCHEDULED"
  },
  {
    "id": "2fc80734-0e8a-48cd-8ec7-c680058e4256",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-13 10:30:00",
    "end_time": "2026-10-13 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261013T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:22.241301",
    "status": "SCHEDULED"
  },
  {
    "id": "c4b59990-7a86-4c8d-9ea6-5dba304148d1",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-15 10:30:00",
    "end_time": "2026-10-15 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261015T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:23.199363",
    "status": "SCHEDULED"
  },
  {
    "id": "8cf8b451-2685-4e99-8608-bf595bb976cc",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-19 10:30:00",
    "end_time": "2026-10-19 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261019T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:24.156323",
    "status": "SCHEDULED"
  },
  {
    "id": "17d3e67f-eecb-4df1-836b-a8d6e826fd8d",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-21 10:30:00",
    "end_time": "2026-10-21 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261021T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:25.114779",
    "status": "SCHEDULED"
  },
  {
    "id": "097464ad-0893-4cc6-b31e-9d2d5189831a",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-09 10:30:00",
    "end_time": "2026-10-09 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261009T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:21.284328",
    "status": "SCHEDULED"
  },
  {
    "id": "e892ab27-5585-4b0a-ad56-30d3e2860a14",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-23 10:30:00",
    "end_time": "2026-10-23 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261023T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:26.07514",
    "status": "SCHEDULED"
  },
  {
    "id": "9cdee7a1-8088-45ac-a45a-7b8be6d255b1",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-23 05:00:00",
    "end_time": "2026-10-23 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261023T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:24.616825",
    "status": "SCHEDULED"
  },
  {
    "id": "50195ae4-70c0-4dec-b475-d2fe488b9664",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-27 03:45:00",
    "end_time": "2026-09-27 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260927T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:43.66195",
    "status": "SCHEDULED"
  },
  {
    "id": "1ef35110-279e-4454-9e9b-671ee18e9fcc",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-09 10:30:00",
    "end_time": "2026-11-09 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261109T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:31.374169",
    "status": "SCHEDULED"
  },
  {
    "id": "8253c30a-35ee-451a-a59c-1f9d2ed2cdc6",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-11 10:30:00",
    "end_time": "2026-11-11 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261111T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:32.349679",
    "status": "SCHEDULED"
  },
  {
    "id": "c8870aab-00af-4697-811d-07fc2ac1f9f5",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-13 10:30:00",
    "end_time": "2026-11-13 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261113T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:33.324895",
    "status": "SCHEDULED"
  },
  {
    "id": "93d66e1a-1e9f-4578-b5e6-a915a7bcadaf",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-01 10:30:00",
    "end_time": "2026-10-01 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261001T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:18.410247",
    "status": "SCHEDULED"
  },
  {
    "id": "de066bac-1103-48c3-a843-cdef0ed2413a",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-30 10:30:00",
    "end_time": "2026-10-30 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261030T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:28.467911",
    "status": "SCHEDULED"
  },
  {
    "id": "6f1776c2-8b85-4947-bb8f-bdd5fbde61bc",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-03 10:30:00",
    "end_time": "2026-11-03 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261103T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:29.436255",
    "status": "SCHEDULED"
  },
  {
    "id": "28ad8e92-4616-4c82-9df2-cc8431c5eb9b",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-05 10:30:00",
    "end_time": "2026-11-05 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261105T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:30.400036",
    "status": "SCHEDULED"
  },
  {
    "id": "c46e03b4-2405-461f-8ca6-39ce2077d35a",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-17 10:30:00",
    "end_time": "2026-11-17 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261117T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:34.315077",
    "status": "SCHEDULED"
  },
  {
    "id": "668e0917-a0d2-4391-80c6-a4e9e61aaeff",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-19 10:30:00",
    "end_time": "2026-11-19 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261119T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:35.334173",
    "status": "SCHEDULED"
  },
  {
    "id": "f1799957-a56d-4463-984e-4e3c49849289",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-11 03:45:00",
    "end_time": "2026-10-11 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261011T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:50.620985",
    "status": "SCHEDULED"
  },
  {
    "id": "afca8893-b703-4fd5-b3ea-e6083fbcedda",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-13 03:45:00",
    "end_time": "2026-10-13 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261013T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:51.578314",
    "status": "SCHEDULED"
  },
  {
    "id": "51991b0c-b74a-456e-b1e9-b52403c47fe2",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-04 03:45:00",
    "end_time": "2026-10-04 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261004T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:47.222754",
    "status": "SCHEDULED"
  },
  {
    "id": "e14f8897-52c6-4038-a606-a4e2859d6a9c",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-15 03:45:00",
    "end_time": "2026-10-15 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261015T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:52.53545",
    "status": "SCHEDULED"
  },
  {
    "id": "739926dc-44af-4eb9-afb9-c2c7a4ddcbf8",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-17 03:45:00",
    "end_time": "2026-10-17 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261017T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:53.492635",
    "status": "SCHEDULED"
  },
  {
    "id": "e8cb8e71-e698-402d-9290-079294143e8c",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-20 03:45:00",
    "end_time": "2026-10-20 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261020T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:54.931432",
    "status": "SCHEDULED"
  },
  {
    "id": "ad026e4c-8735-459e-af17-570609df6c81",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-22 03:45:00",
    "end_time": "2026-10-22 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261022T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:55.888788",
    "status": "SCHEDULED"
  },
  {
    "id": "721c4955-f0a0-4766-979e-ae270b370770",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-24 03:45:00",
    "end_time": "2026-10-24 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261024T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:56.845982",
    "status": "SCHEDULED"
  },
  {
    "id": "df83a1fd-29ff-4c78-b585-00844b3352cd",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-26 03:45:00",
    "end_time": "2026-10-26 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261026T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:57.803402",
    "status": "SCHEDULED"
  },
  {
    "id": "99a8379a-ada0-4e21-9f8e-751704f45d96",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-28 03:45:00",
    "end_time": "2026-10-28 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261028T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:58.760615",
    "status": "SCHEDULED"
  },
  {
    "id": "9b972e3a-0a70-4d95-970d-14d747b73d73",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-30 03:45:00",
    "end_time": "2026-10-30 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261030T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:59.718002",
    "status": "SCHEDULED"
  },
  {
    "id": "ca908b59-9433-4e12-9b14-2246bd4a60c7",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-02 03:45:00",
    "end_time": "2026-11-02 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261102T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:01.153507",
    "status": "SCHEDULED"
  },
  {
    "id": "58966524-c45a-4fac-a825-2504e983330f",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-04 03:45:00",
    "end_time": "2026-11-04 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261104T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:02.114673",
    "status": "SCHEDULED"
  },
  {
    "id": "38541d41-9ee8-467d-bcd6-af34c7ed4ddf",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-06 03:45:00",
    "end_time": "2026-11-06 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261106T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:03.073538",
    "status": "SCHEDULED"
  },
  {
    "id": "8cc621e1-7995-4120-9045-20a85ead4547",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-06 03:45:00",
    "end_time": "2026-10-06 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261006T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:48.185279",
    "status": "SCHEDULED"
  },
  {
    "id": "4cba93fe-9ef7-4f53-acbf-f73852234f1d",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-09 03:45:00",
    "end_time": "2026-10-09 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261009T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:49.640869",
    "status": "SCHEDULED"
  },
  {
    "id": "2a78a054-6448-4127-960a-01396ba7b113",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-07 03:45:00",
    "end_time": "2026-11-07 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261107T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:03.55188",
    "status": "SCHEDULED"
  },
  {
    "id": "bc353c2e-e9fa-44a1-acfb-a13b418bfbb4",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-08 03:45:00",
    "end_time": "2026-11-08 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261108T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:04.030618",
    "status": "SCHEDULED"
  },
  {
    "id": "16d8efd4-f54d-4858-9b6c-4e86ceff2f35",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-10 03:45:00",
    "end_time": "2026-11-10 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261110T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:04.987949",
    "status": "SCHEDULED"
  },
  {
    "id": "7604007d-89b6-43df-a60a-f063e751d887",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-12 03:45:00",
    "end_time": "2026-11-12 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261112T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:05.947334",
    "status": "SCHEDULED"
  },
  {
    "id": "6087afd7-da2d-4250-975f-d829b22aa7d1",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-15 03:45:00",
    "end_time": "2026-11-15 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261115T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:07.383137",
    "status": "SCHEDULED"
  },
  {
    "id": "e87162ce-0fea-4578-878a-2761a9d15505",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-17 03:45:00",
    "end_time": "2026-11-17 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261117T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:08.340549",
    "status": "SCHEDULED"
  },
  {
    "id": "464cfde9-1950-4118-a14c-60bc53c6210e",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-19 03:45:00",
    "end_time": "2026-11-19 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261119T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:09.297439",
    "status": "SCHEDULED"
  },
  {
    "id": "04b72f9d-0c93-45f7-a159-72047bd7d7a1",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-21 03:45:00",
    "end_time": "2026-11-21 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261121T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:10.254666",
    "status": "SCHEDULED"
  },
  {
    "id": "a80d8f4e-5736-4185-a93f-b58e5e057288",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-02 05:00:00",
    "end_time": "2026-10-02 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261002T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:18.871635",
    "status": "SCHEDULED"
  },
  {
    "id": "888edfde-7cc2-42cb-8813-fc04c734f73a",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-17 05:00:00",
    "end_time": "2026-11-17 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261117T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:31.317366",
    "status": "SCHEDULED"
  },
  {
    "id": "a1b943c0-4572-4c56-a470-f3f4bf6cb57f",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-03 05:00:00",
    "end_time": "2026-11-03 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261103T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:27.48915",
    "status": "SCHEDULED"
  },
  {
    "id": "7f3158bb-b4fa-4388-9f7c-d1b9816f9f41",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-09 05:00:00",
    "end_time": "2026-11-09 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261109T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:28.924965",
    "status": "SCHEDULED"
  },
  {
    "id": "e047f1a3-dd7b-4820-956e-2f8783028279",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-13 05:00:00",
    "end_time": "2026-11-13 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261113T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:30.360328",
    "status": "SCHEDULED"
  },
  {
    "id": "a9d1d0d8-8798-42ea-a4e9-f1e4272357b5",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-09 05:00:00",
    "end_time": "2026-10-09 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261009T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:20.788037",
    "status": "SCHEDULED"
  },
  {
    "id": "1b936197-1fa1-4785-bc97-f7c5a52f9f83",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-27 18:30:00",
    "end_time": "2026-09-29 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjA5MjggaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20260928",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.020517",
    "status": "CANCELLED"
  },
  {
    "id": "36fb323f-79c9-4a4a-966b-6e397da4c544",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-22 18:30:00",
    "end_time": "2026-11-24 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjExMjMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261123",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:21.349104",
    "status": "CANCELLED"
  },
  {
    "id": "0322c4ad-f5bf-4970-8be6-3e3005deee6d",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-01 18:30:00",
    "end_time": "2026-11-03 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjExMDIgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261102",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.848478",
    "status": "CANCELLED"
  },
  {
    "id": "c7c9300e-367d-4087-9d8f-188fc5b1b644",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-08 18:30:00",
    "end_time": "2026-11-10 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjExMDkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261109",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:21.013215",
    "status": "CANCELLED"
  },
  {
    "id": "6daa74fc-fb36-4ea8-9553-2bae624e5b8c",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-04 18:30:00",
    "end_time": "2026-10-06 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjEwMDUgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261005",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.187951",
    "status": "CANCELLED"
  },
  {
    "id": "bfd1cbfa-8446-4ee3-b3b6-670cb7eaef54",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-11 18:30:00",
    "end_time": "2026-10-13 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjEwMTIgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261012",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.352563",
    "status": "CANCELLED"
  },
  {
    "id": "005914d5-98fb-409b-9339-4009f6eb839e",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-15 18:30:00",
    "end_time": "2026-11-17 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjExMTYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261116",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:21.1847",
    "status": "CANCELLED"
  },
  {
    "id": "30f26cb9-a93e-48c4-ae0e-4de78ee2a586",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-25 18:30:00",
    "end_time": "2026-10-27 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjEwMjYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261026",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.682347",
    "status": "CANCELLED"
  },
  {
    "id": "cd065a91-6f29-4d02-b194-08b09f3eb047",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-09 18:30:00",
    "end_time": "2026-11-11 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjExMTAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261110",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:23.167452",
    "status": "CANCELLED"
  },
  {
    "id": "a8fb7aff-0c7d-42a6-ae8b-42de43571be7",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-19 18:30:00",
    "end_time": "2026-10-21 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjEwMjAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261020",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.671027",
    "status": "CANCELLED"
  },
  {
    "id": "4bdcd308-da7f-442c-9324-0b67f0bba7b6",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-08 05:00:00",
    "end_time": "2026-10-08 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261008T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:20.309465",
    "status": "SCHEDULED"
  },
  {
    "id": "9c05b791-3046-49e9-bbab-ed579536c0a3",
    "title": "hiii",
    "description": "",
    "start_time": "2026-09-28 08:30:00",
    "end_time": "2026-09-28 09:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/knr-chwu-ycd",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "h2rro8b4s0riqs4un072le93cs",
    "source": "GOOGLE_CALENDAR",
    "created_at": "2026-09-27 13:10:08.469432",
    "status": "CANCELLED"
  },
  {
    "id": "06272f8d-851e-4da9-b6e9-95b19c605ba0",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-29 18:30:00",
    "end_time": "2026-10-01 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjA5MzAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20260930",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:24.329893",
    "status": "CANCELLED"
  },
  {
    "id": "304924a2-d48b-4bb2-85fb-0a3c26e098d5",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-23 18:30:00",
    "end_time": "2026-11-25 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjExMjQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261124",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:23.499719",
    "status": "CANCELLED"
  },
  {
    "id": "312a4a2e-2000-40d6-848c-9f58d7392e62",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-26 18:30:00",
    "end_time": "2026-10-28 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjEwMjcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261027",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.835544",
    "status": "CANCELLED"
  },
  {
    "id": "c7a430ba-1a2c-4228-9a8d-732381939148",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-06 18:30:00",
    "end_time": "2026-10-08 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjEwMDcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261007",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:24.494456",
    "status": "CANCELLED"
  },
  {
    "id": "a90a5aa8-2aec-415d-98fa-e100741e9da1",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-13 18:30:00",
    "end_time": "2026-10-15 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjEwMTQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261014",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:24.659061",
    "status": "CANCELLED"
  },
  {
    "id": "b683e6ec-cd8f-4691-a90d-739c137ed87a",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-02 18:30:00",
    "end_time": "2026-11-04 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjExMDMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261103",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.999965",
    "status": "CANCELLED"
  },
  {
    "id": "1d0f0153-5d8b-49f2-abc6-eb8797278958",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-01 05:00:00",
    "end_time": "2026-10-01 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261001T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:18.393321",
    "status": "SCHEDULED"
  },
  {
    "id": "7d4ee1d1-0cf7-4180-9f57-188faedadf56",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-05 05:00:00",
    "end_time": "2026-10-05 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261005T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:19.352265",
    "status": "SCHEDULED"
  },
  {
    "id": "3164bc96-0cfe-46be-83ac-98f3ad3df4f6",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-23 18:30:00",
    "end_time": "2026-09-25 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjA5MjQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20260924",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:26.311712",
    "status": "CANCELLED"
  },
  {
    "id": "8ab4470f-2f87-4ae4-8e24-96384486092b",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-30 18:30:00",
    "end_time": "2026-10-02 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjEwMDEgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261001",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:26.476331",
    "status": "CANCELLED"
  },
  {
    "id": "ff1611a8-fc3f-4135-8736-d9df468eea0c",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-17 18:30:00",
    "end_time": "2026-11-19 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjExMTggaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261118",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:25.486345",
    "status": "CANCELLED"
  },
  {
    "id": "d6983bb0-900d-45c4-b857-324b16aee00d",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-19 05:00:00",
    "end_time": "2026-11-19 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261119T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:31.796249",
    "status": "SCHEDULED"
  },
  {
    "id": "3f308b95-5ee0-4055-8144-3ff60c4d2c7b",
    "title": "Marketing Team Discussion",
    "description": "",
    "start_time": "2026-08-31 07:00:00",
    "end_time": "2026-08-31 07:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ajf-bqpi-tgq",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "neha@climagroanalytics.com",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7ebpe2tksnpqc0bl47pf36ntni",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:39.187667",
    "status": "SCHEDULED"
  },
  {
    "id": "c64924a8-0bea-4226-9228-3e3d2ded317c",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-29 05:00:00",
    "end_time": "2026-09-29 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260929T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:17.914611",
    "status": "SCHEDULED"
  },
  {
    "id": "40938637-b9a4-4c23-a876-d383ac55b7d0",
    "title": "AI Manthan Discussion ",
    "description": "",
    "start_time": "2026-09-11 11:05:00",
    "end_time": "2026-09-11 11:35:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/nye-mniz-qyz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "6n9r33o5vtm243v967bb7lum0q",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:40.282691",
    "status": "SCHEDULED"
  },
  {
    "id": "4840b726-994e-4326-a67c-6d4c11eec553",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-02 09:15:00",
    "end_time": "2026-10-02 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMDJUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261002T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-23 18:31:59.922708",
    "status": "SCHEDULED"
  },
  {
    "id": "0a374b31-993d-446c-b779-1a21c3388872",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-05 09:15:00",
    "end_time": "2026-10-05 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMDVUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261005T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-23 23:16:48.230611",
    "status": "SCHEDULED"
  },
  {
    "id": "c88e3494-d741-4011-b5e9-5973aa0b6687",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-22 05:00:00",
    "end_time": "2026-10-22 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261022T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:24.137967",
    "status": "SCHEDULED"
  },
  {
    "id": "5bd82f10-33b8-4781-a56c-4202fbb2e404",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-06 05:00:00",
    "end_time": "2026-11-06 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261106T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:28.446513",
    "status": "SCHEDULED"
  },
  {
    "id": "931caf02-1c81-4010-912a-48a5942df95a",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-10 05:00:00",
    "end_time": "2026-11-10 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261110T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:29.403257",
    "status": "SCHEDULED"
  },
  {
    "id": "906282b3-1078-4918-860f-45789ccbd970",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-12 05:00:00",
    "end_time": "2026-11-12 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261112T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:29.881578",
    "status": "SCHEDULED"
  },
  {
    "id": "45f3fa92-414d-4b1f-8a6e-ce0867bd845f",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-16 05:00:00",
    "end_time": "2026-11-16 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261116T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:30.83894",
    "status": "SCHEDULED"
  },
  {
    "id": "165d56db-6abe-4ee8-971f-5fd083627ce2",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-20 05:00:00",
    "end_time": "2026-11-20 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261120T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:32.281469",
    "status": "SCHEDULED"
  },
  {
    "id": "cdb64959-f3ba-4242-94ca-0b1ac83f9a7c",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-20 05:00:00",
    "end_time": "2026-10-20 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261020T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:23.659502",
    "status": "SCHEDULED"
  },
  {
    "id": "b122cfd6-f807-450e-bb90-da488c893f1b",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-16 05:00:00",
    "end_time": "2026-10-16 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261016T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:22.702455",
    "status": "SCHEDULED"
  },
  {
    "id": "07e0e357-22c7-408c-92b4-359f11734cbc",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-13 05:00:00",
    "end_time": "2026-10-13 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261013T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:21.744851",
    "status": "SCHEDULED"
  },
  {
    "id": "6252e476-ded6-49f3-a65a-43b20051f0e5",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-05 05:00:00",
    "end_time": "2026-11-05 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261105T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:27.967761",
    "status": "SCHEDULED"
  },
  {
    "id": "0e2ba332-c71c-4ab5-bff0-893e3c2fcd11",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-02 05:00:00",
    "end_time": "2026-11-02 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261102T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:27.010521",
    "status": "SCHEDULED"
  },
  {
    "id": "0a98ffc7-b6e0-4102-a8bd-4c22119409cb",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-26 05:00:00",
    "end_time": "2026-10-26 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261026T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:25.096019",
    "status": "SCHEDULED"
  },
  {
    "id": "b0e297ab-5e58-4e89-a694-61dc066099c9",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-08 18:30:00",
    "end_time": "2026-10-10 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjEwMDkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261009",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:28.804391",
    "status": "CANCELLED"
  },
  {
    "id": "312a3001-7a88-4be7-87ea-9d3713cacc43",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-25 03:45:00",
    "end_time": "2026-09-25 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260925T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:49:37.133947",
    "status": "SCHEDULED"
  },
  {
    "id": "e8faa5ef-d8ce-451f-9219-22ea8d026f16",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-27 05:00:00",
    "end_time": "2026-10-27 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261027T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:25.575932",
    "status": "SCHEDULED"
  },
  {
    "id": "26a48ce8-dd80-493f-a40a-6365745b9e6b",
    "title": "ClimAgro Discovery Call between Harshit Mishra and Ashutosh mishra ",
    "description": "What:\nClimAgro Discovery Call between Harshit Mishra and Ashutosh mishra \n\nInvitee timezone:\nAsia/Calcutta\n\nWho:\nHarshit Mishra - Organizer\nharshit@climagroanalytics.com\nAshutosh mishra \nashutoshmishraup78@gmail.com\n\nWhere:\nhttps://meet.google.com/img-kyde-xop\n\nDescription\nA 30-minute introduction for anyone exploring climate risk intelligence solutions for agriculture, finance, or institutional risk management. We'll cover: · Your current climate and agricultural risk challenges · How ClimAgro's platform (ClimIntellio for hazard data, CropRisk.ai (http://CropRisk.ai) for risk scoring) addresses your needs · Fit assessment and next steps No deck. Just a conversation to understand if we're a match. Particularly relevant for: Banks, insurers, agribusinesses, government agencies, and development organizations evaluating climate risk solutions.\n\nAdditional notes:\nThis is testing sir please ignore this\n\nWhat best describes your organization?:\nOther\n  \nWhat's your primary role?:\nClimate Finance / Sustainability Lead\n  \nWhat's your primary interest?:\nBoth / Not sure\n  \nGeographic focus?:\nOther\n  \n\nNeed to reschedule or cancel? https://cal.com/booking/6xadBbAKXZBsQop2mNsNRk?changes=true",
    "start_time": "2026-09-21 05:30:00",
    "end_time": "2026-09-21 06:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/img-kyde-xop",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "_6ps62p22c90kmm2q89pl2rrg69mkssqea9lk0gr1dgn66rrd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:40.942878",
    "status": "SCHEDULED"
  },
  {
    "id": "c3e9ffd7-35e2-4cc7-be69-678e8982191a",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-30 05:00:00",
    "end_time": "2026-10-30 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261030T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:26.53218",
    "status": "SCHEDULED"
  },
  {
    "id": "3560bcb2-e8ad-4747-a51a-bebb23877ed9",
    "title": "Weekly Progress Call",
    "description": "",
    "start_time": "2026-09-19 09:30:00",
    "end_time": "2026-09-19 10:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/seh-ottt-sbk",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "7d0f5eh4lkub33d5b0pdjm6quu",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:41.332561",
    "status": "SCHEDULED"
  },
  {
    "id": "a9be8cce-5de6-4101-887b-aca0fed5704a",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-24 18:30:00",
    "end_time": "2026-09-26 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjA5MjUgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20260925",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:28.47404",
    "status": "CANCELLED"
  },
  {
    "id": "b0d51ffe-517a-4500-bf8a-90c1a6f89d10",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-18 18:30:00",
    "end_time": "2026-11-20 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjExMTkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261119",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:27.648344",
    "status": "CANCELLED"
  },
  {
    "id": "8bd79bff-2a62-4e77-9b00-784fc11bdfc1",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-01 18:30:00",
    "end_time": "2026-10-03 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjEwMDIgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261002",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:28.639058",
    "status": "CANCELLED"
  },
  {
    "id": "05da94ce-8da2-4100-8d00-c7af09525148",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-26 03:45:00",
    "end_time": "2026-09-26 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260926T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:49:59.324059",
    "status": "SCHEDULED"
  },
  {
    "id": "14595f68-f682-4f66-b951-3f6c89b21bec",
    "title": "CropRisk Discovery Call between Harshit Mishra and Ashutosh Mishra",
    "description": "What:\nCropRisk Discovery Call between Harshit Mishra and Ashutosh Mishra\n\nInvitee timezone:\nAsia/Calcutta\n\nWho:\nHarshit Mishra - Organizer\nharshit@climagroanalytics.com\nAshutosh Mishra\nashutoshmishraup78@gmail.com\n\nWhere:\nhttps://meet.google.com/zbx-mgfa-uyn\n\nDescription\nA focused 30-minute conversation to understand your agricultural portfolio's risk exposure and how ClimAgro's CropRisk scoring can support your lending or underwriting decisions.\n\nWe'll cover:\n\n· Your current approach to agricultural credit risk\n\n· The geographies and crop types you're most exposed to\n\n· How CropRisk's district-level climate scoring fits your workflow\n\nNo slides. No pitch deck. Just a direct conversation about whether this is a fit.\n\nAdditional notes:\nsir this is testing for croprisk.ai call\n\nWhat best describes your organization?:\nBanks & NBFCs\n  \nWhat is your primary role? :\nRisk Manager (Enterprise / Corporate)\n  \nWhat's your primary interest?:\nClimate hazard data (ClimIntellio)\n  \nGeographic focus?:\nOther\n  \n\nNeed to reschedule or cancel? https://cal.com/booking/jeiDCyqTDziLQJoXKUnpdr?changes=true",
    "start_time": "2026-09-07 05:30:00",
    "end_time": "2026-09-07 06:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/zbx-mgfa-uyn",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "_d9imih23f5ol8h3qd5652ijfb15larjgchp40gr1dgn66rrd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:41.817829",
    "status": "SCHEDULED"
  },
  {
    "id": "e2669376-e666-4904-956f-65e7bd6a5845",
    "title": "ClimAgro Discovery Call between Harshit Mishra and Ashutosh Mishra",
    "description": "What:\nClimAgro Discovery Call between Harshit Mishra and Ashutosh Mishra\n\nInvitee timezone:\nAsia/Calcutta\n\nWho:\nHarshit Mishra - Organizer\nharshit@climagroanalytics.com\nAshutosh Mishra\nashutoshmishraup78@gmail.com\n\nWhere:\nhttps://meet.google.com/wce-ckvb-ufh\n\nDescription\nA 30-minute introduction for anyone exploring climate risk intelligence solutions for agriculture, finance, or institutional risk management. We'll cover: · Your current climate and agricultural risk challenges · How ClimAgro's platform (ClimIntellio for hazard data, CropRisk.ai (http://CropRisk.ai) for risk scoring) addresses your needs · Fit assessment and next steps No deck. Just a conversation to understand if we're a match. Particularly relevant for: Banks, insurers, agribusinesses, government agencies, and development organizations evaluating climate risk solutions.\n\nAdditional notes:\nsir this is testing of climagro call\n\nWhat best describes your organization?:\nInsurance & Reinsurance\n  \nWhat's your primary role?:\nCredit / Lending Officer\n  \nWhat's your primary interest?:\nClimate hazard data (ClimIntellio)\n  \nGeographic focus?:\nundefined\n  \n\nNeed to reschedule or cancel? https://cal.com/booking/te7fJ5MsqWFbxmZdeT43Vf?changes=true",
    "start_time": "2026-09-08 08:30:00",
    "end_time": "2026-09-08 09:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/wce-ckvb-ufh",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "_ehijepia6l6n6san8ph7graqchil8d1japj40gr1dgn66rrd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:42.157791",
    "status": "SCHEDULED"
  },
  {
    "id": "2fd9b98e-5c16-4194-bfac-276f5c95d7cc",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-09 18:30:00",
    "end_time": "2026-10-11 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjEwMTAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261010",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.179011",
    "status": "CANCELLED"
  },
  {
    "id": "2774c148-3c31-41b6-9ebe-22985399919b",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-26 18:30:00",
    "end_time": "2026-11-28 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjExMjcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261127",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.964015",
    "status": "CANCELLED"
  },
  {
    "id": "1ef79e01-2f36-42dd-86b1-51f70b54891e",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-23 18:30:00",
    "end_time": "2026-10-25 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjEwMjQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261024",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.5109",
    "status": "CANCELLED"
  },
  {
    "id": "61eae544-695c-4ebc-af78-b5e5d286ef33",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-25 18:30:00",
    "end_time": "2026-09-27 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjA5MjYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20260926",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:30.84795",
    "status": "CANCELLED"
  },
  {
    "id": "89fc9696-b8ab-4119-a3af-e50364b820ed",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-09-26 05:30:00",
    "end_time": "2026-09-26 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20260926T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:01.704322",
    "status": "SCHEDULED"
  },
  {
    "id": "8c38e0cf-310a-4cd1-8b39-d41da5a71574",
    "title": "Proposals (Agra + Sustainability ...)",
    "description": "",
    "start_time": "2026-09-26 09:00:00",
    "end_time": "2026-09-26 09:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/jbs-jskh-vgq",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "4imcnps6eof1828k6nt2mhpj82",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:04.584189",
    "status": "SCHEDULED"
  },
  {
    "id": "e7c2a768-d91a-4be2-b8b7-3596af517e82",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-19 18:30:00",
    "end_time": "2026-11-21 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjExMjAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261120",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.799037",
    "status": "CANCELLED"
  },
  {
    "id": "44e98baf-d7de-4116-b015-904687f9e04f",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-30 18:30:00",
    "end_time": "2026-11-01 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjEwMzEgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261031",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.67572",
    "status": "CANCELLED"
  },
  {
    "id": "5185790d-0280-4af1-ada9-ec603942255b",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-02 18:30:00",
    "end_time": "2026-10-04 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjEwMDMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261003",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.012602",
    "status": "CANCELLED"
  },
  {
    "id": "702c4ebf-0ebc-4d3b-9f41-ad5d300dc6ad",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-12 18:30:00",
    "end_time": "2026-11-14 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjExMTMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261113",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.634049",
    "status": "CANCELLED"
  },
  {
    "id": "21e3de35-74a0-4b1e-9ad4-676033315919",
    "title": "Company Call ",
    "description": "",
    "start_time": "2026-09-23 06:00:00",
    "end_time": "2026-09-23 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yke-gktd-gik",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "3anrslncscmb4jh66lhgane6jl",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:42.563099",
    "status": "SCHEDULED"
  },
  {
    "id": "2b297563-1d34-45c8-97e1-52169d8bc467",
    "title": "ClimIntellio Discovery Call between Harshit Mishra and Ashutosh Mishra",
    "description": "What:\nClimIntellio Discovery Call between Harshit Mishra and Ashutosh Mishra\n\nInvitee timezone:\nAsia/Calcutta\n\nWho:\nHarshit Mishra - Organizer\nharshit@climagroanalytics.com\nAshutosh Mishra\nashutoshmishraup78@gmail.com\n\nWhere:\nhttps://meet.google.com/gdt-apcv-oxc\n\nDescription\nA 30-minute conversation for banks, financial institutions, and insurers to explore how ClimAgro's ClimIntellio delivers pincode-level climate hazard data aligned with RBI Climate Risk Framework and NDMA-notified hazards.\n\nWe'll cover:· Your agricultural or climate-exposed portfolio and regulatory requirements· How ClimIntellio's hazard scoring (frequency, intensity, persistence) enables audit-proof risk mapping at borrower level· Integration pathways into credit decisioning, pricing, and RBI compliance workflows\n\nParticularly relevant for: Tier-1 banks, agribusiness lenders, NBFCs, and insurance providers managing climate risk exposure and regulatory reporting.\n\nAdditional notes:\nsir this is testing of climintellio discorbery call\n\nWhat best describes your organization?:\nBanks & NBFCs\n  \nWhat's your primary role?:\nRisk Manager (Enterprise / Corporate)\n  \nWhat's your primary interest?:\nClimate hazard data (ClimIntellio)\n  \nGeographic focus?:\nIndia-wide\n  \n\nNeed to reschedule or cancel? https://cal.com/booking/oWNx8sPfsHeCBe1saz7qxy?changes=true",
    "start_time": "2026-09-08 05:30:00",
    "end_time": "2026-09-08 06:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/gdt-apcv-oxc",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "_dtbksu1oed86csq8cl1k4p9hedgnkdrhf1sk0gr1dgn66rrd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:42.982869",
    "status": "SCHEDULED"
  },
  {
    "id": "bac22414-97ef-4af7-be5d-c3877704eafb",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-08-31 05:00:00",
    "end_time": "2026-08-31 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260831T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:57.412897",
    "status": "SCHEDULED"
  },
  {
    "id": "f6bd3a94-dbbd-4374-89af-90034876cb48",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-01 05:00:00",
    "end_time": "2026-09-01 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260901T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:58.012676",
    "status": "SCHEDULED"
  },
  {
    "id": "6a19e5ec-f746-4436-8262-1c258f8408c9",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-10-17 05:30:00",
    "end_time": "2026-10-17 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261017T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:06.428344",
    "status": "SCHEDULED"
  },
  {
    "id": "8ac3da68-0978-4b09-841b-324965a88908",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-13 18:30:00",
    "end_time": "2026-11-15 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjExMTQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261114",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:32.00537",
    "status": "CANCELLED"
  },
  {
    "id": "09ad534e-576d-4b8d-9c7d-9ed28f330e71",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-11-07 05:30:00",
    "end_time": "2026-11-07 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261107T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:07.864782",
    "status": "SCHEDULED"
  },
  {
    "id": "bc1ec592-d67a-43d7-8312-de0e7bd7bcec",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-25 10:30:00",
    "end_time": "2026-09-25 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260925T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:07.484301",
    "status": "SCHEDULED"
  },
  {
    "id": "d02e5ada-aac3-4876-a62c-5499eb0766d4",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-16 18:30:00",
    "end_time": "2026-11-18 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjExMTcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261117",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:23.332864",
    "status": "CANCELLED"
  },
  {
    "id": "3ddd83e4-7424-485d-b6fc-d1dba632fbe9",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-19 09:15:00",
    "end_time": "2026-10-19 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMTlUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261019T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 18:31:39.204409",
    "status": "CANCELLED"
  },
  {
    "id": "6eb98d8a-6762-4c98-9225-564345b7d040",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-10-03 05:30:00",
    "end_time": "2026-10-03 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261003T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:05.469447",
    "status": "SCHEDULED"
  },
  {
    "id": "98f5dadb-395b-4236-9bd1-aee20e57d72e",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-24 18:30:00",
    "end_time": "2026-11-26 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjExMjUgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261125",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:25.650916",
    "status": "CANCELLED"
  },
  {
    "id": "146e5da4-cdfd-4bae-a768-1dbba096f472",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-14 10:30:00",
    "end_time": "2026-10-14 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261014T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:22.720374",
    "status": "SCHEDULED"
  },
  {
    "id": "9b966cbf-94a3-404c-a063-c01621cabaf9",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-16 10:30:00",
    "end_time": "2026-10-16 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261016T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:23.677816",
    "status": "SCHEDULED"
  },
  {
    "id": "50322ba6-81b4-4d36-baa7-47f3cefafcf6",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-20 10:30:00",
    "end_time": "2026-10-20 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261020T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:24.636578",
    "status": "SCHEDULED"
  },
  {
    "id": "41929e04-d40d-42ff-b699-48c0a8f555f8",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-03 05:00:00",
    "end_time": "2026-09-03 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260903T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:58.670029",
    "status": "SCHEDULED"
  },
  {
    "id": "5bcf55d6-d772-4caf-92a9-0d0229f2ee89",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-06 10:30:00",
    "end_time": "2026-11-06 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261106T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:30.891208",
    "status": "SCHEDULED"
  },
  {
    "id": "ec73a170-2841-45a7-a2b4-90339cbdc4e0",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-29 10:30:00",
    "end_time": "2026-10-29 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261029T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:27.98959",
    "status": "SCHEDULED"
  },
  {
    "id": "a8757565-798e-405f-bbf3-8210cccd0a32",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-02 10:30:00",
    "end_time": "2026-11-02 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261102T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:28.950771",
    "status": "SCHEDULED"
  },
  {
    "id": "22000ca7-5db1-494d-abd2-56fa28f30f11",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-04 10:30:00",
    "end_time": "2026-11-04 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261104T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:29.915805",
    "status": "SCHEDULED"
  },
  {
    "id": "8250b595-417c-402b-9e41-854facbdf769",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-22 10:30:00",
    "end_time": "2026-10-22 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261022T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:25.596596",
    "status": "SCHEDULED"
  },
  {
    "id": "0a4bd6b7-f024-41e9-90de-c206a4a84bb2",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-10 10:30:00",
    "end_time": "2026-11-10 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261110T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:31.855654",
    "status": "SCHEDULED"
  },
  {
    "id": "31a6e8fb-49be-4c77-b280-e49d19631844",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-12 10:30:00",
    "end_time": "2026-11-12 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261112T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:32.836473",
    "status": "SCHEDULED"
  },
  {
    "id": "2978d2a9-045a-4603-b600-604ea124078e",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-16 10:30:00",
    "end_time": "2026-11-16 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261116T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:33.808862",
    "status": "SCHEDULED"
  },
  {
    "id": "457b9dca-3559-4e52-a942-c1263c3cb861",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-02 10:30:00",
    "end_time": "2026-10-02 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261002T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:18.890452",
    "status": "SCHEDULED"
  },
  {
    "id": "979c990b-24a1-4b55-aade-39daba830706",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-06 10:30:00",
    "end_time": "2026-10-06 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261006T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:19.84838",
    "status": "SCHEDULED"
  },
  {
    "id": "36d08fa9-ac5e-4e5c-93ad-e7c82fbd65b6",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-08 10:30:00",
    "end_time": "2026-10-08 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261008T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:20.806066",
    "status": "SCHEDULED"
  },
  {
    "id": "a4f045aa-5be5-4af9-a6ba-a387eea5987b",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-27 10:30:00",
    "end_time": "2026-10-27 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261027T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:27.032245",
    "status": "SCHEDULED"
  },
  {
    "id": "e21b45e7-242b-4aad-be64-5c9025907aae",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-16 18:30:00",
    "end_time": "2026-10-18 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjEwMTcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261017",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.346057",
    "status": "CANCELLED"
  },
  {
    "id": "749ff29a-1820-474b-8bd7-a7c72f1de752",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-12 10:30:00",
    "end_time": "2026-10-12 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261012T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:21.762818",
    "status": "SCHEDULED"
  },
  {
    "id": "c40eb1b2-982d-4255-945b-ce8031173c75",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-20 10:30:00",
    "end_time": "2026-11-20 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261120T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:35.849032",
    "status": "SCHEDULED"
  },
  {
    "id": "9dd00b9d-f706-4de8-8b4c-131740b362e2",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-26 03:45:00",
    "end_time": "2026-11-26 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261126T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 03:46:18.179959",
    "status": "SCHEDULED"
  },
  {
    "id": "e9e38214-acac-4f47-8bf8-951e42ef4401",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-04 05:00:00",
    "end_time": "2026-09-04 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260904T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:59.162481",
    "status": "SCHEDULED"
  },
  {
    "id": "952474c8-b6c2-49a8-b02f-6b6393c9f9e3",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-07 05:00:00",
    "end_time": "2026-09-07 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260907T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:59.803172",
    "status": "SCHEDULED"
  },
  {
    "id": "da044720-d2bd-4d91-bfb7-4894b5e47058",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-08 05:00:00",
    "end_time": "2026-09-08 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260908T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:00.287728",
    "status": "SCHEDULED"
  },
  {
    "id": "018c8fd8-aafa-4ec1-bb7d-32cc68592b5f",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-10 05:00:00",
    "end_time": "2026-09-10 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260910T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:00.703124",
    "status": "SCHEDULED"
  },
  {
    "id": "aa03f296-139f-4ce8-9919-3c8b927f560f",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-11 05:00:00",
    "end_time": "2026-09-11 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260911T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:01.202864",
    "status": "SCHEDULED"
  },
  {
    "id": "c176bd1d-50a1-4101-a9de-e0b267674755",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-14 05:00:00",
    "end_time": "2026-09-14 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260914T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:01.592708",
    "status": "SCHEDULED"
  },
  {
    "id": "ad6b804e-0ca3-4dd4-96f0-e73b83e31425",
    "title": "Office",
    "description": "",
    "start_time": "2026-09-28 18:30:00",
    "end_time": "2026-09-30 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjA5MjkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20260929",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.175891",
    "status": "CANCELLED"
  },
  {
    "id": "6d321a92-110f-400a-9d02-20d71042efab",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-06 05:00:00",
    "end_time": "2026-10-06 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261006T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:19.83094",
    "status": "SCHEDULED"
  },
  {
    "id": "9cd75d93-0bbf-462e-9464-9d288842e735",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-12 05:00:00",
    "end_time": "2026-10-12 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261012T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:21.266697",
    "status": "SCHEDULED"
  },
  {
    "id": "2de27947-1372-442d-a106-1c9feb1ed32d",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-10 18:30:00",
    "end_time": "2026-11-12 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjExMTEgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261111",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:25.321681",
    "status": "CANCELLED"
  },
  {
    "id": "72e19a79-8441-41b1-8761-6d448bc1798f",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-21 18:30:00",
    "end_time": "2026-10-23 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjEwMjIgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261022",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:26.971314",
    "status": "CANCELLED"
  },
  {
    "id": "c8b3076a-f99c-4836-bec7-429e5fcccd2a",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-29 18:30:00",
    "end_time": "2026-10-31 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjEwMzAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261030",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.304445",
    "status": "CANCELLED"
  },
  {
    "id": "bcd14f87-45f1-4185-821a-a6316cce225c",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-27 05:00:00",
    "end_time": "2026-11-27 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261127T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 05:00:43.133827",
    "status": "SCHEDULED"
  },
  {
    "id": "85fe110d-1c97-47f8-a404-3be09cdcb6fb",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-29 03:45:00",
    "end_time": "2026-09-29 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260929T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:44.721842",
    "status": "SCHEDULED"
  },
  {
    "id": "82e8705c-c0ce-46f5-a25e-a7ffd9ebf51c",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-08 03:45:00",
    "end_time": "2026-10-08 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261008T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:49.151163",
    "status": "SCHEDULED"
  },
  {
    "id": "e45762ee-f2fb-443b-ae40-2f925884bc37",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-10 03:45:00",
    "end_time": "2026-10-10 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261010T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:50.136538",
    "status": "SCHEDULED"
  },
  {
    "id": "2c71272c-ae8c-4e47-b0c9-8596b3e36e84",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-14 03:45:00",
    "end_time": "2026-10-14 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261014T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:52.057032",
    "status": "SCHEDULED"
  },
  {
    "id": "9ebcff50-dae1-4702-a594-d7f5eaf28417",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-16 03:45:00",
    "end_time": "2026-10-16 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261016T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:53.013773",
    "status": "SCHEDULED"
  },
  {
    "id": "d1f68ac1-a0ff-45fa-b960-e9792a056155",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-18 03:45:00",
    "end_time": "2026-10-18 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261018T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:53.971573",
    "status": "SCHEDULED"
  },
  {
    "id": "26f16d37-dd54-4b9f-a8b0-77936e42a220",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-19 03:45:00",
    "end_time": "2026-10-19 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261019T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:54.452339",
    "status": "SCHEDULED"
  },
  {
    "id": "3fb3d0fd-575b-4de4-b0da-a8560b23ea61",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-28 03:45:00",
    "end_time": "2026-09-28 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260928T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:44.189579",
    "status": "SCHEDULED"
  },
  {
    "id": "fc9c930d-a9b3-405a-b83e-cf97abd7141b",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-15 05:00:00",
    "end_time": "2026-09-15 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260915T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:02.242977",
    "status": "SCHEDULED"
  },
  {
    "id": "38a63c81-5845-47b9-9e88-96d9acd34336",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-17 05:00:00",
    "end_time": "2026-09-17 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260917T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:02.957552",
    "status": "SCHEDULED"
  },
  {
    "id": "f2410dd3-ab4a-4722-b8b9-03bb4f16aa33",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-18 05:00:00",
    "end_time": "2026-09-18 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260918T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:03.353225",
    "status": "SCHEDULED"
  },
  {
    "id": "eaca9265-8687-4ba7-9c20-588d0c640ccd",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-03 03:45:00",
    "end_time": "2026-10-03 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261003T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:46.742407",
    "status": "SCHEDULED"
  },
  {
    "id": "086a393d-597e-4ac7-be86-6055cbd48c4c",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-09-30 03:45:00",
    "end_time": "2026-09-30 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20260930T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:45.233097",
    "status": "SCHEDULED"
  },
  {
    "id": "498b813c-a74b-4e4a-b27b-e17d9e9e2681",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-01 03:45:00",
    "end_time": "2026-10-01 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261001T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:45.742937",
    "status": "SCHEDULED"
  },
  {
    "id": "ef83e5fe-196c-4daf-8c1e-1cfc1269f55f",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-05 03:45:00",
    "end_time": "2026-10-05 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261005T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:47.704923",
    "status": "SCHEDULED"
  },
  {
    "id": "28c9e877-2573-480d-a57e-95afa0d9dbc5",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-12 03:45:00",
    "end_time": "2026-10-12 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261012T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:51.099489",
    "status": "SCHEDULED"
  },
  {
    "id": "3af62091-ea07-4268-b4ef-821a72bc6211",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-07 03:45:00",
    "end_time": "2026-10-07 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261007T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:48.6669",
    "status": "SCHEDULED"
  },
  {
    "id": "5c9f75e8-5a0e-4664-b77e-78fc8f5049a4",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-27 03:45:00",
    "end_time": "2026-10-27 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261027T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:58.281775",
    "status": "SCHEDULED"
  },
  {
    "id": "25c51a0d-c216-4241-8edc-98f6741cd666",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-12 18:30:00",
    "end_time": "2026-10-14 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjEwMTMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261013",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.506443",
    "status": "CANCELLED"
  },
  {
    "id": "d507b257-a043-4820-bce1-a326a446af0a",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-29 03:45:00",
    "end_time": "2026-10-29 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261029T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:59.239085",
    "status": "SCHEDULED"
  },
  {
    "id": "ac57072f-743b-43e9-9b54-6bdc7e31729e",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-31 03:45:00",
    "end_time": "2026-10-31 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261031T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:00.196235",
    "status": "SCHEDULED"
  },
  {
    "id": "d6f5beff-d34f-4377-a24c-4c98b13e028b",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-01 03:45:00",
    "end_time": "2026-11-01 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261101T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:00.67494",
    "status": "SCHEDULED"
  },
  {
    "id": "b9e1da66-d81c-413f-b97e-75e784388bff",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-03 03:45:00",
    "end_time": "2026-11-03 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261103T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:01.636006",
    "status": "SCHEDULED"
  },
  {
    "id": "602049ab-a7bc-47be-8437-4c3205f8c141",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-05 03:45:00",
    "end_time": "2026-11-05 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261105T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:02.593286",
    "status": "SCHEDULED"
  },
  {
    "id": "b2d5f1b7-5d41-48a0-b7f1-83c136b485c6",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-09 03:45:00",
    "end_time": "2026-11-09 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261109T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:04.508937",
    "status": "SCHEDULED"
  },
  {
    "id": "c093195c-9085-4ab2-b5f7-b7b3c83c213b",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-11 03:45:00",
    "end_time": "2026-11-11 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261111T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:05.46682",
    "status": "SCHEDULED"
  },
  {
    "id": "678f6b32-8934-4e41-8de3-86b61c628cdb",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-13 03:45:00",
    "end_time": "2026-11-13 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261113T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:06.426496",
    "status": "SCHEDULED"
  },
  {
    "id": "44a35838-e3af-4f19-9abe-c94fa24d30b4",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-14 03:45:00",
    "end_time": "2026-11-14 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261114T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:06.904993",
    "status": "SCHEDULED"
  },
  {
    "id": "84184696-a7e2-4322-8158-85842f6c7046",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-16 03:45:00",
    "end_time": "2026-11-16 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261116T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:07.861902",
    "status": "SCHEDULED"
  },
  {
    "id": "54c08358-449f-4f92-aca3-544c62a682ae",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-18 03:45:00",
    "end_time": "2026-11-18 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261118T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:08.818833",
    "status": "SCHEDULED"
  },
  {
    "id": "770a10c9-f429-42f5-b7b0-74bf135ad411",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-20 03:45:00",
    "end_time": "2026-11-20 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261120T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:09.775977",
    "status": "SCHEDULED"
  },
  {
    "id": "7574dba7-85b0-4309-b9b3-4bc005e2ea2d",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-23 03:45:00",
    "end_time": "2026-10-23 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261023T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:56.367485",
    "status": "SCHEDULED"
  },
  {
    "id": "72e52cab-1f05-414a-ade7-8ed940de97ac",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-25 03:45:00",
    "end_time": "2026-10-25 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261025T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:57.324678",
    "status": "SCHEDULED"
  },
  {
    "id": "058fcd3f-4a34-4038-b205-24ae58097aab",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-10-21 03:45:00",
    "end_time": "2026-10-21 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261021T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:55.410197",
    "status": "SCHEDULED"
  },
  {
    "id": "e5e42510-27ca-41f3-8c3b-e16799353fbb",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-21 05:00:00",
    "end_time": "2026-09-21 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260921T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:03.697628",
    "status": "SCHEDULED"
  },
  {
    "id": "9c7ad347-8cfb-4be5-b354-1733b2c319ec",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-28 02:00:00",
    "end_time": "2026-09-28 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjA5MjhUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20260928T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.046383",
    "status": "CANCELLED"
  },
  {
    "id": "4fbb1bbf-d974-415f-ab8c-9235dfc4aa95",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-22 05:00:00",
    "end_time": "2026-09-22 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260922T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:04.07303",
    "status": "SCHEDULED"
  },
  {
    "id": "97a2ba17-8850-46f4-9340-65ef5eec6f15",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-24 05:00:00",
    "end_time": "2026-09-24 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260924T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:04.702599",
    "status": "SCHEDULED"
  },
  {
    "id": "41787735-674e-43d0-82e8-a07c89e21560",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-21 09:15:00",
    "end_time": "2026-10-21 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMjFUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261021T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 09:46:38.77209",
    "status": "CANCELLED"
  },
  {
    "id": "97d332d2-7d08-4b7e-9ffd-b53a460ce17a",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-28 05:00:00",
    "end_time": "2026-09-28 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260928T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:17.436175",
    "status": "SCHEDULED"
  },
  {
    "id": "a3bb4d4c-2346-4f0e-924d-745a72d5d50a",
    "title": "Bharat win Application",
    "description": "",
    "start_time": "2026-08-31 17:00:00",
    "end_time": "2026-08-31 18:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/aco-jcee-amh",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "officialutkarshmishra01@gmail.com",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "3rpeopp3dp7opd5gof3h5uta7q",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:08.427753",
    "status": "SCHEDULED"
  },
  {
    "id": "dc575317-281e-4723-8268-a05dc7392bd9",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-05 02:00:00",
    "end_time": "2026-10-05 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDVUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261005T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.880544",
    "status": "CANCELLED"
  },
  {
    "id": "feaefe40-6999-494e-9aa3-118a406b063d",
    "title": "ClimAgro Discovery Call",
    "description": "",
    "start_time": "2026-09-01 05:30:00",
    "end_time": "2026-09-01 06:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/uqo-bynq-eku",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "mohammad.huq@howdengroup.com",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "3q8tjvs39vm3m7l3v2ug6l6k3k",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:08.977826",
    "status": "SCHEDULED"
  },
  {
    "id": "25c5b02f-d342-4f78-af81-15ddfd41f7ef",
    "title": "CropRisk Discovery Call between Harshit Mishra and Ashutosh Mishra",
    "description": "What:\nCropRisk Discovery Call between Harshit Mishra and Ashutosh Mishra\n\nInvitee timezone:\nAsia/Calcutta\n\nWho:\nHarshit Mishra - Organizer\nharshit@climagroanalytics.com\nAshutosh Mishra\nashutoshmishraup78@gmail.com\n\nWhere:\nhttps://meet.google.com/aaq-rypf-msb\n\nDescription\nA focused 30-minute conversation to understand your agricultural portfolio's risk exposure and how ClimAgro's CropRisk scoring can support your lending or underwriting decisions.\n\nWe'll cover:\n\n· Your current approach to agricultural credit risk\n\n· The geographies and crop types you're most exposed to\n\n· How CropRisk's district-level climate scoring fits your workflow\n\nNo slides. No pitch deck. Just a direct conversation about whether this is a fit.\n\nWhat sectors or geographies does your climate programme or portfolio cover?:\nthis is testing sir \n  \nWhat is your primary role? :\ndeveloper \n  \nAre there specific climate reporting standards your organisation works to? (e.g., TCFD, Paris Alignment):\nTCFD\n  \n\nNeed to reschedule or cancel? https://cal.com/booking/jGuW3SvD2NLHXRui9esJiA?changes=true",
    "start_time": "2026-09-01 10:00:00",
    "end_time": "2026-09-01 10:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/aaq-rypf-msb",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "_d93nalpjadr48cie9h45gkjld4smasqad50k0gr1dgn66rrd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:19:39.817684",
    "status": "SCHEDULED"
  },
  {
    "id": "a09481e0-2307-45a4-8dc5-229ff280a4c4",
    "title": "Discussion",
    "description": "",
    "start_time": "2026-09-01 12:30:00",
    "end_time": "2026-09-01 13:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ahw-varg-xmq",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "officialutkarshmishra01@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "4ojsa8spfkdphiublj1qhc46dl",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:09.917641",
    "status": "SCHEDULED"
  },
  {
    "id": "ad5c0941-8422-46fc-89ea-bb7f0e0eb6cd",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-29 02:00:00",
    "end_time": "2026-09-29 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjA5MjlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20260929T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.219716",
    "status": "CANCELLED"
  },
  {
    "id": "4d9ad7d1-cb8b-4845-a0e2-049fab295bd9",
    "title": "Agra Proposal",
    "description": "",
    "start_time": "2026-09-28 14:45:00",
    "end_time": "2026-09-28 15:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/qtk-uqgp-nur",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "7nmpvjlm4g45u2srg4vk720qo5",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 14:51:21.232622",
    "status": "SCHEDULED"
  },
  {
    "id": "baf5321d-ffcd-4cb2-b263-440df7bef34c",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-15 05:00:00",
    "end_time": "2026-10-15 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261015T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:22.223604",
    "status": "SCHEDULED"
  },
  {
    "id": "d81ed7e0-1662-447e-a1e0-cac5085462f2",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-19 05:00:00",
    "end_time": "2026-10-19 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261019T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:23.180931",
    "status": "SCHEDULED"
  },
  {
    "id": "cbe9acc1-73f8-49c8-a4e4-20800c39278f",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-30 02:00:00",
    "end_time": "2026-09-30 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjA5MzBUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20260930T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.384744",
    "status": "CANCELLED"
  },
  {
    "id": "cabc6d40-2596-4836-96b5-66ee653dfe61",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-01 02:00:00",
    "end_time": "2026-10-01 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDFUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261001T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.550015",
    "status": "CANCELLED"
  },
  {
    "id": "76323713-de51-4b8b-94a2-62f3d94b4bc0",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-02 02:00:00",
    "end_time": "2026-10-02 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDJUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261002T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:39.714765",
    "status": "CANCELLED"
  },
  {
    "id": "b24e568d-f129-4963-8c94-4ba7b73f3fb1",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-26 10:30:00",
    "end_time": "2026-11-26 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261126T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 10:32:00.681388",
    "status": "SCHEDULED"
  },
  {
    "id": "9fc3b022-96b5-4570-acfd-c89a03138013",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-21 02:00:00",
    "end_time": "2026-10-21 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjFUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261021T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.859402",
    "status": "CANCELLED"
  },
  {
    "id": "861d116a-f454-44e7-be5a-12fb07060a7b",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-13 02:00:00",
    "end_time": "2026-10-13 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTNUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261013T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.870957",
    "status": "CANCELLED"
  },
  {
    "id": "b74cbbf1-80e9-4b12-981d-53965f780dfd",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-15 02:00:00",
    "end_time": "2026-10-15 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTVUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261015T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.200389",
    "status": "CANCELLED"
  },
  {
    "id": "f4c5cd1d-7173-425d-95e1-0f2b04357a21",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-16 02:00:00",
    "end_time": "2026-10-16 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261016T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.3652",
    "status": "CANCELLED"
  },
  {
    "id": "8bd3bd1c-ea27-4a8c-a26f-24ff478e34f5",
    "title": "FW: Closed-door roundtable discussion on AI for Climate Action in India ",
    "description": "\n\n\nFrom: mannat.p@energivaventures.com\nWhen: 10:00 - 13:00 2 September 2026\nSubject: Closed-door roundtable discussion on AI for Climate Action in India\nLocation: Energiva Ventures, The Capital Court, Munirka, New Delhi; Avni Room\n\n\n\n________________________________________________________________________________\nMicrosoft Teams meeting\nJoin: https://teams.microsoft.com/meet/459097769914457?p=ThgOtI7I4Dt6zemwXc\nMeeting ID: 459 097 769 914 457\nPasscode: cW9sp73R\n________________________________\nNeed help?<https://aka.ms/JoinTeamsMeeting?omkt=en-US> | System reference<https://teams.microsoft.com/l/meetup-join/19%3ameeting_YjY1MDc2NjUtMTQ4Yi00N2QwLTk5MDUtZjcyM2U3YjRmYTRl%40thread.v2/0?context=%7b%22Tid%22%3a%22a78d170a-609b-4891-a924-44780a2dc58b%22%2c%22Oid%22%3a%22456ee46e-332d-4604-8316-7ea449de61ad%22%7d>\nFor organizers: Meeting options<https://teams.microsoft.com/meetingOptions/?organizerId=456ee46e-332d-4604-8316-7ea449de61ad&tenantId=a78d170a-609b-4891-a924-44780a2dc58b&threadId=19_meeting_YjY1MDc2NjUtMTQ4Yi00N2QwLTk5MDUtZjcyM2U3YjRmYTRl@thread.v2&messageId=0&language=en-US>\n________________________________________________________________________________\n",
    "start_time": "2026-09-02 04:30:00",
    "end_time": "2026-09-02 07:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=XzYwcTMwYzFnNjBvMzBlMWk2MG80YWMxZzYwcmo4Z3BsODhyajJjMWg4NHMzNGg5ZzYwczMwYzFnNjBvMzBjMWc2c3MzNGNoaDc0cjQyZHBnNmNvazhoMWc2NG8zMGMxZzYwbzMwYzFnNjBvMzBjMWc2MG8zMmMxZzYwbzMwYzFnOG9va2FjYTY2c3A0YWhoazg5MzQyY3BrNjkwazZlMjQ2aDFqOGg5bDcwc2ppaGkxOGtyMCBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "amit.p@energivaventures.com",
      "mannat.p@energivaventures.com",
      "piyush.g@energivaventures.com",
      "priyanka.s@energivaventures.com",
      "skumar@csis.org",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g6ss34chh74r42dpg6cok8h1g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g8ookaca66sp4ahhk89342cpk690k6e246h1j8h9l70sjihi18kr0",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:10.242733",
    "status": "SCHEDULED"
  },
  {
    "id": "28a2d149-40e4-409d-9f1c-56f196793472",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-22 02:00:00",
    "end_time": "2026-10-22 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjJUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261022T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.024254",
    "status": "CANCELLED"
  },
  {
    "id": "abc5917c-2fa4-4091-a6ac-8dd36c186381",
    "title": "Sales Team Discussion ",
    "description": "",
    "start_time": "2026-09-02 14:40:00",
    "end_time": "2026-09-02 15:10:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ojs-tzti-jxq",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "tiwarihimanshu2303@gmail.com",
      "neha@climagroanalytics.com",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "1r6ddb6ej7ctapei3vuk5jj979",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:10.737621",
    "status": "SCHEDULED"
  },
  {
    "id": "494c3ffe-b521-462a-b7c8-67cfb19c011e",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-23 02:00:00",
    "end_time": "2026-10-23 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjNUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261023T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.195285",
    "status": "CANCELLED"
  },
  {
    "id": "12a33e4c-0f70-470b-a3e6-473480ecfc58",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-29 02:00:00",
    "end_time": "2026-10-29 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261029T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.859678",
    "status": "CANCELLED"
  },
  {
    "id": "714d0113-0f0c-4143-959b-54b051ce3a65",
    "title": "Startup Expo at UP Startup Samvad 3.0 at Lucknow",
    "description": "",
    "start_time": "2026-09-07 18:30:00",
    "end_time": "2026-09-09 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=NGNxNmtpNjkydjgxbnRsdTJubDhhOWw0bjAgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "utsav@ehmconsultancy.co.in",
      "jitendra@ehmconsultancy.co.in",
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "4cq6ki692v81ntlu2nl8a9l4n0",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:11.157734",
    "status": "SCHEDULED"
  },
  {
    "id": "a6fba09b-c01c-4487-90c4-1edf2cb5d610",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-28 02:00:00",
    "end_time": "2026-10-28 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjhUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261028T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.689555",
    "status": "CANCELLED"
  },
  {
    "id": "a845a78a-13e4-4045-b26e-75563ed470be",
    "title": "Sales Team Discussion ",
    "description": "",
    "start_time": "2026-09-03 06:00:00",
    "end_time": "2026-09-03 06:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/skn-ybzs-pdw",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "tiwarihimanshu2303@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "1l7kd3jvifh0rffhgrflpgqde4",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:11.547828",
    "status": "SCHEDULED"
  },
  {
    "id": "c7ab875f-fef7-4c3a-8f2f-e8c0440675e3",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-30 02:00:00",
    "end_time": "2026-10-30 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMzBUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261030T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.02534",
    "status": "CANCELLED"
  },
  {
    "id": "c1fee4b1-514b-416d-8e86-724019fb4a87",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-27 02:00:00",
    "end_time": "2026-10-27 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjdUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261027T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.524352",
    "status": "CANCELLED"
  },
  {
    "id": "20d1130a-f7cf-4f7d-8dcd-2e337ef694ec",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-12 02:00:00",
    "end_time": "2026-10-12 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTJUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261012T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.706242",
    "status": "CANCELLED"
  },
  {
    "id": "d0b96570-2a7d-4c36-9d30-cb56037f9b50",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-13 02:00:00",
    "end_time": "2026-11-13 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTNUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261113T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.672074",
    "status": "CANCELLED"
  },
  {
    "id": "8e675683-3ba4-41fc-8e65-e444bfa60dd6",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-09 02:00:00",
    "end_time": "2026-11-09 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261109T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.016069",
    "status": "CANCELLED"
  },
  {
    "id": "ac4bbe2a-b5e1-499e-821e-c7dd2798c1ac",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-10 02:00:00",
    "end_time": "2026-11-10 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTBUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261110T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.180601",
    "status": "CANCELLED"
  },
  {
    "id": "32c22f86-8af4-4349-a1e0-2abb7e77b45f",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-11 02:00:00",
    "end_time": "2026-11-11 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTFUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261111T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.34424",
    "status": "CANCELLED"
  },
  {
    "id": "eb1c8311-45cd-4761-9bd7-71a6c36e85b3",
    "title": "ClimAgro MKT Sept Plan ",
    "description": "",
    "start_time": "2026-09-03 10:15:00",
    "end_time": "2026-09-03 10:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ghn-marq-bct",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "1v5lust8krmq1t6ilqgqf3ejp6",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:11.967631",
    "status": "SCHEDULED"
  },
  {
    "id": "995db240-33b8-4144-a313-9120e4e509c0",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-10-03 06:30:00",
    "end_time": "2026-10-03 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261003T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:10.260099",
    "status": "SCHEDULED"
  },
  {
    "id": "685c3939-b96f-4c67-879b-ae719527b002",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-17 02:00:00",
    "end_time": "2026-11-17 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTdUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261117T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.999875",
    "status": "CANCELLED"
  },
  {
    "id": "c7955462-41cd-4d36-9929-de44ca9a09fd",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-20 02:00:00",
    "end_time": "2026-11-20 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMjBUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261120T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.500597",
    "status": "CANCELLED"
  },
  {
    "id": "08b809a8-fcfa-4eaf-8090-ef8c7f2305ab",
    "title": "Maps Discussion",
    "description": "",
    "start_time": "2026-09-04 06:30:00",
    "end_time": "2026-09-04 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/jwb-uafo-jwo",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "511a56ngk2b2ce2kr6thcsjudm",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:12.36781",
    "status": "SCHEDULED"
  },
  {
    "id": "6268eec5-4f47-4a04-91da-ef611b6607a3",
    "title": "Discussion",
    "description": "",
    "start_time": "2026-09-04 08:00:00",
    "end_time": "2026-09-04 08:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/que-crbw-pti",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "74v8mkgdbdg6kcudvor30qq4oi",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:12.772681",
    "status": "SCHEDULED"
  },
  {
    "id": "a955afea-b0db-4363-9514-95f975f22e1c",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-12 02:00:00",
    "end_time": "2026-11-12 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTJUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261112T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.507914",
    "status": "CANCELLED"
  },
  {
    "id": "63c04696-6cce-4400-b692-ab67c7a58291",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-25 02:00:00",
    "end_time": "2026-11-25 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMjVUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261125T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.992261",
    "status": "CANCELLED"
  },
  {
    "id": "1cdc83dd-5656-41dc-aa78-156c3b2c666a",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-26 02:00:00",
    "end_time": "2026-11-26 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMjZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261126T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:46.162249",
    "status": "CANCELLED"
  },
  {
    "id": "1c275e46-1b32-48f8-8b8e-dd05aa894213",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-18 02:00:00",
    "end_time": "2026-11-18 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMThUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261118T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.17028",
    "status": "CANCELLED"
  },
  {
    "id": "e89dc199-8419-42aa-b4eb-276bef166e0f",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-06 02:00:00",
    "end_time": "2026-11-06 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261106T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.851747",
    "status": "CANCELLED"
  },
  {
    "id": "ede0592b-2f8e-4968-b148-9ef301cff580",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-09-25 05:00:00",
    "end_time": "2026-09-25 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20260925T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:47.04715",
    "status": "SCHEDULED"
  },
  {
    "id": "d53e72d4-8555-4ae4-b6e2-238978370f02",
    "title": "Internal Discusson",
    "description": "",
    "start_time": "2026-09-04 15:12:00",
    "end_time": "2026-09-04 16:12:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ffc-afud-icw",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "officialutkarshmishra01@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "5hmikvg8dig5a2i19dsd2ooeo0",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:13.717699",
    "status": "SCHEDULED"
  },
  {
    "id": "fb596019-02cc-43f0-a417-3ff4baafec6a",
    "title": "Catch up and potential collaborations",
    "description": "",
    "start_time": "2026-09-06 05:30:00",
    "end_time": "2026-09-06 06:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/qvm-xpex-rgk",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "pranavbhardwaj99@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "6co3ge1k6lh34b9gckq32b9kcos30b9pckr30b9l69i6ac1m60sj8c9nc4",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:14.20781",
    "status": "SCHEDULED"
  },
  {
    "id": "bd681b51-cf8a-4d5b-b33e-28ccbf9478c5",
    "title": "AI Manthan - CSJMU",
    "description": "",
    "start_time": "2026-09-11 18:30:00",
    "end_time": "2026-09-13 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=NzM5YTdzdG10bmpjYWxiYWxuZHRudTlpbGcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "739a7stmtnjcalbalndtnu9ilg",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:14.952704",
    "status": "SCHEDULED"
  },
  {
    "id": "7ba22fa6-6982-4b97-8db6-c9d78b693f6f",
    "title": "Agra Proposal",
    "description": "",
    "start_time": "2026-09-11 09:45:00",
    "end_time": "2026-09-11 10:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ves-wrtq-xkf",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "4lmku9afhdv355ofm00723kspt",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:15.668727",
    "status": "SCHEDULED"
  },
  {
    "id": "06c5d44a-5b3d-464f-a820-157bb7c07ce5",
    "title": "MOU between EHM Consultancy Pvt. Ltd. and Tirkha & Greenhub",
    "description": "",
    "start_time": "2026-09-11 13:15:00",
    "end_time": "2026-09-11 13:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kgd-thqy-paa",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "utsav@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "1t3548vjtp2ub4ntvl1jpvflt9",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:16.57295",
    "status": "SCHEDULED"
  },
  {
    "id": "3752a067-b49e-441f-9bda-c90369286713",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-09-26 06:30:00",
    "end_time": "2026-09-26 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "officialutkarshmishra01@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20260926T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:53.567298",
    "status": "SCHEDULED"
  },
  {
    "id": "bf2e9f1b-7bad-4aa8-9f12-25256d75ac10",
    "title": "Unlocking Investment Opportunities",
    "description": "You are hosting this event. View the public page at https://luma.com/34r2k8x0\n\nManage the event at https://luma.com/event/manage/evt-6WqPU85dyFrHGI8\n\nClick to join: https://luma.com/join/eh-Sv8dxXQU0NDZIFS\n\nThe Genesis 2.0 Matching Investor Component is an investment-focused initiative designed to support market-ready startups in accessing matching investment, strengthening their fundraising readiness, and enabling long-term entrepreneurial growth. The program connects eligible startups with investment opportunities and ecosystem support to accelerate innovation, scale, and market expansion.\n\nHosted by Naman",
    "start_time": "2026-09-17 09:30:00",
    "end_time": "2026-09-17 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=X2Nscjc4YjltYXRvbDBsOW82bGk3aWhqaTkxM2tpZTIwY2xyNmFyamtlY242b3Q5ZWRsZ2cgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "shubham.c2294@gmail.com",
      "connect@canebot.com",
      "biropowr@gmail.com",
      "avarulvel1525@gmail.com",
      "thinkrawtech@gmail.com",
      "contact@clean-water.co.in",
      "krashakinnovativesolutions@gmail.com",
      "skotra4@gmail.com",
      "info@biofieldpower.com",
      "director@speedybyte.co.in",
      "sangeetachilshetty@gmail.com",
      "dhruv@mlense.in",
      "mkrai94@gmail.com",
      "srishti@qzense.com",
      "dharkan.anand.4366@gmail.com",
      "mycolabs.office@gmail.com",
      "srinivas@areete.org",
      "apps.1326@gmail.com",
      "renergizr.industries@gmail.com",
      "kawatra.sahil@gmail.com",
      "shefali@froots.co",
      "abhiev30@gmail.com",
      "pundirabhinav10@gmail.com",
      "vijay@yourfarm.co.in",
      "piyushjha433@gmail.com",
      "gandhijenil45@gmail.com",
      "amrit@indrawater.com",
      "ceo@flylabsolutions.com",
      "pragnyasmarttechnologies@gmail.com",
      "shefali@chiragtechnologies.com",
      "wegreenwarriors@gmail.com",
      "dduwelcome@gmail.com",
      "sharma.vipasha@gmail.com",
      "radhika@netpractice.app",
      "team.heuronics@gmail.com",
      "thochirengma@gmail.com",
      "celligonaturalfibres@gmail.com",
      "shivdeepbrar@live.com",
      "udaygedam@veenerosolutions.com",
      "yashpatil8011@gmail.com",
      "musshtecch@gmail.com",
      "everbright.chakma@gmail.com",
      "priyan@croprover.in",
      "amtoweeder@gmail.com",
      "29.varun@gmail.com",
      "sanjoydeb@bitsathy.ac.in",
      "abhinav@rappr.in",
      "picraft3d@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "sanjay@urbanairlabs.com",
      "girish.sapra1@gmail.com",
      "vijay@prayogik.in",
      "agrohaven3@gmail.com",
      "ghaadnaturals@gmail.com",
      "mahendraiipe@gmail.com",
      "adityasha157@gmail.com",
      "varun@modernvillagefoundation.com",
      "ceo@aressystems.io",
      "er.abhi.dhaliwal@gmail.com",
      "arpit.goyal@aeroworkstechnologies.com",
      "technograndis@gmail.com",
      "akshit.dangi@scratchnest.com",
      "liza@innofarms.co.in",
      "jchaudhry9694@gmail.com",
      "grainiqinnov@gmail.com",
      "4akash7@gmail.com",
      "panyalasainathreddy@gmail.com",
      "innoflectsolutions05@gmail.com",
      "pankaj@cropcoin.in",
      "sisir@navariti.com",
      "chaudhurirapti@gmail.com",
      "gupta.sayak2002@gmail.com",
      "gaurav.agrawal@aptcoder.com",
      "anubhav@redotterfarms.in",
      "hntechnovations@gmail.com",
      "contact@yoboshu.in",
      "joitabioseedai@gmail.com",
      "ragul.paramasivam@chimertech.com",
      "startups@ihub-awadh.in",
      "huskage@gmail.com",
      "chandramani@agrijoy.in",
      "amirayub41@gmail.com",
      "karbari.rsudha@gmail.com",
      "yashstartupworks@gmail.com",
      "ceo@innow8.in",
      "jayabeerpinkunu@gmail.com",
      "baddamnarendranarendra123@gmail.com",
      "swarm.uav25@gmail.com",
      "agri.kibbutz@gmail.com",
      "siddhartha.khare@gmail.com",
      "fruvetech@gmail.com",
      "priyanka.saklani88@gmail.com",
      "harshit1927.be23@chitkara.edu.in",
      "rajgaurav.jsr@gmail.com",
      "sarusagropl@gmail.com",
      "sschavan2878@gmail.com",
      "palanamtechnology@gmail.com",
      "ceo@heyfarmer.in",
      "zulfy11@gmail.com",
      "siddhartha.agspert@gmail.com",
      "siddharth@indianhempstore.com",
      "hegdekudgi@rootsgoods.com",
      "connect@r2e.in",
      "ceo@cropsync.in",
      "hemant@jadibeaute.com",
      "chematicotechnologies@gmail.com",
      "rafiazargar.25@gmail.com",
      "rahul@citygreens.in",
      "mittal46arjun@gmail.com",
      "kanchankuwarbi@gmail.com",
      "infyrainnovations@gmail.com",
      "itssarvagya@gmail.com",
      "suryavedaagritech@gmail.com",
      "sharmauma981@gmail.com",
      "spandaninnovators8@gmail.com",
      "mriganka04saha@gmail.com",
      "manisha.mehra@terafac.com",
      "aditidwiditi@gmail.com",
      "nabanita.sarkar@mindwebs.org",
      "rajesh.patidar1@gmail.com",
      "tushar@vaaniresearch.com",
      "akshay@iwebtechno.com",
      "diptikantacharya@gmail.com",
      "shivam.tripathi@airober.com",
      "mittalsachin770@gmail.com",
      "sunilrathod048@gmail.com",
      "amit@farmo.ai",
      "arifjamal.official@gmail.com",
      "nanokriti@gmail.com",
      "innect.technologies@gmail.com",
      "nehjpuria@gmail.com",
      "rajesh@cluix.in",
      "cashobhitagg@gmail.com",
      "resilientagrisolutions@gmail.com",
      "jasveer@senseitout.com",
      "sandeep.tripathi@agronest.org",
      "kuppireddyakhil@gmail.com",
      "prakritiksukoon@gmail.com",
      "frostbasket01@gmail.com",
      "pdpvagritech@gmail.com",
      "avnagrobharat@gmail.com",
      "priyanka.gupta@rezovate.com",
      "faseeh@wildfloc.com",
      "jiaulhaq1786@gmail.com",
      "naresh19awchar@gmail.com",
      "harsh@evoxialabs.com",
      "canyoudroid@gmail.com",
      "hanish3270153@gmail.com",
      "shwetaf.rce@gmail.com",
      "gauravd2901@gmail.com",
      "jyoti@kroop.ai",
      "jchirag483@gmail.com",
      "susheelshetty2@gmail.com",
      "carrusmobilitysolutions@gmail.com",
      "nitishsharma85060@gmail.com",
      "youngovator@gmail.com",
      "sparkyaitech@gmail.com",
      "jd@ambiator.com",
      "sanjay@aryaveco.com",
      "tvishta@gmail.com",
      "neetesh.thakur@greymattertech.in",
      "geranjoynlrn@gmail.com",
      "ankushda86@gmail.com",
      "arthimendherbals@gmail.com",
      "saumya@ekosight.com",
      "adarshkodhanda@hotmail.com",
      "aman.kumar@gatisheel.com",
      "anita@oxycodetechnologies.com",
      "arnabpchoudhury@viksitlabs.in",
      "avinash@rowbotix.in",
      "faiz.22soag1010021@gmail.com",
      "gyansetu@rotoai.in",
      "hmswamy@cropdomain.com",
      "info@cybergenixsecurity.com",
      "info@drufarm.com",
      "info@skykatech.com",
      "innovation@agrivision4u.com",
      "jaya.kar@blucocoondigital.com",
      "pavanverma@vayunotics.com",
      "rajat@scanxt.com",
      "rajiv.mishra@amaletix.com",
      "ramanath@ayurythm.com",
      "sachin@gramiq.ai",
      "saraswathi@optimists.in",
      "sarvagya.tripathi@abhimaagritech.com",
      "shobana.u@innogle.com",
      "shri_v25@rediffmail.com",
      "shrilesh.mande@industill.com",
      "sushant@jeevshastra.com",
      "vaishalikaurchawla@phulkariforever.com",
      "vivek.saraf@sunseedapv.com",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "_clr78b9matol0l9o6li7ihji913kie20clr6arjkecn6ot9edlgg",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:17.622696",
    "status": "SCHEDULED"
  },
  {
    "id": "0051bf69-1dd2-455d-a0cb-bba7ef829000",
    "title": "Internal meeting - Harshit",
    "description": "",
    "start_time": "2026-09-14 08:00:00",
    "end_time": "2026-09-14 08:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/hdm-oyps-hti",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "67qi7jgr0v5ntj8tmsgd60ukoa",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:17.997696",
    "status": "SCHEDULED"
  },
  {
    "id": "7072c6d9-4632-4dad-aa46-1bedb7d74724",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-08-31 09:15:00",
    "end_time": "2026-08-31 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA4MzFUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260831T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:18.403124",
    "status": "SCHEDULED"
  },
  {
    "id": "e9eb528e-9676-4ee0-96cd-52a44718fce7",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-03 02:00:00",
    "end_time": "2026-11-03 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDNUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261103T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.357668",
    "status": "CANCELLED"
  },
  {
    "id": "3b5d0261-f6ff-4365-9e2f-b0fbea09207b",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-04 02:00:00",
    "end_time": "2026-11-04 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDRUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261104T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.522263",
    "status": "CANCELLED"
  },
  {
    "id": "231c97d5-e507-48a3-9f66-2579080a647c",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-02 09:15:00",
    "end_time": "2026-09-02 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MDJUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260902T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:18.818358",
    "status": "SCHEDULED"
  },
  {
    "id": "8e950044-95fb-47ed-832c-f5e198f53f2c",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-04 09:15:00",
    "end_time": "2026-09-04 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MDRUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260904T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:19.538428",
    "status": "SCHEDULED"
  },
  {
    "id": "82ef2f8a-616c-467a-b784-6e72c9f50a30",
    "title": "Delhi & Agra Proposal ",
    "description": "",
    "start_time": "2026-09-11 11:30:00",
    "end_time": "2026-09-11 12:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yxw-srym-ewh",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "5v6tkvm9qom5j6biag3ge62c2d",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:16.048421",
    "status": "SCHEDULED"
  },
  {
    "id": "bc2b8a82-584e-4fda-899d-f68c558debd5",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-08 07:45:00",
    "end_time": "2026-10-08 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDhUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261008T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.82502",
    "status": "CANCELLED"
  },
  {
    "id": "c5211977-1396-487e-8bff-b70ed8e3c93d",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-06 07:45:00",
    "end_time": "2026-10-06 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261006T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.496356",
    "status": "CANCELLED"
  },
  {
    "id": "081c23fa-890f-44ae-b750-a16b5bc7b3a2",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-27 03:45:00",
    "end_time": "2026-11-27 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261127T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 03:45:59.077407",
    "status": "SCHEDULED"
  },
  {
    "id": "58d1f6eb-6718-4956-8074-60da03636b0d",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-07 09:15:00",
    "end_time": "2026-09-07 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MDdUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260907T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:20.118222",
    "status": "SCHEDULED"
  },
  {
    "id": "f16643a4-f669-4c36-afde-25907512852a",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-09 09:15:00",
    "end_time": "2026-09-09 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MDlUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260909T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:20.557673",
    "status": "SCHEDULED"
  },
  {
    "id": "b2258683-a3bb-44ba-8139-4935b0272937",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-11 09:15:00",
    "end_time": "2026-09-11 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MTFUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260911T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:20.96783",
    "status": "SCHEDULED"
  },
  {
    "id": "2772b52a-1824-4398-bd32-3358d083cf59",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-16 09:15:00",
    "end_time": "2026-09-16 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MTZUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260916T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:21.297762",
    "status": "SCHEDULED"
  },
  {
    "id": "4dd34333-c0c1-40cb-9aee-696fa71843d2",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-12 07:45:00",
    "end_time": "2026-10-12 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTJUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261012T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.160523",
    "status": "CANCELLED"
  },
  {
    "id": "5cbeb9e5-e355-49c5-8bbb-76d43ed6e384",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-13 07:45:00",
    "end_time": "2026-10-13 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTNUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261013T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.327736",
    "status": "CANCELLED"
  },
  {
    "id": "1c461124-5d69-4ce4-a36d-b772637fa099",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-18 09:15:00",
    "end_time": "2026-09-18 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MThUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260918T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:21.813148",
    "status": "SCHEDULED"
  },
  {
    "id": "732fd7c8-852c-456b-941f-17cd900a4b9f",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-21 09:15:00",
    "end_time": "2026-09-21 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MjFUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260921T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:22.382541",
    "status": "SCHEDULED"
  },
  {
    "id": "a363ad5a-e2f0-4d46-9591-3eecffea4fd7",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-23 09:15:00",
    "end_time": "2026-09-23 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MjNUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260923T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:23.033365",
    "status": "SCHEDULED"
  },
  {
    "id": "8753744a-5f59-4db5-a9e9-a81d041a2b92",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-02 07:45:00",
    "end_time": "2026-10-02 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDJUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261002T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.16841",
    "status": "CANCELLED"
  },
  {
    "id": "2ae5d8a4-1744-4fa5-9db3-8281eedb00dd",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-05 07:45:00",
    "end_time": "2026-10-05 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDVUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261005T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.332251",
    "status": "CANCELLED"
  },
  {
    "id": "3c234f62-95d1-4827-bab0-59a894d49cc4",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-09 07:45:00",
    "end_time": "2026-10-09 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261009T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.989423",
    "status": "CANCELLED"
  },
  {
    "id": "90e45659-ff09-4daf-8908-4323cfa001e7",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-29 07:45:00",
    "end_time": "2026-09-29 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjA5MjlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20260929T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:49.669037",
    "status": "CANCELLED"
  },
  {
    "id": "7b80f968-e08a-4873-8c66-9cfb473e6a1a",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-30 07:45:00",
    "end_time": "2026-09-30 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjA5MzBUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20260930T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:49.833133",
    "status": "CANCELLED"
  },
  {
    "id": "693c5c60-b3e5-44f3-9bb8-66f42c5acd7c",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-07 07:45:00",
    "end_time": "2026-10-07 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDdUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261007T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:50.660777",
    "status": "CANCELLED"
  },
  {
    "id": "2a612bfc-43be-49de-97d4-65d646e7f02c",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-30 07:45:00",
    "end_time": "2026-10-30 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMzBUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261030T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.472676",
    "status": "CANCELLED"
  },
  {
    "id": "35fc0337-9a34-478a-9434-2377dc7f18e9",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-04 07:45:00",
    "end_time": "2026-11-04 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDRUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261104T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.96519",
    "status": "CANCELLED"
  },
  {
    "id": "2368d3c6-3218-4b1a-bb63-0db70d226dc7",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-27 07:45:00",
    "end_time": "2026-10-27 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjdUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261027T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.972097",
    "status": "CANCELLED"
  },
  {
    "id": "deb40fcb-b7f1-48d8-8c14-5d59b0177417",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-29 07:45:00",
    "end_time": "2026-10-29 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261029T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.308693",
    "status": "CANCELLED"
  },
  {
    "id": "e57a1ae3-0d82-434c-b96e-8a9e4a3ac37b",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-23 07:45:00",
    "end_time": "2026-10-23 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjNUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261023T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.641758",
    "status": "CANCELLED"
  },
  {
    "id": "0c5de02f-bd25-4685-a62c-03ab824745ac",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-05 07:45:00",
    "end_time": "2026-11-05 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDVUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261105T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.129391",
    "status": "CANCELLED"
  },
  {
    "id": "e045edae-2b17-4251-b06a-c19408b43e94",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-09 07:45:00",
    "end_time": "2026-11-09 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261109T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.457195",
    "status": "CANCELLED"
  },
  {
    "id": "dc5fc557-b145-4746-b351-3e93a24261c3",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-26 07:45:00",
    "end_time": "2026-10-26 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261026T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.805667",
    "status": "CANCELLED"
  },
  {
    "id": "e32640ac-f235-4d48-bf74-b75221af7dc9",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-06 07:45:00",
    "end_time": "2026-11-06 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261106T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.293186",
    "status": "CANCELLED"
  },
  {
    "id": "c0da93d4-d44e-4aa1-9101-b204311386e2",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-21 07:45:00",
    "end_time": "2026-10-21 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjFUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261021T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.313624",
    "status": "CANCELLED"
  },
  {
    "id": "747127f0-6825-481e-bab6-845098571550",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-18 18:30:00",
    "end_time": "2026-10-20 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=djFhZGo1OTZmdjNsbGRoYWRrNHBlZzhmYnNfMjAyNjEwMTkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "v1adj596fv3lldhadk4peg8fbs_20261019",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:20.517439",
    "status": "CANCELLED"
  },
  {
    "id": "b266b179-bd50-4ea9-8154-818c858f32f4",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-12 07:45:00",
    "end_time": "2026-11-12 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTJUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261112T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.956069",
    "status": "CANCELLED"
  },
  {
    "id": "26a5c3a0-3109-4d1a-b59a-fa3d6b94677c",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-22 07:45:00",
    "end_time": "2026-10-22 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjJUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261022T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.477496",
    "status": "CANCELLED"
  },
  {
    "id": "760119e7-938b-46c8-a523-6b619109dd82",
    "title": "Social Analytics discussion meeting ",
    "description": "",
    "start_time": "2026-09-04 09:45:00",
    "end_time": "2026-09-04 10:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/zoq-uxzm-sgc",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "7sb1u6hphd0n633phu4jldlr4n",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:13.28843",
    "status": "SCHEDULED"
  },
  {
    "id": "aeb12fb4-2847-4279-af0a-f47ca11ec714",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-03 07:45:00",
    "end_time": "2026-11-03 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDNUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261103T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.800893",
    "status": "CANCELLED"
  },
  {
    "id": "9acb3987-7961-4881-a46e-e99dbe3bbee3",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-27 10:30:00",
    "end_time": "2026-11-27 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261127T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 10:32:36.044509",
    "status": "SCHEDULED"
  },
  {
    "id": "7faddcae-5eb6-45c0-8b8f-22dc3c976d31",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-02 07:45:00",
    "end_time": "2026-11-02 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMDJUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261102T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.636964",
    "status": "CANCELLED"
  },
  {
    "id": "f4482ea5-c1ec-4c76-8568-e46b49c1d5fc",
    "title": "CityAdapt",
    "description": "",
    "start_time": "2026-09-14 09:00:00",
    "end_time": "2026-09-14 09:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/zjw-pnaf-jke",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "0u8sj4qf69qob9h95o43tefetb",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:32.017737",
    "status": "SCHEDULED"
  },
  {
    "id": "6dad5388-0a80-4e54-8d8d-e2b10de6c296",
    "title": "Agra Proposal - Waste Module",
    "description": "",
    "start_time": "2026-09-15 15:30:00",
    "end_time": "2026-09-15 16:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckj-axxh-yca",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "504agc98qtg7o6em4hm3c2n4ef",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:32.898318",
    "status": "SCHEDULED"
  },
  {
    "id": "99cb23dd-8e50-4ad8-b432-ea249ac31f60",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-13 07:45:00",
    "end_time": "2026-11-13 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTNUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261113T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.12009",
    "status": "CANCELLED"
  },
  {
    "id": "2b4e2c75-0314-4f66-a0d4-2d73926b2014",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-16 07:45:00",
    "end_time": "2026-11-16 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261116T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.284058",
    "status": "CANCELLED"
  },
  {
    "id": "d7492c0d-3e05-4404-8e86-d12f10d0483e",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-17 07:45:00",
    "end_time": "2026-11-17 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTdUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261117T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.448016",
    "status": "CANCELLED"
  },
  {
    "id": "67778b14-f136-4373-831f-2a54fc4c3285",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-20 07:45:00",
    "end_time": "2026-11-20 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMjBUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261120T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.939464",
    "status": "CANCELLED"
  },
  {
    "id": "60a3f022-aaa4-4b69-8caf-192d57702bca",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-24 07:45:00",
    "end_time": "2026-11-24 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMjRUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261124T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:56.267217",
    "status": "CANCELLED"
  },
  {
    "id": "cb4fd2c7-30d3-48ba-9193-4f53a81d95ba",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-25 07:45:00",
    "end_time": "2026-11-25 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMjVUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261125T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:56.430844",
    "status": "CANCELLED"
  },
  {
    "id": "9d88bb90-180d-4ad3-b29f-aa3f1ad8f76d",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-26 07:45:00",
    "end_time": "2026-11-26 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMjZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261126T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:56.594698",
    "status": "CANCELLED"
  },
  {
    "id": "aaffc5a3-effd-4b74-b013-4ffb0dc5bb35",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-10-10 06:30:00",
    "end_time": "2026-10-10 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261010T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:10.739186",
    "status": "SCHEDULED"
  },
  {
    "id": "b0bd5404-3482-49f1-b83f-1f9522ccbdaf",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-16 10:30:00",
    "end_time": "2026-09-16 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/cyn-nscu-aym",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "4hqmoved9ih3uencnp601k501o",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:33.712892",
    "status": "SCHEDULED"
  },
  {
    "id": "ddcd47fe-5f4c-40ad-a418-1474e5568adb",
    "title": "DOMS IITK Delivery & Quotation",
    "description": "",
    "start_time": "2026-09-22 03:30:00",
    "end_time": "2026-09-22 03:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ghs-ywor-gwp",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "50fplrro84ppr00af1hbtqjfdd",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:35.408265",
    "status": "SCHEDULED"
  },
  {
    "id": "3fe8dc2d-0307-4e98-aee6-3917150b106b",
    "title": "Agra Waste Management - Dashboard and Final Deck",
    "description": "",
    "start_time": "2026-09-24 10:45:00",
    "end_time": "2026-09-24 11:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/xjn-xzbg-onz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "1o5f56j0mai03d3qvlu5puueoi",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:36.307942",
    "status": "SCHEDULED"
  },
  {
    "id": "7435041c-b9ca-4b10-9b06-41ee35d8b502",
    "title": "ClimAgro Company call",
    "description": "",
    "start_time": "2026-09-05 05:30:00",
    "end_time": "2026-09-05 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20260905T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:37.502963",
    "status": "SCHEDULED"
  },
  {
    "id": "f77bdaf3-53ff-4baa-9f7c-bd95478db38e",
    "title": "ClimAgro Company call",
    "description": "",
    "start_time": "2026-09-13 05:30:00",
    "end_time": "2026-09-13 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20260912T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:38.187719",
    "status": "SCHEDULED"
  },
  {
    "id": "e2dba32f-8472-4a7e-b6e6-f0e4c717d7ff",
    "title": "ClimAgro Company call",
    "description": "",
    "start_time": "2026-09-19 05:30:00",
    "end_time": "2026-09-19 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20260919T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:38.987915",
    "status": "SCHEDULED"
  },
  {
    "id": "8efc44f4-c2df-403d-83a4-2542e68e53ef",
    "title": "Vipasana Sunday",
    "description": "",
    "start_time": "2026-09-27 03:30:00",
    "end_time": "2026-09-27 10:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y2tzamljMzJjNWg2OGJiMmNnc2o4YjlrNmdxbThiOXBjZ3E2NmI5azZzcG00b3I0NjRzajBwajY2Z18yMDI2MDkyN1QwMzMwMDBaIGR1YmV5LnByYW5zaHVAbQ",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "cksjic32c5h68bb2cgsj8b9k6gqm8b9pcgq66b9k6spm4or464sj0pj66g_20260927T033000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:01.785803",
    "status": "CANCELLED"
  },
  {
    "id": "d4164209-77c1-4755-8e3f-78c9dd632e7f",
    "title": "Vipasana Sunday",
    "description": "",
    "start_time": "2026-10-25 03:30:00",
    "end_time": "2026-10-25 10:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y2tzamljMzJjNWg2OGJiMmNnc2o4YjlrNmdxbThiOXBjZ3E2NmI5azZzcG00b3I0NjRzajBwajY2Z18yMDI2MTAyNVQwMzMwMDBaIGR1YmV5LnByYW5zaHVAbQ",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "cksjic32c5h68bb2cgsj8b9k6gqm8b9pcgq66b9k6spm4or464sj0pj66g_20261025T033000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:01.949853",
    "status": "CANCELLED"
  },
  {
    "id": "818e89e4-74bc-44c2-9009-1ba23f8f4f01",
    "title": "Vipasana Sunday",
    "description": "",
    "start_time": "2026-11-22 03:30:00",
    "end_time": "2026-11-22 10:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y2tzamljMzJjNWg2OGJiMmNnc2o4YjlrNmdxbThiOXBjZ3E2NmI5azZzcG00b3I0NjRzajBwajY2Z18yMDI2MTEyMlQwMzMwMDBaIGR1YmV5LnByYW5zaHVAbQ",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "cksjic32c5h68bb2cgsj8b9k6gqm8b9pcgq66b9k6spm4or464sj0pj66g_20261122T033000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:02.114219",
    "status": "CANCELLED"
  },
  {
    "id": "a52cb8ee-91cf-4333-9d18-b6207cf9a327",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-15 07:45:00",
    "end_time": "2026-10-15 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTVUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261015T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.655452",
    "status": "CANCELLED"
  },
  {
    "id": "cf1a93c1-d2fa-4dfe-a19c-0bb316c95698",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-08 02:00:00",
    "end_time": "2026-10-08 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDhUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261008T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.374932",
    "status": "CANCELLED"
  },
  {
    "id": "d8b76872-d01f-4fc3-858b-e632f79566e3",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-27 18:30:00",
    "end_time": "2026-10-29 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjEwMjggaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261028",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:24.988631",
    "status": "CANCELLED"
  },
  {
    "id": "9cb95aac-4ddf-41cb-ba80-669314dcb251",
    "title": "Anamika 3 monthly review",
    "description": "",
    "start_time": "2026-09-26 04:30:00",
    "end_time": "2026-09-26 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ZmVqNHRxcDYzNWpsNHZzdjcxOTJuZHZxbWNfMjAyNjA5MjZUMDQzMDAwWiBkdWJleS5wcmFuc2h1QG0",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "fej4tqp635jl4vsv7192ndvqmc_20260926T043000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:01.619832",
    "status": "CANCELLED"
  },
  {
    "id": "cd1ccd50-95bf-4570-a9c7-5c994ab936b8",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-18 10:30:00",
    "end_time": "2026-09-18 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260918T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:42.783383",
    "status": "SCHEDULED"
  },
  {
    "id": "fa841555-4dc8-428d-b0f0-f4593125629b",
    "title": "Weekly Engineering Sprint Retrospective",
    "description": "Review Q4 migration progress and blockers",
    "start_time": "2026-09-28 10:46:20.155",
    "end_time": "2026-09-28 11:16:20.155",
    "location": "Google Meet",
    "google_meet_url": null,
    "organizer_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "invitees": [
      "fe14f229-9227-41e4-80bc-ef8d7a9634ec",
      "19fbc17d-3e19-4e4b-81ce-daf19343d3cb"
    ],
    "google_event_id": null,
    "source": "INTERNAL",
    "created_at": "2026-09-28 09:46:20.616288",
    "status": "SCHEDULED"
  },
  {
    "id": "5b546c7a-36f5-4a9f-92a1-8e17a28af699",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-21 10:30:00",
    "end_time": "2026-09-21 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260921T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:43.278155",
    "status": "SCHEDULED"
  },
  {
    "id": "4a622f93-f75d-4364-b9c9-37857b6811c0",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-10 07:45:00",
    "end_time": "2026-11-10 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTBUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261110T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.621277",
    "status": "CANCELLED"
  },
  {
    "id": "64ab4fdc-0d25-4cb5-9b08-2663e19ef7c7",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-22 10:30:00",
    "end_time": "2026-09-22 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260922T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:43.753012",
    "status": "SCHEDULED"
  },
  {
    "id": "8e421995-82fa-4e97-9e25-6c47df307cc6",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-09 02:00:00",
    "end_time": "2026-10-09 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261009T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.539742",
    "status": "CANCELLED"
  },
  {
    "id": "a01a74af-022b-4c7e-a3b1-c7859abf744d",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-05 02:00:00",
    "end_time": "2026-11-05 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDVUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261105T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.687252",
    "status": "CANCELLED"
  },
  {
    "id": "ff85f73c-3b83-407c-a3fa-ad408b00f019",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-23 10:30:00",
    "end_time": "2026-09-23 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260923T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:44.332957",
    "status": "SCHEDULED"
  },
  {
    "id": "f431ca06-2550-4419-a488-9a7dd7d6e7f9",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-24 10:30:00",
    "end_time": "2026-09-24 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260924T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 16:20:44.944153",
    "status": "SCHEDULED"
  },
  {
    "id": "25e39283-b69b-4e32-9c11-07a640a66057",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-28 07:45:00",
    "end_time": "2026-09-28 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjA5MjhUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20260928T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:49.505236",
    "status": "CANCELLED"
  },
  {
    "id": "25abeddb-9bcf-4988-90af-c73d55e85b14",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-25 02:00:00",
    "end_time": "2026-09-25 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjA5MjVUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20260925T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:38.881536",
    "status": "CANCELLED"
  },
  {
    "id": "b2a57895-5660-4d9a-8c18-c7822ff5a351",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-07 02:00:00",
    "end_time": "2026-10-07 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDdUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261007T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.210051",
    "status": "CANCELLED"
  },
  {
    "id": "667046b0-5207-4a31-b60b-10676bd9aee8",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-20 18:30:00",
    "end_time": "2026-11-22 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjExMjEgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261121",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:32.171805",
    "status": "CANCELLED"
  },
  {
    "id": "3f025c60-f7fe-49d2-854b-33160e13b2b6",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-20 07:45:00",
    "end_time": "2026-10-20 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjBUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261020T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:52.149897",
    "status": "CANCELLED"
  },
  {
    "id": "6fa8e7d1-6739-4e0d-ac63-4df276d78f23",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-18 07:45:00",
    "end_time": "2026-11-18 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMThUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261118T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.611875",
    "status": "CANCELLED"
  },
  {
    "id": "6bfabae5-6b34-45cf-ab05-bbbe70b864ab",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-19 07:45:00",
    "end_time": "2026-11-19 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261119T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:55.775732",
    "status": "CANCELLED"
  },
  {
    "id": "2d2a30b1-1fd4-441f-9be4-6de21d49a38a",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-26 05:00:00",
    "end_time": "2026-11-26 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261126T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 05:01:11.370949",
    "status": "SCHEDULED"
  },
  {
    "id": "6e5c9902-ac34-4921-aad2-13f0ff59db96",
    "title": "EHM CRM Meeting",
    "description": "",
    "start_time": "2026-09-28 08:30:00",
    "end_time": "2026-09-28 09:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/nsk-nyao-mph",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "priyankasharma121202@gmail.com",
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "2lk7d39ku8d79oek47sfm6sq81",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 08:48:24.968569",
    "status": "SCHEDULED"
  },
  {
    "id": "4b86783c-e83a-47c8-84f4-d9def97ee535",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-15 18:30:00",
    "end_time": "2026-10-17 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjEwMTYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261016",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:28.970564",
    "status": "CANCELLED"
  },
  {
    "id": "876976f3-fbe9-46d9-9e2c-df2c007bd05f",
    "title": "School Time",
    "description": "",
    "start_time": "2026-09-25 07:45:00",
    "end_time": "2026-09-25 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjA5MjVUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20260925T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:49.341473",
    "status": "CANCELLED"
  },
  {
    "id": "5a41e3a2-a8e3-4ea5-bad2-788a150c5d9a",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-14 02:00:00",
    "end_time": "2026-10-14 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTRUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261014T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.035622",
    "status": "CANCELLED"
  },
  {
    "id": "a2b9a856-3a4f-4de8-ac94-7af636c90f34",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-19 02:00:00",
    "end_time": "2026-10-19 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMTlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261019T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.529742",
    "status": "CANCELLED"
  },
  {
    "id": "c52d1f99-8918-406c-8e1b-804c8073fda7",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-10-29 05:00:00",
    "end_time": "2026-10-29 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261029T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:07:26.053969",
    "status": "SCHEDULED"
  },
  {
    "id": "c372f181-49e8-4495-a9c3-55129033973e",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-05 18:30:00",
    "end_time": "2026-10-07 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=OWxvcm5wamllaG51Mmg1aXI4MGV1bnRnMG9fMjAyNjEwMDYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "9lornpjiehnu2h5ir80euntg0o_20261006",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:22.341637",
    "status": "CANCELLED"
  },
  {
    "id": "14ec5750-ad11-43e2-9648-86e54a5dcb22",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-03 18:30:00",
    "end_time": "2026-11-05 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjExMDQgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261104",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:25.155568",
    "status": "CANCELLED"
  },
  {
    "id": "48dc5bd9-bb81-48b3-9e99-c3d7ddde56d0",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-04 18:30:00",
    "end_time": "2026-11-06 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjExMDUgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261105",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:27.318667",
    "status": "CANCELLED"
  },
  {
    "id": "9c85c9f9-5df5-4ca9-8bae-a9ebcb6f2d69",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-22 18:30:00",
    "end_time": "2026-10-24 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=Y3Fxa2N0bm84aDY5cWVidXQ3djNxazM4am9fMjAyNjEwMjMgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "cqqkctno8h69qebut7v3qk38jo_20261023",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:29.139548",
    "status": "CANCELLED"
  },
  {
    "id": "0c29282b-9c9a-45a7-b542-cb5239c53f6a",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-02 02:00:00",
    "end_time": "2026-11-02 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMDJUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261102T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:43.190594",
    "status": "CANCELLED"
  },
  {
    "id": "d231e0ee-3c69-4080-997b-b9fc1b82cd47",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-06 02:00:00",
    "end_time": "2026-10-06 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMDZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261006T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:40.044939",
    "status": "CANCELLED"
  },
  {
    "id": "4c7ad478-c67b-465a-a190-23c39dfc05d4",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-18 10:30:00",
    "end_time": "2026-11-18 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261118T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:34.81764",
    "status": "SCHEDULED"
  },
  {
    "id": "afbeeff2-95c9-4cf6-bf12-29bf4c8fe770",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-11 07:45:00",
    "end_time": "2026-11-11 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMTFUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261111T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:54.791883",
    "status": "CANCELLED"
  },
  {
    "id": "d87d6d89-752b-41a4-a50b-f11a04604d03",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-16 07:45:00",
    "end_time": "2026-10-16 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTZUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261016T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.819873",
    "status": "CANCELLED"
  },
  {
    "id": "92ae954f-64d5-4b19-a9c9-0db6ac0c47e6",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-06 18:30:00",
    "end_time": "2026-11-08 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=ODNxbzVpNDBsMmZvcGFtdDdnbjRjaGdscDBfMjAyNjExMDcgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "83qo5i40l2fopamt7gn4chglp0_20261107",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:31.840464",
    "status": "CANCELLED"
  },
  {
    "id": "ee358280-9fac-4dec-81a7-ee390ecd0ae5",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-19 07:45:00",
    "end_time": "2026-10-19 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTlUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261019T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.983565",
    "status": "CANCELLED"
  },
  {
    "id": "f07d330b-d28a-40d0-be8f-ac6da3e4de90",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-20 18:30:00",
    "end_time": "2026-10-22 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=dTVwcWp0dmgyaXBmZjMwb2xpdnA5ZWc2NzBfMjAyNjEwMjEgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "u5pqjtvh2ipff30olivp9eg670_20261021",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:24.823939",
    "status": "CANCELLED"
  },
  {
    "id": "8c48bb6f-9fdf-46a4-a32b-aa59c94c5740",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-20 02:00:00",
    "end_time": "2026-10-20 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjBUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261020T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:41.694737",
    "status": "CANCELLED"
  },
  {
    "id": "30523430-0086-4a0e-bbf8-d9e02d7a0d89",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-14 18:30:00",
    "end_time": "2026-10-16 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjEwMTUgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261015",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:26.806102",
    "status": "CANCELLED"
  },
  {
    "id": "61a53e29-c82e-4d9f-98ca-20cf31156765",
    "title": "Hdfc credit card",
    "description": "",
    "start_time": "2026-10-11 04:30:00",
    "end_time": "2026-10-11 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=NnRoNjJjajZjNWo2YWJiNmM4cWowYjlrNjhzajRiOXBjNG9tYWJiM2Njb2o2ZDFqYzlpMzhwMWg2Z18yMDI2MTAxMVQwNDMwMDBaIGR1YmV5LnByYW5zaHVAbQ",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "6th62cj6c5j6abb6c8qj0b9k68sj4b9pc4omabb3ccoj6d1jc9i38p1h6g_20261011T043000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:01.289092",
    "status": "CANCELLED"
  },
  {
    "id": "72f6689e-ef4f-4709-8a37-2f889a45bdb6",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-01 07:45:00",
    "end_time": "2026-10-01 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMDFUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261001T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:49.997296",
    "status": "CANCELLED"
  },
  {
    "id": "061f92c2-8d81-4647-87bf-496a25e4b2b2",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-14 07:45:00",
    "end_time": "2026-10-14 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMTRUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261014T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:51.491466",
    "status": "CANCELLED"
  },
  {
    "id": "53a19edf-3289-46e5-a1e4-b9b1205fc9c8",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-28 07:45:00",
    "end_time": "2026-10-28 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjEwMjhUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261028T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:53.143352",
    "status": "CANCELLED"
  },
  {
    "id": "ec281635-0e84-4a60-961a-edef182c910d",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-23 07:45:00",
    "end_time": "2026-11-23 08:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=cmZkYWdrdGdxNzl0a28wM3MwNWc5NmUzYmxfMjAyNjExMjNUMDc0NTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "rfdagktgq79tko03s05g96e3bl_20261123T074500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:56.103367",
    "status": "CANCELLED"
  },
  {
    "id": "35c623f1-94db-4c11-91a2-418ba23bd6d1",
    "title": "Office",
    "description": "",
    "start_time": "2026-11-25 18:30:00",
    "end_time": "2026-11-27 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjExMjYgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261126",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:27.812979",
    "status": "CANCELLED"
  },
  {
    "id": "c08a0f1c-58f6-4712-afaf-66d99850d659",
    "title": "School Time",
    "description": "",
    "start_time": "2026-10-26 02:00:00",
    "end_time": "2026-10-26 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjEwMjZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261026T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:42.36008",
    "status": "CANCELLED"
  },
  {
    "id": "6f097b96-4aa3-4d32-a863-073850c25c5d",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-16 02:00:00",
    "end_time": "2026-11-16 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTZUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261116T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:44.836148",
    "status": "CANCELLED"
  },
  {
    "id": "048c60c4-e3e2-4cfc-bb62-0895b347b7b7",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-29 10:30:00",
    "end_time": "2026-09-29 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260929T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:17.453011",
    "status": "SCHEDULED"
  },
  {
    "id": "ecace191-717b-4dcc-8c47-fc3d9da4b21a",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-30 10:30:00",
    "end_time": "2026-09-30 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260930T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:17.931169",
    "status": "SCHEDULED"
  },
  {
    "id": "4b6de9e1-0bd4-4ac4-b06a-2b683146fb86",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-28 10:30:00",
    "end_time": "2026-10-28 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261028T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:27.511016",
    "status": "SCHEDULED"
  },
  {
    "id": "c64d09e3-5053-42d9-8e41-706823c32054",
    "title": "Office",
    "description": "",
    "start_time": "2026-10-28 18:30:00",
    "end_time": "2026-10-30 18:29:59",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=YTc4dHRxYmZucWpjcDlnOWFpM3Y4NHNtdjhfMjAyNjEwMjkgaGFyc2hpdEBlaG1jb25zdWx0YW5jeS5jby5pbg",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "a78ttqbfnqjcp9g9ai3v84smv8_20261029",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:27.139854",
    "status": "CANCELLED"
  },
  {
    "id": "ced0ef50-15d1-4f0f-9d6c-c210fd8e6698",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-22 03:45:00",
    "end_time": "2026-11-22 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261122T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-23 03:47:06.373748",
    "status": "SCHEDULED"
  },
  {
    "id": "b378a3fc-e102-44fc-b4e1-e3f106875fdb",
    "title": "Weekly Engineering Sprint Retrospective",
    "description": "Review Q4 migration progress and blockers",
    "start_time": "2026-09-28 10:44:29.673",
    "end_time": "2026-09-28 11:14:29.673",
    "location": "Google Meet",
    "google_meet_url": null,
    "organizer_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "invitees": [
      "c63693a9-31ea-4896-baf2-f78bcebd099a",
      "522c31cd-a505-4c72-8117-48fe0cb551ac"
    ],
    "google_event_id": null,
    "source": "INTERNAL",
    "created_at": "2026-09-28 09:44:30.076665",
    "status": "SCHEDULED"
  },
  {
    "id": "769d4a51-bfc8-43f4-9d3f-acc885557adf",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-19 02:00:00",
    "end_time": "2026-11-19 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMTlUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261119T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.337011",
    "status": "CANCELLED"
  },
  {
    "id": "27f22e63-77f1-48ab-b858-690b9e655bd2",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-25 09:15:00",
    "end_time": "2026-09-25 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MjVUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260925T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:51:42.433031",
    "status": "SCHEDULED"
  },
  {
    "id": "6a460a13-d4f3-49b2-9cdb-98dd18e2b6df",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-23 02:00:00",
    "end_time": "2026-11-23 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMjNUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261123T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.664252",
    "status": "CANCELLED"
  },
  {
    "id": "3f96f94e-34da-44af-969a-7c53acfc104a",
    "title": "School Time",
    "description": "",
    "start_time": "2026-11-24 02:00:00",
    "end_time": "2026-11-24 02:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=N2E3YnFiZHJpYzNwaHI5cHVsY291ZnZtanJfMjAyNjExMjRUMDIwMDAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "7a7bqbdric3phr9pulcoufvmjr_20261124T020000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:36:45.828181",
    "status": "CANCELLED"
  },
  {
    "id": "3f20e386-6e4b-49e1-a119-e830c14ee3bd",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-23 03:45:00",
    "end_time": "2026-11-23 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261123T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 03:47:08.413303",
    "status": "SCHEDULED"
  },
  {
    "id": "23349252-aa81-4a69-9ec6-c3e0a3c145a0",
    "title": "Hdfc credit card",
    "description": "",
    "start_time": "2026-11-11 04:30:00",
    "end_time": "2026-11-11 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=NnRoNjJjajZjNWo2YWJiNmM4cWowYjlrNjhzajRiOXBjNG9tYWJiM2Njb2o2ZDFqYzlpMzhwMWg2Z18yMDI2MTExMVQwNDMwMDBaIGR1YmV5LnByYW5zaHVAbQ",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "6th62cj6c5j6abb6c8qj0b9k68sj4b9pc4omabb3ccoj6d1jc9i38p1h6g_20261111T043000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-27 18:37:01.453388",
    "status": "CANCELLED"
  },
  {
    "id": "58fc405b-5a32-4767-8bb4-c9b6ed9168de",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-23 05:00:00",
    "end_time": "2026-11-23 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261123T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 05:01:55.968141",
    "status": "SCHEDULED"
  },
  {
    "id": "bd167100-d0ac-4de8-9307-376376a3bd41",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-30 09:15:00",
    "end_time": "2026-09-30 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MzBUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260930T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-23 09:45:58.150836",
    "status": "SCHEDULED"
  },
  {
    "id": "d5bbb8be-5f7f-42c1-a3eb-ea266bef5ad9",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-07 09:15:00",
    "end_time": "2026-10-07 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMDdUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261007T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 06:01:42.150652",
    "status": "SCHEDULED"
  },
  {
    "id": "7a49b6e3-a0fe-4bbd-b57e-75db529b9b90",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-09 09:15:00",
    "end_time": "2026-10-09 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMDlUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261009T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 09:03:41.119927",
    "status": "SCHEDULED"
  },
  {
    "id": "b3a4c469-e584-4022-a7ce-93e5dd7446fc",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-12 09:15:00",
    "end_time": "2026-10-12 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMTJUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261012T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 21:55:33.01208",
    "status": "SCHEDULED"
  },
  {
    "id": "f5fd804a-81c4-4ef3-83f8-60aaea13b2ad",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-23 10:30:00",
    "end_time": "2026-11-23 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261123T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-24 10:32:00.682565",
    "status": "SCHEDULED"
  },
  {
    "id": "d9cd034b-435f-44b1-b4e8-78f6c9a32c05",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-11-14 05:30:00",
    "end_time": "2026-11-14 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261114T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:08.343462",
    "status": "SCHEDULED"
  },
  {
    "id": "0e97ab03-81d6-4459-8c7c-29fedd0922e0",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-14 09:15:00",
    "end_time": "2026-10-14 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMTRUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261014T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-25 09:45:33.100931",
    "status": "SCHEDULED"
  },
  {
    "id": "07d1c2f3-f790-4cc4-b4c5-838c30f44987",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-24 10:30:00",
    "end_time": "2026-11-24 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261124T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-25 10:30:11.899274",
    "status": "SCHEDULED"
  },
  {
    "id": "68c6954a-546f-451b-9b1d-f9e71e1c7a9e",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-24 03:45:00",
    "end_time": "2026-11-24 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261124T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-25 03:45:42.820128",
    "status": "SCHEDULED"
  },
  {
    "id": "4cfd003b-22dd-4312-84aa-5909d08bc520",
    "title": "Kisan Survey demo ",
    "description": "",
    "start_time": "2026-09-25 10:00:00",
    "end_time": "2026-09-25 10:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yfa-rjba-wob",
    "organizer_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "dubey.pranshu@gmail.com",
      "jitendra@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "6npb7nm5kvbq5va1avqhu889r8",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 21:50:34.332069",
    "status": "SCHEDULED"
  },
  {
    "id": "e22790fa-b83f-4139-a895-ea64dff7580c",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-10-17 06:30:00",
    "end_time": "2026-10-17 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261017T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:11.218716",
    "status": "SCHEDULED"
  },
  {
    "id": "66b7b911-dd21-48fc-b1d0-1545898a06f0",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-10-24 05:30:00",
    "end_time": "2026-10-24 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261024T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:06.907139",
    "status": "SCHEDULED"
  },
  {
    "id": "a5a5ba6a-b1be-43f1-a3b6-ba7ff820b04e",
    "title": "Dev call, 9:20",
    "description": "",
    "start_time": "2026-11-25 03:45:00",
    "end_time": "2026-11-25 04:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ger-vadd-qfg",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "jitendra@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "neeraj@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "193nc69sguqbi728mcqo1vlm0p_20261125T034500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 03:46:57.232327",
    "status": "SCHEDULED"
  },
  {
    "id": "da04f780-8761-4f0e-9bc4-ae33d527693b",
    "title": "EHM CRM Demo Meeting",
    "description": "",
    "start_time": "2026-09-28 06:00:00",
    "end_time": "2026-09-28 06:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/sbq-kfnj-zhb",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "officialutkarshmishra01@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "640vabm8r16ei3edir9a7mvdib",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-28 05:53:13.496625",
    "status": "SCHEDULED"
  },
  {
    "id": "185a12d3-15d8-4d02-9350-da3948944c7c",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-09-28 09:15:00",
    "end_time": "2026-09-28 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjA5MjhUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20260928T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-23 08:15:59.01002",
    "status": "SCHEDULED"
  },
  {
    "id": "40d09994-f884-49b6-bb23-94ce83f7e296",
    "title": "Avani Sports",
    "description": "",
    "start_time": "2026-10-16 09:15:00",
    "end_time": "2026-10-16 09:45:00",
    "location": "Google Meet",
    "google_meet_url": "https://www.google.com/calendar/event?eid=MG01MzdtZmhtYnRiYjliNWplbmU4ZHBxb29fMjAyNjEwMTZUMDkxNTAwWiBoYXJzaGl0QGVobWNvbnN1bHRhbmN5LmNvLmlu",
    "organizer_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "invitees": [
      "neha@ehmconsultancy.co.in",
      "harshit@ehmconsultancy.co.in",
      "fa0289e6-0109-4228-9f3d-f54b7164773c",
      "1e32f27a-d641-40ff-923c-05fef4836c10"
    ],
    "google_event_id": "0m537mfhmbtbb9b5jene8dpqoo_20261016T091500Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 06:01:36.483993",
    "status": "SCHEDULED"
  },
  {
    "id": "9ee8ef57-c239-4d8c-adbe-61b2f35e86fe",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-11-25 10:30:00",
    "end_time": "2026-11-25 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261125T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-26 10:31:50.144418",
    "status": "SCHEDULED"
  },
  {
    "id": "e9d5cbf7-d42f-420d-8a8c-2aeb6205dd10",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-10-24 06:30:00",
    "end_time": "2026-10-24 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261024T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:11.702291",
    "status": "SCHEDULED"
  },
  {
    "id": "f33bdae2-d071-4de7-83c8-ac91112c193e",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-11-07 06:30:00",
    "end_time": "2026-11-07 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261107T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:12.664001",
    "status": "SCHEDULED"
  },
  {
    "id": "f06686e4-7ff3-4802-955f-180477ed6441",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-11-14 06:30:00",
    "end_time": "2026-11-14 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261114T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:13.143422",
    "status": "SCHEDULED"
  },
  {
    "id": "b9115e20-637f-4d93-a22c-fd6f17c0d9c3",
    "title": "EHM Weekly Updates",
    "description": "",
    "start_time": "2026-10-31 06:30:00",
    "end_time": "2026-10-31 07:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ckr-uwko-tak",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "ashutoshmishraup78@gmail.com",
      "shreyanshsiladar@gmail.com",
      "priyankasharma121202@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutosh@ehmconsultancy.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "officialutkarshmishra01@gmail.com"
    ],
    "google_event_id": "2gmivrrb8u56002on1dt6hp31c_20261031T063000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:12.185634",
    "status": "SCHEDULED"
  },
  {
    "id": "accb8c5f-6d1b-46a3-88b2-f95e1ba4c7fb",
    "title": "ClimAgro Weekly Updates",
    "description": "",
    "start_time": "2026-11-21 05:30:00",
    "end_time": "2026-11-21 06:15:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/kni-opev-xfu",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "jitendra@climagroanalytics.com",
      "neha@climagroanalytics.com",
      "harshit@ehmconsultancy.co.in",
      "tarul@climagroanalytics.com",
      "dubey.pranshu@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "neeraj@climagroanalytics.com",
      "utsavm@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "ashutoshmishraup78@gmail.com",
      "prernashukla566@gmail.com",
      "shreyanshsiladar@gmail.com",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "19ro6nds1825bcp69ihbvm10sb_20261121T053000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:08.821741",
    "status": "SCHEDULED"
  },
  {
    "id": "18c3d014-77b8-4ddf-acf3-83e4c16cfdcd",
    "title": "Company Call",
    "description": "",
    "start_time": "2026-11-24 05:00:00",
    "end_time": "2026-11-24 05:30:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/yoj-opxb-qdz",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "shreyanshsiladar@gmail.com",
      "utsav@ehmconsultancy.co.in",
      "priyankasharma121202@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@ehmconsultancy.co.in",
      "ashutoshmishraup78@gmail.com",
      "officialutkarshmishra01@gmail.com",
      "dubey.pranshu@gmail.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
      "c30c78d7-9398-4517-a54a-64005b90d555"
    ],
    "google_event_id": "ohlu4ojc919i06ca7vmr9u54kq_20261124T050000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-25 05:00:36.683758",
    "status": "SCHEDULED"
  },
  {
    "id": "415ec00a-130c-4f37-a1e0-e0227b5f288b",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-09-28 10:30:00",
    "end_time": "2026-09-28 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20260928T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:16.974263",
    "status": "SCHEDULED"
  },
  {
    "id": "aa15165c-533b-4815-9d5b-b0f511ecdf56",
    "title": "Sales CRM Meeting",
    "description": "",
    "start_time": "2026-10-26 10:30:00",
    "end_time": "2026-10-26 11:00:00",
    "location": "Google Meet",
    "google_meet_url": "https://meet.google.com/ibg-yuxg-qce",
    "organizer_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "invitees": [
      "dubey.pranshu@gmail.com",
      "neha@ehmconsultancy.co.in",
      "prernashukla566@gmail.com",
      "harshit@climagroanalytics.com",
      "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
      "67f526ba-afcf-4ec0-bf41-da1468bfb816"
    ],
    "google_event_id": "03nmib7skuvgmjjs9lnkknhatj_20261026T103000Z",
    "source": "GOOGLE_CALENDAR_IMPORTED",
    "created_at": "2026-09-22 08:06:26.553642",
    "status": "SCHEDULED"
  }
]
```

---

## 📋 Table: `notifications` (172 records)

### Formatted View Preview

| id | user_id | type | payload | read_at | email_sent_at | created_at |
| --- | --- | --- | --- | --- | --- | --- |
| b5758b3f-a602-4a52-81fa-df61890cb62f | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | CALENDAR_RECONNECT | `{"message":"Your Google Calendar OAuth i` | *null* | *null* | 2026-09-22 08:52:39.738177 |
| b840f71f-44e9-4e70-b29b-2e6d1838a8fe | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | CALENDAR_RECONNECT | `{"message":"Your Google Calendar OAuth i` | *null* | *null* | 2026-09-22 10:11:01.581157 |
| 4f0d96ca-8855-4bbd-867a-d655c32215f1 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [EHM-T006]","t` | *null* | *null* | 2026-09-22 11:17:50.660846 |
| 28a39a4e-4dbc-4e97-bea9-ea82ef2e59e8 | fa0289e6-0109-4228-9f3d-f54b7164773c | CALENDAR_RECONNECT | `{"message":"Your Google Calendar OAuth i` | *null* | *null* | 2026-09-22 16:38:07.53909 |
| bf3a2b6a-7651-4738-954c-380c35dde72b | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"testing ","taskId":"256366de-3` | *null* | *null* | 2026-09-23 05:26:00.211272 |
| e138d2eb-3888-4c02-90f3-f83697c8f602 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [COMMON-T001]","` | *null* | *null* | 2026-09-23 05:29:20.986162 |
| 283be646-fbb2-41e1-8eee-cc755da404bb | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_COMMENT | `{"title":"Task Comment: [COMMON-T001]","` | *null* | *null* | 2026-09-23 05:30:40.192926 |
| ef9a653a-fae7-447d-a7c1-3bb3bc78bc01 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"256366de-379c-4977-8d90-b42ba` | *null* | *null* | 2026-09-23 05:54:56.255299 |
| dd696be8-ad32-4d6a-8944-f36168375887 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_OVERDUE | `{"taskId":"256366de-379c-4977-8d90-b42ba` | *null* | *null* | 2026-09-23 05:54:56.457525 |
| 83f12e91-e56e-436b-871d-cb456226ee44 | 6df0b051-0183-414d-96df-b32a19a24cf2 | CALENDAR_RECONNECT | `{"message":"Your Google Calendar OAuth i` | *null* | *null* | 2026-09-23 05:54:56.831988 |
| 8437ba39-46c0-4fd7-860b-1b0f2457c881 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-23 07:16:42.853618 |
| 19a211a0-afe5-4109-bd3d-ed711cd7b60d | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-23 07:27:37.894151 |
| e58ba78b-50be-4aed-946a-7b7aaa5bd0b3 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-23 07:27:38.046006 |
| 663f29fa-1225-4b45-a8b9-d88a18efb75a | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-23 09:21:09.431731 |
| bfae2456-1bd2-40b0-a834-83d6f5ec8930 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_COMPLETED | `{"title":"Task Approved & Completed: [CA` | *null* | *null* | 2026-09-23 15:05:09.571948 |
| aa901cea-1382-4825-82ca-d75a24433e25 | 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-23 18:13:02.408307 |
| 5057f0b7-683e-44cb-80c0-88d9a260543b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-23 19:10:46.231158 |
| aa821ece-b641-4a96-830e-1c7bbae832dc | 526b8f7f-697d-4401-b380-50b085403f3f | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-24 06:47:55.161327 |
| ad465c4e-47f2-4e59-80f3-ac08b30ee873 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [EHM-I13-EP13-` | *null* | *null* | 2026-09-24 06:49:57.400449 |
| d77330df-ad4e-48bc-be1d-60f697351643 | 526b8f7f-697d-4401-b380-50b085403f3f | TASK_COMPLETED | `{"title":"Task Approved & Completed: [EH` | *null* | *null* | 2026-09-24 06:50:10.542782 |
| 93078644-3998-4965-8997-fab9ef084892 | 526b8f7f-697d-4401-b380-50b085403f3f | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-24 06:53:07.331885 |
| efe4bd18-ebb2-45de-85b3-131c26aeb045 | e65b4540-5f3b-407c-aa1e-e6fff984d9c3 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I13-EP13-T0` | *null* | *null* | 2026-09-24 06:53:42.797426 |
| 597294aa-dae2-4d33-a923-38606d832a2a | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-24 09:32:33.039811 |
| b4affbbe-bd6e-4bce-ade3-0dcd6faded6b | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"3730d320-4cf0-4af6-bacd-ee8dc` | *null* | *null* | 2026-09-27 19:17:02.728323 |
| 73c5456f-40ef-42d5-99eb-bd13a59a72cf | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-24 09:38:25.022362 |
| c3b7d216-f3a3-4462-b0ab-af635d26a015 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-24 16:50:03.665267 |
| c95a7f92-60ce-4df0-911e-914ea7738721 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-24 16:50:03.82489 |
| fad2d899-4205-4af0-afe6-22884ea41567 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"4afe15bf-342d-44a7-9c0f-84d8a` | *null* | *null* | 2026-09-24 16:50:04.321415 |
| c680fa6c-588c-4c6e-a894-4bec347a2ccc | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"e736121b-0f62-46d8-b762-c7193` | *null* | *null* | 2026-09-24 16:50:04.691144 |
| feba4e94-f487-4cc0-be15-485a4f29b257 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-25 16:50:03.653855 |
| cfb9b249-9561-4bbd-ac3f-3c684c4b94f2 | 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-25 16:50:03.844233 |
| baa32322-c9f6-4486-b1d1-c7ecf6b0f3a2 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"32289a36-6b04-4fd5-81a9-820f7` | *null* | *null* | 2026-09-25 16:50:04.742652 |
| 3d8a14ed-ba06-4a29-81b3-b36bfaf5a201 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-25 16:53:01.612406 |
| da41b5b3-2bc7-4432-a6ec-5e006614f650 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-E01-` | *null* | *null* | 2026-09-25 16:53:02.939153 |
| a33fa5f4-c80b-4d08-8ee9-7a95c8dfed85 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-25 16:53:21.813787 |
| 30539905-80e6-45ef-b73a-ee167f7aa3ca | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-25 18:18:05.127972 |
| fcba495b-47c6-4284-9ecb-4319701ee40e | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-25 18:18:53.81003 |
| 36ab6b43-a94c-4138-b66e-659ad92dda37 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-25 18:19:38.309908 |
| 322f2421-c35f-4f1f-9b20-f541e10227a6 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-25 18:20:07.729201 |
| f7fcf260-4805-4211-ad1b-93b800b4dd8a | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-25 18:20:38.919526 |
| e3766a73-2470-43ea-ad21-52da04900833 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-25 18:23:52.606861 |
| 653a83bf-e342-48a2-a71e-63aa5eb7b976 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [EHM-I15-EP14-` | *null* | *null* | 2026-09-25 18:24:51.089695 |
| ab2ebdf0-ba29-419d-84fe-8a4209a363e6 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMPLETED | `{"title":"Task Approved & Completed: [CO` | *null* | *null* | 2026-09-25 18:35:36.169024 |
| 1e367d12-a6d4-4b1a-9fc8-b89015557da5 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"b0946eba-6598-4bca-9de2-60f8c` | *null* | *null* | 2026-09-26 03:36:06.239417 |
| 806e47ff-002f-4596-8705-fbec8aea0498 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"b0946eba-6598-4bca-9de2-60f8c` | *null* | *null* | 2026-09-26 03:36:06.438532 |
| f492768b-0ff4-45e9-9d08-6731754dc872 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"7ed6ccfe-071f-48e0-afc4-211c3` | *null* | *null* | 2026-09-26 03:36:06.874437 |
| e8af510c-7380-4cad-bbff-3f6c7ebfce66 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"7ed6ccfe-071f-48e0-afc4-211c3` | *null* | *null* | 2026-09-26 03:36:07.040246 |
| afc96598-898b-46b2-96ee-b03fbca2e377 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"fa515f38-3032-48c7-be25-30b6a` | *null* | *null* | 2026-09-26 03:36:07.453414 |
| ccb8f297-c334-4107-9d6e-6101f4b217bc | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"fa515f38-3032-48c7-be25-30b6a` | *null* | *null* | 2026-09-26 03:36:07.619257 |
| d2923853-c33d-4beb-8810-51710c87f707 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"e736121b-0f62-46d8-b762-c7193` | *null* | *null* | 2026-09-26 03:36:08.036022 |
| f32c4a6e-ced2-4d52-bc2d-4a539dadfd25 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"4d5a6eea-30a5-474d-8716-d1d41` | *null* | *null* | 2026-09-26 03:36:08.448954 |
| 398c4691-ce89-4681-9951-3ba32faf8384 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"4d5a6eea-30a5-474d-8716-d1d41` | *null* | *null* | 2026-09-26 03:36:08.615297 |
| 51bca02f-1fde-4dce-a2a4-0c7ef98259d5 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"670e1b4e-655a-4a14-8aef-1d103` | *null* | *null* | 2026-09-26 03:36:09.035184 |
| 69201a83-25ab-48ac-b217-4a38760cf1f4 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"670e1b4e-655a-4a14-8aef-1d103` | *null* | *null* | 2026-09-26 03:36:09.202885 |
| fa03e2d0-a9dd-4f64-b38c-7fa714f7934c | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"4c0e2581-7463-4bf5-8866-54cbc` | *null* | *null* | 2026-09-26 03:36:10.360152 |
| a0cacee5-8ce1-4876-9650-745ffd3f5d3a | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"4c0e2581-7463-4bf5-8866-54cbc` | *null* | *null* | 2026-09-26 03:36:10.526562 |
| 2864dc25-6803-4af2-b9a0-1be3ea16795b | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-26 03:36:10.939788 |
| 461bf25d-7805-4215-8a92-8fe7bf7c13f0 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-26 03:36:11.105491 |
| e1c96a82-d6b8-45c4-b397-787a068f5d12 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-26 11:47:58.607617 |
| fd7c2fa7-237a-46bb-9e19-b6acc94a9570 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-26 11:47:59.385382 |
| 20148f96-e848-45ef-a396-f3e870506d8e | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-26 11:48:00.598142 |
| 98870032-5b21-4187-9db7-f15758011a45 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-26 20:22:07.733733 |
| 3c22a246-93fe-436e-9255-ec282359df25 | 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-26 20:22:08.093663 |
| 17fb4d37-c0d1-44dd-a2e5-ed74d47e6a51 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"32289a36-6b04-4fd5-81a9-820f7` | *null* | *null* | 2026-09-26 20:22:09.038488 |
| d5ef69a0-e875-45d3-9a80-63de4c36de6a | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"f062ec01-56e0-4157-9ed0-e93d4` | *null* | *null* | 2026-09-27 03:36:07.876744 |
| 0b67d421-cec5-4e90-a361-06f28fa2b25c | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"f062ec01-56e0-4157-9ed0-e93d4` | *null* | *null* | 2026-09-27 03:36:08.052748 |
| e3c4c999-4ae7-4bd8-bd0f-e4caf7bb907a | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"3730d320-4cf0-4af6-bacd-ee8dc` | *null* | *null* | 2026-09-27 19:17:03.118249 |
| 0448d4d5-6fb2-4225-ba9b-fafb3666c6f6 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMPLETED | `{"title":"Task Approved & Completed: [CO` | *null* | *null* | 2026-09-27 10:51:53.959805 |
| 14fb6728-3b45-44fb-8343-ccc15d861d12 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 10:58:10.545989 |
| d30d5d86-957f-4ea6-892a-a3c305daeb32 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 10:58:11.808308 |
| f9c278a3-af77-461c-926a-de09d97fc81f | 1baf71db-ff33-47ea-9bf8-72a30398f567 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 11:32:37.144475 |
| f1787a88-c2a4-4b99-8a66-c9121721a594 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"b0946eba-6598-4bca-9de2-60f8c` | *null* | *null* | 2026-09-27 12:01:36.405218 |
| 459a79cb-6c04-4eab-9ec1-059e6f6eac29 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"b0946eba-6598-4bca-9de2-60f8c` | *null* | *null* | 2026-09-27 12:01:36.834474 |
| 22fd668c-4a11-442d-b132-ff190e11ac28 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"7ed6ccfe-071f-48e0-afc4-211c3` | *null* | *null* | 2026-09-27 12:01:38.054636 |
| 3d1d99b7-b02b-4ed2-ab3f-60e9f1ce5640 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"7ed6ccfe-071f-48e0-afc4-211c3` | *null* | *null* | 2026-09-27 12:01:38.485202 |
| 129b60ac-83c1-480e-81e6-aa79f242bc82 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"fa515f38-3032-48c7-be25-30b6a` | *null* | *null* | 2026-09-27 12:01:39.414964 |
| 269589ff-df3f-456b-ac78-9bfe2ec8cf6b | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"fa515f38-3032-48c7-be25-30b6a` | *null* | *null* | 2026-09-27 12:01:39.904628 |
| 5d6b13f0-9d8e-419a-a89c-7fd24778c485 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"e736121b-0f62-46d8-b762-c7193` | *null* | *null* | 2026-09-27 12:01:41.08464 |
| 278abb04-82c5-4a1c-9192-aaa7c4bd8bc6 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"4d5a6eea-30a5-474d-8716-d1d41` | *null* | *null* | 2026-09-27 12:01:42.134708 |
| 6f9893c5-862d-4a34-9c92-a0e59d810a89 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_OVERDUE | `{"taskId":"4d5a6eea-30a5-474d-8716-d1d41` | *null* | *null* | 2026-09-27 12:01:42.485219 |
| 727d7d01-e125-4b87-a9c8-5cc3f4c70201 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"670e1b4e-655a-4a14-8aef-1d103` | *null* | *null* | 2026-09-27 12:01:44.500006 |
| 06bbf276-76b3-40c1-845b-9c77cc912943 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"670e1b4e-655a-4a14-8aef-1d103` | *null* | *null* | 2026-09-27 12:01:44.994694 |
| 0e467194-59d7-4170-9630-a878bceb8d39 | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-27 12:01:47.45452 |
| 1a7e1121-27e8-4f85-84ef-240b4a8ebc78 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"55fba724-92f5-481e-96fe-e6d20` | *null* | *null* | 2026-09-27 12:01:47.814663 |
| 40dfe60e-3882-424d-8352-f20136e54861 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 12:21:50.77023 |
| a6d3b073-4255-4085-92b6-7f4ac6a472b9 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-E01-` | *null* | *null* | 2026-09-27 12:21:53.990377 |
| df40f89e-5147-4f98-97c4-4287148c4f96 | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_CHECKLIST_COMPLETE | `{"title":"Checklist Completed: [CAG-I10-` | 2026-09-27 16:46:26.915 | *null* | 2026-09-27 12:28:38.961733 |
| 28f85ea5-0eb5-4bcb-bc89-c2350d03a26f | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_CHECKLIST_COMPLETE | `{"title":"Checklist Completed: [CAG-I10-` | 2026-09-27 16:47:36.057 | *null* | 2026-09-27 12:28:34.560778 |
| 5344548f-101b-479e-9fb3-4d19e2ddeabb | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I18-EP16-T0` | *null* | *null* | 2026-09-27 19:16:05.65563 |
| 3f9fa07b-0e23-4dfa-84b0-cdbe881f82ee | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [EHM-I15-EP14-` | 2026-09-27 16:46:15.26 | *null* | 2026-09-27 12:33:58.818783 |
| 651eaf9f-2240-4495-8401-7b48963b0a8c | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 17:30:27.632534 |
| 29c4a1b7-c13c-4105-863e-4a5b3fdcedc2 | 526b8f7f-697d-4401-b380-50b085403f3f | TASK_OVERDUE | `{"taskId":"b0946eba-6598-4bca-9de2-60f8c` | *null* | *null* | 2026-09-27 18:24:03.805567 |
| a1c7e944-b1c5-4d32-839b-c3a13fac36b3 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [EHM-I15-EP14-T0` | 2026-09-27 18:24:34.883 | *null* | 2026-09-27 18:15:31.473156 |
| 0e657efc-42b5-4454-ab26-2b428dd137da | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"5d587b90-2c17-4759-bcf9-392b0` | *null* | *null* | 2026-09-27 18:33:11.857967 |
| e005b937-f727-482a-b01e-67b1f0d1dd70 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"5d587b90-2c17-4759-bcf9-392b0` | *null* | *null* | 2026-09-27 18:33:12.247813 |
| 081ea0cd-04a2-457d-aa88-69faeff5a8aa | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"902d2dbd-e38e-4a57-9c05-ef211` | *null* | *null* | 2026-09-27 18:33:16.392838 |
| 44e2b7b6-0064-457f-8d41-38ee0d42a45b | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"902d2dbd-e38e-4a57-9c05-ef211` | *null* | *null* | 2026-09-27 18:33:16.818059 |
| e2b6a9a0-1d60-4d30-8d8e-07bf0b93fce4 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:12:47.812609 |
| 0ebe4ec6-4175-4d24-865e-15672c1b13ed | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:12:50.382723 |
| f82fecaf-469f-4c5e-aafe-2ef7948c2293 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I17-EP15-T0` | *null* | *null* | 2026-09-27 19:12:56.032848 |
| 67b6d175-fa5c-46b3-a181-ce747ff04ac4 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I17-EP15-T0` | *null* | *null* | 2026-09-27 19:13:02.242259 |
| 29b30d16-8738-436d-947a-39a197b01e32 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 19:13:02.422357 |
| 12491a99-3776-4335-bc4d-91deb5e7a57b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:13:04.182612 |
| 8f1422a4-8f0a-42e4-94d7-b02a1489164b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I17-EP15-T0` | *null* | *null* | 2026-09-27 19:13:08.337261 |
| d65956eb-466b-47a3-b07a-ee2489ce60d9 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I16-EP16` | *null* | *null* | 2026-09-27 19:13:09.652716 |
| bf629cf7-14e9-4d45-9c49-52fb1fea7ba0 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:15:57.440667 |
| fcdf2661-fd84-40bf-af12-35ea67c9544d | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:16:00.030787 |
| 0dcbc3f8-3f39-429b-9e0d-b928214bb32f | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I18-EP16-T0` | *null* | *null* | 2026-09-27 19:16:13.130671 |
| 20cd6220-6aee-4ed3-ab08-b1e318990fdb | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"0e09aea5-d416-40fa-8662-42a79` | *null* | *null* | 2026-09-27 19:17:08.73823 |
| 3dd98cc4-0ee5-4f8f-bfbf-6523a1fde562 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"0e09aea5-d416-40fa-8662-42a79` | *null* | *null* | 2026-09-27 19:17:09.128298 |
| 66817daa-5910-43fb-9fa5-4d2f6f7b30fb | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:18:38.937791 |
| c3f95bf5-85b6-4b6d-bb85-860033da3163 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:18:41.497325 |
| ae06cad1-11dd-4370-bded-bf74e154ad20 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I19-EP17-T0` | *null* | *null* | 2026-09-27 19:18:47.103141 |
| 469d612e-4b49-4ac6-b267-00622450a86d | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I19-EP17-T0` | *null* | *null* | 2026-09-27 19:18:54.642148 |
| 29029fb4-3d0f-4ae3-ae4f-568006708793 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 19:18:54.841824 |
| 60c243bd-d3ec-411e-9931-af96282bd834 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 19:18:56.95621 |
| b554e460-d267-48cd-9d0a-680d2bc86d6b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COM-ADM02-W1-8-` | *null* | *null* | 2026-09-27 19:19:01.46192 |
| 8fef2814-e55c-4f53-9e9d-d785a8a23b0e | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I18-EP18-T0` | *null* | *null* | 2026-09-27 19:19:04.469699 |
| 6c150f16-4823-4e79-a5cd-becdd0345956 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I18-EP18` | 2026-09-27 19:19:04.389 | *null* | 2026-09-27 19:19:02.751927 |
| a7f71dc3-2480-4701-b74b-0df3bc3dca18 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:20:22.852412 |
| e1196df4-1eb7-4a65-ae71-112f0faffdb2 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:20:25.427027 |
| 6aa9189d-28f0-4dc7-8045-f24b77fa8edf | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I20-EP18-T0` | *null* | *null* | 2026-09-27 19:20:30.992626 |
| 0d349e12-383f-4620-9837-0dab7109c87a | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I20-EP18-T0` | *null* | *null* | 2026-09-27 19:20:38.29275 |
| 7017415c-17d9-4bf8-b627-15d42bcc4ea2 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 19:20:38.452713 |
| 5ed58d37-f438-493a-a1f1-40258229d693 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I21-EP19-T0` | *null* | *null* | 2026-09-27 19:22:21.396151 |
| 833a1f71-4932-4bcf-a81c-0c52253bfcb7 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 19:20:40.392387 |
| dcfcc360-3f04-4a76-80a7-714474796ae5 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COM-ADM02-W1-9-` | *null* | *null* | 2026-09-27 19:20:44.642571 |
| 7f03cf7f-5f89-4cc0-8306-3943afcea3c0 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I19-EP19` | 2026-09-27 19:20:47.509 | *null* | 2026-09-27 19:20:45.912778 |
| 4adde73b-d168-4a92-b351-81286aa7c61e | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I19-EP19-T0` | *null* | *null* | 2026-09-27 19:20:47.612824 |
| ca7cd79b-e01f-42c2-9c05-f01b8d4ed793 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:22:05.779132 |
| e2c4c9e4-afb6-44fc-a91b-9c027e512ae8 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:22:08.608473 |
| c1e06882-08c2-4450-b8ce-c81c487ca05f | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I21-EP19-T0` | *null* | *null* | 2026-09-27 19:22:14.576135 |
| f2bd3e0b-9a3d-4cb6-b024-db71d6556b4b | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I20-EP20-T0` | *null* | *null* | 2026-09-27 19:22:31.921148 |
| 37efb352-9577-409a-9966-2615a9870f20 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I20-EP20` | 2026-09-27 19:22:31.849 | *null* | 2026-09-27 19:22:30.067558 |
| ad3fe573-e3eb-4022-8f82-50283a416135 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I22-EP20-T0` | *null* | *null* | 2026-09-27 19:24:43.647615 |
| f2a20eed-a31d-47b8-ba73-0bdf46bc3045 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I21-EP21-T0` | *null* | *null* | 2026-09-27 19:25:02.439969 |
| 3cb5009d-d568-4b0b-b1b6-5d0cd075315a | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I21-EP21` | 2026-09-27 19:25:02.357 | *null* | 2026-09-27 19:25:00.707476 |
| 802fe861-1eb6-4dc8-98ba-c03a68f0bde1 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 19:22:21.586065 |
| 2f37d260-d2c1-4e47-b921-f89abf245499 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 19:22:24.311231 |
| 9eb50977-ec6f-403c-9c22-36c420afb962 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COM-ADM02-W1-10` | *null* | *null* | 2026-09-27 19:22:28.738179 |
| 588643a9-cb5d-42a6-a00b-ca2e9643b9e6 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 19:24:35.067325 |
| 0e7f012a-3d7c-4745-b250-dc546ac83b3b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 19:24:37.866983 |
| 78e540cd-f97b-4ae1-ae97-7760607cbc39 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I22-EP20-T0` | *null* | *null* | 2026-09-27 19:24:52.519514 |
| acb0c5fd-6685-4d1b-97a1-eefbe5b4a8da | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 19:24:52.687263 |
| 30ee591e-aee7-483c-9eef-e3a843b91582 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 19:24:54.927328 |
| 3260d684-dfc6-4dca-a6df-053cd2b272c4 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COM-ADM02-W1-11` | *null* | *null* | 2026-09-27 19:24:59.441975 |
| 4df9c553-bd7f-46e0-852a-23543f829c4c | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [CAG` | *null* | *null* | 2026-09-27 20:13:27.782514 |
| a9bcc607-b05d-4e08-a1d5-06b1cfe5bc11 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-27 20:13:30.742288 |
| 4f28e489-7606-4bca-bdf3-3987f65178c0 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I23-EP21-T0` | *null* | *null* | 2026-09-27 20:13:36.602273 |
| 28da6d49-0dc0-4c1e-82fb-b655f24cb562 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [CAG-I23-EP21-T0` | *null* | *null* | 2026-09-27 20:13:42.992151 |
| 7ecfd417-6c05-4f31-b0b6-fa14c5d8e842 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-ADM0` | *null* | *null* | 2026-09-27 20:13:43.192138 |
| 1f92c87f-0afb-4753-a984-273dbb8d3a24 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | *null* | *null* | 2026-09-27 20:13:45.282217 |
| 4224b407-8b4a-4fcb-bf9e-ecaec9216b6f | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COM-ADM02-W1-T0` | *null* | *null* | 2026-09-27 20:13:49.662258 |
| 8da47547-d28d-429d-b950-6dd174f9542b | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_COMMENT | `{"title":"Task Comment: [EHM-I22-EP22-T0` | *null* | *null* | 2026-09-27 20:13:53.966272 |
| 0a1e5c72-423c-40f4-807c-ccef851f5a87 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"Task Reassigned: [EHM-I22-EP22` | 2026-09-27 20:13:53.892 | *null* | 2026-09-27 20:13:51.042357 |
| ec8e729c-46df-4574-9528-c685e77dc392 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-27 20:27:13.206854 |
| 4212ac40-a014-4828-a3ed-d2e4c3455f2e | 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | TASK_OVERDUE | `{"taskId":"336bafbf-5f38-445c-bd42-74add` | *null* | *null* | 2026-09-27 20:27:13.365766 |
| 611577e1-7968-4fa0-8e85-59bf545e407b | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"32289a36-6b04-4fd5-81a9-820f7` | *null* | *null* | 2026-09-27 20:27:13.762243 |
| c34aab5f-fa3b-474d-a9e7-c9b70a5fce4d | 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [CAG-I10-EP05-` | *null* | *null* | 2026-09-27 20:34:10.117593 |
| 3300e6d9-a440-40b1-a064-cad79e6bba0a | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_COMPLETED | `{"title":"Task Approved & Completed: [CA` | *null* | *null* | 2026-09-27 20:34:13.302627 |
| d9949427-eb72-4a7c-8220-120d52efdf40 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_COMMENT | `{"title":"Task Comment: [COMMON-T005]","` | *null* | *null* | 2026-09-28 04:59:33.481699 |
| bd0eeef4-ce50-4db7-96a8-6b0b693df550 | 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | TASK_REVIEW_SUBMITTED | `{"title":"Review Pending: [EHM-I15-EP14-` | *null* | *null* | 2026-09-28 05:00:59.800454 |
| 8b420617-606a-44e7-93c9-98fe579df918 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-28 05:04:18.06028 |
| 24452255-e6dd-4788-9f5a-354b73cb4517 | cc923c23-5192-45b5-a282-7f0869cc5feb | TASK_OVERDUE | `{"taskId":"f062ec01-56e0-4157-9ed0-e93d4` | *null* | *null* | 2026-09-28 05:12:19.911952 |
| cf8088d2-ac46-41eb-ab25-72329f16b404 | c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | TASK_OVERDUE | `{"taskId":"f062ec01-56e0-4157-9ed0-e93d4` | *null* | *null* | 2026-09-28 05:12:20.223339 |
| 50f97ca8-0e97-499f-baba-6334b19ce97f | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_OVERDUE | `{"taskId":"d0f03dd6-6825-40fb-a425-14264` | *null* | *null* | 2026-09-28 05:12:21.834309 |
| e8f0556f-f607-412c-84a7-b49f605f3611 | 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | TASK_OVERDUE | `{"taskId":"9b63b82c-8c4d-4db9-9238-8c575` | *null* | *null* | 2026-09-28 05:12:27.349694 |
| 128a5f62-be57-4227-9460-a3f025e86b6c | 1baf71db-ff33-47ea-9bf8-72a30398f567 | TASK_OVERDUE | `{"taskId":"9b63b82c-8c4d-4db9-9238-8c575` | *null* | *null* | 2026-09-28 05:12:27.662731 |
| ceb1b761-6514-4494-8384-6a1c07ce06cb | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-28 05:21:34.260487 |
| 07e7a370-64e4-411e-8a49-566f3b6463b3 | 6df0b051-0183-414d-96df-b32a19a24cf2 | TASK_ASSIGNED | `{"title":"New Sprint Assigned: [COM-E01-` | *null* | *null* | 2026-09-28 05:21:36.908892 |
| 2d25a3d3-9575-4a90-9001-e3d85ff291d7 | e691cc1d-7eb1-44b6-a495-1f6713c6c319 | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [EHM` | *null* | *null* | 2026-09-28 05:54:27.516854 |
| 20b63637-7afd-416e-8663-4067026c86d6 | fa0289e6-0109-4228-9f3d-f54b7164773c | TASK_ASSIGNED | `{"title":"New Sprint Task Assigned: [COM` | 2026-09-28 11:31:28.042 | *null* | 2026-09-28 05:59:23.522601 |

### Complete Field Data & Records (`notifications`)

```json
[
  {
    "id": "b5758b3f-a602-4a52-81fa-df61890cb62f",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "CALENDAR_RECONNECT",
    "payload": {
      "message": "Your Google Calendar OAuth integration token will expire within 24 hours. Please reconnect in Settings."
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-22 08:52:39.738177"
  },
  {
    "id": "b840f71f-44e9-4e70-b29b-2e6d1838a8fe",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "CALENDAR_RECONNECT",
    "payload": {
      "message": "Your Google Calendar OAuth integration token will expire within 24 hours. Please reconnect in Settings."
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-22 10:11:01.581157"
  },
  {
    "id": "4f0d96ca-8855-4bbd-867a-d655c32215f1",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [EHM-T006]",
      "taskId": "a39f6260-4d52-4d27-a209-ea563f16368c",
      "message": "Task [EHM-T006] \"Automated CI/CD Resilience & Zero Data Loss Testing\" has deliverables ready for your manager review & sign-off.",
      "taskCode": "EHM-T006",
      "taskTitle": "Automated CI/CD Resilience & Zero Data Loss Testing",
      "deliverableUrl": ""
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-22 11:17:50.660846"
  },
  {
    "id": "28a39a4e-4dbc-4e97-bea9-ea82ef2e59e8",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "CALENDAR_RECONNECT",
    "payload": {
      "message": "Your Google Calendar OAuth integration token will expire within 24 hours. Please reconnect in Settings."
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-22 16:38:07.53909"
  },
  {
    "id": "bf3a2b6a-7651-4738-954c-380c35dde72b",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "testing ",
      "taskId": "256366de-379c-4977-8d90-b42bac2fbb7c",
      "dueDate": "2026-10-07",
      "taskCode": "COMMON-T001"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:26:00.211272"
  },
  {
    "id": "e138d2eb-3888-4c02-90f3-f83697c8f602",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COMMON-T001]",
      "taskId": "256366de-379c-4977-8d90-b42bac2fbb7c",
      "message": "Ashutosh Mishra commented on task [COMMON-T001]: \"you have to do it before 24\"",
      "taskCode": "COMMON-T001",
      "taskTitle": "testing "
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:29:20.986162"
  },
  {
    "id": "283be646-fbb2-41e1-8eee-cc755da404bb",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COMMON-T001]",
      "taskId": "256366de-379c-4977-8d90-b42bac2fbb7c",
      "message": "tester commented on task [COMMON-T001]: \"1 step don on 23 sep\"",
      "taskCode": "COMMON-T001",
      "taskTitle": "testing"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:30:40.192926"
  },
  {
    "id": "ef9a653a-fae7-447d-a7c1-3bb3bc78bc01",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "256366de-379c-4977-8d90-b42bac2fbb7c",
      "taskCode": "COMMON-T001",
      "taskTitle": "testing",
      "daysOverdue": 1,
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:54:56.255299"
  },
  {
    "id": "dd696be8-ad32-4d6a-8944-f36168375887",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "256366de-379c-4977-8d90-b42bac2fbb7c",
      "taskCode": "COMMON-T001",
      "taskTitle": "testing",
      "daysOverdue": 1,
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:54:56.457525"
  },
  {
    "id": "83f12e91-e56e-436b-871d-cb456226ee44",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "CALENDAR_RECONNECT",
    "payload": {
      "message": "Your Google Calendar OAuth integration token will expire within 24 hours. Please reconnect in Settings."
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 05:54:56.831988"
  },
  {
    "id": "8437ba39-46c0-4fd7-860b-1b0f2457c881",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I10-EP05-T001] \"Creating Farmer platform & Testing\"",
      "tagged": true,
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "dueDate": "2026-09-23",
      "message": "You have been assigned to sprint task [CAG-I10-EP05-T001] \"Creating Farmer platform & Testing\". Target Due Date: 2026-09-23.",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "assigneeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 07:16:42.853618"
  },
  {
    "id": "19a211a0-afe5-4109-bd3d-ed711cd7b60d",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 07:27:37.894151"
  },
  {
    "id": "e58ba78b-50be-4aed-946a-7b7aaa5bd0b3",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 07:27:38.046006"
  },
  {
    "id": "663f29fa-1225-4b45-a8b9-d88a18efb75a",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I10-EP05-T002] \"Farmer onboarding & Demo\"",
      "tagged": true,
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "dueDate": "2026-09-27",
      "message": "You have been assigned to sprint task [CAG-I10-EP05-T002] \"Farmer onboarding & Demo\". Target Due Date: 2026-09-27.",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo",
      "assigneeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 09:21:09.431731"
  },
  {
    "id": "bfae2456-1bd2-40b0-a834-83d6f5ec8930",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_COMPLETED",
    "payload": {
      "title": "Task Approved & Completed: [CAG-I10-EP05-T002]",
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "message": "Your deliverable for task [CAG-I10-EP05-T002] \"Farmer onboarding & Demo\" has been signed off and marked Done!",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 15:05:09.571948"
  },
  {
    "id": "aa901cea-1382-4825-82ca-d75a24433e25",
    "user_id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T002] \"Linkedin Lead Gen Form\"",
      "tagged": true,
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "dueDate": "2026-09-25",
      "message": "You have been assigned to sprint task [COMMON-T002] \"Linkedin Lead Gen Form\". Target Due Date: 2026-09-25.",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "assigneeId": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 18:13:02.408307"
  },
  {
    "id": "5057f0b7-683e-44cb-80c0-88d9a260543b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T003] \"Strategy & Positioning (BMC)\"",
      "tagged": true,
      "taskId": "32289a36-6b04-4fd5-81a9-820f70ad1de8",
      "dueDate": "2026-09-25",
      "message": "You have been assigned to sprint task [COMMON-T003] \"Strategy & Positioning (BMC)\". Target Due Date: 2026-09-25.",
      "taskCode": "COMMON-T003",
      "taskTitle": "Strategy & Positioning (BMC)",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-23 19:10:46.231158"
  },
  {
    "id": "aa821ece-b641-4a96-830e-1c7bbae832dc",
    "user_id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I13-EP13-T001] \"heelo psot testing \"",
      "tagged": true,
      "taskId": "abec1e36-20d3-4960-b8aa-64203d353176",
      "dueDate": "2026-09-28",
      "message": "You have been assigned to sprint task [EHM-I13-EP13-T001] \"heelo psot testing \". Target Due Date: 2026-09-28.",
      "taskCode": "EHM-I13-EP13-T001",
      "taskTitle": "heelo psot testing ",
      "assigneeId": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
      "assigneeName": "Shreyansh Siladar"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 06:47:55.161327"
  },
  {
    "id": "ad465c4e-47f2-4e59-80f3-ac08b30ee873",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [EHM-I13-EP13-T001]",
      "taskId": "abec1e36-20d3-4960-b8aa-64203d353176",
      "message": "Task [EHM-I13-EP13-T001] \"heelo psot testing \" has deliverables ready for your manager review & sign-off.",
      "taskCode": "EHM-I13-EP13-T001",
      "taskTitle": "heelo psot testing ",
      "deliverableUrl": null
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 06:49:57.400449"
  },
  {
    "id": "d77330df-ad4e-48bc-be1d-60f697351643",
    "user_id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "type": "TASK_COMPLETED",
    "payload": {
      "title": "Task Approved & Completed: [EHM-I13-EP13-T001]",
      "taskId": "abec1e36-20d3-4960-b8aa-64203d353176",
      "message": "Your deliverable for task [EHM-I13-EP13-T001] \"heelo psot testing \" has been signed off and marked Done!",
      "taskCode": "EHM-I13-EP13-T001",
      "taskTitle": "heelo psot testing "
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 06:50:10.542782"
  },
  {
    "id": "93078644-3998-4965-8997-fab9ef084892",
    "user_id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I13-EP13-T002] \"TESTING\"",
      "tagged": true,
      "taskId": "59dba3e1-73da-423b-8e61-eb323ffac385",
      "dueDate": "2026-10-08",
      "message": "You have been assigned to sprint task [EHM-I13-EP13-T002] \"TESTING\". Target Due Date: 2026-10-08.",
      "taskCode": "EHM-I13-EP13-T002",
      "taskTitle": "TESTING",
      "assigneeId": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
      "assigneeName": "Shreyansh Siladar"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 06:53:07.331885"
  },
  {
    "id": "efe4bd18-ebb2-45de-85b3-131c26aeb045",
    "user_id": "e65b4540-5f3b-407c-aa1e-e6fff984d9c3",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I13-EP13-T002]",
      "taskId": "59dba3e1-73da-423b-8e61-eb323ffac385",
      "message": "Shreyansh Siladar commented on task [EHM-I13-EP13-T002]: \"TMM YE GALT KR RE\"",
      "taskCode": "EHM-I13-EP13-T002",
      "taskTitle": "TESTING"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 06:53:42.797426"
  },
  {
    "id": "597294aa-dae2-4d33-a923-38606d832a2a",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T004] \"Genesis Application\"",
      "tagged": true,
      "taskId": "4afe15bf-342d-44a7-9c0f-84d8af4f998a",
      "dueDate": "2026-09-24",
      "message": "You have been assigned to sprint task [COMMON-T004] \"Genesis Application\". Target Due Date: 2026-09-24.",
      "taskCode": "COMMON-T004",
      "taskTitle": "Genesis Application",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 09:32:33.039811"
  },
  {
    "id": "b4affbbe-bd6e-4bce-ade3-0dcd6faded6b",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "3730d320-4cf0-4af6-bacd-ee8dce518d0f",
      "taskCode": "CAG-I10-EP05-T005",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:17:02.728323"
  },
  {
    "id": "73c5456f-40ef-42d5-99eb-bd13a59a72cf",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T005] \"CSJMU Sustainability Proposal\"",
      "tagged": true,
      "taskId": "e736121b-0f62-46d8-b762-c719399fd6d3",
      "dueDate": "2026-09-24",
      "message": "You have been assigned to sprint task [COMMON-T005] \"CSJMU Sustainability Proposal\". Target Due Date: 2026-09-24.",
      "taskCode": "COMMON-T005",
      "taskTitle": "CSJMU Sustainability Proposal",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 09:38:25.022362"
  },
  {
    "id": "c3b7d216-f3a3-4462-b0ab-af635d26a015",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 2,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 16:50:03.665267"
  },
  {
    "id": "c95a7f92-60ce-4df0-911e-914ea7738721",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 2,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 16:50:03.82489"
  },
  {
    "id": "fad2d899-4205-4af0-afe6-22884ea41567",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4afe15bf-342d-44a7-9c0f-84d8af4f998a",
      "taskCode": "COMMON-T004",
      "taskTitle": "Genesis Application",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 16:50:04.321415"
  },
  {
    "id": "c680fa6c-588c-4c6e-a894-4bec347a2ccc",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "e736121b-0f62-46d8-b762-c719399fd6d3",
      "taskCode": "COMMON-T005",
      "taskTitle": "CSJMU Sustainability Proposal",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-24 16:50:04.691144"
  },
  {
    "id": "feba4e94-f487-4cc0-be15-485a4f29b257",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 1,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:50:03.653855"
  },
  {
    "id": "cfb9b249-9561-4bbd-ac3f-3c684c4b94f2",
    "user_id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 1,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:50:03.844233"
  },
  {
    "id": "baa32322-c9f6-4486-b1d1-c7ecf6b0f3a2",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "32289a36-6b04-4fd5-81a9-820f70ad1de8",
      "taskCode": "COMMON-T003",
      "taskTitle": "Strategy & Positioning (BMC)",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:50:04.742652"
  },
  {
    "id": "3d8a14ed-ba06-4a29-81b3-b36bfaf5a201",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T006] \"testing \"",
      "tagged": true,
      "taskId": "2c125d85-dbab-4219-bfba-cddc77942886",
      "dueDate": "2026-10-09",
      "message": "You have been assigned to sprint task [COMMON-T006] \"testing \". Target Due Date: 2026-10-09.",
      "taskCode": "COMMON-T006",
      "taskTitle": "testing ",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:53:01.612406"
  },
  {
    "id": "da41b5b3-2bc7-4432-a6ec-5e006614f650",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-E01-W4] \"testing \"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-E01-W4] \"testing \" (Week 4 (Days 22–28)).",
      "sprintId": "5e34129f-6507-4556-9460-d0bd8ded8d07",
      "taskCode": "COM-E01-W4",
      "taskTitle": "testing ",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "sprintCode": "COM-E01-W4",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:53:02.939153"
  },
  {
    "id": "a33fa5f4-c80b-4d08-8ee9-7a95c8dfed85",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T007] \"hiii\"",
      "tagged": true,
      "taskId": "e69397ab-e2ad-4c5b-a221-4135035e2726",
      "dueDate": "2026-10-09",
      "message": "You have been assigned to sprint task [COMMON-T007] \"hiii\". Target Due Date: 2026-10-09.",
      "taskCode": "COMMON-T007",
      "taskTitle": "hiii",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 16:53:21.813787"
  },
  {
    "id": "30539905-80e6-45ef-b73a-ee167f7aa3ca",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T001] \"CityAdapt – Climate Resilient Agra proposal\"",
      "tagged": true,
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "dueDate": "2026-09-05",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T001] \"CityAdapt – Climate Resilient Agra proposal\". Target Due Date: 2026-09-05.",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "assigneeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:18:05.127972"
  },
  {
    "id": "fcba495b-47c6-4284-9ecb-4319701ee40e",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T002] \"Integrated Waste Management proposal\"",
      "tagged": true,
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "dueDate": "2026-09-05",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T002] \"Integrated Waste Management proposal\". Target Due Date: 2026-09-05.",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "assigneeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:18:53.81003"
  },
  {
    "id": "36ab6b43-a94c-4138-b66e-659ad92dda37",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T003] \"Water Positive Agra proposal\"",
      "tagged": true,
      "taskId": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
      "dueDate": "2026-09-06",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T003] \"Water Positive Agra proposal\". Target Due Date: 2026-09-06.",
      "taskCode": "EHM-I15-EP14-T003",
      "taskTitle": "Water Positive Agra proposal",
      "assigneeId": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:19:38.309908"
  },
  {
    "id": "322f2421-c35f-4f1f-9b20-f541e10227a6",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T004] \"Ecology, Biodiversity & Urban Forest proposal\"",
      "tagged": true,
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "dueDate": "2026-09-06",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T004] \"Ecology, Biodiversity & Urban Forest proposal\". Target Due Date: 2026-09-06.",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "assigneeId": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:20:07.729201"
  },
  {
    "id": "f7fcf260-4805-4211-ad1b-93b800b4dd8a",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T005] \"AI Training & Capacity Building proposal\"",
      "tagged": true,
      "taskId": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
      "dueDate": "2026-09-06",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T005] \"AI Training & Capacity Building proposal\". Target Due Date: 2026-09-06.",
      "taskCode": "EHM-I15-EP14-T005",
      "taskTitle": "AI Training & Capacity Building proposal",
      "assigneeId": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:20:38.919526"
  },
  {
    "id": "e3766a73-2470-43ea-ad21-52da04900833",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T008] \"Email update for IMD\"",
      "tagged": true,
      "taskId": "4c0e2581-7463-4bf5-8866-54cbcb927f3e",
      "dueDate": "2026-09-26",
      "message": "You have been assigned to sprint task [COMMON-T008] \"Email update for IMD\". Target Due Date: 2026-09-26.",
      "taskCode": "COMMON-T008",
      "taskTitle": "Email update for IMD",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:23:52.606861"
  },
  {
    "id": "653a83bf-e342-48a2-a71e-63aa5eb7b976",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [EHM-I15-EP14-T001]",
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "message": "Task [EHM-I15-EP14-T001] \"CityAdapt – Climate Resilient Agra proposal\" has deliverables ready for your manager review & sign-off.",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "deliverableUrl": "https://delhi-hef-wars.vercel.app/"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:24:51.089695"
  },
  {
    "id": "ab2ebdf0-ba29-419d-84fe-8a4209a363e6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMPLETED",
    "payload": {
      "title": "Task Approved & Completed: [COMMON-T004]",
      "taskId": "4afe15bf-342d-44a7-9c0f-84d8af4f998a",
      "message": "Your deliverable for task [COMMON-T004] \"Genesis Application\" has been signed off and marked Done!",
      "taskCode": "COMMON-T004",
      "taskTitle": "Genesis Application"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-25 18:35:36.169024"
  },
  {
    "id": "1e367d12-a6d4-4b1a-9fc8-b89015557da5",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:06.239417"
  },
  {
    "id": "806e47ff-002f-4596-8705-fbec8aea0498",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:06.438532"
  },
  {
    "id": "f492768b-0ff4-45e9-9d08-6731754dc872",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
      "taskCode": "EHM-I15-EP14-T003",
      "taskTitle": "Water Positive Agra proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:06.874437"
  },
  {
    "id": "e8af510c-7380-4cad-bbff-3f6c7ebfce66",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
      "taskCode": "EHM-I15-EP14-T003",
      "taskTitle": "Water Positive Agra proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:07.040246"
  },
  {
    "id": "afc96598-898b-46b2-96ee-b03fbca2e377",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "daysOverdue": 22,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:07.453414"
  },
  {
    "id": "ccb8f297-c334-4107-9d6e-6101f4b217bc",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "daysOverdue": 22,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:07.619257"
  },
  {
    "id": "d2923853-c33d-4beb-8810-51710c87f707",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "e736121b-0f62-46d8-b762-c719399fd6d3",
      "taskCode": "COMMON-T005",
      "taskTitle": "CSJMU Sustainability Proposal",
      "daysOverdue": 3,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:08.036022"
  },
  {
    "id": "f32c4a6e-ced2-4d52-bc2d-4a539dadfd25",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
      "taskCode": "EHM-I15-EP14-T005",
      "taskTitle": "AI Training & Capacity Building proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:08.448954"
  },
  {
    "id": "398c4691-ce89-4681-9951-3ba32faf8384",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
      "taskCode": "EHM-I15-EP14-T005",
      "taskTitle": "AI Training & Capacity Building proposal",
      "daysOverdue": 21,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:08.615297"
  },
  {
    "id": "51bca02f-1fde-4dce-a2a4-0c7ef98259d5",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "daysOverdue": 22,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:09.035184"
  },
  {
    "id": "69201a83-25ab-48ac-b217-4a38760cf1f4",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "daysOverdue": 22,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:09.202885"
  },
  {
    "id": "fa03e2d0-a9dd-4f64-b38c-7fa714f7934c",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4c0e2581-7463-4bf5-8866-54cbcb927f3e",
      "taskCode": "COMMON-T008",
      "taskTitle": "Email update for IMD",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:10.360152"
  },
  {
    "id": "a0cacee5-8ce1-4876-9650-745ffd3f5d3a",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4c0e2581-7463-4bf5-8866-54cbcb927f3e",
      "taskCode": "COMMON-T008",
      "taskTitle": "Email update for IMD",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:10.526562"
  },
  {
    "id": "2864dc25-6803-4af2-b9a0-1be3ea16795b",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 4,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:10.939788"
  },
  {
    "id": "461bf25d-7805-4215-8a92-8fe7bf7c13f0",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 4,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 03:36:11.105491"
  },
  {
    "id": "e1c96a82-d6b8-45c4-b397-787a068f5d12",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T009] \"HIVE Team Onboarding & Adoption\"",
      "tagged": true,
      "taskId": "9196ea8a-bc16-4dff-a024-c9c265dbea0b",
      "dueDate": "2026-10-10",
      "message": "You have been assigned to sprint task [COMMON-T009] \"HIVE Team Onboarding & Adoption\". Target Due Date: 2026-10-10.",
      "taskCode": "COMMON-T009",
      "taskTitle": "HIVE Team Onboarding & Adoption",
      "assigneeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 11:47:58.607617"
  },
  {
    "id": "fd7c2fa7-237a-46bb-9e19-b6acc94a9570",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T010] \"HIVE Team Onboarding & Adoption\"",
      "tagged": true,
      "taskId": "84ba896a-0b66-46d8-bbe8-dccc00af5921",
      "dueDate": "2026-10-10",
      "message": "You have been assigned to sprint task [COMMON-T010] \"HIVE Team Onboarding & Adoption\". Target Due Date: 2026-10-10.",
      "taskCode": "COMMON-T010",
      "taskTitle": "HIVE Team Onboarding & Adoption",
      "assigneeId": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 11:47:59.385382"
  },
  {
    "id": "20148f96-e848-45ef-a396-f3e870506d8e",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM03-W2026] \"HIVE Team Onboarding & Adoption\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM03-W2026] \"HIVE Team Onboarding & Adoption\" (2026-09-28).",
      "sprintId": "93107e05-c2e1-49a3-bac4-d9e1b0811ca6",
      "taskCode": "COM-ADM03-W2026",
      "taskTitle": "HIVE Team Onboarding & Adoption",
      "assigneeId": "c30c78d7-9398-4517-a54a-64005b90d555",
      "sprintCode": "COM-ADM03-W2026",
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 11:48:00.598142"
  },
  {
    "id": "98870032-5b21-4187-9db7-f15758011a45",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 2,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 20:22:07.733733"
  },
  {
    "id": "3c22a246-93fe-436e-9255-ec282359df25",
    "user_id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 2,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 20:22:08.093663"
  },
  {
    "id": "17fb4d37-c0d1-44dd-a2e5-ed74d47e6a51",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "32289a36-6b04-4fd5-81a9-820f70ad1de8",
      "taskCode": "COMMON-T003",
      "taskTitle": "Strategy & Positioning (BMC)",
      "daysOverdue": 2,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-26 20:22:09.038488"
  },
  {
    "id": "d5ef69a0-e875-45d3-9a80-63de4c36de6a",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 03:36:07.876744"
  },
  {
    "id": "0b67d421-cec5-4e90-a361-06f28fa2b25c",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 03:36:08.052748"
  },
  {
    "id": "e3c4c999-4ae7-4bd8-bd0f-e4caf7bb907a",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "3730d320-4cf0-4af6-bacd-ee8dce518d0f",
      "taskCode": "CAG-I10-EP05-T005",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:17:03.118249"
  },
  {
    "id": "0448d4d5-6fb2-4225-ba9b-fafb3666c6f6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMPLETED",
    "payload": {
      "title": "Task Approved & Completed: [COMMON-T008]",
      "taskId": "4c0e2581-7463-4bf5-8866-54cbcb927f3e",
      "message": "Your deliverable for task [COMMON-T008] \"Email update for IMD\" has been signed off and marked Done!",
      "taskCode": "COMMON-T008",
      "taskTitle": "Email update for IMD"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 10:51:53.959805"
  },
  {
    "id": "14fb6728-3b45-44fb-8343-ccc15d861d12",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T011] \"Update and submit SIA proposal to UP Setu Nigam\"",
      "tagged": true,
      "taskId": "4f6aa0a1-ab35-409a-af0d-435b23293671",
      "dueDate": "2026-10-11",
      "message": "You have been assigned to sprint task [COMMON-T011] \"Update and submit SIA proposal to UP Setu Nigam\". Target Due Date: 2026-10-11.",
      "taskCode": "COMMON-T011",
      "taskTitle": "Update and submit SIA proposal to UP Setu Nigam",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 10:58:10.545989"
  },
  {
    "id": "d30d5d86-957f-4ea6-892a-a3c305daeb32",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W2026] \"Update and submit SIA proposal to UP Setu Nigam\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W2026] \"Update and submit SIA proposal to UP Setu Nigam\" (2026-09-28).",
      "sprintId": "85a0cb18-0036-43d4-b525-cb32b083393d",
      "taskCode": "COM-ADM02-W2026",
      "taskTitle": "Update and submit SIA proposal to UP Setu Nigam",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W2026",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 10:58:11.808308"
  },
  {
    "id": "f9c278a3-af77-461c-926a-de09d97fc81f",
    "user_id": "1baf71db-ff33-47ea-9bf8-72a30398f567",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-T001] \"CRM demo\"",
      "tagged": true,
      "taskId": "9b63b82c-8c4d-4db9-9238-8c5753395be2",
      "dueDate": "2026-09-28",
      "message": "You have been assigned to sprint task [CAG-T001] \"CRM demo\". Target Due Date: 2026-09-28.",
      "taskCode": "CAG-T001",
      "taskTitle": "CRM demo",
      "assigneeId": "650517a8-f325-4586-ba41-04b4cdf883de",
      "assigneeName": "Prerna Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 11:32:37.144475"
  },
  {
    "id": "f1787a88-c2a4-4b99-8a66-c9121721a594",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:36.405218"
  },
  {
    "id": "459a79cb-6c04-4eab-9ec1-059e6f6eac29",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:36.834474"
  },
  {
    "id": "22fd668c-4a11-442d-b132-ff190e11ac28",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
      "taskCode": "EHM-I15-EP14-T003",
      "taskTitle": "Water Positive Agra proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:38.054636"
  },
  {
    "id": "3d1d99b7-b02b-4ed2-ab3f-60e9f1ce5640",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
      "taskCode": "EHM-I15-EP14-T003",
      "taskTitle": "Water Positive Agra proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:38.485202"
  },
  {
    "id": "129b60ac-83c1-480e-81e6-aa79f242bc82",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "daysOverdue": 23,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:39.414964"
  },
  {
    "id": "269589ff-df3f-456b-ac78-9bfe2ec8cf6b",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "daysOverdue": 23,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:39.904628"
  },
  {
    "id": "5d6b13f0-9d8e-419a-a89c-7fd24778c485",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "e736121b-0f62-46d8-b762-c719399fd6d3",
      "taskCode": "COMMON-T005",
      "taskTitle": "CSJMU Sustainability Proposal",
      "daysOverdue": 4,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:41.08464"
  },
  {
    "id": "278abb04-82c5-4a1c-9192-aaa7c4bd8bc6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
      "taskCode": "EHM-I15-EP14-T005",
      "taskTitle": "AI Training & Capacity Building proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:42.134708"
  },
  {
    "id": "6f9893c5-862d-4a34-9c92-a0e59d810a89",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
      "taskCode": "EHM-I15-EP14-T005",
      "taskTitle": "AI Training & Capacity Building proposal",
      "daysOverdue": 22,
      "assigneeName": "Utsav Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:42.485219"
  },
  {
    "id": "727d7d01-e125-4b87-a9c8-5cc3f4c70201",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "daysOverdue": 23,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:44.500006"
  },
  {
    "id": "06bbf276-76b3-40c1-845b-9c77cc912943",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "daysOverdue": 23,
      "assigneeName": "Pranshu Mohan"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:44.994694"
  },
  {
    "id": "0e467194-59d7-4170-9630-a878bceb8d39",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 5,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:47.45452"
  },
  {
    "id": "1a7e1121-27e8-4f85-84ef-240b4a8ebc78",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "daysOverdue": 5,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:01:47.814663"
  },
  {
    "id": "40dfe60e-3882-424d-8352-f20136e54861",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COMMON-T012] \"hiii testing \"",
      "tagged": true,
      "taskId": "49b58df3-b707-463d-88a5-cb0fc95d6088",
      "dueDate": "2026-10-04",
      "message": "You have been assigned to sprint task [COMMON-T012] \"hiii testing \". Target Due Date: 2026-10-04.",
      "taskCode": "COMMON-T012",
      "taskTitle": "hiii testing ",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:21:50.77023"
  },
  {
    "id": "a6d3b073-4255-4085-92b6-7f4ac6a472b9",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-E01-W1] \"hiii testing \"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-E01-W1] \"hiii testing \" (Week 1 (Days 1–7)).",
      "sprintId": "96eeaf5f-2588-405f-b2ca-3710e4c16697",
      "taskCode": "COM-E01-W1",
      "taskTitle": "hiii testing ",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "sprintCode": "COM-E01-W1",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 12:21:53.990377"
  },
  {
    "id": "df40f89e-5147-4f98-97c4-4287148c4f96",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_CHECKLIST_COMPLETE",
    "payload": {
      "title": "Checklist Completed: [CAG-I10-EP05-T002]",
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "message": "All checklist items have been checked off for task [CAG-I10-EP05-T002] \"Farmer onboarding & Demo\".",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo"
    },
    "read_at": "2026-09-27 16:46:26.915",
    "email_sent_at": null,
    "created_at": "2026-09-27 12:28:38.961733"
  },
  {
    "id": "28f85ea5-0eb5-4bcb-bc89-c2350d03a26f",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_CHECKLIST_COMPLETE",
    "payload": {
      "title": "Checklist Completed: [CAG-I10-EP05-T002]",
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "message": "All checklist items have been checked off for task [CAG-I10-EP05-T002] \"Farmer onboarding & Demo\".",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo"
    },
    "read_at": "2026-09-27 16:47:36.057",
    "email_sent_at": null,
    "created_at": "2026-09-27 12:28:34.560778"
  },
  {
    "id": "5344548f-101b-479e-9fb3-4d19e2ddeabb",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I18-EP16-T001]",
      "taskId": "b46f7d2d-b7d0-40c9-b4f2-5866893fc704",
      "message": "Harshit Mishra commented on task [CAG-I18-EP16-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I18-EP16-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:16:05.65563"
  },
  {
    "id": "3f9fa07b-0e23-4dfa-84b0-cdbe881f82ee",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [EHM-I15-EP14-T001]",
      "taskId": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
      "message": "Task [EHM-I15-EP14-T001] \"CityAdapt – Climate Resilient Agra proposal\" has deliverables ready for your manager review & sign-off.",
      "taskCode": "EHM-I15-EP14-T001",
      "taskTitle": "CityAdapt – Climate Resilient Agra proposal",
      "deliverableUrl": "https://executive-decks.pranshumohan.com/cityadapt-agra"
    },
    "read_at": "2026-09-27 16:46:15.26",
    "email_sent_at": null,
    "created_at": "2026-09-27 12:33:58.818783"
  },
  {
    "id": "651eaf9f-2240-4495-8401-7b48963b0a8c",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-E01-W1-T001] \"test hiii \"",
      "tagged": true,
      "taskId": "d9b72359-9993-4669-a8d2-f08d8a898fa0",
      "dueDate": "2026-10-04",
      "message": "You have been assigned to sprint task [COM-E01-W1-T001] \"test hiii \". Target Due Date: 2026-10-04.",
      "taskCode": "COM-E01-W1-T001",
      "taskTitle": "test hiii ",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 17:30:27.632534"
  },
  {
    "id": "29c4a1b7-c13c-4105-863e-4a5b3fdcedc2",
    "user_id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal",
      "daysOverdue": 22,
      "assigneeName": "Shreyansh Siladar"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 18:24:03.805567"
  },
  {
    "id": "a1c7e944-b1c5-4d32-839b-c3a13fac36b3",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I15-EP14-T004]",
      "taskId": "b0946eba-6598-4bca-9de2-60f8c1690307",
      "message": "Shreyansh Siladar commented on task [EHM-I15-EP14-T004]: \"E2E Verified Audit Comment posted by shreyanshsiladar@gmail.com on 2026-09-27T18\"",
      "taskCode": "EHM-I15-EP14-T004",
      "taskTitle": "Ecology, Biodiversity & Urban Forest proposal"
    },
    "read_at": "2026-09-27 18:24:34.883",
    "email_sent_at": null,
    "created_at": "2026-09-27 18:15:31.473156"
  },
  {
    "id": "0e657efc-42b5-4454-ab26-2b428dd137da",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "5d587b90-2c17-4759-bcf9-392b0aa58d23",
      "taskCode": "CAG-I10-EP05-T003",
      "taskTitle": "[CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 18:33:11.857967"
  },
  {
    "id": "e005b937-f727-482a-b01e-67b1f0d1dd70",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "5d587b90-2c17-4759-bcf9-392b0aa58d23",
      "taskCode": "CAG-I10-EP05-T003",
      "taskTitle": "[CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 18:33:12.247813"
  },
  {
    "id": "081ea0cd-04a2-457d-aa88-69faeff5a8aa",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "902d2dbd-e38e-4a57-9c05-ef2119617d8a",
      "taskCode": "CAG-I10-EP05-T004",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 18:33:16.392838"
  },
  {
    "id": "44e2b7b6-0064-457f-8d41-38ee0d42a45b",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "902d2dbd-e38e-4a57-9c05-ef2119617d8a",
      "taskCode": "CAG-I10-EP05-T004",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 18:33:16.818059"
  },
  {
    "id": "e2b6a9a0-1d60-4d30-8d8e-07bf0b93fce4",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I17-EP15-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "ac7160b7-3ea2-49e0-a093-f6a7a3ba495d",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I17-EP15-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I17-EP15-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:12:47.812609"
  },
  {
    "id": "0ebe4ec6-4175-4d24-865e-15672c1b13ed",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I16-EP16-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "adefa901-db6c-4e6e-8e9e-9ed6555d109a",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I16-EP16-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I16-EP16-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:12:50.382723"
  },
  {
    "id": "f82fecaf-469f-4c5e-aafe-2ef7948c2293",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I17-EP15-T001]",
      "taskId": "ac7160b7-3ea2-49e0-a093-f6a7a3ba495d",
      "message": "Harshit Mishra commented on task [CAG-I17-EP15-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I17-EP15-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:12:56.032848"
  },
  {
    "id": "67b6d175-fa5c-46b3-a181-ce747ff04ac4",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I17-EP15-T001]",
      "taskId": "ac7160b7-3ea2-49e0-a093-f6a7a3ba495d",
      "message": "Harshit Mishra commented on task [CAG-I17-EP15-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I17-EP15-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:13:02.242259"
  },
  {
    "id": "29b30d16-8738-436d-947a-39a197b01e32",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "bb522804-3384-4cdb-a251-0d805eca0bc0",
      "taskCode": "COM-ADM02-W1",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:13:02.422357"
  },
  {
    "id": "12491a99-3776-4335-bc4d-91deb5e7a57b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I17-EP15-T002] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "a4b5e8e2-3db6-459a-9db3-192165a5c28e",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [CAG-I17-EP15-T002] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "CAG-I17-EP15-T002",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:13:04.182612"
  },
  {
    "id": "8f1422a4-8f0a-42e4-94d7-b02a1489164b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I17-EP15-T002]",
      "taskId": "a4b5e8e2-3db6-459a-9db3-192165a5c28e",
      "message": "Harshit Mishra commented on task [CAG-I17-EP15-T002]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "CAG-I17-EP15-T002",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:13:08.337261"
  },
  {
    "id": "d65956eb-466b-47a3-b07a-ee2489ce60d9",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I16-EP16-T001]",
      "taskId": "adefa901-db6c-4e6e-8e9e-9ed6555d109a",
      "message": "You have been assigned to task [EHM-I16-EP16-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I16-EP16-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:13:09.652716"
  },
  {
    "id": "bf629cf7-14e9-4d45-9c49-52fb1fea7ba0",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I18-EP16-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "b46f7d2d-b7d0-40c9-b4f2-5866893fc704",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I18-EP16-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I18-EP16-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:15:57.440667"
  },
  {
    "id": "fcdf2661-fd84-40bf-af12-35ea67c9544d",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I17-EP17-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "2e894699-4799-4e5a-a70b-84b68f379713",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I17-EP17-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I17-EP17-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:16:00.030787"
  },
  {
    "id": "0dcbc3f8-3f39-429b-9e0d-b928214bb32f",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I18-EP16-T001]",
      "taskId": "b46f7d2d-b7d0-40c9-b4f2-5866893fc704",
      "message": "Harshit Mishra commented on task [CAG-I18-EP16-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I18-EP16-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:16:13.130671"
  },
  {
    "id": "20cd6220-6aee-4ed3-ab08-b1e318990fdb",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "0e09aea5-d416-40fa-8662-42a795ccc1fb",
      "taskCode": "CAG-I10-EP05-T006",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:17:08.73823"
  },
  {
    "id": "3dd98cc4-0ee5-4f8f-bfbf-6523a1fde562",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "0e09aea5-d416-40fa-8662-42a795ccc1fb",
      "taskCode": "CAG-I10-EP05-T006",
      "taskTitle": "[CLONE] [CLONE] Farmer onboarding & Demo",
      "daysOverdue": 1,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:17:09.128298"
  },
  {
    "id": "66817daa-5910-43fb-9fa5-4d2f6f7b30fb",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I19-EP17-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "8babf9f4-07c9-4a4d-9b49-9f52b756c28f",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I19-EP17-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I19-EP17-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:38.937791"
  },
  {
    "id": "c3f95bf5-85b6-4b6d-bb85-860033da3163",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I18-EP18-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "70850342-39c2-464c-894a-f53b2670a587",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I18-EP18-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I18-EP18-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:41.497325"
  },
  {
    "id": "ae06cad1-11dd-4370-bded-bf74e154ad20",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I19-EP17-T001]",
      "taskId": "8babf9f4-07c9-4a4d-9b49-9f52b756c28f",
      "message": "Harshit Mishra commented on task [CAG-I19-EP17-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I19-EP17-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:47.103141"
  },
  {
    "id": "469d612e-4b49-4ac6-b267-00622450a86d",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I19-EP17-T001]",
      "taskId": "8babf9f4-07c9-4a4d-9b49-9f52b756c28f",
      "message": "Harshit Mishra commented on task [CAG-I19-EP17-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I19-EP17-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:54.642148"
  },
  {
    "id": "29029fb4-3d0f-4ae3-ae4f-568006708793",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1-8] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1-8] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "5aec89c3-7c6f-4ee5-8617-044771261958",
      "taskCode": "COM-ADM02-W1-8",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1-8",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:54.841824"
  },
  {
    "id": "60c243bd-d3ec-411e-9931-af96282bd834",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-ADM02-W1-8-T001] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "bf4517a8-480b-4d43-a376-cefd59133a64",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-ADM02-W1-8-T001] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-ADM02-W1-8-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:18:56.95621"
  },
  {
    "id": "b554e460-d267-48cd-9d0a-680d2bc86d6b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COM-ADM02-W1-8-T001]",
      "taskId": "bf4517a8-480b-4d43-a376-cefd59133a64",
      "message": "Harshit Mishra commented on task [COM-ADM02-W1-8-T001]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "COM-ADM02-W1-8-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:19:01.46192"
  },
  {
    "id": "8fef2814-e55c-4f53-9e9d-d785a8a23b0e",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I18-EP18-T001]",
      "taskId": "70850342-39c2-464c-894a-f53b2670a587",
      "message": "Harshit Mishra commented on task [EHM-I18-EP18-T001]: \"Manager review notice: Please prioritize this gateway config.\"",
      "taskCode": "EHM-I18-EP18-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:19:04.469699"
  },
  {
    "id": "6c150f16-4823-4e79-a5cd-becdd0345956",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I18-EP18-T001]",
      "taskId": "70850342-39c2-464c-894a-f53b2670a587",
      "message": "You have been assigned to task [EHM-I18-EP18-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I18-EP18-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": "2026-09-27 19:19:04.389",
    "email_sent_at": null,
    "created_at": "2026-09-27 19:19:02.751927"
  },
  {
    "id": "a7f71dc3-2480-4701-b74b-0df3bc3dca18",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I20-EP18-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "421bf6b4-58dc-49dd-828d-a2a3149e2099",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I20-EP18-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I20-EP18-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:22.852412"
  },
  {
    "id": "e1196df4-1eb7-4a65-ae71-112f0faffdb2",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I19-EP19-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "d0d3193f-6c62-43b1-92b5-e78af2ce29d4",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I19-EP19-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I19-EP19-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:25.427027"
  },
  {
    "id": "6aa9189d-28f0-4dc7-8045-f24b77fa8edf",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I20-EP18-T001]",
      "taskId": "421bf6b4-58dc-49dd-828d-a2a3149e2099",
      "message": "Harshit Mishra commented on task [CAG-I20-EP18-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I20-EP18-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:30.992626"
  },
  {
    "id": "0d349e12-383f-4620-9837-0dab7109c87a",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I20-EP18-T001]",
      "taskId": "421bf6b4-58dc-49dd-828d-a2a3149e2099",
      "message": "Harshit Mishra commented on task [CAG-I20-EP18-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I20-EP18-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:38.29275"
  },
  {
    "id": "7017415c-17d9-4bf8-b627-15d42bcc4ea2",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1-9] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1-9] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "6807ebb1-cbfa-4190-8ec0-c0f366baa3d1",
      "taskCode": "COM-ADM02-W1-9",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1-9",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:38.452713"
  },
  {
    "id": "5ed58d37-f438-493a-a1f1-40258229d693",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I21-EP19-T001]",
      "taskId": "45608bc2-20c3-43bf-9573-25c39a2a1488",
      "message": "Harshit Mishra commented on task [CAG-I21-EP19-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I21-EP19-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:21.396151"
  },
  {
    "id": "833a1f71-4932-4bcf-a81c-0c52253bfcb7",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-ADM02-W1-9-T001] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "d22ba10b-3117-43b2-ba7e-2758d3d26a55",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-ADM02-W1-9-T001] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-ADM02-W1-9-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:40.392387"
  },
  {
    "id": "dcfcc360-3f04-4a76-80a7-714474796ae5",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COM-ADM02-W1-9-T001]",
      "taskId": "d22ba10b-3117-43b2-ba7e-2758d3d26a55",
      "message": "Harshit Mishra commented on task [COM-ADM02-W1-9-T001]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "COM-ADM02-W1-9-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:44.642571"
  },
  {
    "id": "7f03cf7f-5f89-4cc0-8306-3943afcea3c0",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I19-EP19-T001]",
      "taskId": "d0d3193f-6c62-43b1-92b5-e78af2ce29d4",
      "message": "You have been assigned to task [EHM-I19-EP19-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I19-EP19-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": "2026-09-27 19:20:47.509",
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:45.912778"
  },
  {
    "id": "4adde73b-d168-4a92-b351-81286aa7c61e",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I19-EP19-T001]",
      "taskId": "d0d3193f-6c62-43b1-92b5-e78af2ce29d4",
      "message": "Harshit Mishra commented on task [EHM-I19-EP19-T001]: \"Manager review notice: Please prioritize this gateway config.\"",
      "taskCode": "EHM-I19-EP19-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:20:47.612824"
  },
  {
    "id": "ca7cd79b-e01f-42c2-9c05-f01b8d4ed793",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I21-EP19-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "45608bc2-20c3-43bf-9573-25c39a2a1488",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I21-EP19-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I21-EP19-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:05.779132"
  },
  {
    "id": "e2c4c9e4-afb6-44fc-a91b-9c027e512ae8",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I20-EP20-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "713d0d7b-187d-4d2f-9aaa-830967f531a6",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I20-EP20-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I20-EP20-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:08.608473"
  },
  {
    "id": "c1e06882-08c2-4450-b8ce-c81c487ca05f",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I21-EP19-T001]",
      "taskId": "45608bc2-20c3-43bf-9573-25c39a2a1488",
      "message": "Harshit Mishra commented on task [CAG-I21-EP19-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I21-EP19-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:14.576135"
  },
  {
    "id": "f2bd3e0b-9a3d-4cb6-b024-db71d6556b4b",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I20-EP20-T001]",
      "taskId": "713d0d7b-187d-4d2f-9aaa-830967f531a6",
      "message": "Harshit Mishra commented on task [EHM-I20-EP20-T001]: \"Manager review notice: Please prioritize this gateway config.\"",
      "taskCode": "EHM-I20-EP20-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:31.921148"
  },
  {
    "id": "37efb352-9577-409a-9966-2615a9870f20",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I20-EP20-T001]",
      "taskId": "713d0d7b-187d-4d2f-9aaa-830967f531a6",
      "message": "You have been assigned to task [EHM-I20-EP20-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I20-EP20-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": "2026-09-27 19:22:31.849",
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:30.067558"
  },
  {
    "id": "ad3fe573-e3eb-4022-8f82-50283a416135",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I22-EP20-T001]",
      "taskId": "17b84f25-d80f-4c0a-b183-bcfb051a7f19",
      "message": "Harshit Mishra commented on task [CAG-I22-EP20-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I22-EP20-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:43.647615"
  },
  {
    "id": "f2a20eed-a31d-47b8-ba73-0bdf46bc3045",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I21-EP21-T001]",
      "taskId": "dc7bc742-01d3-40f8-997a-9e2082832175",
      "message": "Harshit Mishra commented on task [EHM-I21-EP21-T001]: \"Manager review notice: Please prioritize this gateway config.\"",
      "taskCode": "EHM-I21-EP21-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:25:02.439969"
  },
  {
    "id": "3cb5009d-d568-4b0b-b1b6-5d0cd075315a",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I21-EP21-T001]",
      "taskId": "dc7bc742-01d3-40f8-997a-9e2082832175",
      "message": "You have been assigned to task [EHM-I21-EP21-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I21-EP21-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": "2026-09-27 19:25:02.357",
    "email_sent_at": null,
    "created_at": "2026-09-27 19:25:00.707476"
  },
  {
    "id": "802fe861-1eb6-4dc8-98ba-c03a68f0bde1",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1-10] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1-10] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "72aa8897-ca94-4c7e-a0b7-3458e6f9f1c1",
      "taskCode": "COM-ADM02-W1-10",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1-10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:21.586065"
  },
  {
    "id": "2f37d260-d2c1-4e47-b921-f89abf245499",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-ADM02-W1-10-T001] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "0bf66e08-9188-48e5-aaa6-42e19bbb0fd9",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-ADM02-W1-10-T001] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-ADM02-W1-10-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:24.311231"
  },
  {
    "id": "9eb50977-ec6f-403c-9c22-36c420afb962",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COM-ADM02-W1-10-T001]",
      "taskId": "0bf66e08-9188-48e5-aaa6-42e19bbb0fd9",
      "message": "Harshit Mishra commented on task [COM-ADM02-W1-10-T001]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "COM-ADM02-W1-10-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:22:28.738179"
  },
  {
    "id": "588643a9-cb5d-42a6-a00b-ca2e9643b9e6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I22-EP20-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "17b84f25-d80f-4c0a-b183-bcfb051a7f19",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I22-EP20-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I22-EP20-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:35.067325"
  },
  {
    "id": "0e7f012a-3d7c-4745-b250-dc546ac83b3b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I21-EP21-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "dc7bc742-01d3-40f8-997a-9e2082832175",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I21-EP21-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I21-EP21-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:37.866983"
  },
  {
    "id": "78e540cd-f97b-4ae1-ae97-7760607cbc39",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I22-EP20-T001]",
      "taskId": "17b84f25-d80f-4c0a-b183-bcfb051a7f19",
      "message": "Harshit Mishra commented on task [CAG-I22-EP20-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I22-EP20-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:52.519514"
  },
  {
    "id": "acb0c5fd-6685-4d1b-97a1-eefbe5b4a8da",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1-11] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1-11] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "9dbe5964-2012-4276-95c2-993d30026f82",
      "taskCode": "COM-ADM02-W1-11",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1-11",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:52.687263"
  },
  {
    "id": "30ee591e-aee7-483c-9eef-e3a843b91582",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-ADM02-W1-11-T001] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "64ecaa43-d8e4-450f-a7d9-60e7f28bf948",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-ADM02-W1-11-T001] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-ADM02-W1-11-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:54.927328"
  },
  {
    "id": "3260d684-dfc6-4dca-a6df-053cd2b272c4",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COM-ADM02-W1-11-T001]",
      "taskId": "64ecaa43-d8e4-450f-a7d9-60e7f28bf948",
      "message": "Harshit Mishra commented on task [COM-ADM02-W1-11-T001]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "COM-ADM02-W1-11-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 19:24:59.441975"
  },
  {
    "id": "4df9c553-bd7f-46e0-852a-23543f829c4c",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [CAG-I23-EP21-T001] \"Deploy GPS Telemetry Gateway Daemon\"",
      "tagged": true,
      "taskId": "fb487540-eed0-4bea-9b51-be1e08963f31",
      "dueDate": "2026-10-15",
      "message": "You have been assigned to sprint task [CAG-I23-EP21-T001] \"Deploy GPS Telemetry Gateway Daemon\". Target Due Date: 2026-10-15.",
      "taskCode": "CAG-I23-EP21-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:27.782514"
  },
  {
    "id": "a9bcc607-b05d-4e08-a1d5-06b1cfe5bc11",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I22-EP22-T001] \"Configure Gateway JWT Ingress Rules\"",
      "tagged": true,
      "taskId": "6c8d9532-b679-4d45-8cd5-c575e5513f7c",
      "dueDate": "2026-10-20",
      "message": "You have been assigned to sprint task [EHM-I22-EP22-T001] \"Configure Gateway JWT Ingress Rules\". Target Due Date: 2026-10-20.",
      "taskCode": "EHM-I22-EP22-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:30.742288"
  },
  {
    "id": "4f28e489-7606-4bca-bdf3-3987f65178c0",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I23-EP21-T001]",
      "taskId": "fb487540-eed0-4bea-9b51-be1e08963f31",
      "message": "Harshit Mishra commented on task [CAG-I23-EP21-T001]: \"Initial telemetry verification completed in staging lab.\"",
      "taskCode": "CAG-I23-EP21-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:36.602273"
  },
  {
    "id": "28da6d49-0dc0-4c1e-82fb-b655f24cb562",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [CAG-I23-EP21-T001]",
      "taskId": "fb487540-eed0-4bea-9b51-be1e08963f31",
      "message": "Harshit Mishra commented on task [CAG-I23-EP21-T001]: \"Canary testing passed successfully. Zero packet drop over 12 hours.\"",
      "taskCode": "CAG-I23-EP21-T001",
      "taskTitle": "Deploy GPS Telemetry Gateway Daemon"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:42.992151"
  },
  {
    "id": "7ecfd417-6c05-4f31-b0b6-fa14c5d8e842",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-ADM02-W1] \"Sprint 42 — IoT Field Deployment\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-ADM02-W1] \"Sprint 42 — IoT Field Deployment\" (Week 1 (Days 1–7)).",
      "sprintId": "12fb2d78-8263-4804-9193-00413bec36c0",
      "taskCode": "COM-ADM02-W1",
      "taskTitle": "Sprint 42 — IoT Field Deployment",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "sprintCode": "COM-ADM02-W1",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:43.192138"
  },
  {
    "id": "1f92c87f-0afb-4753-a984-273dbb8d3a24",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-ADM02-W1-T001] \"Sprint 42 Edge Relay Validation\"",
      "tagged": true,
      "taskId": "cc49ef0e-7a0b-4dfa-918a-9cb6fb607ec5",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-ADM02-W1-T001] \"Sprint 42 Edge Relay Validation\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-ADM02-W1-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:45.282217"
  },
  {
    "id": "4224b407-8b4a-4fcb-bf9e-ecaec9216b6f",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COM-ADM02-W1-T001]",
      "taskId": "cc49ef0e-7a0b-4dfa-918a-9cb6fb607ec5",
      "message": "Harshit Mishra commented on task [COM-ADM02-W1-T001]: \"Sprint Task active on node cluster us-east-relay-01.\"",
      "taskCode": "COM-ADM02-W1-T001",
      "taskTitle": "Sprint 42 Edge Relay Validation"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:49.662258"
  },
  {
    "id": "8da47547-d28d-429d-b950-6dd174f9542b",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [EHM-I22-EP22-T001]",
      "taskId": "6c8d9532-b679-4d45-8cd5-c575e5513f7c",
      "message": "Harshit Mishra commented on task [EHM-I22-EP22-T001]: \"Manager review notice: Please prioritize this gateway config.\"",
      "taskCode": "EHM-I22-EP22-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:53.966272"
  },
  {
    "id": "0a1e5c72-423c-40f4-807c-ccef851f5a87",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "Task Reassigned: [EHM-I22-EP22-T001]",
      "taskId": "6c8d9532-b679-4d45-8cd5-c575e5513f7c",
      "message": "You have been assigned to task [EHM-I22-EP22-T001] \"Configure Gateway JWT Ingress Rules\".",
      "taskCode": "EHM-I22-EP22-T001",
      "taskTitle": "Configure Gateway JWT Ingress Rules"
    },
    "read_at": "2026-09-27 20:13:53.892",
    "email_sent_at": null,
    "created_at": "2026-09-27 20:13:51.042357"
  },
  {
    "id": "ec8e729c-46df-4574-9528-c685e77dc392",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 3,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:27:13.206854"
  },
  {
    "id": "4212ac40-a014-4828-a3ed-d2e4c3455f2e",
    "user_id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "336bafbf-5f38-445c-bd42-74add25a24bc",
      "taskCode": "COMMON-T002",
      "taskTitle": "Linkedin Lead Gen Form",
      "daysOverdue": 3,
      "assigneeName": "Neha Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:27:13.365766"
  },
  {
    "id": "611577e1-7968-4fa0-8e85-59bf545e407b",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "32289a36-6b04-4fd5-81a9-820f70ad1de8",
      "taskCode": "COMMON-T003",
      "taskTitle": "Strategy & Positioning (BMC)",
      "daysOverdue": 3,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:27:13.762243"
  },
  {
    "id": "c34aab5f-fa3b-474d-a9e7-c9b70a5fce4d",
    "user_id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [CAG-I10-EP05-T001]",
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "message": "Task [CAG-I10-EP05-T001] \"Creating Farmer platform & Testing\" has deliverables ready for your manager review & sign-off.",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing",
      "deliverableUrl": "https://github.com/climagro/farmer-platform/pull/101"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:34:10.117593"
  },
  {
    "id": "3300e6d9-a440-40b1-a064-cad79e6bba0a",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_COMPLETED",
    "payload": {
      "title": "Task Approved & Completed: [CAG-I10-EP05-T001]",
      "taskId": "55fba724-92f5-481e-96fe-e6d20f40de35",
      "message": "Your deliverable for task [CAG-I10-EP05-T001] \"Creating Farmer platform & Testing\" has been signed off and marked Done!",
      "taskCode": "CAG-I10-EP05-T001",
      "taskTitle": "Creating Farmer platform & Testing"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-27 20:34:13.302627"
  },
  {
    "id": "d9949427-eb72-4a7c-8220-120d52efdf40",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_COMMENT",
    "payload": {
      "title": "Task Comment: [COMMON-T005]",
      "taskId": "e736121b-0f62-46d8-b762-c719399fd6d3",
      "message": "Harshit Mishra commented on task [COMMON-T005]: \"Three pager Brief shared with Prof. Shilpa on 27th Sept\"",
      "taskCode": "COMMON-T005",
      "taskTitle": "CSJMU Sustainability Proposal"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 04:59:33.481699"
  },
  {
    "id": "bd0eeef4-ce50-4db7-96a8-6b0b693df550",
    "user_id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "type": "TASK_REVIEW_SUBMITTED",
    "payload": {
      "title": "Review Pending: [EHM-I15-EP14-T002]",
      "taskId": "fa515f38-3032-48c7-be25-30b6a6dd881d",
      "message": "Task [EHM-I15-EP14-T002] \"Integrated Waste Management proposal\" has deliverables ready for your manager review & sign-off.",
      "taskCode": "EHM-I15-EP14-T002",
      "taskTitle": "Integrated Waste Management proposal",
      "deliverableUrl": "https://agra-iwm.vercel.app/"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:00:59.800454"
  },
  {
    "id": "8b420617-606a-44e7-93c9-98fe579df918",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-I15-EP14-T006] \"Review Agra Presentation\"",
      "tagged": true,
      "taskId": "d0f03dd6-6825-40fb-a425-14264fd5e04c",
      "dueDate": "2026-09-28",
      "message": "You have been assigned to sprint task [EHM-I15-EP14-T006] \"Review Agra Presentation\". Target Due Date: 2026-09-28.",
      "taskCode": "EHM-I15-EP14-T006",
      "taskTitle": "Review Agra Presentation",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:04:18.06028"
  },
  {
    "id": "24452255-e6dd-4788-9f5a-354b73cb4517",
    "user_id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo",
      "daysOverdue": 2,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:12:19.911952"
  },
  {
    "id": "cf8088d2-ac46-41eb-ab25-72329f16b404",
    "user_id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "f062ec01-56e0-4157-9ed0-e93d42052672",
      "taskCode": "CAG-I10-EP05-T002",
      "taskTitle": "Farmer onboarding & Demo",
      "daysOverdue": 2,
      "assigneeName": "Ashutosh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:12:20.223339"
  },
  {
    "id": "50f97ca8-0e97-499f-baba-6334b19ce97f",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "d0f03dd6-6825-40fb-a425-14264fd5e04c",
      "taskCode": "EHM-I15-EP14-T006",
      "taskTitle": "Review Agra Presentation",
      "daysOverdue": 1,
      "assigneeName": "Harshit Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:12:21.834309"
  },
  {
    "id": "e8f0556f-f607-412c-84a7-b49f605f3611",
    "user_id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "9b63b82c-8c4d-4db9-9238-8c5753395be2",
      "taskCode": "CAG-T001",
      "taskTitle": "CRM demo",
      "daysOverdue": 1,
      "assigneeName": "Prerna Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:12:27.349694"
  },
  {
    "id": "128a5f62-be57-4227-9460-a3f025e86b6c",
    "user_id": "1baf71db-ff33-47ea-9bf8-72a30398f567",
    "type": "TASK_OVERDUE",
    "payload": {
      "taskId": "9b63b82c-8c4d-4db9-9238-8c5753395be2",
      "taskCode": "CAG-T001",
      "taskTitle": "CRM demo",
      "daysOverdue": 1,
      "assigneeName": "Prerna Shukla"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:12:27.662731"
  },
  {
    "id": "ceb1b761-6514-4494-8384-6a1c07ce06cb",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-T013] \"hii test 12\"",
      "tagged": true,
      "taskId": "e25569a0-4557-40ce-b935-c5e6d8181ce6",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [EHM-T013] \"hii test 12\". Target Due Date: 2026-10-05.",
      "taskCode": "EHM-T013",
      "taskTitle": "hii test 12",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:21:34.260487"
  },
  {
    "id": "07e7a370-64e4-411e-8a49-566f3b6463b3",
    "user_id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Assigned: [COM-E01-W1] \"hii test 12\"",
      "tagged": true,
      "message": "You have been assigned to a new personal sprint: [COM-E01-W1] \"hii test 12\" (Week 1 (Days 1–7)).",
      "sprintId": "c89aa35c-f11b-40c8-a6d2-aa7b071b8549",
      "taskCode": "COM-E01-W1",
      "taskTitle": "hii test 12",
      "assigneeId": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
      "sprintCode": "COM-E01-W1",
      "assigneeName": "tester"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:21:36.908892"
  },
  {
    "id": "2d25a3d3-9575-4a90-9001-e3d85ff291d7",
    "user_id": "e691cc1d-7eb1-44b6-a495-1f6713c6c319",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [EHM-T007] \"CSJMU Law department Project Updates \"",
      "tagged": true,
      "taskId": "14e82099-64c0-4d30-8fd0-464ac386e288",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [EHM-T007] \"CSJMU Law department Project Updates \". Target Due Date: 2026-10-05.",
      "taskCode": "EHM-T007",
      "taskTitle": "CSJMU Law department Project Updates ",
      "assigneeId": "5b817f5a-04bd-4118-9f73-48130750007d",
      "assigneeName": "Utkarsh Mishra"
    },
    "read_at": null,
    "email_sent_at": null,
    "created_at": "2026-09-28 05:54:27.516854"
  },
  {
    "id": "20b63637-7afd-416e-8663-4067026c86d6",
    "user_id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "type": "TASK_ASSIGNED",
    "payload": {
      "title": "New Sprint Task Assigned: [COM-E01-W1-T001] \"ClimIntellio Email Campaign for Track 2 (Institutions)\"",
      "tagged": true,
      "taskId": "43a693c1-4863-490b-bb36-b5fb8a033796",
      "dueDate": "2026-10-05",
      "message": "You have been assigned to sprint task [COM-E01-W1-T001] \"ClimIntellio Email Campaign for Track 2 (Institutions)\". Target Due Date: 2026-10-05.",
      "taskCode": "COM-E01-W1-T001",
      "taskTitle": "ClimIntellio Email Campaign for Track 2 (Institutions)",
      "assigneeId": "1e32f27a-d641-40ff-923c-05fef4836c10",
      "assigneeName": "Harshit Mishra"
    },
    "read_at": "2026-09-28 11:31:28.042",
    "email_sent_at": null,
    "created_at": "2026-09-28 05:59:23.522601"
  }
]
```

---

## 📋 Table: `password_reset_otps` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `projects` (13 records)

### Formatted View Preview

| id | code | name | entity | entity_name | category | lead | team |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5adb7203-7d4b-4c29-82ec-4e00501f0664 | PROJ0001 | Orion: Enterprise Platform & Brand Archite... | EHM | ehmconsultancy | Technology & Systems | Ashutosh Mishra | `["Ashutosh Mishra","Pranshu Dubey","Hars` |
| a14b094c-039c-4a2c-98b0-10e3b54ecafb | PROJ0002 | Zenith: Climate & IoT Sensor Telemetry Gat... | CAG | climagroanalytics | Environmental Compliance | Pranshu Dubey | `["Pranshu Dubey","Harshit Mishra","Eusta` |
| 7e54619a-714c-41a0-8994-fb6f9186a61a | PROJ0003 | Helios: Environmental Compliance & Audit E... | EHM | ehmconsultancy | Environmental Compliance | Harshit Mishra | `["Harshit Mishra","Ashutosh Mishra","Uts` |
| d01ea980-20ff-413b-b456-9d2e4f88e128 | PROJ0004 | TerraSense: Drone & Soil Moisture Remote S... | CAG | climagroanalytics | Environmental Compliance | Pranshu Dubey | `["Pranshu Dubey","Harshit Mishra","Utsav` |
| 01804bca-d768-4e11-9b30-71dc0ca2c54d | PROJ0005 | CM Grid - Phase 2 | EHM | ehmconsultancy | Sustainable Environmental Management | Harshit Mishra | `["Utsav Mishra","Neha Shukla","Harshit M` |
| 207f9332-5a60-4a54-b68b-316c42dcac12 | PROJ0006 | CSJMU STARC | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Ashutosh Mishra","Utsav Mishra","Neha ` |
| 55272287-06a0-42d6-9325-f972376dfc62 | PROJ0007 | ICCC O&M tender Vetting | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Harshit Mishra","Utsav Mishra","Utkars` |
| cdb5f960-b4a3-4fcc-8112-fb1af76e99eb | PROJ0008 | Laxmi taal DPR | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Utsav Mishra","Neha Shukla","Harshit M` |
| 471d3ca6-796f-4fbf-9069-79abbcb5d811 | PROJ0009 | JSCL Social Impact | EHM | ehmconsultancy | Environmental Compliance | Harshit Mishra | `["Priyanka Sharma","Utsav Mishra","Neha ` |
| 11c9d440-b38e-4577-aaad-f20bde107c1e | PROJ0010 | UEIPL Phase -1 | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Utsav Mishra","Neha Shukla"]` |
| 4c4d67de-5ada-4658-a711-c16c9dc5813f | PROJ0011 | UEIPL - Phase 2 | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Utsav Mishra","Neha Shukla"]` |
| 68e95c64-2088-4a90-a60c-c28346bfa234 | PROJ0012 | Afro Gulf - Congo Project | EHM | ehmconsultancy | Environmental Compliance | Utsav Mishra | `["Utsav Mishra","Neha Shukla"]` |
| 33c690a2-bbcc-4ef9-9469-883051220c66 | PROJ0013 | STP - Agra Foundary Nagar | EHM | ehmconsultancy | Urban Planning & Management | Harshit Mishra | `["Ashutosh Mishra","Neha Shukla","Harshi` |

### Complete Field Data & Records (`projects`)

```json
[
  {
    "id": "5adb7203-7d4b-4c29-82ec-4e00501f0664",
    "code": "PROJ0001",
    "name": "Orion: Enterprise Platform & Brand Architecture",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Technology & Systems",
    "lead": "Ashutosh Mishra",
    "team": [
      "Ashutosh Mishra",
      "Pranshu Dubey",
      "Harshit Mishra",
      "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d"
    ],
    "budget": "$50,000",
    "start_date": "2026-08-01",
    "target_date": "2026-11-30",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, PostgreSQL, TypeScript",
    "milestones_count": 4,
    "description": "End-to-end multi-tenant HR & operations operating system for enterprise client management.",
    "checkpoints": [
      {
        "id": "chk-1",
        "title": "System Architecture & Database Schema Design",
        "isCompleted": true
      },
      {
        "id": "chk-2",
        "title": "RBAC & Multi-Role Authentication Setup",
        "isCompleted": true
      },
      {
        "id": "chk-3",
        "title": "Real-time Project & Sprint Workflow Sync",
        "isCompleted": true
      },
      {
        "id": "chk-4",
        "title": "Final QA & Security Hardening",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcm-1",
        "content": "Database persistence and schema verification completed.",
        "createdAt": "2026-09-24T12:13:15.567Z",
        "authorName": "Ashutosh Mishra"
      }
    ],
    "created_at": "2026-09-24 12:13:17.036",
    "updated_at": "2026-09-24 12:13:17.036",
    "deliverable_url": ""
  },
  {
    "id": "a14b094c-039c-4a2c-98b0-10e3b54ecafb",
    "code": "PROJ0002",
    "name": "Zenith: Climate & IoT Sensor Telemetry Gateway",
    "entity": "CAG",
    "entity_name": "climagroanalytics",
    "category": "Environmental Compliance",
    "lead": "Pranshu Dubey",
    "team": [
      "Pranshu Dubey",
      "Harshit Mishra",
      "Eustace"
    ],
    "budget": "$42,000",
    "start_date": "2026-08-15",
    "target_date": "2026-12-20",
    "status": "Active",
    "priority": "High",
    "tech_stack": "Python, GIS, Fastify, Docker, TimescaleDB",
    "milestones_count": 4,
    "description": "Agricultural and environmental climate sensor ingestion pipeline with real-time analytics.",
    "checkpoints": [
      {
        "id": "chk-21",
        "title": "Sensor Hardware API Integration",
        "isCompleted": true
      },
      {
        "id": "chk-22",
        "title": "Geospatial Mapping & Ingestion Pipeline",
        "isCompleted": true
      },
      {
        "id": "chk-23",
        "title": "Anomaly Detection & Alert Rules",
        "isCompleted": false
      },
      {
        "id": "chk-24",
        "title": "Client Dashboard Reporting Delivery",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcm-2",
        "content": "Sensor gateway telemetry pipeline configured.",
        "createdAt": "2026-09-24T12:13:15.569Z",
        "authorName": "Pranshu Dubey"
      }
    ],
    "created_at": "2026-09-24 12:13:17.417",
    "updated_at": "2026-09-24 12:13:17.417",
    "deliverable_url": ""
  },
  {
    "id": "7e54619a-714c-41a0-8994-fb6f9186a61a",
    "code": "PROJ0003",
    "name": "Helios: Environmental Compliance & Audit Engine",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Harshit Mishra",
    "team": [
      "Harshit Mishra",
      "Ashutosh Mishra",
      "Utsav Mishra"
    ],
    "budget": "$35,000",
    "start_date": "2026-09-01",
    "target_date": "2026-12-31",
    "status": "Planning",
    "priority": "Medium",
    "tech_stack": "React, TailwindCSS, Express, PostgreSQL",
    "milestones_count": 4,
    "description": "Automated compliance auditing framework and reporting generator for statutory environmental requirements.",
    "checkpoints": [
      {
        "id": "chk-31",
        "title": "Statutory Requirement Matrix Review",
        "isCompleted": true
      },
      {
        "id": "chk-32",
        "title": "Automated Scorecard Engine Implementation",
        "isCompleted": false
      },
      {
        "id": "chk-33",
        "title": "Export PDF / CSV Audit Report Engine",
        "isCompleted": false
      },
      {
        "id": "chk-34",
        "title": "Pilot Client Trial & Feedback",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcm-3",
        "content": "Compliance checklist draft uploaded.",
        "createdAt": "2026-09-24T12:13:15.569Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-24 12:13:17.851",
    "updated_at": "2026-09-24 12:13:17.851",
    "deliverable_url": ""
  },
  {
    "id": "d01ea980-20ff-413b-b456-9d2e4f88e128",
    "code": "PROJ0004",
    "name": "TerraSense: Drone & Soil Moisture Remote Sensing",
    "entity": "CAG",
    "entity_name": "climagroanalytics",
    "category": "Environmental Compliance",
    "lead": "Pranshu Dubey",
    "team": [
      "Pranshu Dubey",
      "Harshit Mishra",
      "Utsav Mishra"
    ],
    "budget": "$48,000",
    "start_date": "2026-09-15",
    "target_date": "2026-11-20",
    "status": "Completed",
    "priority": "High",
    "tech_stack": "GeoPandas, Sentinel-2 Ingestion, QGIS, Node.js, Express",
    "milestones_count": 3,
    "description": "High-resolution multispectral imagery pipeline for precision crop hydration and carbon sequestration verification.",
    "checkpoints": [
      {
        "id": "chk-m2-1",
        "title": "Sentinel-2 Ingestion API Setup",
        "isCompleted": true
      },
      {
        "id": "chk-m2-2",
        "title": "NDVI & NDWI Calculation Algorithms",
        "isCompleted": true
      },
      {
        "id": "chk-m2-3",
        "title": "Field Calibration Ground Truthing",
        "isCompleted": true
      }
    ],
    "comments": [
      {
        "id": "pcm-m2-1",
        "content": "Calibrated reflectance index against field IoT sensor data.",
        "createdAt": "2026-09-24T16:34:45.607Z",
        "authorName": "Pranshu Dubey"
      }
    ],
    "created_at": "2026-09-24 16:34:45.607",
    "updated_at": "2026-09-24 17:11:43.961",
    "deliverable_url": ""
  },
  {
    "id": "01804bca-d768-4e11-9b30-71dc0ca2c54d",
    "code": "PROJ0005",
    "name": "CM Grid - Phase 2",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Sustainable Environmental Management",
    "lead": "Harshit Mishra",
    "team": [
      "Utsav Mishra",
      "Neha Shukla",
      "Harshit Mishra"
    ],
    "budget": "$45,000",
    "start_date": "2025-12-03",
    "target_date": "",
    "status": "Planning",
    "priority": "High",
    "tech_stack": "",
    "milestones_count": 4,
    "description": "",
    "checkpoints": [
      {
        "id": "c-1790311303316-1",
        "title": "Requirement Spec Approval",
        "isCompleted": false
      },
      {
        "id": "c-1790311303316-2",
        "title": "Environment & Tech Stack Setup",
        "isCompleted": false
      },
      {
        "id": "c-1790311303316-3",
        "title": "Core Deliverables Implementation",
        "isCompleted": false
      },
      {
        "id": "c-1790311303316-4",
        "title": "QA & Final Project Delivery",
        "isCompleted": false
      }
    ],
    "comments": [],
    "created_at": "2026-09-25 04:41:43.479",
    "updated_at": "2026-09-25 05:40:34.33",
    "deliverable_url": ""
  },
  {
    "id": "207f9332-5a60-4a54-b68b-316c42dcac12",
    "code": "PROJ0006",
    "name": "CSJMU STARC",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Ashutosh Mishra",
      "Utsav Mishra",
      "Neha Shukla",
      "Harshit Mishra",
      "Utkarsh Mishra",
      "Priyanka Sharma"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-01",
    "target_date": "2026-10-15",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 3,
    "description": "External- Abhishek, Vipin",
    "checkpoints": [
      {
        "id": "chk-1790416668085-f2kj",
        "title": "STARC 1.0",
        "isCompleted": false
      },
      {
        "id": "chk-1790416732334-5y60",
        "title": "Annual Report",
        "isCompleted": false
      },
      {
        "id": "chk-1790416783534-w0qv",
        "title": "Gaps, coverage, Initiate for NAAC, NIRF, THE, QS",
        "isCompleted": false
      }
    ],
    "comments": [],
    "created_at": "2026-09-26 10:03:16.614",
    "updated_at": "2026-09-26 10:05:20.043",
    "deliverable_url": ""
  },
  {
    "id": "55272287-06a0-42d6-9325-f972376dfc62",
    "code": "PROJ0007",
    "name": "ICCC O&M tender Vetting",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Harshit Mishra",
      "Utsav Mishra",
      "Utkarsh Mishra"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-01",
    "target_date": "2026-09-18",
    "status": "In Review",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 4,
    "description": "External - Prof. Abhilash",
    "checkpoints": [
      {
        "id": "c-1790417093825-1",
        "title": "Requirement Spec Approval",
        "isCompleted": false
      },
      {
        "id": "c-1790417093825-2",
        "title": "Environment & Tech Stack Setup",
        "isCompleted": false
      },
      {
        "id": "c-1790417093825-3",
        "title": "Core Deliverables Implementation",
        "isCompleted": false
      },
      {
        "id": "c-1790417093825-4",
        "title": "QA & Final Project Delivery",
        "isCompleted": false
      }
    ],
    "comments": [],
    "created_at": "2026-09-26 10:04:54.168",
    "updated_at": "2026-09-26 10:05:17.784",
    "deliverable_url": ""
  },
  {
    "id": "cdb5f960-b4a3-4fcc-8112-fb1af76e99eb",
    "code": "PROJ0008",
    "name": "Laxmi taal DPR",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Utsav Mishra",
      "Neha Shukla",
      "Harshit Mishra"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-01",
    "target_date": "2026-09-25",
    "status": "In Review",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 4,
    "description": "External -Prabjhot",
    "checkpoints": [
      {
        "id": "c-1790417178592-1",
        "title": "Requirement Spec Approval",
        "isCompleted": false
      },
      {
        "id": "c-1790417178592-2",
        "title": "Environment & Tech Stack Setup",
        "isCompleted": false
      },
      {
        "id": "c-1790417178592-3",
        "title": "Core Deliverables Implementation",
        "isCompleted": false
      },
      {
        "id": "c-1790417178592-4",
        "title": "QA & Final Project Delivery",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcmt-1790417110925",
        "content": "Payment Pending",
        "createdAt": "2026-09-26T10:05:10.925Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-26 10:06:18.971",
    "updated_at": "2026-09-26 10:06:42.546",
    "deliverable_url": ""
  },
  {
    "id": "471d3ca6-796f-4fbf-9069-79abbcb5d811",
    "code": "PROJ0009",
    "name": "JSCL Social Impact",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Harshit Mishra",
    "team": [
      "Priyanka Sharma",
      "Utsav Mishra",
      "Neha Shukla",
      "Harshit Mishra"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-01",
    "target_date": "2026-10-15",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 5,
    "description": "External - Yasashwini, APS, Jitendra",
    "checkpoints": [
      {
        "id": "chk-1790417402259-l743",
        "title": "Report from Jitendra",
        "isCompleted": false
      },
      {
        "id": "chk-1790417424008-1sd2",
        "title": "Finalize comments and report by Yasaswini",
        "isCompleted": false
      },
      {
        "id": "chk-1790417465423-s2h0",
        "title": "Report Design",
        "isCompleted": false
      },
      {
        "id": "chk-1790417473392-55g7",
        "title": "Review and Submission",
        "isCompleted": false
      },
      {
        "id": "chk-1790417482441-nf3v",
        "title": "Payment Followups",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcmt-1790417110925",
        "content": "Payment Pending",
        "createdAt": "2026-09-26T10:05:10.925Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-26 10:11:40.199",
    "updated_at": "2026-09-26 10:11:45.942",
    "deliverable_url": ""
  },
  {
    "id": "11c9d440-b38e-4577-aaad-f20bde107c1e",
    "code": "PROJ0010",
    "name": "UEIPL Phase -1",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Utsav Mishra",
      "Neha Shukla"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-01",
    "target_date": "2026-10-01",
    "status": "In Review",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 2,
    "description": "External - Ansuman",
    "checkpoints": [
      {
        "id": "chk-1790417665408-j4mt",
        "title": "Payment to experts",
        "isCompleted": false
      },
      {
        "id": "chk-1790417678425-s8h9",
        "title": "Completion Certificate",
        "isCompleted": false
      }
    ],
    "comments": [],
    "created_at": "2026-09-26 10:14:43.032",
    "updated_at": "2026-09-26 10:14:49.222",
    "deliverable_url": ""
  },
  {
    "id": "4c4d67de-5ada-4658-a711-c16c9dc5813f",
    "code": "PROJ0011",
    "name": "UEIPL - Phase 2",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Utsav Mishra",
      "Neha Shukla"
    ],
    "budget": "$45,000",
    "start_date": "2026-09-11",
    "target_date": "2026-10-01",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 4,
    "description": "External - Ujjwal",
    "checkpoints": [
      {
        "id": "chk-1790417775367-nkbd",
        "title": "Survey Completion",
        "isCompleted": false
      },
      {
        "id": "chk-1790417830241-v82f",
        "title": "Payment Followp",
        "isCompleted": false
      },
      {
        "id": "chk-1790417842050-csuq",
        "title": "Payment to experts and project closure",
        "isCompleted": false
      },
      {
        "id": "chk-1790417853391-7vvk",
        "title": "Completion Certificate",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcmt-1790417822208",
        "content": "Request for Relaxation due to Cyclone",
        "createdAt": "2026-09-26T10:17:02.208Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-26 10:18:28.758",
    "updated_at": "2026-09-26 10:18:34.111",
    "deliverable_url": ""
  },
  {
    "id": "68e95c64-2088-4a90-a60c-c28346bfa234",
    "code": "PROJ0012",
    "name": "Afro Gulf - Congo Project",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Environmental Compliance",
    "lead": "Utsav Mishra",
    "team": [
      "Utsav Mishra",
      "Neha Shukla"
    ],
    "budget": "$45,000",
    "start_date": "2026-08-07",
    "target_date": "2026-10-01",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 3,
    "description": "External- Hydrocanopy",
    "checkpoints": [
      {
        "id": "chk-1790418030219-enpe",
        "title": "Field visit",
        "isCompleted": false
      },
      {
        "id": "chk-1790418062321-kzif",
        "title": "Final Report & PPT",
        "isCompleted": false
      },
      {
        "id": "chk-1790418070219-ekt0",
        "title": "Remaining Payment",
        "isCompleted": false
      }
    ],
    "comments": [
      {
        "id": "pcmt-1790418047057",
        "content": "Work order to HydroCanopy",
        "createdAt": "2026-09-26T10:20:47.057Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-26 10:21:17.596",
    "updated_at": "2026-09-26 10:21:24.807",
    "deliverable_url": ""
  },
  {
    "id": "33c690a2-bbcc-4ef9-9469-883051220c66",
    "code": "PROJ0013",
    "name": "STP - Agra Foundary Nagar",
    "entity": "EHM",
    "entity_name": "ehmconsultancy",
    "category": "Urban Planning & Management",
    "lead": "Harshit Mishra",
    "team": [
      "Ashutosh Mishra",
      "Neha Shukla",
      "Harshit Mishra"
    ],
    "budget": "",
    "start_date": "2026-08-07",
    "target_date": "2026-10-01",
    "status": "Active",
    "priority": "High",
    "tech_stack": "React, Node.js, Python, GIS",
    "milestones_count": 0,
    "description": "External - Prabhjot",
    "checkpoints": [],
    "comments": [
      {
        "id": "pcmt-1790418199052",
        "content": "Share second invoice + EM cost with Client",
        "createdAt": "2026-09-26T10:23:19.052Z",
        "authorName": "Harshit Mishra"
      }
    ],
    "created_at": "2026-09-26 10:23:33.027",
    "updated_at": "2026-09-28 07:38:13.274",
    "deliverable_url": "React, Node.js, Python, GIS"
  }
]
```

---

## 📋 Table: `sprints` (3 records)

### Formatted View Preview

| id | entity_id | department_id | name | start_date | end_date | status | goal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 93107e05-c2e1-49a3-bac4-d9e1b0811ca6 | 539ba160-88b8-4fdd-a5ef-39c09c97516a | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 | HIVE Team Onboarding & Adoption | 2026-09-26 00:00:00 | 2026-10-10 00:00:00 | PLANNED | Onboard the team and start using HIVE for ... |
| 85a0cb18-0036-43d4-b525-cb32b083393d | 539ba160-88b8-4fdd-a5ef-39c09c97516a | c5180e07-fb28-422c-997c-d33a19211aca | Update and submit SIA proposal to UP Setu ... | 2026-09-27 00:00:00 | 2026-10-11 00:00:00 | PLANNED | Expernal- Yasahwini and Nikhil |
| c89aa35c-f11b-40c8-a6d2-aa7b071b8549 | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 | hii test 12 | 2026-09-28 05:21:38.693 | 2026-10-12 05:21:38.693 | PLANNED |  |

### Complete Field Data & Records (`sprints`)

```json
[
  {
    "id": "93107e05-c2e1-49a3-bac4-d9e1b0811ca6",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "name": "HIVE Team Onboarding & Adoption",
    "start_date": "2026-09-26 00:00:00",
    "end_date": "2026-10-10 00:00:00",
    "status": "PLANNED",
    "goal": "Onboard the team and start using HIVE for daily work and project tracking",
    "created_at": "2026-09-26 11:48:00.598142",
    "sprint_code": "SPRT0001",
    "employee_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "epic_id": null,
    "reviewing_lead_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "department": "Operations & Delivery",
    "target_week": "2026-09-28",
    "next_task_seq": 1
  },
  {
    "id": "85a0cb18-0036-43d4-b525-cb32b083393d",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "name": "Update and submit SIA proposal to UP Setu Nigam",
    "start_date": "2026-09-27 00:00:00",
    "end_date": "2026-10-11 00:00:00",
    "status": "PLANNED",
    "goal": "Expernal- Yasahwini and Nikhil",
    "created_at": "2026-09-27 10:58:11.808308",
    "sprint_code": "SPRT0002",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "epic_id": null,
    "reviewing_lead_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "department": "Sales",
    "target_week": "2026-09-28",
    "next_task_seq": 1
  },
  {
    "id": "c89aa35c-f11b-40c8-a6d2-aa7b071b8549",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "name": "hii test 12",
    "start_date": "2026-09-28 05:21:38.693",
    "end_date": "2026-10-12 05:21:38.693",
    "status": "PLANNED",
    "goal": "",
    "created_at": "2026-09-28 05:21:36.908892",
    "sprint_code": "SPRT0003",
    "employee_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "epic_id": null,
    "reviewing_lead_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "department": "Product & Tech",
    "target_week": "Week 1 (Days 1–7)",
    "next_task_seq": 2
  }
]
```

---

## 📋 Table: `task_checklists` (4 records)

### Formatted View Preview

| id | task_id | item_text | is_completed | completed_by | sort_order | completed_at | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cbad93f9-e19d-4191-be43-8ea5f1da60d7 | f062ec01-56e0-4157-9ed0-e93d42052672 | meeting done for the demo | true | c30c78d7-9398-4517-a54a-64005b90d555 | 0 | 2026-09-27 12:28:38.239 | 2026-09-27 12:28:28.617357 |
| fd6de1ee-1e47-4eae-9630-88b3854bae0c | f062ec01-56e0-4157-9ed0-e93d42052672 | doing the finalise changes and moving for ... | false | *null* | 1 | *null* | 2026-09-27 12:29:19.61226 |
| 300badfb-5e35-471f-9c15-9475261d6653 | f062ec01-56e0-4157-9ed0-e93d42052672 | Share the final application to the team | false | *null* | 2 | *null* | 2026-09-27 12:30:06.094285 |
| 1feb4192-b3e8-4d61-9280-995011084463 | f062ec01-56e0-4157-9ed0-e93d42052672 | Onboarded our first farmer | false | *null* | 3 | *null* | 2026-09-27 12:30:18.283576 |

### Complete Field Data & Records (`task_checklists`)

```json
[
  {
    "id": "cbad93f9-e19d-4191-be43-8ea5f1da60d7",
    "task_id": "f062ec01-56e0-4157-9ed0-e93d42052672",
    "item_text": "meeting done for the demo",
    "is_completed": true,
    "completed_by": "c30c78d7-9398-4517-a54a-64005b90d555",
    "sort_order": 0,
    "completed_at": "2026-09-27 12:28:38.239",
    "created_at": "2026-09-27 12:28:28.617357"
  },
  {
    "id": "fd6de1ee-1e47-4eae-9630-88b3854bae0c",
    "task_id": "f062ec01-56e0-4157-9ed0-e93d42052672",
    "item_text": "doing the finalise changes and moving for the final test",
    "is_completed": false,
    "completed_by": null,
    "sort_order": 1,
    "completed_at": null,
    "created_at": "2026-09-27 12:29:19.61226"
  },
  {
    "id": "300badfb-5e35-471f-9c15-9475261d6653",
    "task_id": "f062ec01-56e0-4157-9ed0-e93d42052672",
    "item_text": "Share the final application to the team",
    "is_completed": false,
    "completed_by": null,
    "sort_order": 2,
    "completed_at": null,
    "created_at": "2026-09-27 12:30:06.094285"
  },
  {
    "id": "1feb4192-b3e8-4d61-9280-995011084463",
    "task_id": "f062ec01-56e0-4157-9ed0-e93d42052672",
    "item_text": "Onboarded our first farmer",
    "is_completed": false,
    "completed_by": null,
    "sort_order": 3,
    "completed_at": null,
    "created_at": "2026-09-27 12:30:18.283576"
  }
]
```

---

## 📋 Table: `task_comments` (2 records)

### Formatted View Preview

| id | task_id | author_id | author_name | content | is_system_log | created_at |
| --- | --- | --- | --- | --- | --- | --- |
| f87ee04a-414b-47fe-91eb-9b141adae33a | e736121b-0f62-46d8-b762-c719399fd6d3 | 1e32f27a-d641-40ff-923c-05fef4836c10 | Harshit Mishra | Three pager Brief shared with Prof. Shilpa... | false | 2026-09-28 04:59:33.304528 |
| 614b2984-ad91-4571-9481-4e7bed200a10 | b0946eba-6598-4bca-9de2-60f8c1690307 | bb54d7bc-fbf4-42f9-be0a-2fc090260d7d | Shreyansh Siladar | E2E Verified Audit Comment posted by shrey... | false | 2026-09-27 18:15:31.102862 |

### Complete Field Data & Records (`task_comments`)

```json
[
  {
    "id": "f87ee04a-414b-47fe-91eb-9b141adae33a",
    "task_id": "e736121b-0f62-46d8-b762-c719399fd6d3",
    "author_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "author_name": "Harshit Mishra",
    "content": "Three pager Brief shared with Prof. Shilpa on 27th Sept",
    "is_system_log": false,
    "created_at": "2026-09-28 04:59:33.304528"
  },
  {
    "id": "614b2984-ad91-4571-9481-4e7bed200a10",
    "task_id": "b0946eba-6598-4bca-9de2-60f8c1690307",
    "author_id": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
    "author_name": "Shreyansh Siladar",
    "content": "E2E Verified Audit Comment posted by shreyanshsiladar@gmail.com on 2026-09-27T18:15:30.664Z - Task comments system verified.",
    "is_system_log": false,
    "created_at": "2026-09-27 18:15:31.102862"
  }
]
```

---

## 📋 Table: `task_notes` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `task_templates` (0 records)

*Table exists in database schema but currently contains 0 records.*

---

## 📋 Table: `tasks` (19 records)

### Formatted View Preview

| id | task_code | title | description | entity_id | department_id | sprint_week | sprint_id |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e25569a0-4557-40ce-b935-c5e6d8181ce6 | TASK0009 | hii test 12 |  | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 | Week 1 (Days 1–7) | *null* |
| fa515f38-3032-48c7-be25-30b6a6dd881d | TASK0004 | Integrated Waste Management proposal | The Waste management app is ready and is c... | 886d7680-6a7c-482e-ae61-159ec359f881 | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 4d5a6eea-30a5-474d-8716-d1d416f6ee37 | TASK0007 | AI Training & Capacity Building proposal |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 | Week 1 (Days 1–7) | *null* |
| 55fba724-92f5-481e-96fe-e6d20f40de35 | TASK0001 | Creating Farmer platform & Testing |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 | Week 1 (Days 1–7) | *null* |
| f062ec01-56e0-4157-9ed0-e93d42052672 | TASK0002 | Farmer onboarding & Demo |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 | Week 1 (Days 1–7) | *null* |
| 670e1b4e-655a-4a14-8aef-1d1036fe5abf | TASK0003 | CityAdapt – Climate Resilient Agra proposal | Executive deck for cityadapt-agra presenta... | ebbf77f7-c1ac-423d-a29d-8db50beac25f | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 7ed6ccfe-071f-48e0-afc4-211c3da98d11 | TASK0005 | Water Positive Agra proposal |  | 539ba160-88b8-4fdd-a5ef-39c09c97516a | 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 | *null* | *null* |
| b0946eba-6598-4bca-9de2-60f8c1690307 | TASK0006 | Ecology, Biodiversity & Urban Forest proposal |  | 539ba160-88b8-4fdd-a5ef-39c09c97516a | 9aa80de0-acf5-4a3c-9b1a-f4abf47d0442 | *null* | *null* |
| d0f03dd6-6825-40fb-a425-14264fd5e04c | TASK0008 | Review Agra Presentation | Will share this deck with Katayayni, | 539ba160-88b8-4fdd-a5ef-39c09c97516a | c5180e07-fb28-422c-997c-d33a19211aca | *null* | *null* |
| 43a693c1-4863-490b-bb36-b5fb8a033796 | STSK0001 | ClimIntellio Email Campaign for Track 2 (I... |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | c89aa35c-f11b-40c8-a6d2-aa7b071b8549 |
| 336bafbf-5f38-445c-bd42-74add25a24bc | BLOG0001 | Linkedin Lead Gen Form |  | 539ba160-88b8-4fdd-a5ef-39c09c97516a | e3cdb5e9-74df-45af-8655-9b40491bf1a0 | *null* | *null* |
| 32289a36-6b04-4fd5-81a9-820f70ad1de8 | BLOG0002 | Strategy & Positioning (BMC) |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 4afe15bf-342d-44a7-9c0f-84d8af4f998a | BLOG0003 | Genesis Application |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| e736121b-0f62-46d8-b762-c719399fd6d3 | BLOG0004 | CSJMU Sustainability Proposal | CSJMU Sustainability Proposal- team, fund,... | 886d7680-6a7c-482e-ae61-159ec359f881 | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 4c0e2581-7463-4bf5-8866-54cbcb927f3e | BLOG0005 | Email update for IMD |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 9196ea8a-bc16-4dff-a024-c9c265dbea0b | BLOG0006 | HIVE Team Onboarding & Adoption | Onboard the team and start using HIVE for ... | 886d7680-6a7c-482e-ae61-159ec359f881 | 1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4 | Week 1 (Days 1–7) | *null* |
| 4f6aa0a1-ab35-409a-af0d-435b23293671 | BLOG0007 | Update and submit SIA proposal to UP Setu ... | Expernal- Yasahwini and Nikhil | 886d7680-6a7c-482e-ae61-159ec359f881 | c5180e07-fb28-422c-997c-d33a19211aca | Week 1 (Days 1–7) | *null* |
| 9b63b82c-8c4d-4db9-9238-8c5753395be2 | BLOG0008 | CRM demo |  | ebbf77f7-c1ac-423d-a29d-8db50beac25f | e3cdb5e9-74df-45af-8655-9b40491bf1a0 | Week 1 (Days 1–7) | *null* |
| 14e82099-64c0-4d30-8fd0-464ac386e288 | BLOG0009 | CSJMU Law department Project Updates  | call needed for status update and plan the... | 886d7680-6a7c-482e-ae61-159ec359f881 | c5180e07-fb28-422c-997c-d33a19211aca | *null* | *null* |

### Complete Field Data & Records (`tasks`)

```json
[
  {
    "id": "e25569a0-4557-40ce-b935-c5e6d8181ce6",
    "task_code": "TASK0009",
    "title": "hii test 12",
    "description": "",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "6c199e80-9d32-481f-8bf6-5545190174db",
    "story_points": null,
    "assignee_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "creator_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "reviewing_lead_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "due_date": "2026-10-05 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-28 05:21:34.260487",
    "updated_at": "2026-09-28 11:00:01.762",
    "epic_id": "2171c90d-838a-43cb-8778-8e17965a4d3d",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "fa515f38-3032-48c7-be25-30b6a6dd881d",
    "task_code": "TASK0004",
    "title": "Integrated Waste Management proposal",
    "description": "The Waste management app is ready and is currently available at link https://agra-iwm.vercel.app/\nAlong with that it has the Programme Briefing Presentaion also ready to use and update.\nWaiting on feedback for further changes or enhancements\n\n",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "deliverable_url": "https://agra-iwm.vercel.app/",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-05 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:18:53.81003",
    "updated_at": "2026-09-28 11:26:17.005",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "4d5a6eea-30a5-474d-8716-d1d416f6ee37",
    "task_code": "TASK0007",
    "title": "AI Training & Capacity Building proposal",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-06 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:20:38.919526",
    "updated_at": "2026-09-28 11:29:37.393",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "55fba724-92f5-481e-96fe-e6d20f40de35",
    "task_code": "TASK0001",
    "title": "Creating Farmer platform & Testing",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "5a1a0972-fca8-4e26-b647-7a2317af914c",
    "story_points": null,
    "assignee_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-23 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-23 07:16:42.853618",
    "updated_at": "2026-09-27 20:34:14.633",
    "epic_id": "4c0dc5be-4780-4940-9877-81dfe0a7b3bf",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "f062ec01-56e0-4157-9ed0-e93d42052672",
    "task_code": "TASK0002",
    "title": "Farmer onboarding & Demo",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "5a1a0972-fca8-4e26-b647-7a2317af914c",
    "story_points": null,
    "assignee_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "62785b3e-f538-4618-a412-436f3c3408f1",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-27 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-23 09:21:09.431731",
    "updated_at": "2026-09-25 18:35:26.597",
    "epic_id": "4c0dc5be-4780-4940-9877-81dfe0a7b3bf",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "670e1b4e-655a-4a14-8aef-1d1036fe5abf",
    "task_code": "TASK0003",
    "title": "CityAdapt – Climate Resilient Agra proposal",
    "description": "Executive deck for cityadapt-agra presentation.\npasscode for the application is: climagro2026",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "https://executive-decks.pranshumohan.com/cityadapt-agra",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-05 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:18:05.127972",
    "updated_at": "2026-09-28 05:20:15.258",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "7ed6ccfe-071f-48e0-afc4-211c3da98d11",
    "task_code": "TASK0005",
    "title": "Water Positive Agra proposal",
    "description": "",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "sprint_week": null,
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": null,
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-06 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:19:38.309908",
    "updated_at": "2026-09-25 18:25:14.25",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "b0946eba-6598-4bca-9de2-60f8c1690307",
    "task_code": "TASK0006",
    "title": "Ecology, Biodiversity & Urban Forest proposal",
    "description": "",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "9aa80de0-acf5-4a3c-9b1a-f4abf47d0442",
    "sprint_week": null,
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": null,
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2026-09-06 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:20:07.729201",
    "updated_at": "2026-09-25 18:25:10.272",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "d0f03dd6-6825-40fb-a425-14264fd5e04c",
    "task_code": "TASK0008",
    "title": "Review Agra Presentation",
    "description": "Will share this deck with Katayayni,",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": null,
    "sprint_id": null,
    "initiative_id": "64a0686d-b229-4121-a1d7-349735182587",
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": null,
    "parent_task_id": null,
    "group_task_id": null,
    "status": "BACKLOG",
    "priority": "URGENT",
    "due_date": "2026-09-28 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-28 05:04:18.06028",
    "updated_at": "2026-09-28 05:04:18.06028",
    "epic_id": "1024d705-e908-4fbe-81e5-8d5fb8a38c46",
    "task_type": "EPIC_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "43a693c1-4863-490b-bb36-b5fb8a033796",
    "task_code": "STSK0001",
    "title": "ClimIntellio Email Campaign for Track 2 (Institutions)",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": "c89aa35c-f11b-40c8-a6d2-aa7b071b8549",
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": null,
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "BACKLOG",
    "priority": "HIGH",
    "due_date": "2026-10-05 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-28 05:59:23.522601",
    "updated_at": "2026-09-28 07:33:18.959",
    "epic_id": null,
    "task_type": "SPRINT_TASK",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "336bafbf-5f38-445c-bd42-74add25a24bc",
    "task_code": "BLOG0001",
    "title": "Linkedin Lead Gen Form",
    "description": "",
    "entity_id": "539ba160-88b8-4fdd-a5ef-39c09c97516a",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "sprint_week": null,
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": null,
    "parent_task_id": null,
    "group_task_id": null,
    "status": "BACKLOG",
    "priority": "HIGH",
    "due_date": "2026-09-25 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-23 18:13:02.408307",
    "updated_at": "2026-09-23 18:13:02.408307",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "32289a36-6b04-4fd5-81a9-820f70ad1de8",
    "task_code": "BLOG0002",
    "title": "Strategy & Positioning (BMC)",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "due_date": "2026-09-25 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-23 19:10:46.231158",
    "updated_at": "2026-09-25 18:36:56.876",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "4afe15bf-342d-44a7-9c0f-84d8af4f998a",
    "task_code": "BLOG0003",
    "title": "Genesis Application",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "DONE",
    "priority": "URGENT",
    "due_date": "2026-09-24 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-24 09:32:33.039811",
    "updated_at": "2026-09-28 05:19:42.534",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "e736121b-0f62-46d8-b762-c719399fd6d3",
    "task_code": "BLOG0004",
    "title": "CSJMU Sustainability Proposal",
    "description": "CSJMU Sustainability Proposal- team, fund, future plan.\nProduct purcharse list\nTraining Plan",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "due_date": "2026-09-24 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-24 09:38:25.022362",
    "updated_at": "2026-09-28 04:59:50.508",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "4c0e2581-7463-4bf5-8866-54cbcb927f3e",
    "task_code": "BLOG0005",
    "title": "Email update for IMD",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "DONE",
    "priority": "HIGH",
    "due_date": "2026-09-26 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-25 18:23:52.606861",
    "updated_at": "2026-09-28 05:00:04.037",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "9196ea8a-bc16-4dff-a024-c9c265dbea0b",
    "task_code": "BLOG0006",
    "title": "HIVE Team Onboarding & Adoption",
    "description": "Onboard the team and start using HIVE for daily work and project tracking",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "1ddbf7df-3c2d-4684-ae37-7ca971ed8cc4",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": "5371389d-05e1-47d4-aee8-ba436c8b9746",
    "status": "BACKLOG",
    "priority": "URGENT",
    "due_date": "2026-10-10 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-26 11:47:58.607617",
    "updated_at": "2026-09-26 12:02:43.679",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "4f6aa0a1-ab35-409a-af0d-435b23293671",
    "task_code": "BLOG0007",
    "title": "Update and submit SIA proposal to UP Setu Nigam",
    "description": "Expernal- Yasahwini and Nikhil",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "BACKLOG",
    "priority": "MEDIUM",
    "due_date": "2026-10-11 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-27 10:58:10.545989",
    "updated_at": "2026-09-28 03:31:09.249",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "9b63b82c-8c4d-4db9-9238-8c5753395be2",
    "task_code": "BLOG0008",
    "title": "CRM demo",
    "description": "",
    "entity_id": "ebbf77f7-c1ac-423d-a29d-8db50beac25f",
    "department_id": "e3cdb5e9-74df-45af-8655-9b40491bf1a0",
    "sprint_week": "Week 1 (Days 1–7)",
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "650517a8-f325-4586-ba41-04b4cdf883de",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "deliverable_url": "",
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "due_date": "2026-09-28 00:00:00",
    "dependency_task_id": null,
    "created_at": "2026-09-27 11:32:37.144475",
    "updated_at": "2026-09-28 07:33:44.845",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  },
  {
    "id": "14e82099-64c0-4d30-8fd0-464ac386e288",
    "task_code": "BLOG0009",
    "title": "CSJMU Law department Project Updates ",
    "description": "call needed for status update and plan the project exceution",
    "entity_id": "886d7680-6a7c-482e-ae61-159ec359f881",
    "department_id": "c5180e07-fb28-422c-997c-d33a19211aca",
    "sprint_week": null,
    "sprint_id": null,
    "initiative_id": null,
    "story_points": null,
    "assignee_id": "5b817f5a-04bd-4118-9f73-48130750007d",
    "creator_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "reviewing_lead_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "deliverable_url": null,
    "parent_task_id": null,
    "group_task_id": null,
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "due_date": "2026-10-05 05:54:27.908",
    "dependency_task_id": null,
    "created_at": "2026-09-28 05:54:27.516854",
    "updated_at": "2026-09-28 05:54:37.28",
    "epic_id": null,
    "task_type": "BACKLOG",
    "waiting_on": "None (Self)",
    "project_id": null
  }
]
```

---

## 📋 Table: `users` (14 records)

### Formatted View Preview

| id | email | password_hash | role | status | employee_id | managed_team_id | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3 | utsav@ehmconsultancy.co.in | $2a$10$qq5Lfelkpr.8PlwKnJuNQuzFbhkJZZ3LfN4... | ADMIN | ACTIVE | a9918b75-cba5-46e9-8bee-e9c536a331cc | *null* | 2026-09-21 20:29:18.331125 |
| fa0289e6-0109-4228-9f3d-f54b7164773c | harshit@ehmconsultancy.co.in | $2a$10$ZDb2V4MO3WjkMWGNsB68/OlReRo4wKA5D/a... | ADMIN | ACTIVE | 1e32f27a-d641-40ff-923c-05fef4836c10 | *null* | 2026-09-21 05:17:14.585565 |
| 6a82e692-0b48-441e-b26f-09dbfd6c0ca9 | dubey.pranshu@gmail.com | $2a$10$tYvVjc3ns708cWYjq2aEZeRr299D1qL.QUh... | ADMIN | ACTIVE | 67f526ba-afcf-4ec0-bf41-da1468bfb816 | *null* | 2026-09-22 07:29:57.540938 |
| cc923c23-5192-45b5-a282-7f0869cc5feb | jitendra@ehmconsultancy.co.in | $2a$10$iTONdDZpIufsy1T87rvVneicDQj5WWkB0VN... | ADMIN | PENDING | 62785b3e-f538-4618-a412-436f3c3408f1 | *null* | 2026-09-23 09:21:59.433128 |
| 6df0b051-0183-414d-96df-b32a19a24cf2 | ashutoshmishraup78@mpgi.edu.in | $2a$10$/EJQdVnvFCxsdYFmcYhoGeh8OD4jsg5fauo... | EMPLOYEE | ACTIVE | e6efb986-4f3d-40ac-bfe7-120fbd9d022d | *null* | 2026-09-23 05:22:17.887386 |
| 598469a9-7dd2-4ff6-8cfd-f3320ea94f46 | neha@ehmconsultancy.co.in | $2a$10$rl/HMRsCQI78YFgzEgBgZufAqjpHoxrdbaa... | ADMIN | ACTIVE | 2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e | *null* | 2026-09-23 06:42:52.086039 |
| e691cc1d-7eb1-44b6-a495-1f6713c6c319 | officialutkarshmishra01@gmail.com | $2a$10$qMbkiX/ZUHhIyWIIOTU7X.0.kP3.oBMCIUC... | EMPLOYEE | ACTIVE | 5b817f5a-04bd-4118-9f73-48130750007d | *null* | 2026-09-24 05:48:54.749932 |
| 64f41606-a849-4fa0-951d-978747036553 | tarul@ehmconsultancy.co.in | $2a$10$vpymETH2fqTzVYQpuFKo8O9LdoL2saYWfn7... | EMPLOYEE | PENDING | e80c26a6-0696-45e5-857f-540ff91058b3 | *null* | 2026-09-25 17:57:21.852555 |
| 1d52fca7-a69d-42c1-b798-f3b2104152e7 | neeraj@ehmconsultancy.co.in | $2a$10$JPsIkgvORGycVxV2FTtVx.11wUs77GDt/Ig... | EMPLOYEE | PENDING | 05197216-bf53-4a63-99ac-a9aa60174257 | *null* | 2026-09-25 17:58:03.043547 |
| c20f5e78-aa5b-49ea-9a01-f69f34d91fb7 | ashutoshmishraup78@gmail.com | $2a$10$LppiuZhvBlrh0uflqWDJw.oFl4rEyqOAVI3... | ADMIN | ACTIVE | c30c78d7-9398-4517-a54a-64005b90d555 | *null* | 2026-09-15 09:56:30.869592 |
| e65b4540-5f3b-407c-aa1e-e6fff984d9c3 | priyankasharma121202@gmail.com | $2a$10$CedlQcEEcEZsRhFJZIYLB.A04E3IOL.0nhj... | EMPLOYEE | ACTIVE | d3a231fa-5d33-4249-a17d-102765de4e09 | *null* | 2026-09-23 09:24:18.71322 |
| 1baf71db-ff33-47ea-9bf8-72a30398f567 | prernashukla566@gmail.com | $2a$10$zwAQICjggxTbtvv8s9UNuuI5yqgwqv5Djl8... | EMPLOYEE | ACTIVE | 650517a8-f325-4586-ba41-04b4cdf883de | *null* | 2026-09-23 09:23:05.899812 |
| 526b8f7f-697d-4401-b380-50b085403f3f | shreyanshsiladar@gmail.com | $2a$10$iy./jY9.QfmpfNT2Eui9JOA8SlEsf.1n5PI... | EMPLOYEE | ACTIVE | bb54d7bc-fbf4-42f9-be0a-2fc090260d7d | *null* | 2026-09-23 09:25:16.050851 |
| fbabfd51-893e-47da-8653-0f5cfdc3d1f3 | admin@example.com | $2a$10$XcauIg0r5HIPTTjHUT/BougQiFoEjvsL7G1... | ADMIN | ACTIVE | *null* | *null* | 2026-09-22 11:23:12.77719 |

### Complete Field Data & Records (`users`)

```json
[
  {
    "id": "2eb0a13a-3e35-4e1b-89a3-e01dc1ae49c3",
    "email": "utsav@ehmconsultancy.co.in",
    "password_hash": "$2a$10$qq5Lfelkpr.8PlwKnJuNQuzFbhkJZZ3LfN4YMSiwNdUIqo5JzPqRW",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": "a9918b75-cba5-46e9-8bee-e9c536a331cc",
    "managed_team_id": null,
    "created_at": "2026-09-21 20:29:18.331125",
    "updated_at": "2026-09-21 20:29:18.331125"
  },
  {
    "id": "fa0289e6-0109-4228-9f3d-f54b7164773c",
    "email": "harshit@ehmconsultancy.co.in",
    "password_hash": "$2a$10$ZDb2V4MO3WjkMWGNsB68/OlReRo4wKA5D/aoWc/Y78d13Ql3ce6zq",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": "1e32f27a-d641-40ff-923c-05fef4836c10",
    "managed_team_id": null,
    "created_at": "2026-09-21 05:17:14.585565",
    "updated_at": "2026-09-21 16:10:01.178"
  },
  {
    "id": "6a82e692-0b48-441e-b26f-09dbfd6c0ca9",
    "email": "dubey.pranshu@gmail.com",
    "password_hash": "$2a$10$tYvVjc3ns708cWYjq2aEZeRr299D1qL.QUhjbCcw/DYsSkYCKQuIy",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": "67f526ba-afcf-4ec0-bf41-da1468bfb816",
    "managed_team_id": null,
    "created_at": "2026-09-22 07:29:57.540938",
    "updated_at": "2026-09-22 07:29:57.540938"
  },
  {
    "id": "cc923c23-5192-45b5-a282-7f0869cc5feb",
    "email": "jitendra@ehmconsultancy.co.in",
    "password_hash": "$2a$10$iTONdDZpIufsy1T87rvVneicDQj5WWkB0VNNazC9BxYuR/Anxsila",
    "role": "ADMIN",
    "status": "PENDING",
    "employee_id": "62785b3e-f538-4618-a412-436f3c3408f1",
    "managed_team_id": null,
    "created_at": "2026-09-23 09:21:59.433128",
    "updated_at": "2026-09-23 09:21:59.433128"
  },
  {
    "id": "6df0b051-0183-414d-96df-b32a19a24cf2",
    "email": "ashutoshmishraup78@mpgi.edu.in",
    "password_hash": "$2a$10$/EJQdVnvFCxsdYFmcYhoGeh8OD4jsg5fauopX.dyKe/9OxgB3XNjK",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employee_id": "e6efb986-4f3d-40ac-bfe7-120fbd9d022d",
    "managed_team_id": null,
    "created_at": "2026-09-23 05:22:17.887386",
    "updated_at": "2026-09-23 05:22:17.887386"
  },
  {
    "id": "598469a9-7dd2-4ff6-8cfd-f3320ea94f46",
    "email": "neha@ehmconsultancy.co.in",
    "password_hash": "$2a$10$rl/HMRsCQI78YFgzEgBgZufAqjpHoxrdbaaHmlnTqtxtgtuHDvoR.",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": "2d18f81e-2ac7-40dd-9c1c-f93eedc77e0e",
    "managed_team_id": null,
    "created_at": "2026-09-23 06:42:52.086039",
    "updated_at": "2026-09-23 06:42:52.086039"
  },
  {
    "id": "e691cc1d-7eb1-44b6-a495-1f6713c6c319",
    "email": "officialutkarshmishra01@gmail.com",
    "password_hash": "$2a$10$qMbkiX/ZUHhIyWIIOTU7X.0.kP3.oBMCIUCtBIbMxT2R0KCYLU/bG",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employee_id": "5b817f5a-04bd-4118-9f73-48130750007d",
    "managed_team_id": null,
    "created_at": "2026-09-24 05:48:54.749932",
    "updated_at": "2026-09-24 05:48:54.749932"
  },
  {
    "id": "64f41606-a849-4fa0-951d-978747036553",
    "email": "tarul@ehmconsultancy.co.in",
    "password_hash": "$2a$10$vpymETH2fqTzVYQpuFKo8O9LdoL2saYWfn7raH1zjgGrAcTmNm7Yy",
    "role": "EMPLOYEE",
    "status": "PENDING",
    "employee_id": "e80c26a6-0696-45e5-857f-540ff91058b3",
    "managed_team_id": null,
    "created_at": "2026-09-25 17:57:21.852555",
    "updated_at": "2026-09-25 17:57:21.852555"
  },
  {
    "id": "1d52fca7-a69d-42c1-b798-f3b2104152e7",
    "email": "neeraj@ehmconsultancy.co.in",
    "password_hash": "$2a$10$JPsIkgvORGycVxV2FTtVx.11wUs77GDt/Ig2EnHNrY.n7O4NIYKYK",
    "role": "EMPLOYEE",
    "status": "PENDING",
    "employee_id": "05197216-bf53-4a63-99ac-a9aa60174257",
    "managed_team_id": null,
    "created_at": "2026-09-25 17:58:03.043547",
    "updated_at": "2026-09-25 17:58:03.043547"
  },
  {
    "id": "c20f5e78-aa5b-49ea-9a01-f69f34d91fb7",
    "email": "ashutoshmishraup78@gmail.com",
    "password_hash": "$2a$10$LppiuZhvBlrh0uflqWDJw.oFl4rEyqOAVI3GSljBq/V8i4C58KtYi",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": "c30c78d7-9398-4517-a54a-64005b90d555",
    "managed_team_id": null,
    "created_at": "2026-09-15 09:56:30.869592",
    "updated_at": "2026-09-15 09:56:30.869592"
  },
  {
    "id": "e65b4540-5f3b-407c-aa1e-e6fff984d9c3",
    "email": "priyankasharma121202@gmail.com",
    "password_hash": "$2a$10$CedlQcEEcEZsRhFJZIYLB.A04E3IOL.0nhjay4eA3YOicioVb4Kxm",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employee_id": "d3a231fa-5d33-4249-a17d-102765de4e09",
    "managed_team_id": null,
    "created_at": "2026-09-23 09:24:18.71322",
    "updated_at": "2026-09-23 09:24:18.71322"
  },
  {
    "id": "1baf71db-ff33-47ea-9bf8-72a30398f567",
    "email": "prernashukla566@gmail.com",
    "password_hash": "$2a$10$zwAQICjggxTbtvv8s9UNuuI5yqgwqv5Djl8xmLSB7mvcJBl3S1f6C",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employee_id": "650517a8-f325-4586-ba41-04b4cdf883de",
    "managed_team_id": null,
    "created_at": "2026-09-23 09:23:05.899812",
    "updated_at": "2026-09-23 09:23:05.899812"
  },
  {
    "id": "526b8f7f-697d-4401-b380-50b085403f3f",
    "email": "shreyanshsiladar@gmail.com",
    "password_hash": "$2a$10$iy./jY9.QfmpfNT2Eui9JOA8SlEsf.1n5PImvaDKogxKwtQjszKRG",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employee_id": "bb54d7bc-fbf4-42f9-be0a-2fc090260d7d",
    "managed_team_id": null,
    "created_at": "2026-09-23 09:25:16.050851",
    "updated_at": "2026-09-23 09:25:16.050851"
  },
  {
    "id": "fbabfd51-893e-47da-8653-0f5cfdc3d1f3",
    "email": "admin@example.com",
    "password_hash": "$2a$10$XcauIg0r5HIPTTjHUT/BougQiFoEjvsL7G12hk7TyI8ViyAhMOobq",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employee_id": null,
    "managed_team_id": null,
    "created_at": "2026-09-22 11:23:12.77719",
    "updated_at": "2026-09-22 11:23:12.77719"
  }
]
```

---

