import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';

import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  getSession,
  supabase,
  logAuthTransition,
} from './authClient';

import { fetchAdminProfile, AdminProfile } from './session';
import type { Role } from './permissions';

// ─────────────────────────────────────
// AUTH STATUS
// ─────────────────────────────────────
export const AUTH_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  UNAUTHENTICATED: 'unauthenticated',
} as const;

export type AuthStatus =
  typeof AUTH_STATUS[keyof typeof AUTH_STATUS];

// ─────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────
interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role | null;
  profile: AdminProfile | null;
  loading: boolean;
  authStatus: AuthStatus;

  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    AUTH_STATUS.LOADING
  );

  // ─────────────────────────────────────
  // PROFILE HYDRATION (SOURCE OF TRUTH)
  // ─────────────────────────────────────
  const hydrateProfile = useCallback(async (userId: string) => {
    logAuthTransition('PROFILE_HYDRATION_START', { userId });

    const profile = await fetchAdminProfile(userId);

    if (!profile) {
      logAuthTransition('PROFILE_HYDRATION_FAILED', { userId });

      return {
        profile: null,
        role: null,
      };
    }

    logAuthTransition('PROFILE_HYDRATION_SUCCESS', {
      userId,
      role: profile.role,
    });

    return {
      profile,
      role: profile.role,
    };
  }, []);

  // ─────────────────────────────────────
  // AUTH STATE RESOLUTION
  // ─────────────────────────────────────
  const resolveSession = useCallback(
    async (sess: Session | null) => {
      if (!sess?.user) {
        setUser(null);
        setSession(null);
        setRole(null);
        setProfile(null);
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        setLoading(false);
        return;
      }

      const { profile, role } = await hydrateProfile(sess.user.id);

      setUser(sess.user);
      setSession(sess);

      // fallback safety (never break app)
      setProfile(
        profile ?? {
          id: sess.user.id,
          email: sess.user.email ?? null,
          full_name: null,
          role: 'viewer',
          avatar_url: null,
        }
      );

      setRole(role ?? 'viewer');

      setAuthStatus(AUTH_STATUS.READY);
      setLoading(false);

      logAuthTransition('AUTH_READY', {
        userId: sess.user.id,
        role: role ?? 'viewer',
      });
    },
    [hydrateProfile]
  );

  // ─────────────────────────────────────
  // BOOTSTRAP SESSION
  // ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      const sess = await getSession();
      await resolveSession(sess);
    })();
  }, [resolveSession]);

  // ─────────────────────────────────────
  // SUPABASE LIVE LISTENER
  // ─────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, sess) => {
        await resolveSession(sess);
      });

    return () => subscription.unsubscribe();
  }, [resolveSession]);

  // ─────────────────────────────────────
  // AUTH METHODS
  // ─────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);

    if (!result.error) {
      await resolveSession(result.session);
    }

    return { error: result.error?.message || null };
  }, [resolveSession]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      const result = await authSignUp(email, password, {
        full_name: fullName,
        phone,
      });

      if (!result.error && result.session) {
        await resolveSession(result.session);
      }

      return { error: result.error?.message || null };
    },
    [resolveSession]
  );

  const signOut = useCallback(async () => {
    await authSignOut();

    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);

    logAuthTransition('SIGNED_OUT');
  }, []);

  // ─────────────────────────────────────
  // MEMO CONTEXT VALUE
  // ─────────────────────────────────────
  const value = useMemo(
    () => ({
      user,
      session,
      role,
      profile,
      loading,
      authStatus,
      signIn,
      signOut,
      signUp,
    }),
    [user, session, role, profile, loading, authStatus, signIn, signOut, signUp]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────
// HOOK
// ─────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};