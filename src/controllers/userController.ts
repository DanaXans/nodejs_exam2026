import {NextFunction, Response} from 'express';
import bcrypt from 'bcryptjs';
import {User} from '../models/User.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {AccountType, UserRole} from '../types/index.js';

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select('name email role accountType isBanned createdAt').sort({createdAt: -1});
        return res.json(users.map((user) => ({
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            isBanned: user.isBanned,
        })));
    } catch (error) {
        next(error);
    }
};

export const createManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {name, email, password} = req.body as {name?: string; email?: string; password?: string};
        if (!name || !email || !password) {
            return res.status(400).json({message: 'Ім’я, email та пароль є обов’язковими'});
        }
        if (password.length < 6) {
            return res.status(400).json({message: 'Пароль має містити щонайменше 6 символів'});
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail});
        if (existingUser) {
            return res.status(409).json({message: 'Email вже використовується'});
        }

        const manager = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(password, 10),
            role: UserRole.MANAGER,
            accountType: AccountType.BASIC,
            isBanned: false,
        });

        return res.status(201).json({
            id: String(manager._id),
            name: manager.name,
            email: manager.email,
            role: manager.role,
        });
    } catch (error) {
        next(error);
    }
};

export const setBan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено'});
        }
        if (user.role === UserRole.ADMIN) {
            return res.status(403).json({message: 'Адміністратора не можна заблокувати'});
        }
        if (String(user._id) === req.user?.userId) {
            return res.status(403).json({message: 'Не можна заблокувати власний акаунт'});
        }

        user.isBanned = Boolean(req.body?.isBanned);
        await user.save();
        return res.json({
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned,
        });
    } catch (error) {
        next(error);
    }
};
