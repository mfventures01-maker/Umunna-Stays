/**
 * session.ts — Session Utilities
 *
 * Role resolution, profile hydration, and session inspection helpers.
 * All role data is resolved from the Supabase `profiles` table — never client-side.
 */

import { supabase } from '../lib/supabaseClient';
import type { Role } from './permissions';

export interface AdminProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  avatar_url: string | null;
}

const DEFAULT_ROLE: Role = 'viewer';

/**
 * Fetch the role and profile for a given Supabase user ID.
 * Falls back to 'viewer' if the profile row does not exist.
 */
export const fetchAdminProfile = async (
  userId: string
): Promise<AdminProfile | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('[session] Profile not found for user:', userId);
      return null;
    }

    return {
      id: data.id,
      email: data.email ?? null,
      full_name: data.full_name ?? null,
      role: (data.role as Role) ?? DEFAULT_ROLE,
      avatar_url: data.avatar_url ?? null,
    };
  } catch (err) {
    console.error('[session] fetchAdminProfile error:', err);
    return null;
  }
};

/**
 * Determine if a JWT session is considered active (not expired).
 * Supabase tokens include `expires_at` as a Unix timestamp.
 */
export const isSessionActive = (expiresAt: number | undefined): boolean => {
  if (!expiresAt) return false;
  // Give a 60-second buffer before expiry
  return Date.now() / 1000 < expiresAt - 60;
};
