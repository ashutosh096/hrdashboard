import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';

export const AcceptInviteView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { setUserSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getQueryOrHashParam = (paramName: string): string => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromSearch = searchParams.get(paramName);
    if (fromSearch) return fromSearch;

    if (window.location.hash) {
      const hashStr = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(hashStr);
      const fromHash = hashParams.get(paramName);
      if (fromHash) return fromHash;
    }
    return '';
  };

  const token = getQueryOrHashParam('token');
  const emailParam = getQueryOrHashParam('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match! Please enter identical passwords in both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchApi<{ token: string; user: any }>('/api/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ token, email: email.trim(), password }),
      });

      setUserSession(res.user, res.token);
      toast.success('Account activated & password set successfully! Welcome to HROS.');
      setLocation('/');
    } catch (err: any) {
      console.error('[SET-PASSWORD ERROR]:', err);
      toast.error(err.message || 'Invalid, expired, or already-used invite token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background Wallpaper Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/login-bg.jpg')` }}
      ></div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 pointer-events-none"></div>

      {/* Glassmorphism Invitation Setup Card */}
      <div className="bg-slate-900/70 backdrop-blur-2xl border border-emerald-500/35 rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-[0_0_90px_rgba(16,185,129,0.25)] relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            <ShieldCheck className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Activate Your HROS Account</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wide mt-1">
              EHM & CLIMAGRO Enterprise OS
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Enter your registered email and set a password to activate account.
            </p>
          </div>
        </div>

        {/* Password Setup Form */}
        <form onSubmit={handleSetPassword} className="space-y-4">
          
          {/* Registered Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Registered Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Re-enter password to match"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-slate-950/80 border focus:ring-2 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500/80 focus:border-red-400 focus:ring-red-500/20'
                    : confirmPassword && password === confirmPassword
                    ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/20'
                    : 'border-slate-700/80 focus:border-emerald-400 focus:ring-emerald-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-red-400 font-semibold mt-1">
                ⚠️ Passwords do not match.
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Passwords match!</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Activating Account & Setting Password...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Activate Account & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back to Main Login */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setLocation('/');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
          >
            Already activated? Go to Main Sign In
          </a>
        </div>
      </div>
    </div>
  );
};
