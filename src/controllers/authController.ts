import {NextFunction, Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import {AccountType, UserRole} from '../types/index.js';
import {AuthRequest} from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

const createToken = (user: {_id: unknown; role: UserRole; accountType: AccountType}) => {
    return jwt.sign(
        {
            userId: String(user._id),
            role: user.role,
            accountType: user.accountType,
        },
        JWT_SECRET,
        {expiresIn: '30d'},
    );
};

const serializeUser = (user: {_id: unknown; name: string; email: string; role: UserRole; accountType: AccountType}) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: user.accountType,
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, password, role} = req.body as {
            name?: string;
            email?: string;
            password?: string;
            role?: string;
        };

        if (!name || !email || !password) {
            return res.status(400).json({message: 'Ім’я, email та пароль є обов’язковими'});
        }
        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({message: 'Пароль має містити щонайменше 6 символів'});
        }

        const accountRole = role ?? UserRole.SELLER;
        if (accountRole !== UserRole.BUYER && accountRole !== UserRole.SELLER) {
            return res.status(400).json({message: 'Під час реєстрації можна обрати лише BUYER або SELLER'});
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail});
        if (existingUser) {
            return res.status(409).json({message: 'Email вже використовується'});
        }

        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(password, 10),
            role: accountRole,
            accountType: AccountType.BASIC,
            isBanned: false,
        });

        return res.status(201).json({
            token: createToken(user),
            user: serializeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body as {email?: string; password?: string};
        if (!email || !password) {
            return res.status(400).json({message: 'Email та пароль є обов’язковими'});
        }

        const user = await User.findOne({email: String(email).trim().toLowerCase()});
        if (!user) {
            return res.status(401).json({message: 'Невірний email або пароль'});
        }
        if (user.isBanned) {
            return res.status(403).json({message: 'Користувача заблоковано'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Невірний email або пароль'});
        }

        return res.json({
            token: createToken(user),
            user: serializeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

export const upgradeToPremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({message: 'Користувач не авторизований'});
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено'});
        }
        if (user.role !== UserRole.SELLER) {
            return res.status(403).json({message: 'PREMIUM-акаунт доступний тільки продавцям'});
        }
        if (user.accountType === AccountType.PREMIUM) {
            return res.status(400).json({message: 'Ваш акаунт вже має статус PREMIUM'});
        }

        user.accountType = AccountType.PREMIUM;
        await user.save();

        return res.json({
            message: 'Акаунт успішно оновлено до PREMIUM',
            token: createToken(user),
            user: serializeUser(user),
        });
    } catch (error) {
        next(error);
    }
};
