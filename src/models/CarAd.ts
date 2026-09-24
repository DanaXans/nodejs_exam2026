import {model, Schema, Types} from 'mongoose';
import {AdStatus, Currency} from '../types/index.js';

export interface ICarAd {
    _id: Types.ObjectId;
    sellerId: Types.ObjectId;
    title: string;
    description: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
    calculatedPrices: {
        USD: number;
        UAH: number;
        EUR: number;
    };
    status: AdStatus;
    badWordsAttempts: number;
    views: number;
    viewDates: Date[];
    createdAt: Date;
    updatedAt: Date;
}

const carAdSchema = new Schema<ICarAd>(
    {
        sellerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        title: {type: String, required: true},
        description: {type: String, required: true},
        make: {type: String, required: true},
        model: {type: String, required: true},
        region: {type: String, required: true},
        originalPrice: {type: Number, required: true},
        originalCurrency: {type: String, enum: Object.values(Currency), required: true},
        calculatedPrices: {
            USD: {type: Number, required: true},
            UAH: {type: Number, required: true},
            EUR: {type: Number, required: true},
        },
        status: {type: String, enum: Object.values(AdStatus), default: AdStatus.ACTIVE},
        badWordsAttempts: {type: Number, default: 0},
        views: {type: Number, default: 0},
        viewDates: {type: [Date], default: [], select: false},
    },
    {timestamps: true},
);

export const CarAd = model<ICarAd>('CarAd', carAdSchema);
