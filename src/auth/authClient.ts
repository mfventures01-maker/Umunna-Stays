/**
 * authClient.ts — Centralized Supabase Auth Client
 *
 * ALL identity operations in the application must flow through this module.
 * No component may call supabase.auth directly.
 */

export { supabase } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import type { Session, User, AuthError } from '@supabase/supabase-js';

export interface SignInResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignOutResult {
  error: AuthError | null;
}

/** Sign in with email + password. Returns session or error. Never throws. */
export const signIn = async (
  email: string,
  password: string
): Promise<SignInResult> => {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: { message: 'Auth not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' } as AuthError,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    error: error ?? null,
  };
};

/** Sign out the current user. */
export const signOut = async (): Promise<SignOutResult> => {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error: error ?? null };
};

/** Sign up a new user with metadata. */
export const signUp = async (
  email: string,
  password: string,
  metadata: any = {}
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
  if (!supabase) return { user: null, session: null, error: { message: 'Auth not configured' } as AuthError };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    error: error ?? null
  };
};

/** Return the current active session, or null. */
export const getSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};

/** Return the currently authenticated user, or null. */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};

/** Trigger a session refresh. Returns new session or null. */
export const refreshSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.refreshSession();
  return data.session ?? null;
};

/** Subscribe to auth state changes. Returns the unsubscribe function. */
export const onAuthStateChange = (
  callback: (session: Session | null) => void
): (() => void) => {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ?? null);
  });
  return () => subscription.unsubscribe();
};
