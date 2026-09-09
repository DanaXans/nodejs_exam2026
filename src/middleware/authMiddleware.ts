import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {AccountType, UserRole} from '../types/index.js';

export interface AuthUserPayload {
    userId: string;
    role: UserRole;
    accountType: AccountType;
    permissions?: string[];
}

export interface AuthRequest extends Request {
    user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction,) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Токен відсутній',});
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({message: 'Недійсний або прострочений токен',});
    }
};
export const requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({message: 'Користувач не авторизований',});
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: 'Недостатньо прав для цієї дії',});
        }
        next();
    };
};
export const requirePermission = (...permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Користувач не авторизований',
            });
        }
        if (req.user.role === UserRole.ADMIN) {
            return next();
        }
        const userPermissions = req.user.permissions ?? [];
        const hasAllPermissions = permissions.every((permission) => userPermissions.includes(permission),);
        if (!hasAllPermissions) {
            return res.status(403).json({
                message: 'Недостатньо permissions для цієї дії',
            });
        }
        next();
    };
};
