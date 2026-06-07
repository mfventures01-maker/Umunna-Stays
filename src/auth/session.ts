/**
 * session.ts — Session Utilities
 *
 * Role resolution, profile hydration, and session inspection helpers.
 * All role data is resolved from the Supabase `profiles` table.
 */

import { supabase } from '../lib/supabaseClient';
import type { Role } from './permissions';

export interface AdminProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
}

const DEFAULT_ROLE: Role = 'viewer';

/**
 * Fetch the role and profile for a given Supabase user ID.
 */
export const fetchAdminProfile = async (
  userId: string
): Promise<AdminProfile | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('[session] Profile not found for user:', userId);
      console.warn('[session] Supabase error:', error);
      return null;
    }

    return {
      id: data.id,
      full_name: data.full_name ?? null,
      phone: data.phone ?? null,
      role: (data.role as Role) ?? DEFAULT_ROLE,
    };
  } catch (err) {
    console.error('[session] fetchAdminProfile error:', err);
    return null;
  }
};

/**
 * Determine if a JWT session is considered active.
 */
export const isSessionActive = (
  expiresAt: number | undefined
): boolean => {
  if (!expiresAt) return false;

  // 60 second expiry buffer
  return Date.now() / 1000 < expiresAt - 60;
};