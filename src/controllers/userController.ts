import bcrypt from 'bcryptjs';
import {Response} from 'express';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {User} from '../models/User.js';
import {serializeUser} from '../services/authToken.js';
import {AccountType, UserRole} from '../types/index.js';

export const createManager = async (req: AuthRequest, res: Response) => {
    const {name, email, password} = req.body ?? {};
    if (!name || !email || !password) {
        throw new HttpError(400, 'Імʼя, email та пароль є обовʼязковими');
    }
    if (typeof password !== 'string' || password.length < 6) {
        throw new HttpError(400, 'Пароль має містити щонайменше 6 символів');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({email: normalizedEmail});
    if (existing) {
        throw new HttpError(409, 'Email вже використовується');
    }

    const manager = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: UserRole.MANAGER,
        accountType: AccountType.BASIC,
        extraPermissions: [],
    });

    res.status(201).json({
        message: 'Менеджера створено',
        user: serializeUser(manager),
    });
};

export const listUsers = async (_req: AuthRequest, res: Response) => {
    const users = await User.find().sort({createdAt: -1});
    res.json(users.map(serializeUser));
};

export const setBan = async (req: AuthRequest, res: Response) => {
    const target = await User.findById(req.params.id);
    if (!target) {
        throw new HttpError(404, 'Користувача не знайдено');
    }
    if (String(target._id) === req.auth?.id) {
        throw new HttpError(400, 'Не можна заблокувати власний акаунт');
    }
    if (target.role === UserRole.ADMIN) {
        throw new HttpError(403, 'Адміністратора не можна заблокувати');
    }
    if (req.auth?.role === UserRole.MANAGER && target.role === UserRole.MANAGER) {
        throw new HttpError(403, 'Менеджер не може блокувати іншого менеджера');
    }

    const banned = Boolean(req.body?.banned);
    target.banned = banned;
    target.banReason = banned ? String(req.body?.reason ?? '').trim() || 'Порушення правил платформи' : undefined;
    await target.save();

    res.json({
        message: banned ? 'Користувача заблоковано' : 'Блокування знято',
        user: serializeUser(target),
    });
};
