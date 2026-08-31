import {Document, model, Schema} from 'mongoose';
import {AccountType, IUserBase, UserRole} from '../types/index.js';

export interface IUser extends Document, Omit<IUserBase, 'createdAt'> {
    passwordHash: string;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    role: {type: String, enum: Object.values(UserRole), default: UserRole.SELLER},
    accountType: {type: String, enum: Object.values(AccountType), default: AccountType.BASIC},
    permissions: [{type: String}],
    dealershipId: {type: Schema.Types.ObjectId, ref: 'Dealership'},
    createdAt: {type: Date, default: Date.now}
});

export const User = model<IUser>('User', userSchema);