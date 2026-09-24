import {AccountType, UserRole} from './types/index.js';

export const Permission = {
    AD_CREATE: 'ads:create',
    AD_EDIT_OWN: 'ads:edit-own',
    AD_DELETE_OWN: 'ads:delete-own',
    AD_DELETE_ANY: 'ads:delete-any',
    AD_REVIEW: 'ads:review',
    AD_STATS: 'ads:view-stats',
    USER_BAN: 'users:ban',
    USER_LIST: 'users:list',
    USER_CREATE_MANAGER: 'users:create-manager',
    BRAND_REPORT: 'brands:report',
    BRAND_REVIEW: 'brands:review',
    EMAIL_READ: 'emails:read',
} as const;

export type PermissionName = typeof Permission[keyof typeof Permission];

const ALL_PERMISSIONS = Object.values(Permission);

// Нова роль автосалону додається сюди: enum UserRole + список прав.
// Самі перевірки в роутах лишаються на пермішинах, тому менеджера, сейла
// чи механіка салону не доведеться розкидати по контролерах.
export const ROLE_PERMISSIONS: Record<UserRole, PermissionName[]> = {
    [UserRole.BUYER]: [],
    [UserRole.SELLER]: [
        Permission.AD_CREATE,
        Permission.AD_EDIT_OWN,
        Permission.AD_DELETE_OWN,
        Permission.BRAND_REPORT,
    ],
    [UserRole.MANAGER]: [
        Permission.AD_DELETE_ANY,
        Permission.AD_REVIEW,
        Permission.USER_BAN,
        Permission.USER_LIST,
        Permission.EMAIL_READ,
    ],
    [UserRole.ADMIN]: ALL_PERMISSIONS,
};

export const permissionsFor = (role: UserRole, accountType: AccountType): PermissionName[] => {
    const permissions = new Set<PermissionName>(ROLE_PERMISSIONS[role] ?? []);
    if (role === UserRole.SELLER && accountType === AccountType.PREMIUM) {
        permissions.add(Permission.AD_STATS);
    }
    return [...permissions];
};
