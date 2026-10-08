import { db, notifications, eq, and, gte, sql } from '@workspace/db';
import { getRecipients, EntityStakeholders, NotificationEvent } from './recipientService.js';
import { resolveUserIdFromEmployeeId, resolveUserIdsFromEmployeeIds } from '../utils/userResolver.js';

interface DispatchParams {
  entity: {
    entityType: 'TASK' | 'EPIC' | 'PROJECT' | 'SPRINT';
    entityId: string;
    entityCode?: string | null;
    title: string;
    assigneeEmployeeIds?: (string | null | undefined)[];
    reviewingLeadEmployeeId?: string | null;
    creatorEmployeeId?: string | null;
    taggedEmployeeIds?: (string | null | undefined)[];
    previousAssigneeEmployeeIds?: (string | null | undefined)[];
  };
  actorUserId: string;
  eventType: NotificationEvent;
  title: string;
  message: string;
  extraPayload?: Record<string, any>;
}

// In-memory burst tracker: debounces rapid micro-updates within a 60-second window.
// Key: `${entityId}_${recipientUserId}_${eventType}`
interface BurstEntry {
  count: number;
  lastTimestamp: number;
}
const burstMap = new Map<string, BurstEntry>();
const BURST_WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Dispatches targeted notifications to the stakeholders computed by getRecipients().
 *
 * INVARIANTS guaranteed by this function:
 * - actorUserId is NEVER in the recipient set (enforced in getRecipients).
 * - Matching is entirely by users.id UUID — no name/email strings ever appear in WHERE clauses.
 * - Each recipient gets exactly one row in the notifications table.
 * - This function never throws to its caller; all errors are caught and logged.
 * - The caller's HTTP response is never blocked (runs via setImmediate).
 */
export async function dispatchNotification(params: DispatchParams): Promise<void> {
  setImmediate(async () => {
    try {
      const { entity, actorUserId, eventType, title, message, extraPayload = {} } = params;

      // 1. Resolve all employeeIds → canonical users.id values
      const [
        assigneeUserIds,
        reviewingLeadUserId,
        creatorUserId,
        taggedUserIds,
        previousAssigneeUserIds,
      ] = await Promise.all([
        resolveUserIdsFromEmployeeIds(entity.assigneeEmployeeIds || []),
        resolveUserIdFromEmployeeId(entity.reviewingLeadEmployeeId),
        resolveUserIdFromEmployeeId(entity.creatorEmployeeId),
        resolveUserIdsFromEmployeeIds(entity.taggedEmployeeIds || []),
        resolveUserIdsFromEmployeeIds(entity.previousAssigneeEmployeeIds || []),
      ]);

      const stakeholders: EntityStakeholders = {
        entityType: entity.entityType,
        entityId: entity.entityId,
        assigneeUserIds,
        reviewingLeadUserId,
        creatorUserId,
        taggedUserIds,
        previousAssigneeUserIds,
      };

      // 2. Pure ID-based recipient routing (actor always excluded inside getRecipients)
      const { recipientUserIds, removedAssigneeUserIds } = getRecipients(
        stakeholders,
        actorUserId,
        eventType
      );

      const now = Date.now();
      const insertRows: any[] = [];

      // 3. Build notification rows for primary recipients
      for (const recipientId of recipientUserIds) {
        if (!recipientId) continue;

        // Burst debounce: suppress duplicate rapid-fire updates within 60 s
        if (
          eventType === 'STATUS_CHANGED' ||
          eventType === 'SUBTASK_ADDED' ||
          eventType === 'SUBTASK_COMPLETED' ||
          eventType === 'CHECKLIST_COMPLETED'
        ) {
          const burstKey = `${entity.entityId}_${recipientId}_${eventType}`;
          const entry = burstMap.get(burstKey);
          if (entry && now - entry.lastTimestamp < BURST_WINDOW_MS) {
            entry.count += 1;
            entry.lastTimestamp = now;
            continue; // suppress duplicate within burst window
          }
          burstMap.set(burstKey, { count: 1, lastTimestamp: now });
        }

        // Notification type prefix: TASK_*, EPIC_*, PROJECT_*, SPRINT_*
        const notifType = `${entity.entityType}_${eventType}`;

        insertRows.push({
          userId: recipientId,
          type: notifType,
          payload: {
            title,
            message,
            entityType: entity.entityType,
            entityId: entity.entityId,
            taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
            taskCode: entity.entityCode,
            taskTitle: entity.title,
            eventType,
            actorUserId,
            ...extraPayload,
          },
        });
      }

      // 4. Removal notices for unassigned stakeholders on REASSIGNED events
      if (eventType === 'REASSIGNED' && removedAssigneeUserIds.length > 0) {
        for (const removedId of removedAssigneeUserIds) {
          if (!removedId) continue;
          insertRows.push({
            userId: removedId,
            type: `${entity.entityType}_REMOVED`,
            payload: {
              title: `Removed from ${entity.entityType}: [${entity.entityCode || 'ITEM'}]`,
              message: `You were unassigned from [${entity.entityCode || 'ITEM'}] "${entity.title}".`,
              entityType: entity.entityType,
              entityId: entity.entityId,
              taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
              taskCode: entity.entityCode,
              taskTitle: entity.title,
              eventType: 'REASSIGNED',
              actorUserId,
              ...extraPayload,
            },
          });
        }
      }

      // 5. Batch insert all rows atomically
      if (insertRows.length > 0) {
        await db.insert(notifications).values(insertRows);
        console.log(
          `[DISPATCH] ${eventType} on ${entity.entityType}[${entity.entityCode}] ` +
          `→ recipients: [${recipientUserIds.join(', ')}] ` +
          `(actor ${actorUserId} excluded)`
        );
      } else {
        console.log(
          `[DISPATCH] ${eventType} on ${entity.entityType}[${entity.entityCode}] ` +
          `→ no recipients (actor is sole stakeholder or no stakeholders resolved)`
        );
      }
    } catch (err) {
      console.error('[DISPATCH FAILED (non-blocking)]:', err);
    }
  });
}
