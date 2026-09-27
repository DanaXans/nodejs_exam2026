import {Document, model, Schema, Types} from 'mongoose';
import {ContactPurpose} from '../types/index.js';

export interface IContactRequest extends Document {
    adId: Types.ObjectId;
    buyerId: Types.ObjectId;
    sellerId: Types.ObjectId;
    message: string;
    purpose: ContactPurpose;
    createdAt: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
    {
        adId: {type: Schema.Types.ObjectId, ref: 'CarAd', required: true},
        buyerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        sellerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        message: {type: String, required: true, trim: true},
        purpose: {type: String, enum: Object.values(ContactPurpose), required: true},
    },
    {timestamps: {createdAt: true, updatedAt: false}},
);

export const ContactRequest = model<IContactRequest>('ContactRequest', contactRequestSchema);
