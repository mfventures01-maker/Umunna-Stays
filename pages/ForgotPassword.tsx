/**
 * ForgotPassword.tsx — Password Reset Request Page
 *
 * FLOW:
 *  1. User enters email
 *  2. supabase.auth.resetPasswordForEmail() sends reset link
 *  3. Link redirects to app's /set-password route
 *  4. User sets new password via SetPassword.tsx
 *
 * SECURITY CONTRACT:
 *  - Never reveals whether email exists in system
 *  - Redirect URL is hardcoded to production domain
 *  - noindex meta injected for this route
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from '../src/auth/authClient';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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

    setError(null);
    setSubmitting(true);

    try {
      const result = await sendPasswordResetEmail(email.trim());

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state — email sent
  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[32px] shadow-2xl p-10 border border-slate-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                Check Your Email
              </h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2">
                If an account exists for <strong className="text-slate-700">{email}</strong>,
                you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-slate-400 mb-8">
                The link will redirect you back to this app to set your new password.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Send Another Email
                </button>
                <button
                  onClick={() => navigate('/secure-admin-login')}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-2xl p-10 border border-slate-100">

          {/* Back button */}
          <button
            onClick={() => navigate('/secure-admin-login')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl">
              <Mail className="w-8 h-8 text-[#C46210]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-2">
              Enter your admin email and we'll send you a reset link
            </p>
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
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="forgot-password-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C46210]/30 focus:border-[#C46210] disabled:opacity-50 transition-all"
                  placeholder="admin@umunnastays.com.ng"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="forgot-password-submit"
              disabled={submitting || !email}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-300 space-y-1">
            <p>Reset link delivered via Supabase Auth</p>
            <p>Password set entirely inside this app</p>
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

export default ForgotPassword;
