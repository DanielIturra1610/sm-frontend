'use client';

/**
 * RBAC React Components
 * Components for conditional rendering based on permissions
 */

import { type ReactNode } from 'react';
import { useHasRole, useHasAnyRole, useHasPermission, useHasAnyPermission } from './hooks';
import type { RoleType } from './roles';
import type { PermissionType } from './permissions';

interface PermissionGuardProps {
  /** Permission required to render children */
  permission?: PermissionType;
  /** Any of these permissions allows rendering */
  anyPermission?: PermissionType[];
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback content when user lacks permission */
  fallback?: ReactNode;
}

/**
 * Guard component that only renders children if user has required permission
 */
export function PermissionGuard({
  permission,
  anyPermission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const hasSinglePermission = useHasPermission(permission || ('' as PermissionType));
  const hasAnyPerm = useHasAnyPermission(anyPermission || []);

  // If permission is specified, check it
  if (permission && !hasSinglePermission) {
    return <>{fallback}</>;
  }

  // If anyPermission is specified, check if user has any of them
  if (anyPermission && anyPermission.length > 0 && !hasAnyPerm) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  /** Role required to render children */
  role?: RoleType;
  /** Any of these roles allows rendering */
  anyRole?: RoleType[];
  /** Content to render if user has role */
  children: ReactNode;
  /** Optional fallback content when user lacks role */
  fallback?: ReactNode;
}

/**
 * Guard component that only renders children if user has required role
 */
export function RoleGuard({ role, anyRole, children, fallback = null }: RoleGuardProps) {
  const hasSingleRole = useHasRole(role || ('' as RoleType));
  const hasAny = useHasAnyRole(anyRole || []);

  // If role is specified, check it
  if (role && !hasSingleRole) {
    return <>{fallback}</>;
  }

  // If anyRole is specified, check if user has any of them
  if (anyRole && anyRole.length > 0 && !hasAny) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Convenience component for admin-only content
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard role="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface SupervisorOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Convenience component for supervisor and above content
 */
export function SupervisorOnly({ children, fallback = null }: SupervisorOnlyProps) {
  return (
    <RoleGuard role="supervisor" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface CanApproveProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Convenience component for users who can approve reports
 */
export function CanApprove({ children, fallback = null }: CanApproveProps) {
  return (
    <PermissionGuard permission="report:approve" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

interface CanDeleteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Convenience component for users who can delete incidents
 */
export function CanDelete({ children, fallback = null }: CanDeleteProps) {
  return (
    <PermissionGuard permission="incident:delete" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
