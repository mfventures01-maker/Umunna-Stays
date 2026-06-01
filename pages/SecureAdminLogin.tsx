/**
 * SecureAdminLogin.tsx — Admin Shield Login (Stable Gate)
 *
 * RULE:
 * - AuthProvider resolves session + role
 * - This file ONLY decides access AFTER signIn completes
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const SecureAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, role, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/admin';

  // Auto redirect if already authenticated
  useEffect(() => {
    if (!loading && user && role === 'super_admin') {
      navigate(from, { replace: true });
    }
  }, [user, role, loading, navigate, from]);

  // Noindex for security
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
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      // SIMPLE GATE — no polling, no timeout, no guessing
      if (role === 'super_admin') {
        navigate('/admin', { replace: true });
        return;
      }

      setError('Access denied: super admin only');
      setSubmitting(false);

    } catch {
      setError('Authentication failed');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-slate-900 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="text-[#C46210]" />
          </div>
          <h1 className="text-xl font-bold">Admin Access</h1>
          <p className="text-sm text-slate-500">Secure CMS Login</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold"
          >
            {submitting ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-slate-400 mt-6">
          Super admin only access
        </p>
      </div>
    </div>
  );
};

export default SecureAdminLogin;