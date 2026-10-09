import React, { useState, useEffect } from 'react';
import {
  Chrome,
  Shield,
  CheckCircle2,
  Download,
  Database,
  Clock,
  Lock,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { TableSkeleton } from '../components/Skeletons';

interface BackupHistoryItem {
  id: string;
  filename: string;
  fileSizeBytes: number;
  triggerType: 'MANUAL' | 'CRON';
  status: 'SUCCESS' | 'FAILED';
  verificationResult: {
    sheetName: string;
    expectedRows: number;
    actualRows: number;
    match: boolean;
  }[];
  errorMessage?: string;
  createdAt: string;
}

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isExporting, setIsExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch backup history if admin
  const fetchHistory = async () => {
    if (!isAdmin) return;
    try {
      setIsLoadingHistory(true);
      const token = localStorage.getItem('hros_token');
      const res = await fetch('/api/backup/history', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.records || []);
      }
    } catch (err) {
      console.error('[SETTINGS] Failed to load backup history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchHistory();
    }
  }, [isAdmin]);

  const handleConnectGoogle = () => {
    const returnPath = encodeURIComponent(window.location.pathname || '/settings');
    if (user?.id) {
      window.location.href = `/api/auth/google?userId=${user.id}&returnPath=${returnPath}`;
    } else {
      window.location.href = `/api/auth/google?returnPath=${returnPath}`;
    }
  };

  // Download live backup
  const handleDownloadLiveBackup = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('hros_token');
      const res = await fetch('/api/backup/export', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        let errMessage = 'Failed to generate enterprise backup';
        try {
          const errData = await res.json();
          errMessage = errData.message || errMessage;
        } catch {
          errMessage = `Server returned status ${res.status}: ${res.statusText}`;
        }
        toast.error(errMessage);
        return;
      }

      // Extract filename from header if present
      const disposition = res.headers.get('content-disposition');
      let filename = 'HIVE_Enterprise_Backup.xlsx';
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        'Enterprise backup downloaded successfully. The password to open the file is configured in your system environment settings.'
      );
      // Refresh history list
      fetchHistory();
    } catch (err: any) {
      console.error('[BACKUP EXPORT ERROR]:', err);
      toast.error(err?.message || 'Network error while downloading backup');
    } finally {
      setIsExporting(false);
    }
  };

  // Download historical backup
  const handleDownloadArchived = async (item: BackupHistoryItem) => {
    try {
      setDownloadingId(item.id);
      const token = localStorage.getItem('hros_token');
      const res = await fetch(`/api/backup/download/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        let errMessage = 'Failed to download archived backup';
        try {
          const errData = await res.json();
          errMessage = errData.message || errMessage;
        } catch {
          errMessage = `Server error ${res.status}`;
        }
        toast.error(errMessage);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        'Archived backup downloaded successfully. The password to open the file is configured in your system environment settings.'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download archived backup');
    } finally {
      setDownloadingId(null);
    }
  };

  const lastBackup = history.length > 0 ? history[0] : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Settings & Integrations</h2>
        <p className="text-xs text-gray-500 font-medium">
          Enterprise database archival, Google Calendar OAuth sync, security, and account preferences.
        </p>
      </div>

      {/* Admin-Only Enterprise Data Backup & Archival */}
      {isAdmin && (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/80">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">Enterprise Data Backup & Archival</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Complete snapshot of Initiatives, Epics, Projects, Sprints, Tasks, and Attendance.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadLiveBackup}
              disabled={isExporting}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                isExporting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Generating Encrypted Excel...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Live Master Backup (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          {/* Automated 48-Hour Backup Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Automated Schedule</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-gray-900">48-Hour Auto Sync Active</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Updates live master Excel & archives snapshot every 48h.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Storage Retention</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">1 Master + Max 3 Snapshots</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Prevents month-end clutter while guaranteeing rollback safety.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last System Backup</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                  {lastBackup ? new Date(lastBackup.createdAt).toLocaleString() : 'No backups yet recorded'}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {lastBackup
                    ? `Trigger: ${lastBackup.triggerType} (${(lastBackup.fileSizeBytes / 1024).toFixed(1)} KB)`
                    : 'Download or await scheduled run'}
                </p>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Backup History & Audit Log ({history.length} Saved)</span>
              </h4>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                Rolling 3-Backup Retention Active (Zero Storage Clutter)
              </span>
            </div>

            {isLoadingHistory && history.length === 0 ? (
              <TableSkeleton rows={3} columns={4} />
            ) : history.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Database className="w-6 h-6 text-gray-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-gray-700">No backup records yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Click "Download Live Backup" above to generate your first verified snapshot.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200/90">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Backup File</th>
                      <th className="py-2.5 px-3">Trigger</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Verification Integrity</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {history.map((item) => {
                      const allMatched =
                        Array.isArray(item.verificationResult) &&
                        item.verificationResult.length > 0 &&
                        item.verificationResult.every((v) => v.match);

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-gray-900 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-mono text-[11px]">{item.filename}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.triggerType === 'MANUAL'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {item.triggerType === 'MANUAL' ? 'Manual Export' : '48h Auto Cron'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                            {(item.fileSizeBytes / 1024).toFixed(1)} KB
                          </td>
                          <td className="py-2.5 px-3">
                            {allMatched ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>All 7 Sheets Verified (100% Match)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Discrepancy Detected</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDownloadArchived(item)}
                              disabled={downloadingId === item.id}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              {downloadingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Calendar & Meet OAuth Sync */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Chrome className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Google Calendar & Meet OAuth Sync</h3>
              <p className="text-xs text-gray-400 font-medium">
                Per-user OAuth 2.0 token storage encrypted at rest with AES-256.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Connect Google Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
