import {model, Schema, Types} from 'mongoose';

export interface IBrandRequest {
    _id: Types.ObjectId;
    make: string;
    model: string;
    sellerId: Types.ObjectId;
    createdAt: Date;
}

const brandRequestSchema = new Schema<IBrandRequest>(
    {
        make: {type: String, required: true},
        model: {type: String, default: ''},
        sellerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    },
    {timestamps: {createdAt: true, updatedAt: false}},
);

export const BrandRequest = model<IBrandRequest>('BrandRequest', brandRequestSchema);
