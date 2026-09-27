import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {getConfig} from '../config.js';
import {Permission, resolvePermissions} from '../constants/permissions.js';
import {HttpError} from '../errors/HttpError.js';
import {User} from '../models/User.js';
import {AccountType, UserRole} from '../types/index.js';
import {asyncHandler} from './asyncHandler.js';

export interface AuthContext {
    id: string;
    role: UserRole;
    accountType: AccountType;
    permissions: Permission[];
    dealershipId?: string;
    email: string;
    name: string;
}

export interface AuthRequest extends Request {
    auth?: AuthContext;
}

async function loadAuth(req: AuthRequest, required: boolean): Promise<void> {
    const header = req.headers.authorization;
    if (!header) {
        if (required) {
            throw new HttpError(401, 'Токен відсутній');
        }
        return;
    }
    if (!header.startsWith('Bearer ')) {
        throw new HttpError(401, 'Токен відсутній');
    }

    const token = header.slice(7);
    let userId = '';
    try {
        const decoded = jwt.verify(token, getConfig().jwtSecret) as {userId?: string};
        userId = decoded.userId ?? '';
    } catch {
        throw new HttpError(401, 'Недійсний або прострочений токен');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new HttpError(401, 'Користувача не знайдено');
    }
    if (user.banned) {
        throw new HttpError(403, 'Акаунт заблоковано');
    }

    req.auth = {
        id: String(user._id),
        role: user.role,
        accountType: user.accountType,
        permissions: resolvePermissions(user),
        email: user.email,
        name: user.name,
        ...(user.dealershipId ? {dealershipId: String(user.dealershipId)} : {}),
    };
}

export const authMiddleware = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    await loadAuth(req, true);
    next();
});

export const optionalAuth = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    await loadAuth(req, false);
    next();
});

export const requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.auth) {
            next(new HttpError(401, 'Користувач не авторизований'));
            return;
        }
        if (!roles.includes(req.auth.role)) {
            next(new HttpError(403, 'Недостатньо прав для цієї дії'));
            return;
        }
        next();
    };
};

export const requirePermission = (...needed: Permission[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.auth) {
            next(new HttpError(401, 'Користувач не авторизований'));
            return;
        }
        const missing = needed.filter((permission) => !req.auth?.permissions.includes(permission));
        if (missing.length > 0) {
            next(new HttpError(403, 'Недостатньо прав для цієї дії'));
            return;
        }
        next();
    };
};
