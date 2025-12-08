'use client';

/**
 * RBAC React Hooks
 * Hooks for using role-based access control in React components
 */

import { useMemo } from 'react';
import { useAuth } from '@/shared/contexts/auth-context';
import { hasRole, hasAnyRole, type RoleType } from './roles';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  type PermissionType,
} from './permissions';

/**
 * Hook to get the current user's role
 */
export function useUserRole(): RoleType | undefined {
  const { user } = useAuth();
  return user?.role as RoleType | undefined;
}

/**
 * Hook to check if current user has a specific role
 */
export function useHasRole(requiredRole: RoleType): boolean {
  const userRole = useUserRole();
  return useMemo(() => hasRole(userRole, requiredRole), [userRole, requiredRole]);
}

/**
 * Hook to check if current user has any of the required roles
 */
export function useHasAnyRole(requiredRoles: RoleType[]): boolean {
  const userRole = useUserRole();
  return useMemo(() => hasAnyRole(userRole, requiredRoles), [userRole, requiredRoles]);
}

/**
 * Hook to check if current user has a specific permission
 */
export function useHasPermission(permission: PermissionType): boolean {
  const userRole = useUserRole();
  return useMemo(() => hasPermission(userRole, permission), [userRole, permission]);
}

/**
 * Hook to check if current user has any of the required permissions
 */
export function useHasAnyPermission(permissions: PermissionType[]): boolean {
  const userRole = useUserRole();
  return useMemo(() => hasAnyPermission(userRole, permissions), [userRole, permissions]);
}

/**
 * Hook to check if current user has all of the required permissions
 */
export function useHasAllPermissions(permissions: PermissionType[]): boolean {
  const userRole = useUserRole();
  return useMemo(() => hasAllPermissions(userRole, permissions), [userRole, permissions]);
}

/**
 * Hook to get all permissions for the current user
 */
export function usePermissions(): PermissionType[] {
  const userRole = useUserRole();
  return useMemo(() => getPermissions(userRole), [userRole]);
}

/**
 * Hook that returns multiple permission checks at once
 * Useful for components that need to check several permissions
 */
export function usePermissionChecks<T extends Record<string, PermissionType>>(
  permissionMap: T
): Record<keyof T, boolean> {
  const userRole = useUserRole();

  return useMemo(() => {
    const result = {} as Record<keyof T, boolean>;
    for (const [key, permission] of Object.entries(permissionMap)) {
      result[key as keyof T] = hasPermission(userRole, permission);
    }
    return result;
  }, [userRole, permissionMap]);
}

/**
 * Hook for checking multiple roles/permissions with detailed results
 */
export function useRBAC() {
  const userRole = useUserRole();
  const permissions = useMemo(() => getPermissions(userRole), [userRole]);

  return useMemo(
    () => ({
      role: userRole,
      permissions,
      hasRole: (role: RoleType) => hasRole(userRole, role),
      hasAnyRole: (roles: RoleType[]) => hasAnyRole(userRole, roles),
      hasPermission: (permission: PermissionType) => hasPermission(userRole, permission),
      hasAnyPermission: (perms: PermissionType[]) => hasAnyPermission(userRole, perms),
      hasAllPermissions: (perms: PermissionType[]) => hasAllPermissions(userRole, perms),
      // Quick checks for common roles
      isOwner: userRole === 'owner',
      isAdmin: hasRole(userRole, 'admin'),
      isSupervisor: hasRole(userRole, 'supervisor'),
      isInvestigator: hasRole(userRole, 'investigator'),
      isOperator: hasRole(userRole, 'operator'),
      isViewer: userRole === 'viewer',
      // Quick checks for common permissions
      canApproveReports: hasPermission(userRole, 'report:approve'),
      canDeleteIncidents: hasPermission(userRole, 'incident:delete'),
      canManageUsers: hasPermission(userRole, 'user:invite'),
      canConfigureSystem: hasPermission(userRole, 'system:config'),
    }),
    [userRole, permissions]
  );
}
