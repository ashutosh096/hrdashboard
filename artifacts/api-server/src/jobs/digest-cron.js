import { sendDigestEmail } from '../services/email.js';
export function startDigestCron() {
    console.log('[PG_CRON JOB] Initializing daily digest notification trigger...');
    // Simulating daily digest trigger
    setTimeout(async () => {
        console.log('[PG_CRON JOB] Triggering daily task digest emails via Resend...');
        await sendDigestEmail('admin@example.com', 'Admin User', 3);
    }, 10000);
}
