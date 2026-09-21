import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [, setLocation] = useLocation();
  const { setUserSession } = useAuth();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-login auth payload after successful reset
  const [authPayload, setAuthPayload] = useState<{ user: any; token: string } | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize email when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep('EMAIL');
      setOtpDigits(['', '', '', '', '', '']);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setAuthPayload(null);
    }
  }, [isOpen, initialEmail]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first OTP input when reaching OTP step
  useEffect(() => {
    if (step === 'OTP' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Auto-redirect timer on success
  useEffect(() => {
    if (step === 'SUCCESS') {
      const redirectTimer = setTimeout(() => {
        handleFinalRedirect();
      }, 2500);
      return () => clearTimeout(redirectTimer);
    }
  }, [step, authPayload]);

  if (!isOpen) return null;

  // Password Validation Checklist Rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordFormValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  // Step 1: Send OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await fetchApi<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      });

      toast.success('Verification code sent to your email.');
      setStep('OTP');
      setCountdown(60);
    } catch (err: any) {
      console.error('[FORGOT PASSWORD REQUEST ERROR]:', err);
      // Fallback message to prevent user enumeration
      toast.success('Verification code sent if email is registered.');
      setStep('OTP');
      setCountdown(60);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    await handleRequestOtp();
  };

  // OTP Input Changes
  const handleOtpChange = (index: number, val: string) => {
    const value = val.replace(/[^0-9]/g, '');
    if (!value) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Single digit input
    const singleDigit = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (index < 5 && singleDigit) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const newDigits = [...otpDigits];
    digits.forEach((digit, i) => {
      if (i < 6) newDigits[i] = digit;
    });
    setOtpDigits(newDigits);

    const focusIndex = Math.min(digits.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchApi<{ resetToken: string; message: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });

      if (res && res.resetToken) {
        setResetToken(res.resetToken);
        toast.success('Code verified successfully!');
        setStep('PASSWORD');
      } else {
        setErrorMessage('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      console.error('[VERIFY OTP ERROR]:', err);
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordFormValid) {
      setErrorMessage('Please meet all password requirements before continuing.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetchApi<{ token: string; user: any; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          newPassword,
        }),
      });

      if (res && res.token && res.user) {
        setAuthPayload({ user: res.user, token: res.token });
      }

      toast.success('Password updated successfully!');
      setStep('SUCCESS');
    } catch (err: any) {
      console.error('[RESET PASSWORD ERROR]:', err);
      setErrorMessage(err.message || 'Failed to update password. Session may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Final Action: Complete Login & Redirect
  const handleFinalRedirect = () => {
    if (authPayload) {
      setUserSession(authPayload.user, authPayload.token);
      onClose();
      setLocation('/');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 shadow-[0_0_60px_rgba(16,185,129,0.15)] rounded-3xl max-w-md w-full p-6 sm:p-8 relative text-white overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            {step === 'SUCCESS' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : step === 'PASSWORD' ? (
              <Lock className="w-5 h-5 text-emerald-400" />
            ) : (
              <KeyRound className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {step === 'EMAIL' && 'Forgot Password'}
              {step === 'OTP' && 'Verify Code'}
              {step === 'PASSWORD' && 'Set New Password'}
              {step === 'SUCCESS' && 'Password Reset Complete'}
            </h2>
            <p className="text-xs text-slate-400">
              {step === 'EMAIL' && 'Enter your registered email to receive an OTP code'}
              {step === 'OTP' && 'Enter the 6-digit code sent to your email'}
              {step === 'PASSWORD' && 'Create a secure new password for your account'}
              {step === 'SUCCESS' && 'Your credentials have been securely updated'}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 'EMAIL' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
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
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <span className="text-xs text-slate-400">Sent code to </span>
              <span className="text-xs font-semibold text-emerald-400">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('EMAIL'); setErrorMessage(null); }}
                className="ml-2 text-xs text-slate-400 hover:text-white underline"
              >
                Change
              </button>
            </div>

            {/* 6 Digit Segmented Inputs */}
            <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl text-emerald-400 outline-none transition-all"
                />
              ))}
            </div>

            {/* Countdown & Resend Option */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Code expires in 10 minutes</span>
              {countdown > 0 ? (
                <span className="text-slate-500 font-mono">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend code</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep('EMAIL'); setErrorMessage(null); }}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading || otpDigits.some((d) => !d)}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Password Reset Form */}
        {step === 'PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
                  autoFocus
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Dynamic Password Validation Checklist */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>At least 8 characters long</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Contains at least 1 uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Contains at least 1 number</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordFormValid}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Update Password & Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 'SUCCESS' && (
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-slate-300">
                You have successfully reset your password. You are being redirected to your dashboard...
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinalRedirect}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Go to Dashboard Now</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
