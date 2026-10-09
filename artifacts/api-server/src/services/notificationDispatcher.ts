import { db, notifications, users, employees, eq, and, sql, gt } from '@workspace/db';
import { getRecipients, EntityStakeholders, NotificationEvent } from './recipientService.js';
import { resolveUserIdFromEmployeeId, resolveUserIdsFromEmployeeIds } from '../utils/userResolver.js';
import { pruneNotificationsForUser } from './notificationService.js';

interface DispatchParams {
  entity: {
    entityType: 'TASK' | 'EPIC' | 'PROJECT' | 'SPRINT' | 'INITIATIVE';
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
  actorName?: string;
  eventType: NotificationEvent;
  title: string;
  message: string;
  extraPayload?: Record<string, any>;
}

// In-flight dispatch promise map to serialize rapid concurrent dispatches (e.g. sub-millisecond double-fires)
// so that subsequent dispatches execute their SQL idempotency query AFTER the prior insert commits to PostgreSQL.
const inFlightDispatches = new Map<string, Promise<void>>();


/**
 * Normalizes raw statuses into plain readable English:
 * e.g. "IN_PROGRESS" -> "In Progress", "TO_REVIEW" -> "To Review", "TODO" -> "To Do"
 */
export function formatReadableStatus(status: string = ''): string {
  const s = String(status).toUpperCase().trim();
  switch (s) {
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'In Progress';
    case 'TO_REVIEW':
    case 'TO REVIEW':
    case 'IN_REVIEW':
      return 'To Review';
    case 'TODO':
    case 'TO DO':
      return 'To Do';
    case 'DONE':
    case 'COMPLETED':
      return 'Done';
    case 'BACKLOG':
      return 'Backlog';
    case 'PLANNED':
      return 'Planned';
    case 'DELAYED':
      return 'Delayed';
    case 'BLOCKED':
      return 'Blocked';
    case 'ACTIVE':
      return 'Active';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Updated';
  }
}

/**
 * Formats notification messages into standard plain language:
 * Format: "{ActorName} {action} '{TaskTitle}' {detail}"
 */
export function formatPlainLanguageNotification(params: {
  actorName: string;
  eventType: NotificationEvent;
  entityType: string;
  entityTitle: string;
  entityCode?: string | null;
  extraPayload?: Record<string, any>;
  defaultTitle?: string;
  defaultMessage?: string;
}): { title: string; message: string } {
  const { actorName, eventType, entityType, entityTitle, entityCode, extraPayload = {}, defaultTitle, defaultMessage } = params;
  const actor = actorName || 'A team member';
  const titleText = entityTitle || (entityCode ? `[${entityCode}]` : 'item');

  switch (eventType) {
    case 'STATUS_CHANGED': {
      const newStatus = formatReadableStatus(extraPayload.newStatus || extraPayload.status || '');
      return {
        title: entityTitle,
        message: `${actor} changed status of '${titleText}' to ${newStatus}`,
      };
    }
    case 'SIGNED_OFF': {
      return {
        title: entityTitle,
        message: `${actor} approved '${titleText}' and marked as Done`,
      };
    }
    case 'REVIEW_SUBMITTED': {
      return {
        title: entityTitle,
        message: `${actor} submitted '${titleText}' for review`,
      };
    }
    case 'REOPENED': {
      const newStatus = formatReadableStatus(extraPayload.newStatus || 'To Do');
      return {
        title: entityTitle,
        message: `${actor} reopened '${titleText}' and set to ${newStatus}`,
      };
    }
    case 'ASSIGNED':
    case 'REASSIGNED': {
      return {
        title: entityTitle,
        message: `${actor} assigned '${titleText}' to you`,
      };
    }
    case 'DUE_DATE_CHANGED': {
      const dueDate = extraPayload.dueDate || extraPayload.newDueDate || 'new date';
      return {
        title: entityTitle,
        message: `${actor} updated due date of '${titleText}' to ${dueDate}`,
      };
    }
    case 'CHECKLIST_COMPLETED':
    case 'SUBTASK_COMPLETED': {
      const itemText = extraPayload.checklistText || extraPayload.subtaskText;
      return {
        title: entityTitle,
        message: itemText
          ? `${actor} completed checklist item '${itemText}' on '${titleText}'`
          : `${actor} completed all checklist items on '${titleText}'`,
      };
    }
    case 'SUBTASK_ADDED': {
      const itemText = extraPayload.checklistText || extraPayload.subtaskText || 'subtask';
      return {
        title: entityTitle,
        message: `${actor} added checklist item '${itemText}' to '${titleText}'`,
      };
    }
    case 'COMMENT_ADDED': {
      const preview = extraPayload.commentPreview || extraPayload.content || '';
      return {
        title: entityTitle,
        message: preview
          ? `${actor} commented on '${titleText}': "${preview.length > 80 ? preview.slice(0, 77) + '...' : preview}"`
          : `${actor} posted a comment on '${titleText}'`,
      };
    }
    case 'CREATED':
    case 'INITIATIVE_ASSIGNED':
    case 'EPIC_ASSIGNED':
    case 'PROJECT_ASSIGNED': {
      if (['INITIATIVE', 'EPIC', 'PROJECT'].includes(entityType)) {
        const typeLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase();
        return {
          title: entityTitle,
          message: `New ${typeLabel} '${titleText}' created by ${actor}`,
        };
      }
      return {
        title: entityTitle,
        message: `${actor} assigned '${titleText}' to you`,
      };
    }
    default: {
      return {
        title: defaultTitle || entityTitle,
        message: defaultMessage || `${actor} updated '${titleText}'`,
      };
    }
  }
}

/**
 * Dispatches targeted notifications to stakeholders.
 * Guarantees:
 * - Real SQL query check (DB-backed idempotency guard 15s) BEFORE inserting.
 * - Invariant: actor is NEVER in the recipient set.
 * - Invariant: Admin accounts receive alerts on INITIATIVE/EPIC/PROJECT, but NEVER for TASK/SPRINT.
 */
export async function dispatchNotification(params: DispatchParams): Promise<void> {
  setImmediate(async () => {
    try {
      const { entity, actorUserId, eventType, title, message, extraPayload = {} } = params;

      // 1. Resolve actor display name
      let resolvedActorName = params.actorName;
      if (!resolvedActorName && actorUserId) {
        try {
          const [actorRow] = await db
            .select({
              name: sql<string>`COALESCE(NULLIF(TRIM(CONCAT(${employees.firstName}, ' ', ${employees.lastName})), ''), ${employees.firstName}, ${users.email})`,
            })
            .from(users)
            .leftJoin(employees, eq(employees.id, users.employeeId))
            .where(eq(users.id, actorUserId))
            .limit(1);
          resolvedActorName = actorRow?.name || 'A team member';
        } catch {
          resolvedActorName = 'A team member';
        }
      }

      // 2. Resolve Admin users for high-level entities (Initiative / Epic / Project)
      let adminUserIds: string[] = [];
      if (['INITIATIVE', 'EPIC', 'PROJECT'].includes(entity.entityType)) {
        try {
          const adminRows = await db
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.role, 'ADMIN'), eq(users.status, 'ACTIVE')));
          adminUserIds = adminRows.map((r) => r.id);
        } catch (adminErr) {
          console.error('[RESOLVE ADMIN USERS ERROR]:', adminErr);
        }
      }

      // 3. Resolve all employeeIds → canonical users.id values
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
        adminUserIds,
      };

      // 4. Pure ID-based recipient routing (actor always excluded inside getRecipients)
      const { recipientUserIds, removedAssigneeUserIds } = getRecipients(
        stakeholders,
        actorUserId,
        eventType
      );

      const notifType = `${entity.entityType}_${eventType}`;

      // 5. Build standardized plain-language title and message
      const formatted = formatPlainLanguageNotification({
        actorName: resolvedActorName || 'A team member',
        eventType,
        entityType: entity.entityType,
        entityTitle: entity.title,
        entityCode: entity.entityCode,
        extraPayload,
        defaultTitle: title,
        defaultMessage: message,
      });

      const insertRows: any[] = [];
      const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);

      // 6. DB-BACKED IDEMPOTENCY GUARD: Real SQL check for each recipient BEFORE inserting
      // Collect flight keys for any recipient involved in this dispatch
      const flightKeys: string[] = [];
      for (const rId of recipientUserIds) {
        if (rId) flightKeys.push(`${entity.entityId}_${rId}_${notifType}`);
      }
      for (const remId of removedAssigneeUserIds) {
        if (remId) flightKeys.push(`${entity.entityId}_${remId}_${entity.entityType}_REMOVED`);
      }

      // If a concurrent dispatch targeting the same keys is already running, await it so our SQL check sees its committed row
      for (const key of flightKeys) {
        const existingFlight = inFlightDispatches.get(key);
        if (existingFlight) {
          try {
            await existingFlight;
          } catch {}
        }
      }

      // Register this execution as in-flight
      let releaseFlight!: () => void;
      const currentFlight = new Promise<void>((resolve) => {
        releaseFlight = resolve;
      });
      for (const key of flightKeys) {
        inFlightDispatches.set(key, currentFlight);
      }

      try {
        for (const recipientId of recipientUserIds) {
          if (!recipientId) continue;

          try {
            // Actual database SQL query checking PostgreSQL notifications table directly
            const [existingRecent] = await db
              .select({ id: notifications.id })
              .from(notifications)
              .where(
                and(
                  eq(notifications.userId, recipientId),
                  eq(notifications.type, notifType),
                  sql`payload->>'entityId' = ${entity.entityId}`,
                  sql`${notifications.createdAt} >= NOW() - INTERVAL '15 seconds'`
                )
              )
              .limit(1);

            if (existingRecent) {
              console.log(
                `[DISPATCH DEDUPLICATED (DB GUARD)]: SQL matched existing recent notification (${existingRecent.id}) for user ${recipientId} on ${notifType} (${entity.entityId}) within 15s — skipping duplicate insert.`
              );
              continue;
            }
          } catch (dbGuardErr) {
            console.warn('[DB IDEMPOTENCY GUARD QUERY WARNING]:', dbGuardErr);
          }

          insertRows.push({
            userId: recipientId,
            type: notifType,
            payload: {
              title: formatted.title,
              message: formatted.message,
              entityType: entity.entityType,
              entityId: entity.entityId,
              taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
              taskCode: entity.entityCode,
              taskTitle: entity.title,
              eventType,
              actorUserId,
              actorName: resolvedActorName || 'A team member',
              ...extraPayload,
            },
          });
        }

        // 7. Removal notices for unassigned stakeholders on REASSIGNED events
        if (eventType === 'REASSIGNED' && removedAssigneeUserIds.length > 0) {
          for (const removedId of removedAssigneeUserIds) {
            if (!removedId) continue;

            // Check DB guard for removal notices as well
            const [existingRecentRem] = await db
              .select({ id: notifications.id })
              .from(notifications)
              .where(
                and(
                  eq(notifications.userId, removedId),
                  eq(notifications.type, `${entity.entityType}_REMOVED`),
                  sql`payload->>'entityId' = ${entity.entityId}`,
                  sql`${notifications.createdAt} >= NOW() - INTERVAL '15 seconds'`
                )
              )
              .limit(1);

            if (existingRecentRem) continue;

            insertRows.push({
              userId: removedId,
              type: `${entity.entityType}_REMOVED`,
              payload: {
                title: entity.title,
                message: `${resolvedActorName || 'A team member'} unassigned you from '${entity.title}'`,
                entityType: entity.entityType,
                entityId: entity.entityId,
                taskId: entity.entityType === 'TASK' ? entity.entityId : undefined,
                taskCode: entity.entityCode,
                taskTitle: entity.title,
                eventType: 'REASSIGNED',
                actorUserId,
                actorName: resolvedActorName || 'A team member',
                ...extraPayload,
              },
            });
          }
        }

        // 8. Batch insert all rows atomically & prune per-user
        if (insertRows.length > 0) {
          await db.insert(notifications).values(insertRows);
          for (const r of recipientUserIds) {
            if (r) pruneNotificationsForUser(r).catch(() => {});
          }
          for (const rem of removedAssigneeUserIds) {
            if (rem) pruneNotificationsForUser(rem).catch(() => {});
          }
          console.log(
            `[DISPATCH] ${eventType} on ${entity.entityType}[${entity.entityCode || entity.entityId}] ` +
            `by "${resolvedActorName}" → inserted ${insertRows.length} rows for: [${insertRows.map(r => r.userId).join(', ')}] ` +
            `(actor ${actorUserId} excluded)`
          );
        } else {
          console.log(
            `[DISPATCH] ${eventType} on ${entity.entityType}[${entity.entityCode || entity.entityId}] ` +
            `by "${resolvedActorName}" → no new rows inserted (deduplicated by DB guard or no non-actor recipients)`
          );
        }
      } finally {
        releaseFlight();
        for (const key of flightKeys) {
          if (inFlightDispatches.get(key) === currentFlight) {
            inFlightDispatches.delete(key);
          }
        }
      }
    } catch (err) {
      console.error('[DISPATCH FAILED (non-blocking)]:', err);
    }
  });
}

