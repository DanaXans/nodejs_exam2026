import {UserRole} from '../types/index.js';

/**
 * Дії системи описані пермішинами, а не жорстко зашитими if (role === ...).
 * Роль лише видає набір пермішинів за замовчуванням.
 * Додаткові пермішини можна видати користувачу (наприклад співробітнику автосалону)
 * без нової ролі платформи.
 */
export enum Permission {
    AD_VIEW = 'ad:view',
    AD_CREATE = 'ad:create',
    AD_UPDATE_OWN = 'ad:update:own',
    AD_DELETE_OWN = 'ad:delete:own',
    AD_DELETE_ANY = 'ad:delete:any',
    AD_MODERATE = 'ad:moderate',

    USER_BAN = 'user:ban',
    USER_CREATE_MANAGER = 'user:create:manager',
    USER_LIST = 'user:list',

    CATALOG_REQUEST = 'catalog:request',
    CATALOG_MANAGE = 'catalog:manage',

    CONTACT_SELLER = 'contact:create',

    DEALERSHIP_VIEW = 'dealership:view',
    DEALERSHIP_MANAGE = 'dealership:manage',
    DEALERSHIP_STAFF_MANAGE = 'dealership:staff:manage',
}

export const ALL_PERMISSIONS = Object.values(Permission);

/** Пермішини, які автосалон зможе видавати своїм людям (сейл, механік, адмін салону). */
export const DEALERSHIP_ASSIGNABLE_PERMISSIONS: Permission[] = [
    Permission.AD_CREATE,
    Permission.AD_UPDATE_OWN,
    Permission.AD_DELETE_OWN,
    Permission.CATALOG_REQUEST,
    Permission.CONTACT_SELLER,
    Permission.DEALERSHIP_VIEW,
    Permission.DEALERSHIP_STAFF_MANAGE,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.BUYER]: [
        Permission.AD_VIEW,
        Permission.CONTACT_SELLER,
        Permission.DEALERSHIP_VIEW,
    ],
    [UserRole.SELLER]: [
        Permission.AD_VIEW,
        Permission.AD_CREATE,
        Permission.AD_UPDATE_OWN,
        Permission.AD_DELETE_OWN,
        Permission.CATALOG_REQUEST,
        Permission.CONTACT_SELLER,
        Permission.DEALERSHIP_VIEW,
    ],
    [UserRole.MANAGER]: [
        Permission.AD_VIEW,
        Permission.AD_DELETE_ANY,
        Permission.AD_MODERATE,
        Permission.USER_BAN,
        Permission.USER_LIST,
        Permission.CATALOG_MANAGE,
        Permission.DEALERSHIP_VIEW,
    ],
    [UserRole.ADMIN]: ALL_PERMISSIONS,
};

export function resolvePermissions(user: {role: UserRole; extraPermissions?: string[]}): Permission[] {
    const fromRole = ROLE_PERMISSIONS[user.role] ?? [];
    const extra = (user.extraPermissions ?? []).filter((item): item is Permission =>
        ALL_PERMISSIONS.includes(item as Permission),
    );
    return [...new Set([...fromRole, ...extra])];
}
