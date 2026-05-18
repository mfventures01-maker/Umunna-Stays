/**
 * AdminShield.tsx — Floating Admin Access Icon
 *
 * Renders a floating shield icon that navigates to the admin login.
 * Dead modal state and dead handler have been removed.
 * Only shown to non-authenticated users (authenticated users already have admin nav).
 */

import React from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/auth/AuthProvider';

const AdminShield: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide shield if user is already authenticated (redundant nav)
  if (user) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 group cursor-pointer"
      onClick={() => navigate('/secure-admin-login')}
      title="Admin Access"
      aria-label="Admin login"
    >
      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors">
        <Shield className="w-5 h-5 text-slate-500 group-hover:text-[#C46210] transition-colors" />
      </div>
      <div className="absolute right-12 bottom-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        Admin Access
      </div>
    </div>
  );
};

export default AdminShield;
