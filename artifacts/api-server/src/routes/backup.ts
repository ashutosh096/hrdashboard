import { Router, Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { requireAuth } from '../middleware/auth.js';
import { generateEnterpriseBackup } from '../services/backupService.js';
import { db, desc, eq } from '@workspace/db';
import { backupHistory } from '@workspace/db';

export const backupRouter = Router();

// =========================================================================
// 1. GET /api/backup/export (Manual Download - ADMIN ONLY)
// =========================================================================
backupRouter.get('/export', requireAuth, async (req: Request, res: Response) => {
  // Strict server-side ADMIN check
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only system Administrators can generate and download backups.',
    });
  }

  try {
    const result = await generateEnterpriseBackup('MANUAL');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${result.masterFilename || 'HIVE_Enterprise_Master_Backup.xlsx'}"`);
    res.setHeader('Content-Length', result.buffer.length);

    return res.send(result.buffer);
  } catch (err: any) {
    console.error('[BACKUP EXPORT ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to generate enterprise backup',
    });
  }
});

// =========================================================================
// 2. POST /api/backup/cron (Automated Scheduled Runner - CRON_SECRET ONLY)
// =========================================================================
backupRouter.post('/cron', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return res.status(500).json({
      success: false,
      message: 'CRON_SECRET environment variable is not configured on server.',
    });
  }

  if (!token || token !== expectedSecret) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid CRON_SECRET bearer token.',
    });
  }

  try {
    const result = await generateEnterpriseBackup('CRON');
    return res.status(200).json({
      success: true,
      filename: result.filename,
      filePath: result.filePath,
      fileSizeBytes: result.fileSizeBytes,
      verificationTable: result.verificationTable,
      legacyCodesDetected: result.legacyCodesDetected,
    });
  } catch (err: any) {
    console.error('[BACKUP CRON ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Automated cron backup execution failed',
    });
  }
});

// =========================================================================
// 3. GET /api/backup/history (View All Backup Audit Logs - ADMIN ONLY)
// =========================================================================
backupRouter.get('/history', requireAuth, async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only system Administrators can view backup history.',
    });
  }

  try {
    const records = await db
      .select()
      .from(backupHistory)
      .orderBy(desc(backupHistory.createdAt));

    return res.json({
      success: true,
      records,
    });
  } catch (err: any) {
    console.error('[BACKUP HISTORY FETCH ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to retrieve backup history',
    });
  }
});

// =========================================================================
// 4. GET /api/backup/download/:id (Download Archived Backup - ADMIN ONLY)
// =========================================================================
backupRouter.get('/download/:id', requireAuth, async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only system Administrators can download backups.',
    });
  }

  const id = String(req.params.id);
  try {
    const records = await db
      .select()
      .from(backupHistory)
      .where(eq(backupHistory.id, id))
      .limit(1);

    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup record not found.' });
    }

    const record = records[0];
    const fileExists = await fs
      .access(record.filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return res.status(404).json({
        success: false,
        message: 'The requested physical backup file is no longer present on server disk.',
      });
    }

    res.download(record.filePath, record.filename);
  } catch (err: any) {
    console.error('[BACKUP DOWNLOAD ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to download backup file',
    });
  }
});
