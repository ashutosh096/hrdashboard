import { db } from '../../../lib/db/src/index';
import { sql } from 'drizzle-orm';

async function run() {
  const entitiesRes = await db.execute(sql`SELECT * FROM entities`);
  const entities: any[] = entitiesRes.rows;
  const entityMap = new Map(entities.map(e => [e.id, e]));

  const tasksRes = await db.execute(sql`SELECT * FROM tasks ORDER BY task_code ASC`);
  const tasks: any[] = tasksRes.rows;

  const epicsRes = await db.execute(sql`SELECT * FROM epics`);
  const epics: any[] = epicsRes.rows;
  const epicMap = new Map(epics.map(e => [e.id, e]));

  console.log(`Loaded ${tasks.length} tasks and ${entities.length} entities.`);

  // --- Pre-Step-1 (HEAD commit 06477e4) Backend enrichTasks ---
  function enrichOld(t: any) {
    const entity = entityMap.get(t.entity_id);
    return {
      entity: entity?.code === 'CAG'
        ? 'CLIMAGRO'
        : entity?.code === 'COMMON'
        ? 'COMMON'
        : entity?.code === 'EHM'
        ? 'EHM'
        : t.task_code?.startsWith('CAG')
        ? 'CLIMAGRO'
        : (t.task_code?.startsWith('COMMON') || t.task_code?.startsWith('COM-'))
        ? 'COMMON'
        : 'EHM',
      entityCode: entity?.code || (t.task_code?.startsWith('CAG') ? 'CAG' : (t.task_code?.startsWith('COMMON') || t.task_code?.startsWith('COM-')) ? 'COMMON' : 'EHM'),
      entityName: entity?.name || (t.task_code?.startsWith('CAG') ? 'Climagro Analytics' : (t.task_code?.startsWith('COMMON') || t.task_code?.startsWith('COM-')) ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
    };
  }

  // --- Post-Step-1 (Current working tree) Backend enrichTasks ---
  function enrichNew(t: any) {
    const entity = entityMap.get(t.entity_id);
    return {
      entity: entity?.code === 'CAG'
        ? 'CLIMAGRO'
        : entity?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM',
      entityCode: entity?.code || 'EHM',
      entityName: entity?.name || (entity?.code === 'CAG' ? 'Climagro Analytics' : entity?.code === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
    };
  }

  // --- Pre-Step-1 entityUtils.getEntityBadge(item) ---
  function getEntityBadgeOld(item: any) {
    const rawEntity = (item.entity || item.entityCode || '').toUpperCase().trim();
    const rawEntityName = (item.entityName || '').toLowerCase().trim();
    const rawEntityId = (item.entityId || '').toLowerCase().trim();

    if (
      rawEntity === 'COMMON' ||
      rawEntity === 'BOTH' ||
      rawEntity === 'EHM & CLIMAGRO' ||
      rawEntity.includes('COMMON') ||
      rawEntity.includes('BOTH') ||
      rawEntityId === '539ba160-88b8-4fdd-a5ef-39c09c97516a' ||
      rawEntityId === 'common' ||
      rawEntityName.includes('common') ||
      rawEntityName.includes('&')
    ) {
      return { label: 'EHM & CLIMAGRO', isCAG: false, isCommon: true };
    }
    if (
      rawEntity === 'CAG' ||
      rawEntity === 'CLIMAGRO' ||
      rawEntityId === 'ebbf77f7-c1ac-423d-a29d-8db50beac25f' ||
      rawEntityId === 'cag' ||
      rawEntityId === 'climagroanalytics' ||
      rawEntityName.includes('climagro')
    ) {
      return { label: 'CLIMAGRO', isCAG: true, isCommon: false };
    }
    if (
      rawEntity === 'EHM' ||
      rawEntityId === '886d7680-6a7c-482e-ae61-159ec359f881' ||
      rawEntityId === 'ehm' ||
      rawEntityId === 'ehmconsultancy' ||
      rawEntityName.includes('ehm')
    ) {
      return { label: 'EHM', isCAG: false, isCommon: false };
    }
    const code = (item.taskCode || '').toUpperCase().trim();
    if (code.startsWith('COMMON') || code.startsWith('COM-')) {
      return { label: 'EHM & CLIMAGRO', isCAG: false, isCommon: true };
    }
    if (code.startsWith('CAG') || code.startsWith('CLIMAGRO')) {
      return { label: 'CLIMAGRO', isCAG: true, isCommon: false };
    }
    return { label: 'EHM', isCAG: false, isCommon: false };
  }

  // --- Post-Step-1 entityUtils.getEntityBadge(item) ---
  function getEntityBadgeNew(item: any) {
    const rawEntity = (item.entity || item.entityCode || '').toUpperCase().trim();
    const rawEntityName = (item.entityName || '').toLowerCase().trim();
    const rawEntityId = (item.entityId || '').toLowerCase().trim();

    if (
      rawEntity === 'COMMON' ||
      rawEntity === 'BOTH' ||
      rawEntity === 'EHM & CLIMAGRO' ||
      rawEntity.includes('COMMON') ||
      rawEntity.includes('BOTH') ||
      rawEntityId === '539ba160-88b8-4fdd-a5ef-39c09c97516a' ||
      rawEntityId === 'common' ||
      rawEntityName.includes('common') ||
      rawEntityName.includes('&')
    ) {
      return { label: 'EHM & CLIMAGRO', isCAG: false, isCommon: true };
    }
    if (
      rawEntity === 'CAG' ||
      rawEntity === 'CLIMAGRO' ||
      rawEntityId === 'ebbf77f7-c1ac-423d-a29d-8db50beac25f' ||
      rawEntityId === 'cag' ||
      rawEntityId === 'climagroanalytics' ||
      rawEntityName.includes('climagro')
    ) {
      return { label: 'CLIMAGRO', isCAG: true, isCommon: false };
    }
    if (
      rawEntity === 'EHM' ||
      rawEntityId === '886d7680-6a7c-482e-ae61-159ec359f881' ||
      rawEntityId === 'ehm' ||
      rawEntityId === 'ehmconsultancy' ||
      rawEntityName.includes('ehm')
    ) {
      return { label: 'EHM', isCAG: false, isCommon: false };
    }
    return { label: 'EHM', isCAG: false, isCommon: false };
  }

  // Evaluate for each task
  const rows = [];
  for (const t of tasks) {
    const parentEpic = epicMap.get(t.epic_id);
    const oldApi = enrichOld(t);
    const newApi = enrichNew(t);

    const oldTaskObj = {
      ...t,
      taskCode: t.task_code,
      entityId: t.entity_id,
      ...oldApi,
    };
    const newTaskObj = {
      ...t,
      taskCode: t.task_code,
      entityId: t.entity_id,
      ...newApi,
    };

    // 1. TasksView
    // Table badge: uses getEntityBadge(t).label
    const tvOldBadge = getEntityBadgeOld(oldTaskObj).label;
    const tvNewBadge = getEntityBadgeNew(newTaskObj).label;

    // 2. EpicsSubView
    // Inside EpicsSubView:
    // a) In epic card task item: task.taskCode || task.id (no badge)
    // b) In linked tasks list:
    // old: isEpicCAG && taskCode.startsWith('EHM-') ? replace('EHM-', 'CAG-') : taskCode
    const oldIsEpicCAG = (parentEpic?.epic_code || '').startsWith('CAG');
    const newIsEpicCAG = (parentEpic?.entity_code || parentEpic?.entity) === 'CAG';
    const epicsOldCodeRender = oldIsEpicCAG && t.task_code?.startsWith('EHM-')
      ? t.task_code.replace(/^EHM-/, 'CAG-')
      : t.task_code;
    const epicsNewCodeRender = t.task_code;

    // 3. InitiativesSubView
    // Similar to EpicsSubView linked tasks modal:
    const initsOldCodeRender = oldIsEpicCAG && t.task_code?.startsWith('EHM-')
      ? t.task_code.replace(/^EHM-/, 'CAG-')
      : t.task_code;
    const initsNewCodeRender = t.task_code;

    // 4. SprintsSubView
    // In sprint task card (line 1414): uses getEntityBadge(t).label
    const sprintsOldBadge = getEntityBadgeOld(oldTaskObj).label;
    const sprintsNewBadge = getEntityBadgeNew(newTaskObj).label;
    // SprintsSubView entityName resolution:
    const sprintsOldEntityName = (t.task_code || '').startsWith('CAG') || (oldApi.entityName || '').toLowerCase().includes('climagro') || (t.entity_id || '').toLowerCase().includes('cag') ? 'Climagro' : 'EHM';
    const sprintsNewEntityName = newApi.entityCode === 'CAG' || (newApi.entityName || '').toLowerCase().includes('climagro') || (t.entity_id || '').toLowerCase().includes('cag') ? 'Climagro' : 'EHM';

    rows.push({
      taskCode: t.task_code,
      dbEntityCode: entityMap.get(t.entity_id)?.code,
      oldApiEntity: oldApi.entity,
      newApiEntity: newApi.entity,
      oldApiEntityCode: oldApi.entityCode,
      newApiEntityCode: newApi.entityCode,
      oldApiEntityName: oldApi.entityName,
      newApiEntityName: newApi.entityName,
      apiEqual: JSON.stringify(oldApi) === JSON.stringify(newApi),
      tvOldBadge,
      tvNewBadge,
      tvEqual: tvOldBadge === tvNewBadge,
      epicsOldCodeRender,
      epicsNewCodeRender,
      epicsEqual: epicsOldCodeRender === epicsNewCodeRender,
      initsOldCodeRender,
      initsNewCodeRender,
      initsEqual: initsOldCodeRender === initsNewCodeRender,
      sprintsOldBadge,
      sprintsNewBadge,
      sprintsBadgeEqual: sprintsOldBadge === sprintsNewBadge,
      sprintsOldEntityName,
      sprintsNewEntityName,
      sprintsEntityEqual: sprintsOldEntityName === sprintsNewEntityName,
    });
  }

  console.log('\n| Task Code | DB Entity | Pre /api/tasks (entity, entityCode, entityName) | Post /api/tasks (entity, entityCode, entityName) | TasksView (Pre -> Post) | EpicsSubView (Pre -> Post) | InitiativesSubView (Pre -> Post) | SprintsSubView (Pre -> Post) |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const preApi = `${r.oldApiEntity} / ${r.oldApiEntityCode} / "${r.oldApiEntityName}"`;
    const postApi = `${r.newApiEntity} / ${r.newApiEntityCode} / "${r.newApiEntityName}"`;
    const tv = r.tvOldBadge === r.tvNewBadge ? r.tvOldBadge : `${r.tvOldBadge} -> ${r.tvNewBadge}`;
    const epics = r.epicsOldCodeRender === r.epicsNewCodeRender ? r.epicsOldCodeRender : `${r.epicsOldCodeRender} -> ${r.epicsNewCodeRender}`;
    const inits = r.initsOldCodeRender === r.initsNewCodeRender ? r.initsOldCodeRender : `${r.initsOldCodeRender} -> ${r.initsNewCodeRender}`;
    const sprints = r.sprintsOldBadge === r.sprintsNewBadge ? r.sprintsOldBadge : `${r.sprintsOldBadge} -> ${r.sprintsNewBadge}`;
    console.log(`| \`${r.taskCode}\` | **${r.dbEntityCode}** | \`${preApi}\` | \`${postApi}\` | ${tv} | \`${epics}\` | \`${inits}\` | ${sprints} |`);
  }

  // Check audit_logs and notifications for COM-E01-W1-T001
  const auditRes = await db.execute(sql`SELECT * FROM audit_logs WHERE details::text ILIKE '%COM-E01-W1-T001%' OR details::text ILIKE '%ebbf77f7-c1ac-423d-a29d-8db50beac25f%'`);
  console.log('Audit logs for COM-E01-W1-T001:', auditRes.rows);

  const tRowRes = await db.execute(sql`SELECT id, task_code, title, entity_id, created_at, updated_at FROM tasks WHERE task_code = 'COM-E01-W1-T001'`);
  console.log('Current DB row for COM-E01-W1-T001:', tRowRes.rows);

  process.exit(0);
}

run().catch(console.error);
