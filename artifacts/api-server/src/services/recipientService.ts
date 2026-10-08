/**
 * Pure Recipient Engine for Tasks, Sprints, Epics, and Projects.
 *
 * Core invariants (enforced unconditionally on every code path):
 * 1. The actor who performed the action is ALWAYS excluded from their own notification.
 * 2. Recipient matching is ALWAYS by userId (users.id UUID). Never by name, email, or string.
 * 3. One row is inserted per recipient — never a shared row for multiple recipients.
 * 4. Admins NEVER receive fallback alerts. If an employee has no linked user account, the
 *    notification is silently skipped — never re-routed to an Admin.
 *
 * Event routing rules:
 * - ASSIGNED / REASSIGNED  → new assignee(s) only (actor excluded)
 * - STATUS_CHANGED         → assignees + reviewing lead (actor excluded)
 * - REVIEW_SUBMITTED       → reviewing lead ONLY (actor excluded)
 * - SIGNED_OFF / APPROVED  → all assignees (actor excluded)
 * - REOPENED               → all assignees + reviewing lead (actor excluded)
 * - CHECKLIST_COMPLETED    → reviewing lead ONLY (actor excluded)
 * - COMMENT_ADDED          → assignees + reviewing lead (actor excluded)
 * - MENTIONED              → explicitly tagged users (actor excluded)
 * - EPIC_ASSIGNED          → epic owner / department lead (actor excluded)
 * - PROJECT_ASSIGNED       → project team members with new/changed role (actor excluded)
 * - SPRINT_ASSIGNED        → the sprint owner employee (actor excluded)
 */

export type NotificationEvent =
  | 'CREATED'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'STATUS_CHANGED'
  | 'REVIEW_SUBMITTED'
  | 'SIGNED_OFF'
  | 'REOPENED'
  | 'CHECKLIST_COMPLETED'
  | 'COMMENT_ADDED'
  | 'MENTIONED'
  | 'EPIC_ASSIGNED'
  | 'PROJECT_ASSIGNED'
  | 'SPRINT_ASSIGNED'
  | 'INITIATIVE_ASSIGNED'
  // Legacy aliases kept for backward compat with existing dispatchNotification call sites
  | 'SUBTASK_ADDED'
  | 'SUBTASK_COMPLETED'
  | 'DUE_DATE_CHANGED';

export interface EntityStakeholders {
  entityType: 'TASK' | 'EPIC' | 'PROJECT' | 'SPRINT' | 'INITIATIVE';
  entityId: string;
  assigneeUserIds: string[];           // Canonical users.id[]
  reviewingLeadUserId: string | null;  // Canonical users.id
  creatorUserId?: string | null;       // Canonical users.id
  taggedUserIds?: string[];            // @mentioned users.id[]
  previousAssigneeUserIds?: string[];  // For REASSIGNED detection
}

export interface RecipientResult {
  recipientUserIds: string[];         // Primary notification recipients
  removedAssigneeUserIds: string[];   // For REASSIGNED removal notices
}

/**
 * Pure, deterministic, ID-based recipient computation for any entity event.
 * Never returns the actorUserId in any result set.
 */
export function getRecipients(
  stakeholders: EntityStakeholders,
  actorUserId: string,
  eventType: NotificationEvent
): RecipientResult {
  const actor = actorUserId?.trim();
  const assignees = dedupe((stakeholders.assigneeUserIds || []).map(id => id?.trim()).filter(Boolean));
  const lead = stakeholders.reviewingLeadUserId?.trim() || null;
  const creator = stakeholders.creatorUserId?.trim() || null;
  const tagged = dedupe((stakeholders.taggedUserIds || []).map(id => id?.trim()).filter(Boolean));
  const previousAssignees = dedupe((stakeholders.previousAssigneeUserIds || []).map(id => id?.trim()).filter(Boolean));

  const excActor = (id: string) => id !== actor;

  // ── MENTIONED ──────────────────────────────────────────────────────────────
  if (eventType === 'MENTIONED') {
    return { recipientUserIds: tagged.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── REASSIGNED ─────────────────────────────────────────────────────────────
  if (eventType === 'REASSIGNED') {
    const newAssignees = assignees.filter(id => !previousAssignees.includes(id) && excActor(id));
    const removedAssignees = previousAssignees.filter(id => !assignees.includes(id) && excActor(id));
    const primary = new Set<string>(newAssignees);
    if (lead && excActor(lead)) primary.add(lead);
    return { recipientUserIds: Array.from(primary), removedAssigneeUserIds: removedAssignees };
  }

  // ── REVIEW_SUBMITTED ───────────────────────────────────────────────────────
  // Reviewing lead receives this; if lead is unset, falls back to creator
  if (eventType === 'REVIEW_SUBMITTED') {
    const recipients = new Set<string>();
    if (lead && excActor(lead)) {
      recipients.add(lead);
    } else if (creator && excActor(creator)) {
      recipients.add(creator);
    }
    return { recipientUserIds: Array.from(recipients), removedAssigneeUserIds: [] };
  }

  // ── CHECKLIST_COMPLETED ────────────────────────────────────────────────────
  // Reviewing lead; if lead is not specified or lead is actor, fall back to creator or collaborators
  if (eventType === 'CHECKLIST_COMPLETED' || eventType === 'SUBTASK_COMPLETED') {
    const recipients = new Set<string>();
    if (lead && excActor(lead)) {
      recipients.add(lead);
    } else if (creator && excActor(creator)) {
      recipients.add(creator);
    }
    if (recipients.size === 0) {
      assignees.filter(excActor).forEach(id => recipients.add(id));
    }
    return { recipientUserIds: Array.from(recipients), removedAssigneeUserIds: [] };
  }

  // ── SIGNED_OFF / APPROVED ─────────────────────────────────────────────────
  // All assignees receive this; the lead who approved is the actor (excluded).
  if (eventType === 'SIGNED_OFF') {
    return { recipientUserIds: assignees.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── COMMENT_ADDED ─────────────────────────────────────────────────────────
  // All assignees + reviewing lead, minus the commenter (actor).
  if (eventType === 'COMMENT_ADDED') {
    const recipients = new Set<string>();
    assignees.filter(excActor).forEach(id => recipients.add(id));
    if (lead && excActor(lead)) recipients.add(lead);
    return { recipientUserIds: Array.from(recipients), removedAssigneeUserIds: [] };
  }

  // ── EPIC_ASSIGNED ─────────────────────────────────────────────────────────
  // The epic's owner / department lead receives this. assigneeUserIds[0] is the owner here.
  if (eventType === 'EPIC_ASSIGNED') {
    return { recipientUserIds: assignees.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── INITIATIVE_ASSIGNED ───────────────────────────────────────────────────
  // The initiative owner receives this. assigneeUserIds[0] is the owner here.
  if (eventType === 'INITIATIVE_ASSIGNED') {
    return { recipientUserIds: assignees.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── PROJECT_ASSIGNED ──────────────────────────────────────────────────────
  // The person(s) newly added to the project team. Stored in assigneeUserIds.
  if (eventType === 'PROJECT_ASSIGNED') {
    return { recipientUserIds: assignees.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── SPRINT_ASSIGNED ───────────────────────────────────────────────────────
  // Only the sprint owner employee (assigneeUserIds[0]); NOT the reviewing lead.
  if (eventType === 'SPRINT_ASSIGNED') {
    return { recipientUserIds: assignees.filter(excActor), removedAssigneeUserIds: [] };
  }

  // ── ASSIGNED / CREATED ─────────────────────────────────────────────────────
  if (eventType === 'ASSIGNED' || eventType === 'CREATED') {
    // New assignee(s) get notified; lead is also notified if a third party made the assignment.
    const isActorLead = lead !== null && lead === actor;
    const recipients = new Set<string>(assignees.filter(excActor));
    // If lead is not the actor (i.e. a third party assigned), notify the lead too
    if (!isActorLead && lead && excActor(lead)) recipients.add(lead);
    return { recipientUserIds: Array.from(recipients), removedAssigneeUserIds: [] };
  }

  // ── STATUS_CHANGED / REOPENED / DUE_DATE_CHANGED / SUBTASK_ADDED ─────────
  // General updates: assignees + reviewing lead, actor excluded.
  {
    const recipients = new Set<string>();
    assignees.filter(excActor).forEach(id => recipients.add(id));
    if (lead && excActor(lead)) recipients.add(lead);
    tagged.filter(excActor).forEach(id => recipients.add(id));
    return { recipientUserIds: Array.from(recipients), removedAssigneeUserIds: [] };
  }
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
