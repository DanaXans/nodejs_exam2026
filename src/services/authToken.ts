import jwt from 'jsonwebtoken';
import {getConfig} from '../config.js';
import {resolvePermissions} from '../constants/permissions.js';
import {IUser} from '../models/User.js';

export function createToken(user: IUser): string {
    return jwt.sign({userId: String(user._id)}, getConfig().jwtSecret, {expiresIn: 60 * 60 * 24 * 30});
}

export function serializeUser(user: IUser) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        permissions: resolvePermissions(user),
        dealershipId: user.dealershipId ? String(user.dealershipId) : null,
        banned: user.banned,
    };
}
