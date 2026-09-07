import { db, googleTokens } from '@workspace/db';
import { pullGoogleCalendarEvents } from '../services/calendar-sync.js';

export function startSyncCron() {
  console.log('[CALENDAR SYNC CRON] Initializing background Google Calendar sync job (every 1 minute)...');

  // Run once on server startup
  runSyncAllUsers();

  // Run every 5 minutes
  setInterval(runSyncAllUsers, 5 * 60 * 1000);
}

async function runSyncAllUsers() {
  try {
    const tokens = await db.select({ userId: googleTokens.userId }).from(googleTokens);
    for (const tokenRow of tokens) {
      try {
        await pullGoogleCalendarEvents(tokenRow.userId);
      } catch (userErr) {
        console.error(`[CALENDAR SYNC CRON ERROR] Failed for user ${tokenRow.userId}:`, userErr);
      }
    }
  } catch (err) {
    console.error('[CALENDAR SYNC CRON FETCH ERROR]:', err);
  }
}
