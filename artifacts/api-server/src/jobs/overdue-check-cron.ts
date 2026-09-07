import { db, tasks, employees, users, notifications, googleTokens, eq, and, ne, lt, lte, gt, gte, sql } from '@workspace/db';
import { sendOverdueTaskAlertEmail, sendCalendarReconnectEmail } from '../services/email.js';

export function startOverdueCheckCron() {
  console.log('[OVERDUE & TOKEN CRON] Initializing daily task overdue and calendar token expiry check...');

  // Run once on server startup
  runOverdueAndTokenChecks();

  // Run once every 24 hours
  setInterval(runOverdueAndTokenChecks, 24 * 60 * 60 * 1000);
}

async function runOverdueAndTokenChecks() {
  const now = new Date();
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 1. Overdue Task Alert Check
  try {
    const overdueTasks = await db
      .select()
      .from(tasks)
      .where(and(lt(tasks.dueDate, now), ne(tasks.status, 'DONE')));

    for (const task of overdueTasks) {
      const daysOverdue = Math.max(1, Math.ceil((now.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)));

      // Resolve assignee name
      let assigneeName = 'Employee';
      const [assigneeEmp] = await db.select().from(employees).where(eq(employees.id, task.assigneeId));
      if (assigneeEmp) {
        assigneeName = `${assigneeEmp.firstName || ''} ${assigneeEmp.lastName || ''}`.trim();
      }

      // Priority Order Recipient Lookup:
      // a. reviewingLeadId -> user
      // b. creatorId -> user
      // c. fallback ADMIN
      let recipientUser: any = null;

      if (task.reviewingLeadId) {
        const [leadUser] = await db.select().from(users).where(eq(users.employeeId, task.reviewingLeadId));
        if (leadUser) recipientUser = leadUser;
      }

      if (!recipientUser && task.creatorId) {
        const [creatorUser] = await db.select().from(users).where(eq(users.employeeId, task.creatorId));
        if (creatorUser) recipientUser = creatorUser;
      }

      if (!recipientUser) {
        console.warn(`[OVERDUE CRON WARNING] Fallback to default ADMIN user for task ${task.taskCode}`);
        const [fallbackAdmin] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
        recipientUser = fallbackAdmin;
      }

      if (recipientUser) {
        // Skip duplicate spam if a TASK_OVERDUE notification for this exact taskId was created in last 24h
        const recentNotifs = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, recipientUser.id),
              eq(notifications.type, 'TASK_OVERDUE'),
              gte(notifications.createdAt, last24h)
            )
          );

        const alreadySent = recentNotifs.some(n => (n.payload as any)?.taskId === task.id);

        if (!alreadySent) {
          await db.insert(notifications).values({
            userId: recipientUser.id,
            type: 'TASK_OVERDUE',
            payload: {
              taskId: task.id,
              taskCode: task.taskCode,
              taskTitle: task.title,
              assigneeName,
              daysOverdue,
            },
          });

          await sendOverdueTaskAlertEmail(
            recipientUser.email,
            'Manager',
            task.taskCode,
            task.title,
            assigneeName,
            daysOverdue
          );
        }
      }
    }
  } catch (err) {
    console.error('[OVERDUE CRON ERROR]:', err);
  }

  // 2. Google Token Expiry Reminder Check (Next 24 Hours)
  try {
    const future24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiringTokens = await db
      .select()
      .from(googleTokens)
      .where(and(gt(googleTokens.expiry, now), lt(googleTokens.expiry, future24h)));

    for (const tokenRow of expiringTokens) {
      const recentNotifs = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, tokenRow.userId),
            eq(notifications.type, 'CALENDAR_RECONNECT'),
            gte(notifications.createdAt, last24h)
          )
        );

      if (recentNotifs.length === 0) {
        const [targetUser] = await db.select().from(users).where(eq(users.id, tokenRow.userId));
        if (targetUser) {
          await db.insert(notifications).values({
            userId: targetUser.id,
            type: 'CALENDAR_RECONNECT',
            payload: {
              message: 'Your Google Calendar OAuth integration token will expire within 24 hours. Please reconnect in Settings.',
            },
          });

          await sendCalendarReconnectEmail(targetUser.email, targetUser.email);
        }
      }
    }
  } catch (err) {
    console.error('[TOKEN EXPIRY CRON ERROR]:', err);
  }
}
