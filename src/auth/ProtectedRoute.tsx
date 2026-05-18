/**
 * ProtectedRoute.tsx — Route Protection Gate
 *
 * Wraps any route that requires authentication and/or a minimum role.
 *
 * Behavior:
 *  - While auth is loading → renders a loading gate (prevents hydration flicker)
 *  - If unauthenticated → redirects to /secure-admin-login
 *  - If authenticated but insufficient role → redirects to /
 *  - If authorized → renders children
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasRole, type Role } from './permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Minimum role required to access this route. Defaults to 'viewer'. */
  requiredRole?: Role;
}

const LoadingGate: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">
        Verifying identity…
      </p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'viewer',
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // Phase 1: Auth not yet resolved — show loading gate, never render the page
  if (loading) {
    return <LoadingGate />;
  }

  // Phase 2: No authenticated user — redirect to login preserving intended destination
  if (!user) {
    return (
      <Navigate
        to="/secure-admin-login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Phase 3: Authenticated but insufficient role
  if (!hasRole(role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // Phase 4: Fully authorized — render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
