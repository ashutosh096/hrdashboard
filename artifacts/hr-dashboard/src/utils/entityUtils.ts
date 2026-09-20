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
