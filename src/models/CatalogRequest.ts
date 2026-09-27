import {Document, model, Schema, Types} from 'mongoose';
import {CatalogRequestStatus, CatalogRequestType} from '../types/index.js';

export interface ICatalogRequest extends Document {
    authorId: Types.ObjectId;
    type: CatalogRequestType;
    makeName?: string;
    requestedName: string;
    status: CatalogRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

const catalogRequestSchema = new Schema<ICatalogRequest>(
    {
        authorId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        type: {type: String, enum: Object.values(CatalogRequestType), required: true},
        makeName: {type: String, trim: true},
        requestedName: {type: String, required: true, trim: true},
        status: {type: String, enum: Object.values(CatalogRequestStatus), default: CatalogRequestStatus.PENDING},
    },
    {timestamps: true},
);

export const CatalogRequest = model<ICatalogRequest>('CatalogRequest', catalogRequestSchema);
