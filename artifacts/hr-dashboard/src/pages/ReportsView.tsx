import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ExportReportModal } from '../components/ExportReportModal';
import { useEntity } from '../contexts/EntityContext';

export const ReportsView: React.FC = () => {
  const { selectedEntity } = useEntity();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-gray-500 font-medium">Exportable weekly/sprint summary reports per entity and department.</p>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Sprint Summary (CSV/PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileSpreadsheet className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">Sprint Task Throughput Report</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium">Detailed deliverable status, assigned leads, and completion dates for {selectedEntity}.</p>
          <button
            onClick={() => window.open('/api/reports/sprint-summary?format=csv', '_blank')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Download CSV Spreadsheet →
          </button>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">Executive Performance Summary</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium">Cross-entity attendance percentages, active meetings, and sprint health overview.</p>
          <button
            onClick={() => window.open('/api/reports/sprint-summary?format=pdf', '_blank')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Download PDF Executive Summary →
          </button>
        </div>
      </div>

      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
};
