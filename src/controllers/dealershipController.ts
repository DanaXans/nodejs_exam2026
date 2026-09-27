import {Response} from 'express';
import {DEALERSHIP_ASSIGNABLE_PERMISSIONS, Permission} from '../constants/permissions.js';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {Dealership} from '../models/Dealership.js';
import {User} from '../models/User.js';
import {serializeUser} from '../services/authToken.js';
import {AccountType, UserRole} from '../types/index.js';

export const createDealership = async (req: AuthRequest, res: Response) => {
    const name = String(req.body?.name ?? '').trim();
    const city = String(req.body?.city ?? '').trim();
    if (!name || !city) {
        throw new HttpError(400, 'Назва і місто автосалону є обовʼязковими');
    }

    const dealership = await Dealership.create({
        name,
        city,
        ownerId: req.auth?.id,
        accountType: AccountType.BASIC,
    });

    res.status(201).json({
        message: 'Автосалон створено. Співробітникам далі видаються пермішини, а не нові ролі платформи.',
        dealership,
    });
};

export const listDealerships = async (_req: AuthRequest, res: Response) => {
    const dealerships = await Dealership.find().sort({createdAt: -1});
    res.json(dealerships);
};

export const assignStaff = async (req: AuthRequest, res: Response) => {
    const dealership = await Dealership.findById(req.params.id);
    if (!dealership) {
        throw new HttpError(404, 'Автосалон не знайдено');
    }

    const isAdmin = req.auth?.role === UserRole.ADMIN;
    const managesThisSalon = req.auth?.permissions.includes(Permission.DEALERSHIP_STAFF_MANAGE)
        && req.auth.dealershipId === String(dealership._id);
    if (!isAdmin && !managesThisSalon) {
        throw new HttpError(403, 'Керувати співробітниками цього салону не можна');
    }

    const user = await User.findById(req.body?.userId);
    if (!user) {
        throw new HttpError(404, 'Користувача не знайдено');
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
        throw new HttpError(400, 'Платформових менеджерів і адміністраторів не привʼязують до салону цим методом');
    }

    const requested = Array.isArray(req.body?.permissions) ? req.body.permissions.map(String) : [];
    const allowed = new Set<string>(DEALERSHIP_ASSIGNABLE_PERMISSIONS);
    const unknown = requested.filter((permission: string) => !allowed.has(permission));
    if (unknown.length > 0) {
        throw new HttpError(400, `Ці пермішини салону не видаються: ${unknown.join(', ')}`);
    }

    user.dealershipId = dealership._id;
    user.extraPermissions = requested;
    await user.save();

    res.json({
        message: 'Співробітнику видано пермішини автосалону',
        user: serializeUser(user),
    });
};
