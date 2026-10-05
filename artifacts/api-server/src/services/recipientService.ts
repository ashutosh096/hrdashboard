/**
 * Pure Recipient Engine for Tasks, Sprints, Epics, and Projects.
 *
 * Invariants:
 * 1. Actor who performed the action is ALWAYS excluded from receiving their own notification.
 * 2. Assignee acts -> Reviewing Lead ONLY receives notification.
 * 3. Reviewing Lead acts -> Assignee(s) ONLY receive notification.
 * 4. Third-party (Manager/Admin) acts -> Both Assignee(s) and Reviewing Lead receive notification.
 * 5. Assignee and Reviewing Lead are the same person -> Nobody is notified (returns []).
 * 6. Admins NEVER get fallback alerts; they only receive alerts if they are explicitly the assignee, lead, or tagged.
 * 7. Reassignments trigger an 'ASSIGNED' event for the new assignee and 'REMOVED' notice for the old assignee.
 */

export type NotificationEvent =
  | 'CREATED'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'STATUS_CHANGED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_COMPLETED'
  | 'COMMENT_ADDED'
  | 'SIGNED_OFF'
  | 'REOPENED'
  | 'DUE_DATE_CHANGED'
  | 'MENTIONED';

export interface EntityStakeholders {
  entityType: 'TASK' | 'EPIC' | 'PROJECT' | 'SPRINT';
  entityId: string;
  assigneeUserIds: string[];          // Canonical user.id[]
  reviewingLeadUserId: string | null; // Canonical user.id
  creatorUserId?: string | null;      // Canonical user.id
  taggedUserIds?: string[];           // Mentioned user.id[]
  previousAssigneeUserIds?: string[]; // For reassignment detection
}

export interface RecipientResult {
  recipientUserIds: string[];         // Primary alert recipients
  removedAssigneeUserIds: string[];   // For reassignment removal notices
}

/**
 * Pure, deterministic function to compute exact recipients for any entity event.
 */
export function getRecipients(
  stakeholders: EntityStakeholders,
  actorUserId: string,
  eventType: NotificationEvent
): RecipientResult {
  const actor = actorUserId?.trim();
  const assignees = Array.from(new Set((stakeholders.assigneeUserIds || []).map(id => id?.trim()).filter(Boolean)));
  const lead = stakeholders.reviewingLeadUserId?.trim() || null;
  const tagged = Array.from(new Set((stakeholders.taggedUserIds || []).map(id => id?.trim()).filter(Boolean)));
  const previousAssignees = Array.from(new Set((stakeholders.previousAssigneeUserIds || []).map(id => id?.trim()).filter(Boolean)));

  // If assignee and lead are the exact same person, no notifications needed (self-review / solo task)
  if (lead && assignees.length === 1 && assignees[0] === lead && tagged.length === 0) {
    return { recipientUserIds: [], removedAssigneeUserIds: [] };
  }

  // Handle MENTIONED event (explicit @mentions take precedence)
  if (eventType === 'MENTIONED') {
    const mentionRecipients = tagged.filter(id => id !== actor);
    return { recipientUserIds: mentionRecipients, removedAssigneeUserIds: [] };
  }

  // Handle REASSIGNED event
  if (eventType === 'REASSIGNED') {
    const newAssignees = assignees.filter(id => !previousAssignees.includes(id) && id !== actor);
    const removedAssignees = previousAssignees.filter(id => !assignees.includes(id) && id !== actor);

    const primaryRecipients = new Set<string>(newAssignees);
    // If the lead was not the actor, notify the lead about the reassignment
    if (lead && lead !== actor) {
      primaryRecipients.add(lead);
    }

    return {
      recipientUserIds: Array.from(primaryRecipients),
      removedAssigneeUserIds: removedAssignees,
    };
  }

  const isActorAssignee = assignees.includes(actor);
  const isActorLead = lead !== null && lead === actor;

  const targetRecipients = new Set<string>();

  if (isActorAssignee && !isActorLead) {
    // 1. Actor is an Assignee -> Notify Reviewing Lead ONLY
    if (lead && lead !== actor) {
      targetRecipients.add(lead);
    }
  } else if (isActorLead && !isActorAssignee) {
    // 2. Actor is the Reviewing Lead -> Notify all Assignees ONLY
    assignees.forEach(id => {
      if (id !== actor) targetRecipients.add(id);
    });
  } else {
    // 3. Actor is a third party (e.g. Manager, Admin, or Creator who is neither assignee nor lead)
    // Notify both Assignees and Reviewing Lead
    assignees.forEach(id => {
      if (id !== actor) targetRecipients.add(id);
    });
    if (lead && lead !== actor) {
      targetRecipients.add(lead);
    }
  }

  // Include any tagged users who are not the actor
  tagged.forEach(id => {
    if (id !== actor) targetRecipients.add(id);
  });

  return {
    recipientUserIds: Array.from(targetRecipients),
    removedAssigneeUserIds: [],
  };
}
