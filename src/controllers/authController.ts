import bcrypt from 'bcryptjs';
import {Response} from 'express';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {User} from '../models/User.js';
import {createToken, serializeUser} from '../services/authToken.js';
import {AccountType, UserRole} from '../types/index.js';

const PUBLIC_ROLES = new Set<string>([UserRole.BUYER, UserRole.SELLER]);

export const register = async (req: AuthRequest, res: Response) => {
    const {name, email, password, role} = req.body ?? {};
    if (!name || !email || !password) {
        throw new HttpError(400, 'Імʼя, email та пароль є обовʼязковими');
    }
    if (typeof password !== 'string' || password.length < 6) {
        throw new HttpError(400, 'Пароль має містити щонайменше 6 символів');
    }

    const selectedRole = role ? String(role).toUpperCase() : UserRole.SELLER;
    if (!PUBLIC_ROLES.has(selectedRole)) {
        throw new HttpError(403, 'Самостійно можна зареєструвати лише BUYER або SELLER. Менеджера створює адміністратор.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({email: normalizedEmail});
    if (existing) {
        throw new HttpError(409, 'Email вже використовується');
    }

    const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: selectedRole,
        accountType: AccountType.BASIC,
        extraPermissions: [],
    });

    res.status(201).json({
        token: createToken(user),
        user: serializeUser(user),
    });
};

export const login = async (req: AuthRequest, res: Response) => {
    const {email, password} = req.body ?? {};
    if (!email || !password) {
        throw new HttpError(400, 'Email та пароль є обовʼязковими');
    }

    const user = await User.findOne({email: String(email).trim().toLowerCase()});
    if (!user) {
        throw new HttpError(401, 'Невірний email або пароль');
    }
    if (user.banned) {
        throw new HttpError(403, 'Акаунт заблоковано');
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
        throw new HttpError(401, 'Невірний email або пароль');
    }

    res.json({
        token: createToken(user),
        user: serializeUser(user),
    });
};

export const me = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.auth?.id);
    if (!user) {
        throw new HttpError(404, 'Користувача не знайдено');
    }
    res.json(serializeUser(user));
};

export const upgradeToPremium = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.auth?.id);
    if (!user) {
        throw new HttpError(404, 'Користувача не знайдено');
    }
    if (user.role !== UserRole.SELLER) {
        throw new HttpError(403, 'PREMIUM-акаунт купує продавець. Покупець, менеджер і адміністратор його не оформлюють.');
    }
    if (user.accountType === AccountType.PREMIUM) {
        throw new HttpError(400, 'Ваш акаунт вже має статус PREMIUM');
    }

    user.accountType = AccountType.PREMIUM;
    await user.save();

    res.json({
        message: 'Оплату замокано: кошти не списуються. Акаунт оновлено до PREMIUM.',
        token: createToken(user),
        user: serializeUser(user),
    });
};
