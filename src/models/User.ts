import {Document, model, Schema, Types} from 'mongoose';
import {AccountType, UserRole} from '../types/index.js';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    accountType: AccountType;
    extraPermissions: string[];
    dealershipId?: Types.ObjectId;
    banned: boolean;
    banReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {type: String, required: true, trim: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        passwordHash: {type: String, required: true},
        role: {type: String, enum: Object.values(UserRole), default: UserRole.SELLER},
        accountType: {type: String, enum: Object.values(AccountType), default: AccountType.BASIC},
        extraPermissions: {type: [String], default: []},
        dealershipId: {type: Schema.Types.ObjectId, ref: 'Dealership'},
        banned: {type: Boolean, default: false},
        banReason: {type: String},
    },
    {timestamps: true},
);

export const User = model<IUser>('User', userSchema);
