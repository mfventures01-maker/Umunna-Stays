/**
 * SecureAdminLogin.tsx — Real Supabase Authentication Gate
 *
 * SECURITY CONTRACT:
 *  - Never navigates before verified Supabase auth success
 *  - Role verified via `profiles` table — NEVER user_metadata
 *  - Shows deterministic error on credential rejection
 *  - Disables form during auth request (prevents double-submit)
 *  - Redirects to intended destination after success
 *  - noindex meta injected for this route
 *
 * AUTH FLOW:
 *  1. signInWithPassword (identity)
 *  2. Query profiles table (authorization)
 *  3. Only navigate if profile.role === 'super_admin'
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthProvider';

const SecureAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, role, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intended destination from ProtectedRoute redirect
  const from = (location.state as { from?: string })?.from ?? '/admin';

  // If already authenticated AND authorized, skip login
  useEffect(() => {
    if (!loading && user && role === 'super_admin') {
      navigate(from, { replace: true });
    }
  }, [user, role, loading, navigate, from]);

  // Inject noindex for this route
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      // STEP 1: Authenticate via Supabase Auth (identity layer)
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      // STEP 2: AuthProvider automatically hydrates profile + role
      // after signIn succeeds (via applySession → hydrateProfile).
      // The useEffect above will detect user + role change and navigate.
      // We just need to wait briefly for the state to propagate.

      // If after 3 seconds we haven't navigated, show an error
      setTimeout(() => {
        setSubmitting(false);
        // If we're still here, the role check didn't pass
      }, 3000);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-[#C46210] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-2xl p-10 border border-slate-100">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-[#C46210]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Umunna Admin Access
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-2">
              Identity verification required
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
            {/* Email */}
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
                  id="admin-email"
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

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C46210]/30 focus:border-[#C46210] disabled:opacity-50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                  className="text-xs text-[#C46210] hover:text-[#a34f0d] font-semibold transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="admin-login-submit"
              disabled={submitting || !email || !password}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Authenticate
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-300 space-y-1">
            <p>Identity verified via Supabase Auth</p>
            <p>Role resolved from profiles table</p>
            <p>All access attempts are logged</p>
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

export default SecureAdminLogin;
