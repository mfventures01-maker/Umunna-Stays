/**
 * AuthProvider.tsx — Deterministic Identity Kernel (Upgraded)
 *
 * This is the SINGLE SOURCE OF IDENTITY TRUTH for the application.
 * All auth state, including favorites and modal orchestration, is managed here.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  getSession,
  onAuthStateChange,
  supabase,
  logAuthTransition,
  buildRedirect,
} from './authClient';
import { fetchAdminProfile, type AdminProfile } from './session';
import type { Role } from './permissions';
import AuthModal from '../../components/auth/AuthModal';

// ─── Auth Status Gate ─────────────────────────────────────────────────────────

export const AUTH_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  UNAUTHENTICATED: 'unauthenticated',
} as const;

export type AuthStatus = typeof AUTH_STATUS[keyof typeof AUTH_STATUS];

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role | null;
  profile: AdminProfile | null;
  loading: boolean;
  authStatus: AuthStatus;
  favorites: string[];
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AUTH_STATUS.LOADING);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('umunna_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State
  const [modalState, setModalState] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({
    isOpen: false,
    view: 'login',
  });

  const openAuthModal = useCallback((view: 'login' | 'signup' = 'login') => {
    setModalState({ isOpen: true, view });
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalState(s => ({ ...s, isOpen: false }));
  }, []);

  /** Hydrate role/profile after a valid session is established. Includes a 3-pass retry policy. */
  const hydrateProfileAndRole = useCallback(async (userId: string): Promise<{ profile: AdminProfile | null; role: Role | null }> => {
    let fetchedProfile: AdminProfile | null = null;
    let retries = 3;
    let delayMs = 1000;

    logAuthTransition('PROFILE_HYDRATION_START', { userId });

    while (retries > 0) {
      try {
        fetchedProfile = await fetchAdminProfile(userId);
        if (fetchedProfile) {
          logAuthTransition('PROFILE_HYDRATION_SUCCESS', { userId, role: fetchedProfile.role });
          return { profile: fetchedProfile, role: fetchedProfile.role };
        }
      } catch (err) {
        logAuthTransition('PROFILE_HYDRATION_RETRY_ERROR', { userId, retriesLeft: retries - 1, error: String(err) });
      }
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // Exponential backoff
      }
    }

    logAuthTransition('PROFILE_HYDRATION_FAILED_ALL_RETRIES', { userId });
    return { profile: null, role: null };
  }, []);

  /** Sequence: Hydrate session -> Fetch Profile -> Resolve Role -> Set AUTH_STATUS */
  const runDeterministicAuthSequence = useCallback(
    async (sess: Session | null) => {
      if (sess?.user) {
        const { profile: prof, role: r } = await hydrateProfileAndRole(sess.user.id);
        
        setSession(sess);
        setUser(sess.user);

        if (prof) {
          setProfile(prof);
          setRole(r);
          setAuthStatus(AUTH_STATUS.READY);
          logAuthTransition('AUTH_STATE_READY', { userId: sess.user.id, role: r });
        } else {
          // Failure isolation model: Profile failure -> retry, NOT logout. Default to guest viewer.
          const fallbackProfile: AdminProfile = {
            id: sess.user.id,
            email: sess.user.email ?? null,
            full_name: null,
            role: 'viewer',
            avatar_url: null,
          };
          setProfile(fallbackProfile);
          setRole('viewer');
          setAuthStatus(AUTH_STATUS.READY);
          logAuthTransition('AUTH_STATE_READY_FALLBACK', { userId: sess.user.id, role: 'viewer' });
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        logAuthTransition('AUTH_STATE_UNAUTHENTICATED');
      }
      setLoading(false);
    },
    [hydrateProfileAndRole]
  );

  // ── Bootstrap: Restore session from storage on mount ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          // Absolute Domain Rule: Normalize www context away instantly
          if (hostname.startsWith('www.')) {
            const canonicalHostname = hostname.replace('www.', '');
            const newUrl = `${window.location.protocol}//${canonicalHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
            logAuthTransition('DOMAIN_NORMALIZATION_BOOTSTRAP_REDIRECT', { original: window.location.href, target: newUrl });
            window.location.replace(newUrl);
            return;
          }

          // Intercept PKCE codes before session hydration
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          if (code && supabase) {
            logAuthTransition('CODE_EXCHANGE_BOOTSTRAP_START', { codeLength: code.length });
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              logAuthTransition('CODE_EXCHANGE_BOOTSTRAP_ERROR', { error: error.message });
              // Clean URL to prevent infinite reload loops
              url.searchParams.delete('code');
              window.history.replaceState({}, '', url.toString());
              if (!cancelled) {
                setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
                setLoading(false);
              }
              return;
            }
            logAuthTransition('CODE_EXCHANGE_BOOTSTRAP_SUCCESS');
            // Clean code parameter
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url.toString());
          }
        }

        const sess = await getSession();
        if (!cancelled) {
          await runDeterministicAuthSequence(sess);
        }
      } catch (err) {
        logAuthTransition('BOOTSTRAP_FATAL_ERROR', { error: String(err) });
        if (!cancelled) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [runDeterministicAuthSequence]);

  // ── Live: listen for auth state changes ──
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      logAuthTransition('AUTH_EVENT_DETECTED', { event });

      // Handle PASSWORD_RECOVERY event
      if (event === 'PASSWORD_RECOVERY') {
        logAuthTransition('PASSWORD_RECOVERY_EVENT_ROUTING');
        // Hydrate session state immediately
        await runDeterministicAuthSequence(sess);
        // Clean navigation with buildRedirect
        const targetRedirect = buildRedirect('/set-password');
        logAuthTransition('PASSWORD_RECOVERY_REDIRECT_EXECUTE', { target: targetRedirect });
        window.location.href = targetRedirect;
        return;
      }

      // Handle signout explicitly
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        setLoading(false);
        return;
      }

      await runDeterministicAuthSequence(sess);
    });

    return () => subscription.unsubscribe();
  }, [runDeterministicAuthSequence]);

  // ── Favorites Management ──
  useEffect(() => {
    localStorage.setItem('umunna_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId) 
        : [...prev, propertyId]
    );
  }, []);

  // ─── Public Methods ─────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string) => {
      logAuthTransition('SIGNIN_METHOD_CALL', { email });
      const result = await authSignIn(email, password);
      if (!result.error) {
        logAuthTransition('SIGNIN_METHOD_SUCCESS');
        await runDeterministicAuthSequence(result.session);
      } else {
        logAuthTransition('SIGNIN_METHOD_ERROR', { error: result.error.message });
      }
      return { error: result.error?.message || null };
    },
    [runDeterministicAuthSequence]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      logAuthTransition('SIGNUP_METHOD_CALL', { email });
      const result = await authSignUp(email, password, {
        full_name: fullName,
        phone: phone,
      });
      
      if (!result.error && result.session) {
        logAuthTransition('SIGNUP_METHOD_SUCCESS');
        await runDeterministicAuthSequence(result.session);
      } else if (result.error) {
        logAuthTransition('SIGNUP_METHOD_ERROR', { error: result.error.message });
      }
      return { error: result.error?.message || null };
    },
    [runDeterministicAuthSequence]
  );

  const signOutUser = useCallback(async () => {
    logAuthTransition('SIGNOUT_METHOD_CALL');
    await authSignOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
    logAuthTransition('SIGNOUT_METHOD_COMPLETED');
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    role,
    profile,
    loading,
    authStatus,
    favorites,
    signIn,
    signUp,
    signOut: signOutUser,
    toggleFavorite,
    openAuthModal,
    closeAuthModal,
  }), [user, session, role, profile, loading, authStatus, favorites, signIn, signUp, signOutUser, toggleFavorite, openAuthModal, closeAuthModal]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal 
        isOpen={modalState.isOpen} 
        onClose={closeAuthModal} 
        initialView={modalState.view} 
        
      />
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};
