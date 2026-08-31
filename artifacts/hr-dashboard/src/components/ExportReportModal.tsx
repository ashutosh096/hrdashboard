import React from 'react';
import { X, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = (format: 'csv' | 'pdf') => {
    window.open(`/api/reports/sprint-summary?format=${format}`, '_blank');
    toast.success(`Exporting sprint summary report as ${format.toUpperCase()}...`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 className="font-bold text-gray-900">Export Sprint Summary Report</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Download executive deliverable status and throughput metrics for EHM and CliAgro entities.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => handleDownload('csv')}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 font-semibold text-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Export as CSV Spreadsheet</span>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 font-semibold text-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Export Executive Summary (PDF)</span>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
