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
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      logAuthTransition('GET_SESSION_ERROR', { error: error.message });
      return null;
    }
    return data?.session ?? null;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      logAuthTransition('GET_SESSION_ABORT_CAUGHT', { message: err.message });
      return null;
    }
    logAuthTransition('GET_SESSION_UNEXPECTED_ERROR', { error: String(err) });
    return null;
  }
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

// ─── Observability & Logger ──────────────────────────────────────────────────

export const logAuthTransition = (
  transition: string,
  details: Record<string, any> = {}
) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[AUTH_OBSERVABILITY] [${timestamp}] Transition: ${transition} | Details:`,
    JSON.stringify(details, null, 2)
  );
};

// ─── Auth Lifecycle Methods (Password Reset / Set / Exchange) ───────────────

export const CANONICAL_DOMAIN = "https://umunnastays.com.ng";

/**
 * Canonical redirect builder.
 * Guarantees zero-drift redirect URLs across execution contexts.
 * Explicitly allows localhost for development builds only.
 */
export const buildRedirect = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Normalize www context away at the builder level
    if (hostname.startsWith('www.')) {
      const canonicalHostname = hostname.replace('www.', '');
      logAuthTransition('DOMAIN_NORMALIZATION_BUILDER', {
        original: window.location.href,
        target: `${window.location.protocol}//${canonicalHostname}${cleanPath}`
      });
      return `${window.location.protocol}//${canonicalHostname}${cleanPath}`;
    }
    // Explicit localhost dev handling
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const localRedirect = `${window.location.origin}${cleanPath}`;
      logAuthTransition('REDIRECT_BUILD_DEV', { path, target: localRedirect });
      return localRedirect;
    }
  }
  const target = `${CANONICAL_DOMAIN}${cleanPath}`;
  logAuthTransition('REDIRECT_BUILD_CANONICAL', { path, target });
  return target;
};

/**
 * Send a password reset email with deep-link return to /set-password.
 * The email will contain a link that routes the user back into the app.
 */
export const sendPasswordResetEmail = async (
  email: string
): Promise<{ error: string | null }> => {
  if (!supabase) {
    logAuthTransition('PASSWORD_RESET_FAIL', { email, reason: 'SUPABASE_NOT_CONFIGURED' });
    return { error: 'Auth not configured' };
  }

  const redirectUrl = buildRedirect('/set-password');
  logAuthTransition('PASSWORD_RESET_REQUEST', { email, redirectUrl });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    logAuthTransition('PASSWORD_RESET_FAIL', { email, error: error.message });
  } else {
    logAuthTransition('PASSWORD_RESET_SENT', { email });
  }

  return { error: error?.message ?? null };
};

/**
 * Update the current user's password.
 * Requires an active session (set by email link callback or login).
 */
export const updateUserPassword = async (
  newPassword: string
): Promise<{ error: string | null }> => {
  if (!supabase) {
    logAuthTransition('UPDATE_PASSWORD_FAIL', { reason: 'SUPABASE_NOT_CONFIGURED' });
    return { error: 'Auth not configured' };
  }

  logAuthTransition('UPDATE_PASSWORD_REQUEST');
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    logAuthTransition('UPDATE_PASSWORD_FAIL', { error: error.message });
  } else {
    logAuthTransition('UPDATE_PASSWORD_SUCCESS');
  }

  return { error: error?.message ?? null };
};

/**
 * Exchange a PKCE authorization code for a session.
 * Used for OAuth callbacks and magic link flows.
 */
export const exchangeCode = async (
  code: string
): Promise<{ error: string | null }> => {
  if (!supabase) {
    logAuthTransition('EXCHANGE_CODE_FAIL', { reason: 'SUPABASE_NOT_CONFIGURED' });
    return { error: 'Auth not configured' };
  }

  logAuthTransition('EXCHANGE_CODE_REQUEST', { codeLength: code.length });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logAuthTransition('EXCHANGE_CODE_FAIL', { error: error.message });
  } else {
    logAuthTransition('EXCHANGE_CODE_SUCCESS');
  }

  return { error: error?.message ?? null };
};
