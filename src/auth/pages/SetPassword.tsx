/**
 * SetPassword.tsx — Unified Password Setup Page
 *
 * HANDLES:
 *  1. Initial password setup after admin invite
 *  2. Password reset after "forgot password" email
 *
 * SECURITY CONTRACT:
 *  - Requires active Supabase session (set by email link callback)
 *  - Uses supabase.auth.updateUser({ password }) — NOT resetPasswordForEmail
 *  - Validates password strength before submission
 *  - Redirects to /admin on success
 *  - Redirects to /secure-admin-login if no session detected
 *
 * DESIGN PRINCIPLE:
 *  - All password management is in-app — zero Supabase dashboard dependency
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { updateUserPassword } from '../authClient';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const validatePassword = (pw: string): PasswordValidation => ({
  minLength: pw.length >= 8,
  hasUppercase: /[A-Z]/.test(pw),
  hasLowercase: /[a-z]/.test(pw),
  hasNumber: /[0-9]/.test(pw),
  hasSpecial: /[^A-Za-z0-9]/.test(pw),
});

const isPasswordValid = (v: PasswordValidation): boolean =>
  v.minLength && v.hasUppercase && v.hasLowercase && v.hasNumber;

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authStatus } = useAuth();
  const authLoading = authStatus === 'loading';

  const flow = (location.state as { flow?: string })?.flow ?? 'reset';
  const isInviteFlow = flow === 'invite';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  // Inject noindex
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate
    if (!isPasswordValid(validation)) {
      setError('Password does not meet the minimum requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const result = await updateUserPassword(password);

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      setSuccess(true);

      // Redirect to admin after brief success message
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#C46210] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  // No session state — Hard Block Screen (No silent fallback/redirect)
  if (!user || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 animate-pulse" />
          <h2 className="text-white text-xl font-bold">Session Invalid or Expired</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Your password reset link is invalid or has expired. For security reasons, you cannot set a password without a valid active session.
          </p>
          <button
            onClick={() => navigate('/secure-admin-login', { replace: true })}
            className="mt-4 px-6 py-3 bg-[#C46210] hover:bg-[#A8510D] text-white rounded-xl font-bold text-sm transition-colors"
          >
            Return to Secure Login
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-white text-xl font-bold">Password Updated</h2>
          <p className="text-slate-400 text-sm">
            Redirecting to admin dashboard…
          </p>
        </div>
      </div>
    );
  }

  const ValidationItem: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? 'text-emerald-500' : 'text-slate-400'}`}>
      <CheckCircle2 size={12} className={met ? 'text-emerald-500' : 'text-slate-300'} />
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-2xl p-10 border border-slate-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl">
              <KeyRound className="w-8 h-8 text-[#C46210]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isInviteFlow ? 'Set Your Admin Password' : 'Reset Password'}
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-2">
              {isInviteFlow
                ? 'Create a secure password for your admin account'
                : 'Enter your new password below'}
            </p>
            {user?.email && (
              <p className="text-xs text-slate-300 font-mono mt-2">{user.email}</p>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-6 text-sm font-medium">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="set-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C46210]/30 focus:border-[#C46210] disabled:opacity-50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <ValidationItem met={validation.minLength} label="8+ characters" />
                <ValidationItem met={validation.hasUppercase} label="Uppercase" />
                <ValidationItem met={validation.hasLowercase} label="Lowercase" />
                <ValidationItem met={validation.hasNumber} label="Number" />
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C46210]/30 focus:border-[#C46210] disabled:opacity-50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 font-medium mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="set-password-submit"
              disabled={submitting || !isPasswordValid(validation) || !passwordsMatch}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  {isInviteFlow ? 'Set Password & Continue' : 'Update Password'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-300 space-y-1">
            <p>Password secured via Supabase Auth</p>
            <p>No dashboard dependency — fully in-app</p>
          </div>
        </div>

        {/* Brand mark */}
        <div className="text-center mt-6">
          <span className="text-xs text-slate-600 font-bold tracking-widest uppercase">
            Umunna Stays — Admin Portal
          </span>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
