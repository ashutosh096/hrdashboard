/**
 * calendar-token-cron.ts
 *
 * Runs once on boot and then every 24 hours.
 * Checks for Google OAuth tokens that are about to expire without a refresh token,
 * and sends a CALENDAR_RECONNECT notification to the affected user.
 *
 * NOTE: The overdue task alert cron that previously lived here has been permanently
 * removed. "Task Due / Overdue Warning" notifications are no longer generated anywhere
 * in this codebase.
 */

import { db, notifications, googleTokens, users, eq, and, lt, gte, sql } from '@workspace/db';
import { sendCalendarReconnectEmail } from '../services/email.js';
import { insertNotification } from '../services/notificationService.js';

export function startOverdueCheckCron() {
  console.log('[CALENDAR TOKEN CRON] Initializing daily calendar token expiry check...');
  // Run once on startup, then every 24 hours
  runCalendarTokenChecks();
  setInterval(runCalendarTokenChecks, 24 * 60 * 60 * 1000);
}

export async function runOverdueAndTokenChecks() {
  // Backward-compat alias — overdue logic has been removed.
  return runCalendarTokenChecks();
}

async function runCalendarTokenChecks() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Google Token Expiry: alert only when no refreshToken is available to auto-renew
  try {
    const future24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiringTokens = await db
      .select()
      .from(googleTokens)
      .where(
        and(
          sql`(${googleTokens.refreshToken} IS NULL OR ${googleTokens.refreshToken} = '')`,
          lt(googleTokens.expiry, future24h)
        )
      );

    for (const tokenRow of expiringTokens) {
      // De-duplicate: skip if we already sent a CALENDAR_RECONNECT in the last 24 h
      const recentNotifs = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, tokenRow.userId),
            eq(notifications.type, 'CALENDAR_RECONNECT'),
            gte(notifications.createdAt, last24h)
          )
        );

      if (recentNotifs.length === 0) {
        const [targetUser] = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.id, tokenRow.userId))
          .limit(1);

        if (targetUser) {
          await insertNotification({
            userId: targetUser.id,
            type: 'CALENDAR_RECONNECT',
            payload: {
              title: 'Action Required: Reconnect Google Calendar',
              message:
                'Your Google Calendar integration requires manual reconnection in Settings to continue syncing meetings.',
            },
          });

          await sendCalendarReconnectEmail(targetUser.email, targetUser.email);
        }
      }
    }
  } catch (err) {
    console.error('[CALENDAR TOKEN CRON ERROR]:', err);
  }
}
