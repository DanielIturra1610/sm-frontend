/**
 * Role-Based Access Control - Roles
 * Mirrors the backend RBAC system
 */

// User roles in the system
export const Role = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  INVESTIGATOR: 'investigator',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

// All valid roles
export const ALL_ROLES: RoleType[] = [
  Role.OWNER,
  Role.ADMIN,
  Role.SUPERVISOR,
  Role.INVESTIGATOR,
  Role.OPERATOR,
  Role.VIEWER,
];

// Role hierarchy - higher roles inherit lower role permissions
export const ROLE_HIERARCHY: Record<RoleType, RoleType[]> = {
  [Role.OWNER]: [Role.ADMIN, Role.SUPERVISOR, Role.INVESTIGATOR, Role.OPERATOR, Role.VIEWER],
  [Role.ADMIN]: [Role.SUPERVISOR, Role.INVESTIGATOR, Role.OPERATOR, Role.VIEWER],
  [Role.SUPERVISOR]: [Role.INVESTIGATOR, Role.OPERATOR, Role.VIEWER],
  [Role.INVESTIGATOR]: [Role.OPERATOR, Role.VIEWER],
  [Role.OPERATOR]: [Role.VIEWER],
  [Role.VIEWER]: [],
};

// Role display names in Spanish
export const ROLE_LABELS: Record<RoleType, string> = {
  [Role.OWNER]: 'Propietario',
  [Role.ADMIN]: 'Administrador',
  [Role.SUPERVISOR]: 'Supervisor',
  [Role.INVESTIGATOR]: 'Investigador',
  [Role.OPERATOR]: 'Operador',
  [Role.VIEWER]: 'Visualizador',
};

// Role descriptions in Spanish
export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [Role.OWNER]: 'Acceso completo al sistema, incluida la gestión del tenant',
  [Role.ADMIN]: 'Gestión de usuarios y configuración del sistema',
  [Role.SUPERVISOR]: 'Aprobación de reportes y supervisión de incidentes',
  [Role.INVESTIGATOR]: 'Investigación de incidentes y análisis de causa raíz',
  [Role.OPERATOR]: 'Reporte de incidentes y tareas básicas',
  [Role.VIEWER]: 'Acceso de solo lectura',
};

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is RoleType {
  return ALL_ROLES.includes(role as RoleType);
}

/**
 * Check if user role includes the required role (considering hierarchy)
 */
export function hasRole(userRole: RoleType | string | undefined, requiredRole: RoleType): boolean {
  if (!userRole || !isValidRole(userRole)) return false;

  // Direct match
  if (userRole === requiredRole) return true;

  // Check inherited roles
  const inheritedRoles = ROLE_HIERARCHY[userRole] || [];
  return inheritedRoles.includes(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(
  userRole: RoleType | string | undefined,
  requiredRoles: RoleType[]
): boolean {
  return requiredRoles.some((required) => hasRole(userRole, required));
}

/**
 * Get roles that a user can assign (can only assign lower roles)
 */
export function getAssignableRoles(userRole: RoleType | string | undefined): RoleType[] {
  if (!userRole || !isValidRole(userRole)) return [];

  // Owner can assign all roles except owner
  if (userRole === Role.OWNER) {
    return [Role.ADMIN, Role.SUPERVISOR, Role.INVESTIGATOR, Role.OPERATOR, Role.VIEWER];
  }

  // Admin can assign roles below admin
  if (userRole === Role.ADMIN) {
    return [Role.SUPERVISOR, Role.INVESTIGATOR, Role.OPERATOR, Role.VIEWER];
  }

  // Others cannot assign roles
  return [];
}
