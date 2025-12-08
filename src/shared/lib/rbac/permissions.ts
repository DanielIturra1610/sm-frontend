/**
 * Role-Based Access Control - Permissions
 * Mirrors the backend RBAC system
 */

import { Role, type RoleType } from './roles';

// Permission types
export const Permission = {
  // Incident permissions
  INCIDENT_CREATE: 'incident:create',
  INCIDENT_READ: 'incident:read',
  INCIDENT_UPDATE: 'incident:update',
  INCIDENT_DELETE: 'incident:delete',
  INCIDENT_ASSIGN: 'incident:assign',
  INCIDENT_CLOSE: 'incident:close',
  INCIDENT_EXPORT: 'incident:export',
  INCIDENT_VIEW_ALL: 'incident:view_all',

  // Report permissions
  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  REPORT_UPDATE: 'report:update',
  REPORT_DELETE: 'report:delete',
  REPORT_SUBMIT: 'report:submit',
  REPORT_APPROVE: 'report:approve',
  REPORT_REJECT: 'report:reject',
  REPORT_EXPORT: 'report:export',

  // Analysis permissions
  ANALYSIS_CREATE: 'analysis:create',
  ANALYSIS_READ: 'analysis:read',
  ANALYSIS_UPDATE: 'analysis:update',
  ANALYSIS_DELETE: 'analysis:delete',
  ANALYSIS_SUBMIT: 'analysis:submit',
  ANALYSIS_APPROVE: 'analysis:approve',
  ANALYSIS_REJECT: 'analysis:reject',

  // Workflow permissions
  WORKFLOW_CREATE: 'workflow:create',
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_DELETE: 'workflow:delete',
  WORKFLOW_ACTIVATE: 'workflow:activate',
  TASK_ASSIGN: 'task:assign',
  TASK_COMPLETE: 'task:complete',

  // User/Team permissions
  USER_INVITE: 'user:invite',
  USER_REMOVE: 'user:remove',
  USER_ROLE_UPDATE: 'user:role_update',
  USER_LIST: 'user:list',

  // System/Admin permissions
  SYSTEM_CONFIG: 'system:config',
  SLA_CONFIG: 'sla:config',
  BRANDING_CONFIG: 'branding:config',
  AUDIT_VIEW: 'audit:view',

  // Document permissions
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_GENERATE: 'document:generate',
  DOCUMENT_SIGN: 'document:sign',

  // Attachment permissions
  ATTACHMENT_UPLOAD: 'attachment:upload',
  ATTACHMENT_READ: 'attachment:read',
  ATTACHMENT_DELETE: 'attachment:delete',
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  [Role.OWNER]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE,
    Permission.INCIDENT_DELETE,
    Permission.INCIDENT_ASSIGN,
    Permission.INCIDENT_CLOSE,
    Permission.INCIDENT_EXPORT,
    Permission.INCIDENT_VIEW_ALL,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.REPORT_DELETE,
    Permission.REPORT_SUBMIT,
    Permission.REPORT_APPROVE,
    Permission.REPORT_REJECT,
    Permission.REPORT_EXPORT,
    Permission.ANALYSIS_CREATE,
    Permission.ANALYSIS_READ,
    Permission.ANALYSIS_UPDATE,
    Permission.ANALYSIS_DELETE,
    Permission.ANALYSIS_SUBMIT,
    Permission.ANALYSIS_APPROVE,
    Permission.ANALYSIS_REJECT,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_READ,
    Permission.WORKFLOW_UPDATE,
    Permission.WORKFLOW_DELETE,
    Permission.WORKFLOW_ACTIVATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_COMPLETE,
    Permission.USER_INVITE,
    Permission.USER_REMOVE,
    Permission.USER_ROLE_UPDATE,
    Permission.USER_LIST,
    Permission.SLA_CONFIG,
    Permission.BRANDING_CONFIG,
    Permission.AUDIT_VIEW,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_GENERATE,
    Permission.DOCUMENT_SIGN,
    Permission.ATTACHMENT_UPLOAD,
    Permission.ATTACHMENT_READ,
    Permission.ATTACHMENT_DELETE,
  ],
  [Role.SUPERVISOR]: [
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE,
    Permission.INCIDENT_ASSIGN,
    Permission.INCIDENT_CLOSE,
    Permission.INCIDENT_EXPORT,
    Permission.INCIDENT_VIEW_ALL,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.REPORT_SUBMIT,
    Permission.REPORT_APPROVE,
    Permission.REPORT_REJECT,
    Permission.REPORT_EXPORT,
    Permission.ANALYSIS_CREATE,
    Permission.ANALYSIS_READ,
    Permission.ANALYSIS_UPDATE,
    Permission.ANALYSIS_SUBMIT,
    Permission.ANALYSIS_APPROVE,
    Permission.ANALYSIS_REJECT,
    Permission.WORKFLOW_READ,
    Permission.TASK_ASSIGN,
    Permission.TASK_COMPLETE,
    Permission.USER_LIST,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_GENERATE,
    Permission.DOCUMENT_SIGN,
    Permission.ATTACHMENT_UPLOAD,
    Permission.ATTACHMENT_READ,
  ],
  [Role.INVESTIGATOR]: [
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE,
    Permission.INCIDENT_ASSIGN,
    Permission.INCIDENT_EXPORT,
    Permission.INCIDENT_VIEW_ALL,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.REPORT_SUBMIT,
    Permission.REPORT_EXPORT,
    Permission.ANALYSIS_CREATE,
    Permission.ANALYSIS_READ,
    Permission.ANALYSIS_UPDATE,
    Permission.ANALYSIS_SUBMIT,
    Permission.WORKFLOW_READ,
    Permission.TASK_COMPLETE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_GENERATE,
    Permission.ATTACHMENT_UPLOAD,
    Permission.ATTACHMENT_READ,
  ],
  [Role.OPERATOR]: [
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.REPORT_SUBMIT,
    Permission.WORKFLOW_READ,
    Permission.TASK_COMPLETE,
    Permission.DOCUMENT_READ,
    Permission.ATTACHMENT_UPLOAD,
    Permission.ATTACHMENT_READ,
  ],
  [Role.VIEWER]: [
    Permission.INCIDENT_READ,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.ANALYSIS_READ,
    Permission.WORKFLOW_READ,
    Permission.DOCUMENT_READ,
    Permission.ATTACHMENT_READ,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: RoleType | string | undefined,
  permission: PermissionType
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as RoleType];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: RoleType | string | undefined,
  permissions: PermissionType[]
): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: RoleType | string | undefined,
  permissions: PermissionType[]
): boolean {
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: RoleType | string | undefined): PermissionType[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role as RoleType] || [];
}
