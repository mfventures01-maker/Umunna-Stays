/**
 * permissions.ts — Deterministic Role & Permission Engine
 *
 * ALL authority decisions must flow through this module.
 * No scattered `if (role === 'admin')` checks in components.
 *
 * Role Hierarchy (highest to lowest):
 *   super_admin > admin > editor > writer > viewer
 */

export type Role = 'super_admin' | 'admin' | 'editor' | 'writer' | 'viewer';

export type Permission =
  | 'access:admin_dashboard'
  | 'access:blog_cms'
  | 'access:seo_analytics'
  | 'access:gmb_sync'
  | 'access:gsc_settings'
  | 'access:internal_linking'
  | 'blog:create'
  | 'blog:publish'
  | 'blog:delete'
  | 'blog:edit'
  | 'blog:view_drafts';

/** Numeric rank for role comparison (higher = more authority). */
const ROLE_RANK: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  writer: 40,
  viewer: 20,
};

/** Minimum role required for each permission (inherited by higher roles). */
const PERMISSION_GATE: Record<Permission, Role> = {
  'access:admin_dashboard': 'viewer',
  'access:blog_cms': 'writer',
  'access:seo_analytics': 'editor',
  'access:gmb_sync': 'admin',
  'access:gsc_settings': 'admin',
  'access:internal_linking': 'editor',
  'blog:create': 'writer',
  'blog:edit': 'editor',
  'blog:view_drafts': 'writer',
  'blog:publish': 'editor',
  'blog:delete': 'admin',
};

/**
 * Returns true if the given role has the specified permission.
 * Uses inheritance: higher roles inherit all lower permissions.
 */
export const hasPermission = (
  role: Role | null | undefined,
  permission: Permission
): boolean => {
  if (!role) return false;
  const userRank = ROLE_RANK[role] ?? 0;
  const requiredRole = PERMISSION_GATE[permission];
  const requiredRank = ROLE_RANK[requiredRole] ?? Infinity;
  return userRank >= requiredRank;
};

/**
 * Returns true if the given role meets or exceeds the required role.
 */
export const hasRole = (
  userRole: Role | null | undefined,
  requiredRole: Role
): boolean => {
  if (!userRole) return false;
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[requiredRole] ?? Infinity);
};

/**
 * Throws an error if the user does not have the required permission.
 * Use in data mutation handlers (server actions, form submits).
 */
export const requirePermission = (
  role: Role | null | undefined,
  permission: Permission,
  context = ''
): void => {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `[AUTH] Permission denied: "${permission}" requires role "${PERMISSION_GATE[permission]}". ${
        context ? `Context: ${context}` : ''
      }`
    );
  }
};

/** Returns the list of all permissions granted to a role. */
export const getGrantedPermissions = (role: Role): Permission[] => {
  return (Object.keys(PERMISSION_GATE) as Permission[]).filter((p) =>
    hasPermission(role, p)
  );
};
