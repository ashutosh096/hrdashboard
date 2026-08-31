import React from 'react';
import { Chrome, Shield, Bell, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Settings & Integrations</h2>
        <p className="text-xs text-gray-500 font-medium">Google Calendar OAuth sync, security, and account preferences.</p>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Chrome className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Google Calendar & Meet OAuth Sync</h3>
              <p className="text-xs text-gray-400 font-medium">Per-user OAuth 2.0 token storage encrypted at rest with AES-256.</p>
            </div>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Connected (Sync Active)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
