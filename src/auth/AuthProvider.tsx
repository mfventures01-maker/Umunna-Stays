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
} from './authClient';
import { fetchAdminProfile, type AdminProfile } from './session';
import type { Role } from './permissions';
import AuthModal from '../../components/auth/AuthModal';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role | null;
  profile: AdminProfile | null;
  loading: boolean;
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

  /** Hydrate role/profile after a valid session is established. */
  const hydrateProfile = useCallback(async (userId: string) => {
    const p = await fetchAdminProfile(userId);
    setProfile(p);
    setRole(p?.role ?? 'viewer');
  }, []);

  /** Apply a resolved session to state. */
  const applySession = useCallback(
    async (sess: Session | null) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await hydrateProfile(sess.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
    },
    [hydrateProfile]
  );

  // ── Bootstrap: restore session from storage on mount ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const sess = await getSession();
      if (!cancelled) {
        await applySession(sess);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  // ── Live: listen for auth state changes ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
        await applySession(sess);
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

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
      const result = await authSignIn(email, password);
      if (!result.error) {
        await applySession(result.session);
      }
      return { error: result.error?.message || null };
    },
    [applySession]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      const result = await authSignUp(email, password, {
        full_name: fullName,
        phone: phone,
      });
      
      if (!result.error && result.session) {
        await applySession(result.session);
      }
      return { error: result.error?.message || null };
    },
    [applySession]
  );

  const signOutUser = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    role,
    profile,
    loading,
    favorites,
    signIn,
    signUp,
    signOut: signOutUser,
    toggleFavorite,
    openAuthModal,
    closeAuthModal,
  }), [user, session, role, profile, loading, favorites, signIn, signUp, signOutUser, toggleFavorite, openAuthModal, closeAuthModal]);

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
