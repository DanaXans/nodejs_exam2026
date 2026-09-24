import {Document, model, Schema} from 'mongoose';
import {AccountType, UserRole} from '../types/index.js';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    accountType: AccountType;
    isBanned: boolean;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    role: {type: String, enum: Object.values(UserRole), default: UserRole.SELLER},
    accountType: {type: String, enum: Object.values(AccountType), default: AccountType.BASIC},
    isBanned: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
});

export const User = model<IUser>('User', userSchema);
