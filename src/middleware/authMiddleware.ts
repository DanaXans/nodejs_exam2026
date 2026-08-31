import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUserPayload {
    userId?: string;
    id?: string;
    _id?: string;
    role?: string;
    accountType?: string;
}

export interface AuthRequest extends Request {
    user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Токен відсутній'});
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Недійсний токен'});
    }
};

export const requireRole = (...roles: (string | string[])[]) => {
    const allowedRoles = roles.flat();
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({message: 'Користувач не авторизований'});
        }
        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message: 'Недостатньо прав для цієї дії'});
        }
        next();
    };
};