export type NotificationSeverity = 'emerald' | 'indigo' | 'blue' | 'violet' | 'amber';

export interface SeverityConfig {
  severity: NotificationSeverity;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  dotBg: string;
  iconBg: string;
  iconText: string;
}

/**
 * Returns consistent severity coloring based on event type:
 * - Emerald: Approved / Signed Off / Completed
 * - Indigo: Assigned (Task, Sprint, Epic, Project)
 * - Blue: Status / Progress updates
 * - Violet: Comments
 * - Amber: Review submitted / Action required / Reassigned / Removed / Calendar
 */
export function getNotificationSeverity(type: string = ''): SeverityConfig {
  const t = type.toUpperCase();

  // Emerald: Approved / Signed Off / Completed
  if (t.includes('SIGNED_OFF') || t.includes('COMPLETED') || t.includes('APPROVED')) {
    return {
      severity: 'emerald',
      label: 'Completed',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeText: 'text-emerald-700',
      borderAccent: 'border-l-emerald-500',
      dotBg: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
    };
  }

  // Indigo: Assigned (Task, Sprint, Epic, Project)
  if (t.includes('ASSIGNED')) {
    return {
      severity: 'indigo',
      label: 'Assigned',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeText: 'text-indigo-700',
      borderAccent: 'border-l-indigo-500',
      dotBg: 'bg-indigo-500',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
    };
  }

  // Blue: Status / Progress updates
  if (t.includes('STATUS') || t.includes('PROGRESS') || t.includes('SUBTASK')) {
    return {
      severity: 'blue',
      label: 'Status Update',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeText: 'text-blue-700',
      borderAccent: 'border-l-blue-500',
      dotBg: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    };
  }

  // Violet: Comments
  if (t.includes('COMMENT')) {
    return {
      severity: 'violet',
      label: 'Comment',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      badgeText: 'text-violet-700',
      borderAccent: 'border-l-violet-500',
      dotBg: 'bg-violet-500',
      iconBg: 'bg-violet-100',
      iconText: 'text-violet-600',
    };
  }

  // Amber: Review submitted / Action required / Reassigned / Removed / Calendar
  if (
    t.includes('REVIEW') ||
    t.includes('REASSIGNED') ||
    t.includes('REMOVED') ||
    t.includes('CALENDAR') ||
    t.includes('OVERDUE')
  ) {
    return {
      severity: 'amber',
      label: 'Action Required',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeText: 'text-amber-800',
      borderAccent: 'border-l-amber-500',
      dotBg: 'bg-amber-500',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-700',
    };
  }

  // Default neutral/blue
  return {
    severity: 'blue',
    label: 'Notification',
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    borderAccent: 'border-l-slate-400',
    dotBg: 'bg-slate-400',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
  };
}
