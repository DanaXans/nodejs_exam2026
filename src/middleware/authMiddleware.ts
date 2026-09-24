import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import {AccountType, UserRole} from '../types/index.js';
import {PermissionName, permissionsFor} from '../permissions.js';

export interface AuthUserPayload {
    userId: string;
    role: UserRole;
    accountType: AccountType;
    permissions: PermissionName[];
}

export interface AuthRequest extends Request {
    user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

const readUser = async (token: string): Promise<AuthUserPayload | 'banned' | null> => {
    const decoded = jwt.verify(token, JWT_SECRET) as {userId?: string};
    if (!decoded.userId) {
        return null;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
        return null;
    }
    if (user.isBanned) {
        return 'banned';
    }

    return {
        userId: String(user._id),
        role: user.role,
        accountType: user.accountType,
        permissions: permissionsFor(user.role, user.accountType),
    };
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Токен відсутній'});
    }

    try {
        const user = await readUser(authHeader.slice(7));
        if (user === 'banned') {
            return res.status(403).json({message: 'Користувача заблоковано'});
        }
        if (!user) {
            return res.status(401).json({message: 'Недійсний або прострочений токен'});
        }
        req.user = user;
        next();
    } catch {
        return res.status(401).json({message: 'Недійсний або прострочений токен'});
    }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }

    try {
        const user = await readUser(authHeader.slice(7));
        if (user && user !== 'banned') {
            req.user = user;
        }
    } catch {
        // Каталог лишається публічним, навіть якщо токен зіпсований.
    }
    next();
};

export const requirePermission = (...permissions: PermissionName[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({message: 'Користувач не авторизований'});
        }
        const allowed = permissions.every((permission) => req.user?.permissions.includes(permission));
        if (!allowed) {
            return res.status(403).json({message: 'Недостатньо прав для цієї дії'});
        }
        next();
    };
};
