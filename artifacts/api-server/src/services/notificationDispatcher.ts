import { db, notifications, sql, eq, and, gte } from '@workspace/db';
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

// In-memory burst tracker for debouncing micro-updates (e.g. 4 subtasks clicked in 1 minute)
// Key: `${entityId}_${recipientUserId}_${eventType}`
interface BurstEntry {
  count: number;
  lastTimestamp: number;
  firstMessage: string;
}
const burstMap = new Map<string, BurstEntry>();
const BURST_WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Dispatches targeted notifications exclusively to stakeholders calculated by getRecipients.
 * Safe, asynchronous, non-blocking: Never throws errors to callers.
 */
export async function dispatchNotification(params: DispatchParams): Promise<void> {
  // Execute asynchronously so caller's HTTP response is never blocked or failed
  setImmediate(async () => {
    try {
      const { entity, actorUserId, eventType, title, message, extraPayload = {} } = params;

      // 1. Resolve canonical user.id for all stakeholder parties
      const [assigneeUserIds, reviewingLeadUserId, creatorUserId, taggedUserIds, previousAssigneeUserIds] =
        await Promise.all([
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

      // 2. Pure stakeholder recipient routing
      const { recipientUserIds, removedAssigneeUserIds } = getRecipients(
        stakeholders,
        actorUserId,
        eventType
      );

      const now = Date.now();
      const insertRows: any[] = [];

      // 3. Process primary recipients
      for (const recipientId of recipientUserIds) {
        if (!recipientId) continue;

        // Burst debounce check for rapid subtask or status toggles
        if (eventType === 'SUBTASK_ADDED' || eventType === 'SUBTASK_COMPLETED' || eventType === 'STATUS_CHANGED') {
          const burstKey = `${entity.entityId}_${recipientId}_${eventType}`;
          const existingBurst = burstMap.get(burstKey);

          if (existingBurst && (now - existingBurst.lastTimestamp < BURST_WINDOW_MS)) {
            // Already sent an alert within last 60 seconds, increment count and suppress duplicate alert
            existingBurst.count += 1;
            existingBurst.lastTimestamp = now;
            continue;
          }

          burstMap.set(burstKey, {
            count: 1,
            lastTimestamp: now,
            firstMessage: message,
          });
        }

        // Deduplication check: verify no identical notification was created for this recipient in last 60 seconds
        const idempotencyKey = `${entity.entityType}_${entity.entityId}_${eventType}_${recipientId}_${Math.floor(now / 60000)}`;

        insertRows.push({
          userId: recipientId,
          type: `TASK_${eventType}`,
          payload: {
            title,
            message,
            entityType: entity.entityType,
            entityId: entity.entityId,
            taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
            taskCode: entity.entityCode,
            taskTitle: entity.title,
            eventType,
            idempotencyKey,
            ...extraPayload,
          },
        });
      }

      // 4. Process removed assignees on reassignment
      if (eventType === 'REASSIGNED' && removedAssigneeUserIds && removedAssigneeUserIds.length > 0) {
        for (const removedId of removedAssigneeUserIds) {
          if (!removedId) continue;
          insertRows.push({
            userId: removedId,
            type: 'TASK_REMOVED',
            payload: {
              title: `Removed from ${entity.entityType}: [${entity.entityCode || 'ITEM'}]`,
              message: `You were unassigned from [${entity.entityCode || 'ITEM'}] "${entity.title}".`,
              entityType: entity.entityType,
              entityId: entity.entityId,
              taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
              taskCode: entity.entityCode,
              taskTitle: entity.title,
              eventType: 'REASSIGNED',
              ...extraPayload,
            },
          });
        }
      }

      // 5. Batch insert all rows in one operation
      if (insertRows.length > 0) {
        await db.insert(notifications).values(insertRows);
        console.log(`[TARGETED DISPATCH SUCCESS] Event: ${eventType} on ${entity.entityType} ${entity.entityCode} -> Recipients: [${recipientUserIds.join(', ')}]`);
      }
    } catch (err) {
      // NEVER crash caller; log and isolate failure
      console.error('[TARGETED DISPATCH FAILED NON-BLOCKING]:', err);
    }
  });
}
