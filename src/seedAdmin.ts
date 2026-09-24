import bcrypt from 'bcryptjs';
import {User} from './models/User.js';
import {AccountType, UserRole} from './types/index.js';

export const seedAdmin = async () => {
    const existingAdmin = await User.findOne({role: UserRole.ADMIN});
    if (existingAdmin) {
        return;
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@autoria.local').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Admin';
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        accountType: AccountType.BASIC,
        isBanned: false,
    });

    console.log(`Створено адміністратора: ${email}`);
};
