import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export const AcceptInviteView: React.FC = () => {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token') || 'demo-token';

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account activated successfully! Redirecting to Dashboard...');
    setTimeout(() => setLocation('/?welcome=true'), 1200);
  };

  const handleGoogleOAuth = () => {
    window.location.href = `/api/auth/google?inviteToken=${token}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Accept HROS Invite</h2>
          <p className="text-xs text-gray-500 font-medium">Complete account setup and optionally link your Google Calendar.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleOAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-sm font-bold text-gray-700 shadow-xs transition-all"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            <span>Continue with Google & Link Calendar</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400 font-semibold uppercase relative">Or set password</span>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Create Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Activate Account & Proceed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
