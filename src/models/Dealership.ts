import {Document, model, Schema, Types} from 'mongoose';
import {AccountType} from '../types/index.js';

/**
 * Заготовка під автосалони. Зараз це окрема сутність з власником і типом акаунта.
 * Співробітники (адмін салону, сейл, механік) не отримують нових ролей платформи:
 * їм видають extraPermissions і dealershipId.
 */
export interface IDealership extends Document {
    name: string;
    city: string;
    ownerId: Types.ObjectId;
    accountType: AccountType;
    createdAt: Date;
    updatedAt: Date;
}

const dealershipSchema = new Schema<IDealership>(
    {
        name: {type: String, required: true, trim: true},
        city: {type: String, required: true, trim: true},
        ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        accountType: {type: String, enum: Object.values(AccountType), default: AccountType.BASIC},
    },
    {timestamps: true},
);

export const Dealership = model<IDealership>('Dealership', dealershipSchema);
