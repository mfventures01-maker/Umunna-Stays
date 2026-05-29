/**
 * ProtectedRoute.tsx — Admin Route Protection Layer
 *
 * SECURITY CONTRACT:
 *  - Uses AuthProvider as SINGLE SOURCE OF TRUTH
 *  - Role resolved from `profiles` table — NEVER from user_metadata
 *  - Blocks unauthorized access at routing level
 *  - Survives page refresh (AuthProvider re-hydrates session)
 *  - Cannot be bypassed via URL manipulation
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'super_admin',
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // ── Still hydrating session/profile — show loading spinner ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">
            Verifying identity…
          </p>
        </div>
      </div>
    );
  }

  // ── No authenticated user → redirect to login ──
  if (!user) {
    return (
      <Navigate
        to="/secure-admin-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ── User exists but role doesn't match → redirect to login ──
  if (role !== requiredRole) {
    return (
      <Navigate
        to="/secure-admin-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ── Authorized — render children ──
  return <>{children}</>;
};

export default ProtectedRoute;
