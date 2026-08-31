import {NextFunction, Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: 'Email вже використовується'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role: 'SELLER',
            accountType: 'BASIC'
        });
        const token = jwt.sign(
            {userId: user._id, role: user.role, accountType: user.accountType},
            JWT_SECRET,
            {expiresIn: '24h'}
        );
        return res.status(201).json({
            token,
            user: {id: user._id, name: user.name, email: user.email, role: user.role, accountType: user.accountType}
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+passwordHash');
        if (!user) {
            return res.status(400).json({message: 'Невірний email або пароль'});
        }
        const isPasswordValid = await bcrypt.compare(password, (user as any).passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Невірний email або пароль'});
        }
        const token = jwt.sign(
            {userId: user._id, role: user.role, accountType: user.accountType},
            JWT_SECRET,
            {expiresIn: '30d'}
        );
        return res.json({
            token,
            user: {id: user._id, name: user.name, email: user.email, role: user.role, accountType: user.accountType}
        });
    } catch (error) {
        next(error);
    }
};
