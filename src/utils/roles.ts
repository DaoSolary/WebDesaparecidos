export type UserRole = 'CIDADAO' | 'FAMILIAR' | 'VOLUNTARIO' | 'MODERADOR' | 'AUTORIDADE' | 'ADMIN';

export const ROLES = {
  CIDADAO: 'CIDADAO',
  FAMILIAR: 'FAMILIAR',
  VOLUNTARIO: 'VOLUNTARIO',
  MODERADOR: 'MODERADOR',
  AUTORIDADE: 'AUTORIDADE',
  ADMIN: 'ADMIN',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  CIDADAO: 'Cidadão',
  FAMILIAR: 'Familiar',
  VOLUNTARIO: 'Voluntário',
  MODERADOR: 'Moderador',
  AUTORIDADE: 'Autoridade',
  ADMIN: 'Administrador',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CIDADAO: 1,
  FAMILIAR: 1,
  VOLUNTARIO: 2,
  MODERADOR: 3,
  AUTORIDADE: 4,
  ADMIN: 5,
};

export function hasRole(userRole: string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole as UserRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(userRole: string | undefined, roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole as UserRole);
}

export function canCreateCase(userRole: string | undefined): boolean {
  return hasAnyRole(userRole, ['CIDADAO', 'FAMILIAR', 'MODERADOR', 'ADMIN']);
}

export function canModerate(userRole: string | undefined): boolean {
  return hasAnyRole(userRole, ['MODERADOR', 'ADMIN']);
}

export function canViewAdmin(userRole: string | undefined): boolean {
  return hasAnyRole(userRole, ['ADMIN']);
}

export function canViewAuthorities(userRole: string | undefined): boolean {
  return hasAnyRole(userRole, ['AUTORIDADE', 'ADMIN']);
}


