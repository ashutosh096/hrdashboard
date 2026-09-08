import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export const LoginView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('expired') === 'true') {
      toast.error('Session expired. Please sign in again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      setLocation('/');
    } catch (err: any) {
      console.error('[LOGIN ERROR]:', err);
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background Wallpaper Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/login-bg.jpg')` }}
      ></div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 pointer-events-none"></div>

      {/* Glassmorphism Login Card */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/35 rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-[0_0_90px_rgba(16,185,129,0.25)] relative z-10 space-y-6">
        
        {/* Company Badge Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">EHM-Climagro OS</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wide mt-1">
              EHM Consultancy & Climagro Analytics
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
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

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info('Password reset feature ready.'); }} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
