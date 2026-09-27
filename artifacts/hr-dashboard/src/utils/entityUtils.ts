/**
 * Robust Entity Filtering Utility for HR & Task Management Dashboard
 * Enforces global scoping between EHM, CLIMAGRO (CAG), and ALL.
 */

export function matchesEntityFilter(item: any, selectedEntity: string): boolean {
  if (!selectedEntity || selectedEntity === 'ALL') {
    return true;
  }

  if (!item) {
    return true; // Avoid hiding empty undefined records prematurely
  }

  // Handle primitive string items (e.g., entity codes directly)
  if (typeof item === 'string') {
    const str = item.toUpperCase();
    if (selectedEntity === 'EHM') return str.includes('EHM');
    if (selectedEntity === 'CAG') return str.includes('CAG') || str.includes('CLIMAGRO');
    return true;
  }

  const target = selectedEntity.toUpperCase(); // 'EHM' or 'CAG'
  const isCAGTarget = target === 'CAG' || target === 'CLIMAGRO';
  const isEHMTarget = target === 'EHM';

  // Check 'BOTH', 'COMMON', or 'ALL' on item properties (means applies to both entities)
  const entityCode = (item.entityCode || '').toUpperCase();
  const entity = (item.entity || '').toUpperCase();
  if (entityCode === 'BOTH' || entityCode === 'ALL' || entityCode === 'COMMON' || entity === 'BOTH' || entity === 'ALL' || entity === 'COMMON') {
    return true;
  }

  const entityId = (item.entityId || '').toLowerCase();
  const entityName = (item.entityName || '').toLowerCase();

  // 1. Direct Entity Property Matching
  if (isEHMTarget) {
    if (
      entityCode === 'EHM' ||
      entity === 'EHM' ||
      entityId === 'ehm' ||
      entityId === 'ehmconsultancy' ||
      entityName.includes('ehm')
    ) {
      return true;
    }
  }

  if (isCAGTarget) {
    if (
      entityCode === 'CAG' ||
      entityCode === 'CLIMAGRO' ||
      entity === 'CAG' ||
      entity === 'CLIMAGRO' ||
      entityId === 'cag' ||
      entityId === 'climagroanalytics' ||
      entityName.includes('cag') ||
      entityName.includes('climagro')
    ) {
      return true;
    }
  }

  // 2. Code Prefix Matching (e.g., EHM-EMP01, CAG-TSK-001, EHM-SPR-01, CAG-INIT-01)
  const code = (
    item.taskCode ||
    item.employeeCode ||
    item.sprintCode ||
    item.initiativeCode ||
    item.epicCode ||
    item.taskId ||
    item.code ||
    (typeof item.id === 'string' ? item.id : '')
  ).toUpperCase();

  if (isEHMTarget && code.startsWith('EHM')) {
    return true;
  }

  if (isCAGTarget && (code.startsWith('CAG') || code.startsWith('CLIMAGRO'))) {
    return true;
  }

  return false;
}

export function isCAGEntity(item: any): boolean {
  if (!item) return false;
  if (typeof item === 'string') {
    const s = item.toUpperCase();
    return s === 'CAG' || s === 'CLIMAGRO' || s.startsWith('CAG') || s.startsWith('CLIMAGRO') || s.includes('CLIMAGRO');
  }
  const entity = (item.entity || '').toUpperCase();
  const entityCode = (item.entityCode || '').toUpperCase();
  const entityName = (item.entityName || '').toLowerCase();
  const entityId = (item.entityId || '').toLowerCase();

  // 1. Direct entity property (CAG vs EHM vs COMMON)
  if (entity === 'CAG' || entity === 'CLIMAGRO' || entityCode === 'CAG' || entityCode === 'CLIMAGRO' || entityId === 'ebbf77f7-c1ac-423d-a29d-8db50beac25f') return true;
  if (entity === 'EHM' || entityCode === 'EHM' || entityId === '886d7680-6a7c-482e-ae61-159ec359f881') return false;
  if (entityId === 'cag' || entityId === 'climagroanalytics' || entityName.includes('climagro')) return true;
  if (entityId === 'ehm' || entityId === 'ehmconsultancy' || entityName.includes('ehm')) return false;

  // 2. Code prefix fallback
  const code = (
    item.taskCode ||
    item.initiativeCode ||
    item.epicCode ||
    item.sprintCode ||
    item.taskId ||
    item.code ||
    (typeof item.id === 'string' ? item.id : '')
  ).toUpperCase();

  if (code.startsWith('CAG') || code.startsWith('CLIMAGRO')) return true;
  return false;
}

export interface EntityBadgeInfo {
  label: 'CLIMAGRO' | 'EHM' | 'EHM & CLIMAGRO';
  isCAG: boolean;
  isCommon: boolean;
  className: string;
  dotColor: string;
}

export function getEntityBadge(item: any): EntityBadgeInfo {
  if (!item) {
    return {
      label: 'EHM',
      isCAG: false,
      isCommon: false,
      className: 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold',
      dotColor: 'bg-amber-500',
    };
  }

  // Handle primitive string items
  if (typeof item === 'string') {
    const s = item.toUpperCase();
    if (s === 'COMMON' || s === 'BOTH' || s.includes('EHM & CLIMAGRO') || s.startsWith('COM')) {
      return {
        label: 'EHM & CLIMAGRO',
        isCAG: false,
        isCommon: true,
        className: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold',
        dotColor: 'bg-purple-500',
      };
    }
    if (s === 'CAG' || s === 'CLIMAGRO' || s.startsWith('CAG') || s.includes('CLIMAGRO')) {
      return {
        label: 'CLIMAGRO',
        isCAG: true,
        isCommon: false,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold',
        dotColor: 'bg-emerald-500',
      };
    }
    return {
      label: 'EHM',
      isCAG: false,
      isCommon: false,
      className: 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold',
      dotColor: 'bg-amber-500',
    };
  }

  const entity = (item.entity || item.entityCode || '').toUpperCase();
  const entityName = (item.entityName || '').toLowerCase();
  const entityId = (item.entityId || '').toLowerCase();
  const code = (
    item.taskCode ||
    item.employeeCode ||
    item.initiativeCode ||
    item.epicCode ||
    item.sprintCode ||
    item.taskId ||
    item.code ||
    (typeof item.id === 'string' ? item.id : '')
  ).toUpperCase();

  // 1. Check COMMON / BOTH (Mixed EHM & ClimAgro Pool)
  if (
    entity === 'COMMON' ||
    entity === 'BOTH' ||
    entity === 'EHM & CLIMAGRO' ||
    entity.includes('COMMON') ||
    entity.includes('BOTH') ||
    entityId === '539ba160-88b8-4fdd-a5ef-39c09c97516a' ||
    entityName.includes('common') ||
    entityName.includes('&') ||
    code.startsWith('COMMON') ||
    code.startsWith('COM-')
  ) {
    return {
      label: 'EHM & CLIMAGRO',
      isCAG: false,
      isCommon: true,
      className: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold',
      dotColor: 'bg-purple-500',
    };
  }

  // 2. Check CLIMAGRO
  if (
    entity === 'CAG' ||
    entity === 'CLIMAGRO' ||
    entityId === 'ebbf77f7-c1ac-423d-a29d-8db50beac25f' ||
    entityName.includes('climagro') ||
    entityId.includes('climagro') ||
    entityId === 'cag' ||
    code.startsWith('CAG') ||
    code.startsWith('CLIMAGRO')
  ) {
    return {
      label: 'CLIMAGRO',
      isCAG: true,
      isCommon: false,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold',
      dotColor: 'bg-emerald-500',
    };
  }

  // 3. Default to EHM
  return {
    label: 'EHM',
    isCAG: false,
    isCommon: false,
    className: 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold',
    dotColor: 'bg-amber-500',
  };
}
