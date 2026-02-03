export const ROLES = {
    CIDADAO: 'CIDADAO',
    FAMILIAR: 'FAMILIAR',
    VOLUNTARIO: 'VOLUNTARIO',
    MODERADOR: 'MODERADOR',
    AUTORIDADE: 'AUTORIDADE',
    ADMIN: 'ADMIN',
};
export const ROLE_LABELS = {
    CIDADAO: 'Cidadão',
    FAMILIAR: 'Familiar',
    VOLUNTARIO: 'Voluntário',
    MODERADOR: 'Moderador',
    AUTORIDADE: 'Autoridade',
    ADMIN: 'Administrador',
};
export const ROLE_HIERARCHY = {
    CIDADAO: 1,
    FAMILIAR: 1,
    VOLUNTARIO: 2,
    MODERADOR: 3,
    AUTORIDADE: 4,
    ADMIN: 5,
};
export function hasRole(userRole, requiredRole) {
    if (!userRole)
        return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
export function hasAnyRole(userRole, roles) {
    if (!userRole)
        return false;
    return roles.includes(userRole);
}
export function canCreateCase(userRole) {
    return hasAnyRole(userRole, ['CIDADAO', 'FAMILIAR', 'MODERADOR', 'ADMIN']);
}
export function canModerate(userRole) {
    return hasAnyRole(userRole, ['MODERADOR', 'ADMIN']);
}
export function canViewAdmin(userRole) {
    return hasAnyRole(userRole, ['ADMIN']);
}
export function canViewAuthorities(userRole) {
    return hasAnyRole(userRole, ['AUTORIDADE', 'ADMIN']);
}
