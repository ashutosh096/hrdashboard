import cron from 'node-cron';
import { generateEnterpriseBackup } from '../services/backupService.js';

export function startBackupCron() {
  console.log('⏰ [BACKUP CRON] Initializing 48-Hour Enterprise Backup Scheduler (0 0 */2 * *)...');

  // Schedule to run every 48 hours at midnight
  cron.schedule('0 0 */2 * *', async () => {
    console.log('⏰ [BACKUP CRON] Triggering automated 48-hour system backup routine...');
    try {
      const result = await generateEnterpriseBackup('CRON');
      console.log(`✅ [BACKUP CRON SUCCESS] Backup saved: ${result.filename} (${(result.fileSizeBytes / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error('❌ [BACKUP CRON ERROR]: Automated backup failed:', err?.message || err);
    }
  });

  console.log('✅ [BACKUP CRON] 48-Hour Enterprise Backup Scheduler is active.');
}
