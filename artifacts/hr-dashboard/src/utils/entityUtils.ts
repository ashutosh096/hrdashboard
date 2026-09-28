/**
 * Robust Entity Filtering Utility for HR & Task Management Dashboard
 * Enforces global scoping between EHM, CLIMAGRO (CAG), and COMMON.
 */

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
    const s = item.toUpperCase().trim();
    if (s === 'COMMON' || s === 'BOTH' || s.includes('EHM & CLIMAGRO') || s.startsWith('COM')) {
      return {
        label: 'EHM & CLIMAGRO',
        isCAG: false,
        isCommon: true,
        className: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold',
        dotColor: 'bg-purple-500',
      };
    }
    if (s === 'CAG' || s === 'CLIMAGRO' || s.includes('CLIMAGRO')) {
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

  const rawEntity = (item.entity || item.entityCode || '').toUpperCase().trim();
  const rawEntityName = (item.entityName || '').toLowerCase().trim();
  const rawEntityId = (item.entityId || '').toLowerCase().trim();

  // 1. EXPLICIT ENTITY PROPERTY PRIORITY
  // Check COMMON / BOTH
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
    return {
      label: 'EHM & CLIMAGRO',
      isCAG: false,
      isCommon: true,
      className: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold',
      dotColor: 'bg-purple-500',
    };
  }

  // Check CLIMAGRO / CAG
  if (
    rawEntity === 'CAG' ||
    rawEntity === 'CLIMAGRO' ||
    rawEntityId === 'ebbf77f7-c1ac-423d-a29d-8db50beac25f' ||
    rawEntityId === 'cag' ||
    rawEntityId === 'climagroanalytics' ||
    rawEntityName.includes('climagro')
  ) {
    return {
      label: 'CLIMAGRO',
      isCAG: true,
      isCommon: false,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold',
      dotColor: 'bg-emerald-500',
    };
  }

  // Check EHM
  if (
    rawEntity === 'EHM' ||
    rawEntityId === '886d7680-6a7c-482e-ae61-159ec359f881' ||
    rawEntityId === 'ehm' ||
    rawEntityId === 'ehmconsultancy' ||
    rawEntityName.includes('ehm')
  ) {
    return {
      label: 'EHM',
      isCAG: false,
      isCommon: false,
      className: 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold',
      dotColor: 'bg-amber-500',
    };
  }

  // 2. CODE PREFIX FALLBACK (ONLY IF NO EXPLICIT ENTITY PROPERTY WAS MATCHED)
  const code = (
    item.taskCode ||
    item.employeeCode ||
    item.initiativeCode ||
    item.epicCode ||
    item.sprintCode ||
    item.taskId ||
    item.code ||
    (typeof item.id === 'string' ? item.id : '')
  ).toUpperCase().trim();

  if (code.startsWith('COMMON') || code.startsWith('COM-')) {
    return {
      label: 'EHM & CLIMAGRO',
      isCAG: false,
      isCommon: true,
      className: 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold',
      dotColor: 'bg-purple-500',
    };
  }

  if (code.startsWith('CAG') || code.startsWith('CLIMAGRO')) {
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

export function matchesEntityFilter(item: any, selectedEntity: string): boolean {
  if (!selectedEntity || selectedEntity === 'ALL') {
    return true;
  }

  if (!item) {
    return true;
  }

  const badge = getEntityBadge(item);
  // Shared / Common items appear under both EHM and CAG views
  if (badge.isCommon) {
    return true;
  }

  const target = selectedEntity.toUpperCase().trim();
  if (target === 'CAG' || target === 'CLIMAGRO') {
    return badge.isCAG;
  }
  if (target === 'EHM') {
    return !badge.isCAG && !badge.isCommon;
  }

  return true;
}

export function isCAGEntity(item: any): boolean {
  if (!item) return false;
  const badge = getEntityBadge(item);
  return badge.isCAG;
}
