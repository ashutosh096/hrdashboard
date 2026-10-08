import ExcelJS from 'exceljs';
import officecrypto from 'officecrypto-tool';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db, sql, desc, eq } from '@workspace/db';
import {
  employees,
  users,
  entities,
  departments,
  initiatives,
  epics,
  projects,
  sprints,
  tasks,
  taskChecklists,
  attendance,
  backupHistory,
} from '@workspace/db';

export interface VerificationResult {
  sheetName: string;
  expectedRows: number;
  actualRows: number;
  match: boolean;
  notes?: string;
}

export interface BackupExecutionResult {
  success: boolean;
  filename: string;
  filePath: string;
  masterFilename: string;
  masterFilePath: string;
  fileSizeBytes: number;
  buffer: Buffer;
  verificationTable: VerificationResult[];
  legacyCodesDetected: { table: string; code: string; titleOrName: string }[];
  errorMessage?: string;
}

// Regex for current code formats
const REGEX_INIT = /^INIT\d{4}$/i;
const REGEX_EPIC = /^EPIC\d{4}$/i;
const REGEX_TASK = /^(TASK|STSK|BLOG)\d{4}$/i;
const REGEX_SPRINT = /^SPRT\d{4}$/i;
const REGEX_PROJECT = /^PROJ\d{4}$/i;
const REGEX_EMPLOYEE = /^(ADMN|MANA|TEAM)\d{4}$/i;

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return 'N/A';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return String(d);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return 'N/A';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return String(d);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function applyHeaderStyle(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }];
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Segoe UI' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate-800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF059669' } }, // Emerald accent
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });
}

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value;
      let cellText = '';
      if (val && typeof val === 'object') {
        if ('text' in val) cellText = String(val.text);
        else cellText = JSON.stringify(val);
      } else {
        cellText = String(val ?? '');
      }
      const lines = cellText.split('\n');
      lines.forEach((l) => {
        if (l.length > maxLength) maxLength = l.length;
      });
    });
    column.width = Math.min(65, maxLength + 3);
  });
}

function styleDataRow(row: ExcelJS.Row, isLegacy = false) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 9.5 };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
    cell.alignment = { vertical: 'middle' };

    if (isLegacy) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }, // Amber warning background
      };
    }
  });
}

export async function generateEnterpriseBackup(triggerType: 'MANUAL' | 'CRON'): Promise<BackupExecutionResult> {
  const password = process.env.BACKUP_FILE_PASSWORD;
  if (!password) {
    throw new Error('BACKUP_FILE_PASSWORD environment variable is missing.');
  }

  // 1. Fetch live database data using read-only SELECTs
  const [
    dbEmployees,
    dbUsers,
    dbEntities,
    dbDepartments,
    dbInitiatives,
    dbEpics,
    dbProjects,
    dbSprints,
    dbTasks,
    dbChecklists,
    dbAttendance,
  ] = await Promise.all([
    db.select().from(employees),
    db.select().from(users),
    db.select().from(entities),
    db.select().from(departments),
    db.select().from(initiatives),
    db.select().from(epics),
    db.select().from(projects),
    db.select().from(sprints),
    db.select().from(tasks),
    db.select().from(taskChecklists),
    db.select().from(attendance),
  ]);

  // Lookup Maps
  const entityMap = new Map(dbEntities.map((e) => [e.id, e]));
  const deptMap = new Map(dbDepartments.map((d) => [d.id, d.name]));
  const employeeMap = new Map(dbEmployees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));
  const employeeObjMap = new Map(dbEmployees.map((e) => [e.id, e]));
  const userMap = new Map(dbUsers.map((u) => [u.employeeId || '', u.role]));
  const initMap = new Map(dbInitiatives.map((i) => [i.id, i.initiativeCode]));
  const epicMap = new Map(dbEpics.map((ep) => [ep.id, ep.epicCode]));
  const projMap = new Map(dbProjects.map((p) => [p.id, p.code]));

  // Checklist mapping for tasks
  const checklistsByTaskId = new Map<string, { itemText: string; isCompleted: boolean }[]>();
  dbChecklists.forEach((c) => {
    const list = checklistsByTaskId.get(c.taskId) || [];
    list.push({ itemText: c.itemText, isCompleted: c.isCompleted });
    checklistsByTaskId.set(c.taskId, list);
  });

  // Track legacy format codes
  const legacyCodesDetected: { table: string; code: string; titleOrName: string }[] = [];

  // Create Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HIVE Enterprise OS';
  workbook.created = new Date();

  // ----------------------------------------------------
  // SHEET 1: OVERVIEW & SUMMARY
  // ----------------------------------------------------
  const wsOverview = workbook.addWorksheet('Overview & Summary');
  wsOverview.columns = [
    { header: 'System Metric / Category', key: 'metric', width: 35 },
    { header: 'Details / Count', key: 'value', width: 45 },
  ];
  applyHeaderStyle(wsOverview);

  const timestampStr = formatDateTime(new Date());
  wsOverview.addRow({ metric: 'Backup Timestamp', value: timestampStr });
  wsOverview.addRow({ metric: 'Trigger Type', value: triggerType });
  wsOverview.addRow({ metric: 'Encryption Standard', value: 'OOXML Agile / Standard (AES-256)' });
  wsOverview.addRow({ metric: 'Storage Retention Policy', value: 'Live Master + Rolling 3-Snapshot Retention' });
  wsOverview.addRow({ metric: 'Total Team Members', value: dbEmployees.length });
  wsOverview.addRow({ metric: 'Total Initiatives', value: dbInitiatives.length });
  wsOverview.addRow({ metric: 'Total Epics', value: dbEpics.length });
  wsOverview.addRow({ metric: 'Total Projects', value: dbProjects.length });
  wsOverview.addRow({ metric: 'Total Sprints', value: dbSprints.length });
  wsOverview.addRow({ metric: 'Total Tasks', value: dbTasks.length });
  wsOverview.addRow({ metric: 'Total Attendance Records', value: dbAttendance.length });

  // Entity Breakdown
  const countCAG = dbEmployees.filter((e) => entityMap.get(e.entityId)?.code === 'CAG').length;
  const countEHM = dbEmployees.filter((e) => entityMap.get(e.entityId)?.code === 'EHM').length;
  wsOverview.addRow({ metric: 'Climagro (CAG) Team Count', value: countCAG });
  wsOverview.addRow({ metric: 'EHM Team Count', value: countEHM });

  wsOverview.eachRow((r, rowIdx) => {
    if (rowIdx > 1) styleDataRow(r);
  });

  // ----------------------------------------------------
  // SHEET 2: TEAM
  // ----------------------------------------------------
  const wsTeam = workbook.addWorksheet('Team');
  wsTeam.columns = [
    { header: 'Team Member Code', key: 'code' },
    { header: 'Full Name', key: 'name' },
    { header: 'System Role', key: 'role' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Designation', key: 'designation' },
    { header: 'Email Address', key: 'email' },
    { header: 'Team Member Status', key: 'status' },
    { header: 'Joining Date', key: 'joiningDate' },
    { header: 'Record Created', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsTeam);

  let teamRowsWritten = 0;
  const standardTeam: any[] = [];
  const legacyTeam: any[] = [];

  dbEmployees.forEach((emp) => {
    const isStandard = REGEX_EMPLOYEE.test(emp.employeeCode);
    const rawRole = (userMap.get(emp.id) || 'EMPLOYEE').toUpperCase();
    const displayRole = rawRole === 'EMPLOYEE' ? 'TEAM MEMBER' : rawRole;

    const rowData = {
      code: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`.trim(),
      role: displayRole,
      entity: entityMap.get(emp.entityId)?.code || 'EHM',
      department: deptMap.get(emp.departmentId) || 'Unassigned',
      designation: emp.designation,
      email: emp.email,
      status: emp.status,
      joiningDate: formatDate(emp.joiningDate),
      createdAt: formatDateTime(emp.createdAt),
      syncedAt: timestampStr,
    };
    if (isStandard) {
      standardTeam.push(rowData);
    } else {
      legacyTeam.push(rowData);
      legacyCodesDetected.push({ table: 'Employees', code: emp.employeeCode, titleOrName: rowData.name });
    }
  });

  standardTeam.forEach((d) => {
    const row = wsTeam.addRow(d);
    styleDataRow(row);
    teamRowsWritten++;
  });

  if (legacyTeam.length > 0) {
    const sep = wsTeam.addRow({ code: `⚠️ LEGACY CODES (${legacyTeam.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacyTeam.forEach((d) => {
      const row = wsTeam.addRow(d);
      styleDataRow(row, true);
      teamRowsWritten++;
    });
  }
  autoFitColumns(wsTeam);

  // ----------------------------------------------------
  // SHEET 3: INITIATIVES
  // ----------------------------------------------------
  const wsInit = workbook.addWorksheet('Initiatives');
  wsInit.columns = [
    { header: 'Initiative Code', key: 'code' },
    { header: 'Title', key: 'title' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Sub-Department / Track', key: 'subDept' },
    { header: 'Target Metric', key: 'metric' },
    { header: 'Target Month', key: 'month' },
    { header: 'Planned Epics Target', key: 'targetEpics' },
    { header: 'Status', key: 'status' },
    { header: 'Created By', key: 'createdByName' },
    { header: 'Created At', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsInit);

  let initRowsWritten = 0;
  const standardInit: any[] = [];
  const legacyInit: any[] = [];

  dbInitiatives.forEach((ini) => {
    const isStandard = REGEX_INIT.test(ini.initiativeCode);
    const rowData = {
      code: ini.initiativeCode,
      title: ini.title,
      entity: entityMap.get(ini.entityId)?.code || 'EHM',
      department: ini.departmentId ? deptMap.get(ini.departmentId) || '' : '',
      subDept: ini.subDepartment || '',
      metric: ini.targetDeliverableMetric || '',
      month: ini.targetMonth || formatDate(ini.targetDate),
      targetEpics: ini.epicsCountTarget || 0,
      status: ini.status,
      createdByName: ini.createdByName || employeeMap.get(ini.createdById || '') || 'System',
      createdAt: formatDateTime(ini.createdAt),
      syncedAt: timestampStr,
    };
    if (isStandard) {
      standardInit.push(rowData);
    } else {
      legacyInit.push(rowData);
      legacyCodesDetected.push({ table: 'Initiatives', code: ini.initiativeCode, titleOrName: ini.title });
    }
  });

  standardInit.forEach((d) => {
    const row = wsInit.addRow(d);
    styleDataRow(row);
    initRowsWritten++;
  });

  if (legacyInit.length > 0) {
    const sep = wsInit.addRow({ code: `⚠️ LEGACY CODES (${legacyInit.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacyInit.forEach((d) => {
      const row = wsInit.addRow(d);
      styleDataRow(row, true);
      initRowsWritten++;
    });
  }
  autoFitColumns(wsInit);

  // ----------------------------------------------------
  // SHEET 4: EPICS
  // ----------------------------------------------------
  const wsEpics = workbook.addWorksheet('Epics');
  wsEpics.columns = [
    { header: 'Epic Code', key: 'code' },
    { header: 'Title', key: 'title' },
    { header: 'Parent Initiative', key: 'initiative' },
    { header: 'Parent Project', key: 'project' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Target Week / Date', key: 'targetWeek' },
    { header: 'Planned Sprints Target', key: 'targetSprints' },
    { header: 'Assigned Leads', key: 'assignedTo' },
    { header: 'Status', key: 'status' },
    { header: 'Created By', key: 'createdByName' },
    { header: 'Created At', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsEpics);

  let epicRowsWritten = 0;
  const standardEpics: any[] = [];
  const legacyEpics: any[] = [];

  dbEpics.forEach((ep) => {
    const isStandard = REGEX_EPIC.test(ep.epicCode);
    let assignedNames = '';
    if (ep.assignedTo) {
      try {
        const parsed = JSON.parse(ep.assignedTo);
        assignedNames = Array.isArray(parsed) ? parsed.join(', ') : ep.assignedTo;
      } catch {
        assignedNames = ep.assignedTo;
      }
    }

    const rowData = {
      code: ep.epicCode,
      title: ep.title,
      initiative: ep.initiativeId ? initMap.get(ep.initiativeId) || '' : '',
      project: ep.projectId ? projMap.get(ep.projectId) || '' : '',
      entity: entityMap.get(ep.entityId)?.code || 'EHM',
      department: ep.department || '',
      targetWeek: ep.targetWeek || formatDate(ep.targetDate),
      targetSprints: ep.sprintsCountTarget || 0,
      assignedTo: assignedNames,
      status: ep.status,
      createdByName: ep.createdByName || employeeMap.get(ep.createdById || '') || 'System',
      createdAt: formatDateTime(ep.createdAt),
      syncedAt: timestampStr,
    };

    if (isStandard) {
      standardEpics.push(rowData);
    } else {
      legacyEpics.push(rowData);
      legacyCodesDetected.push({ table: 'Epics', code: ep.epicCode, titleOrName: ep.title });
    }
  });

  standardEpics.forEach((d) => {
    const row = wsEpics.addRow(d);
    styleDataRow(row);
    epicRowsWritten++;
  });

  if (legacyEpics.length > 0) {
    const sep = wsEpics.addRow({ code: `⚠️ LEGACY CODES (${legacyEpics.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacyEpics.forEach((d) => {
      const row = wsEpics.addRow(d);
      styleDataRow(row, true);
      epicRowsWritten++;
    });
  }
  autoFitColumns(wsEpics);

  // ----------------------------------------------------
  // SHEET 5: PROJECTS
  // ----------------------------------------------------
  const wsProjects = workbook.addWorksheet('Projects');
  wsProjects.columns = [
    { header: 'Project Code', key: 'code' },
    { header: 'Title / Name', key: 'name' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Category', key: 'category' },
    { header: 'Priority', key: 'priority' },
    { header: 'Reviewing Lead', key: 'lead' },
    { header: 'Team Members', key: 'team' },
    { header: 'Start Date', key: 'startDate' },
    { header: 'Target Date', key: 'targetDate' },
    { header: 'Lifecycle Status', key: 'status' },
    { header: 'Deliverable Objective', key: 'description' },
    { header: 'Created By', key: 'createdByName' },
    { header: 'Created At', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsProjects);

  let projRowsWritten = 0;
  const standardProjects: any[] = [];
  const legacyProjects: any[] = [];

  dbProjects.forEach((p) => {
    const isStandard = REGEX_PROJECT.test(p.code);
    const teamMembers = Array.isArray(p.team) ? p.team.join(', ') : '';
    const rowData = {
      code: p.code,
      name: p.name,
      entity: p.entity,
      category: p.category,
      priority: p.priority,
      lead: p.lead || '',
      team: teamMembers,
      startDate: p.startDate || '',
      targetDate: p.targetDate || '',
      status: p.status,
      description: p.description || '',
      createdByName: p.createdByName || employeeMap.get(p.createdById || '') || 'System',
      createdAt: formatDateTime(p.createdAt),
      syncedAt: timestampStr,
    };

    if (isStandard) {
      standardProjects.push(rowData);
    } else {
      legacyProjects.push(rowData);
      legacyCodesDetected.push({ table: 'Projects', code: p.code, titleOrName: p.name });
    }
  });

  standardProjects.forEach((d) => {
    const row = wsProjects.addRow(d);
    styleDataRow(row);
    projRowsWritten++;
  });

  if (legacyProjects.length > 0) {
    const sep = wsProjects.addRow({ code: `⚠️ LEGACY CODES (${legacyProjects.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacyProjects.forEach((d) => {
      const row = wsProjects.addRow(d);
      styleDataRow(row, true);
      projRowsWritten++;
    });
  }
  autoFitColumns(wsProjects);

  // ----------------------------------------------------
  // SHEET 6: SPRINTS
  // ----------------------------------------------------
  const wsSprints = workbook.addWorksheet('Sprints');
  wsSprints.columns = [
    { header: 'Sprint Code', key: 'code' },
    { header: 'Sprint Name', key: 'name' },
    { header: 'Cycle / Week', key: 'targetWeek' },
    { header: 'Parent Epic', key: 'epic' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Owner Team Member', key: 'owner' },
    { header: 'Start Date', key: 'startDate' },
    { header: 'End Date', key: 'endDate' },
    { header: 'Status', key: 'status' },
    { header: 'Goal / Notes', key: 'goal' },
    { header: 'Created By', key: 'createdByName' },
    { header: 'Created At', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsSprints);

  let sprintRowsWritten = 0;
  const standardSprints: any[] = [];
  const legacySprints: any[] = [];

  dbSprints.forEach((sp) => {
    const isStandard = REGEX_SPRINT.test(sp.sprintCode);
    const rowData = {
      code: sp.sprintCode,
      name: sp.name,
      targetWeek: sp.targetWeek || '',
      epic: sp.epicId ? epicMap.get(sp.epicId) || '' : '',
      entity: entityMap.get(sp.entityId)?.code || 'EHM',
      department: sp.department || '',
      owner: employeeMap.get(sp.employeeId) || 'Unassigned',
      startDate: formatDate(sp.startDate),
      endDate: formatDate(sp.endDate),
      status: sp.status,
      goal: sp.goal || '',
      createdByName: sp.createdByName || employeeMap.get(sp.createdById || '') || 'System',
      createdAt: formatDateTime(sp.createdAt),
      syncedAt: timestampStr,
    };

    if (isStandard) {
      standardSprints.push(rowData);
    } else {
      legacySprints.push(rowData);
      legacyCodesDetected.push({ table: 'Sprints', code: sp.sprintCode, titleOrName: sp.name });
    }
  });

  standardSprints.forEach((d) => {
    const row = wsSprints.addRow(d);
    styleDataRow(row);
    sprintRowsWritten++;
  });

  if (legacySprints.length > 0) {
    const sep = wsSprints.addRow({ code: `⚠️ LEGACY CODES (${legacySprints.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacySprints.forEach((d) => {
      const row = wsSprints.addRow(d);
      styleDataRow(row, true);
      sprintRowsWritten++;
    });
  }
  autoFitColumns(wsSprints);

  // ----------------------------------------------------
  // SHEET 7: TASKS
  // ----------------------------------------------------
  const wsTasks = workbook.addWorksheet('Tasks');
  wsTasks.columns = [
    { header: 'Task Code', key: 'code' },
    { header: 'Task Title', key: 'title' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Parent Project', key: 'project' },
    { header: 'Parent Epic', key: 'epic' },
    { header: 'Priority', key: 'priority' },
    { header: 'Status', key: 'status' },
    { header: 'Assigned Members', key: 'assignees' },
    { header: 'Reviewing Leads', key: 'reviewers' },
    { header: 'Due Date', key: 'dueDate' },
    { header: 'Deliverable Link', key: 'deliverableLink' },
    { header: 'Subtask Checklist', key: 'checklist' },
    { header: 'Description / Notes', key: 'description' },
    { header: 'Created By', key: 'createdByName' },
    { header: 'Created At', key: 'createdAt' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsTasks);

  let taskRowsWritten = 0;
  const standardTasks: any[] = [];
  const legacyTasks: any[] = [];

  dbTasks.forEach((t) => {
    const isStandard = REGEX_TASK.test(t.taskCode);

    // Resolve assignees
    const aIds = (Array.isArray(t.assigneeIds) && t.assigneeIds.length > 0)
      ? t.assigneeIds
      : t.assigneeId ? [t.assigneeId] : [];
    const assigneeNames = aIds.map((id) => employeeMap.get(id) || id).join(', ') || 'Unassigned';

    // Resolve reviewers
    const rIds = (Array.isArray(t.reviewingLeadIds) && t.reviewingLeadIds.length > 0)
      ? t.reviewingLeadIds
      : t.reviewingLeadId ? [t.reviewingLeadId] : [];
    const reviewerNames = rIds.map((id) => employeeMap.get(id) || id).join(', ') || 'Unassigned';

    // Format checklist items (☑ Done, ☐ Pending)
    const checklists = checklistsByTaskId.get(t.id) || [];
    const checklistText = checklists.length > 0
      ? checklists.map((c) => `${c.isCompleted ? '☑' : '☐'} ${c.itemText}`).join('\n')
      : 'No subtasks';

    // Format deliverable links
    let firstDeliverableUrl = '';
    let firstDeliverableName = '';
    if (Array.isArray(t.deliverableLinks) && t.deliverableLinks.length > 0) {
      firstDeliverableUrl = t.deliverableLinks[0].url;
      firstDeliverableName = t.deliverableLinks[0].name || 'Deliverable';
    } else if (t.deliverableUrl) {
      firstDeliverableUrl = t.deliverableUrl.split(',')[0].trim();
      firstDeliverableName = 'Deliverable';
    }

    const rowData = {
      code: t.taskCode,
      title: t.title,
      entity: entityMap.get(t.entityId)?.code || 'EHM',
      department: deptMap.get(t.departmentId) || '',
      project: t.projectId ? projMap.get(t.projectId) || '' : '',
      epic: t.epicId ? epicMap.get(t.epicId) || '' : '',
      priority: t.priority,
      status: t.status,
      assignees: assigneeNames,
      reviewers: reviewerNames,
      dueDate: formatDate(t.dueDate),
      deliverableUrl: firstDeliverableUrl,
      deliverableName: firstDeliverableName,
      checklist: checklistText,
      description: t.description || '',
      createdByName: t.createdByName || employeeMap.get(t.creatorId) || 'System',
      createdAt: formatDateTime(t.createdAt),
      syncedAt: timestampStr,
    };

    if (isStandard) {
      standardTasks.push(rowData);
    } else {
      legacyTasks.push(rowData);
      legacyCodesDetected.push({ table: 'Tasks', code: t.taskCode, titleOrName: t.title });
    }
  });

  standardTasks.forEach((d) => {
    const row = wsTasks.addRow({
      code: d.code,
      title: d.title,
      entity: d.entity,
      department: d.department,
      project: d.project,
      epic: d.epic,
      priority: d.priority,
      status: d.status,
      assignees: d.assignees,
      reviewers: d.reviewers,
      dueDate: d.dueDate,
      deliverableLink: d.deliverableUrl ? { text: `${d.deliverableName}: ${d.deliverableUrl}`, hyperlink: d.deliverableUrl } : '',
      checklist: d.checklist,
      description: d.description,
      createdByName: d.createdByName,
      createdAt: d.createdAt,
      syncedAt: d.syncedAt,
    });
    styleDataRow(row);
    if (d.checklist && d.checklist.includes('\n')) {
      const cell = row.getCell('checklist');
      cell.alignment = { wrapText: true, vertical: 'top' };
    }
    taskRowsWritten++;
  });

  if (legacyTasks.length > 0) {
    const sep = wsTasks.addRow({ code: `⚠️ LEGACY CODES (${legacyTasks.length} Records)` });
    sep.font = { bold: true, color: { argb: 'FF92400E' } };
    legacyTasks.forEach((d) => {
      const row = wsTasks.addRow({
        code: d.code,
        title: d.title,
        entity: d.entity,
        department: d.department,
        project: d.project,
        epic: d.epic,
        priority: d.priority,
        status: d.status,
        assignees: d.assignees,
        reviewers: d.reviewers,
        dueDate: d.dueDate,
        deliverableLink: d.deliverableUrl ? { text: `${d.deliverableName}: ${d.deliverableUrl}`, hyperlink: d.deliverableUrl } : '',
        checklist: d.checklist,
        description: d.description,
        createdByName: d.createdByName,
        createdAt: d.createdAt,
        syncedAt: d.syncedAt,
      });
      styleDataRow(row, true);
      taskRowsWritten++;
    });
  }
  autoFitColumns(wsTasks);

  // ----------------------------------------------------
  // SHEET 8: ATTENDANCE
  // ----------------------------------------------------
  const wsAttend = workbook.addWorksheet('Attendance');
  wsAttend.columns = [
    { header: 'Record ID', key: 'id' },
    { header: 'Team Member Code', key: 'code' },
    { header: 'Team Member Name', key: 'name' },
    { header: 'Entity / Brand', key: 'entity' },
    { header: 'Department', key: 'department' },
    { header: 'Date', key: 'date' },
    { header: 'Work Mode', key: 'mode' },
    { header: 'Attendance Status', key: 'status' },
    { header: 'Clock In', key: 'clockIn' },
    { header: 'Clock Out', key: 'clockOut' },
    { header: 'Total Hours', key: 'hours' },
    { header: 'Last Synced / Updated At', key: 'syncedAt' },
  ];
  applyHeaderStyle(wsAttend);

  let attendRowsWritten = 0;
  dbAttendance.forEach((att) => {
    const emp = employeeObjMap.get(att.employeeId);
    const row = wsAttend.addRow({
      id: att.id,
      code: emp?.employeeCode || 'N/A',
      name: emp ? `${emp.firstName} ${emp.lastName}`.trim() : 'Unknown',
      entity: emp ? entityMap.get(emp.entityId)?.code || 'EHM' : 'EHM',
      department: emp ? deptMap.get(emp.departmentId) || '' : '',
      date: formatDate(att.date),
      mode: att.workMode,
      status: att.status,
      clockIn: formatDateTime(att.clockIn),
      clockOut: att.clockOut ? formatDateTime(att.clockOut) : 'Active',
      hours: att.totalHours || '0.00',
      syncedAt: timestampStr,
    });
    styleDataRow(row);
    attendRowsWritten++;
  });
  autoFitColumns(wsAttend);

  // ----------------------------------------------------
  // STEP 5: LITERAL ROW COUNT PRE-VERIFICATION
  // ----------------------------------------------------
  const verificationTable: VerificationResult[] = [
    {
      sheetName: 'Team',
      expectedRows: dbEmployees.length,
      actualRows: teamRowsWritten,
      match: dbEmployees.length === teamRowsWritten,
    },
    {
      sheetName: 'Initiatives',
      expectedRows: dbInitiatives.length,
      actualRows: initRowsWritten,
      match: dbInitiatives.length === initRowsWritten,
    },
    {
      sheetName: 'Epics',
      expectedRows: dbEpics.length,
      actualRows: epicRowsWritten,
      match: dbEpics.length === epicRowsWritten,
    },
    {
      sheetName: 'Projects',
      expectedRows: dbProjects.length,
      actualRows: projRowsWritten,
      match: dbProjects.length === projRowsWritten,
    },
    {
      sheetName: 'Sprints',
      expectedRows: dbSprints.length,
      actualRows: sprintRowsWritten,
      match: dbSprints.length === sprintRowsWritten,
    },
    {
      sheetName: 'Tasks',
      expectedRows: dbTasks.length,
      actualRows: taskRowsWritten,
      match: dbTasks.length === taskRowsWritten,
    },
    {
      sheetName: 'Attendance',
      expectedRows: dbAttendance.length,
      actualRows: attendRowsWritten,
      match: dbAttendance.length === attendRowsWritten,
    },
  ];

  const hasMismatch = verificationTable.some((v) => !v.match);
  if (hasMismatch) {
    const errorMsg = `Integrity verification failure: Row counts do not match live table records! Details: ${JSON.stringify(verificationTable)}`;
    throw new Error(errorMsg);
  }

  // ----------------------------------------------------
  // STEP 3: WORKBOOK PASSWORD ENCRYPTION
  // ----------------------------------------------------
  const rawBuffer = await workbook.xlsx.writeBuffer();
  const encryptedBuffer = await officecrypto.encrypt(Buffer.from(rawBuffer), {
    password,
  });

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const filename = `HIVE_Enterprise_Backup_${yyyy}-${mm}-${dd}_${hh}-${min}.xlsx`;
  const masterFilename = 'HIVE_Enterprise_Master_Backup.xlsx';

  // Persistent backups directory
  const rootDir = process.cwd().endsWith('api-server') ? process.cwd() : path.resolve(process.cwd(), 'artifacts/api-server');
  const backupsDir = path.resolve(rootDir, 'backups');
  await fs.mkdir(backupsDir, { recursive: true });
  const filePath = path.join(backupsDir, filename);
  const masterFilePath = path.join(backupsDir, masterFilename);

  // 1. Write the versioned snapshot file
  await fs.writeFile(filePath, encryptedBuffer);

  // 2. Atomically update the single live master backup file
  const tempMasterPath = path.join(backupsDir, `master_temp_${Date.now()}.xlsx`);
  try {
    await fs.writeFile(tempMasterPath, encryptedBuffer);
    await fs.rename(tempMasterPath, masterFilePath).catch(async () => {
      await fs.writeFile(masterFilePath, encryptedBuffer);
    });
  } catch (err: any) {
    console.warn('[MASTER BACKUP UPDATE WARN]: Fallback direct write for master backup:', err?.message || err);
    await fs.writeFile(masterFilePath, encryptedBuffer);
  }

  // 3. Log to backup_history table (metadata audit only)
  try {
    await db.insert(backupHistory).values({
      filename,
      filePath,
      fileSizeBytes: encryptedBuffer.length,
      triggerType,
      status: 'SUCCESS',
      verificationResult: verificationTable,
    });

    // 4. ROLLING 3-BACKUP RETENTION ENFORCEMENT
    // Retain strictly the latest 3 historical snapshots to eliminate month-end clutter
    const allHistory = await db
      .select()
      .from(backupHistory)
      .orderBy(desc(backupHistory.createdAt));

    if (allHistory.length > 3) {
      const recordsToPrune = allHistory.slice(3);
      for (const oldRec of recordsToPrune) {
        try {
          await fs.unlink(oldRec.filePath).catch(() => {});
        } catch (err: any) {
          console.warn(`[BACKUP PRUNE WARN]: Could not delete file ${oldRec.filePath}:`, err?.message);
        }
        try {
          await db.delete(backupHistory).where(eq(backupHistory.id, oldRec.id));
        } catch (err: any) {
          console.warn(`[BACKUP PRUNE DB WARN]: Could not delete history record ${oldRec.id}:`, err?.message);
        }
      }
      console.log(`🧹 [BACKUP PRUNE] Cleaned up ${recordsToPrune.length} older backups. Exactly 3 snapshots retained.`);
    }

    // 5. Clean up any orphan unrecorded snapshot files in directory
    try {
      const retainedFilenames = new Set([
        masterFilename,
        ...allHistory.slice(0, 3).map((r) => r.filename),
        filename,
      ]);
      const dirFiles = await fs.readdir(backupsDir);
      for (const file of dirFiles) {
        if (file.endsWith('.xlsx') && !retainedFilenames.has(file)) {
          await fs.unlink(path.join(backupsDir, file)).catch(() => {});
          console.log(`🧹 [BACKUP PRUNE] Cleaned up orphan backup file on disk: ${file}`);
        }
      }
    } catch (cleanErr: any) {
      console.warn('[BACKUP PRUNE DISK SCAN WARN]:', cleanErr?.message || cleanErr);
    }
  } catch (err: any) {
    console.error('[BACKUP HISTORY LOG ERROR]:', err?.message || err);
  }

  return {
    success: true,
    filename,
    filePath,
    masterFilename,
    masterFilePath,
    fileSizeBytes: encryptedBuffer.length,
    buffer: Buffer.from(encryptedBuffer),
    verificationTable,
    legacyCodesDetected,
  };
}
