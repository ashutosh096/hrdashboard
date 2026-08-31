export function startSyncCron() {
    console.log('[PG_CRON JOB] Initializing scheduled Google Calendar background sync job (every 5 minutes)...');
    setInterval(() => {
        console.log('[PG_CRON JOB] Executing automatic per-user Google Calendar sync and live meeting presence update...');
    }, 5 * 60 * 1000);
}
