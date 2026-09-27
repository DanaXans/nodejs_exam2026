import {model, Schema, Types} from 'mongoose';
import {AdStatus, CalculatedPrices, Currency, ExchangeRateSnapshot} from '../types/index.js';

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
    calculatedPrices: CalculatedPrices;
    exchangeRate: ExchangeRateSnapshot;
    status: AdStatus;
    badWordsAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const carAdSchema = new Schema<ICarAd>(
    {
        sellerId: {type: Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        title: {type: String, required: true},
        description: {type: String, required: true},
        make: {type: String, required: true},
        model: {type: String, required: true},
        region: {type: String, required: true},
        originalPrice: {type: Number, required: true},
        originalCurrency: {type: String, enum: Object.values(Currency), required: true},
        calculatedPrices: {
            USD: {type: Number, required: true},
            EUR: {type: Number, required: true},
            UAH: {type: Number, required: true},
        },
        exchangeRate: {
            source: {type: String, required: true},
            date: {type: String, required: true},
            USD_UAH: {type: Number, required: true},
            EUR_UAH: {type: Number, required: true},
        },
        status: {type: String, enum: Object.values(AdStatus), default: AdStatus.ACTIVE, index: true},
        badWordsAttempts: {type: Number, default: 0},
    },
    {timestamps: true},
);

carAdSchema.index({make: 1, model: 1, region: 1, status: 1});
carAdSchema.index({sellerId: 1, status: 1});

export const CarAd = model<ICarAd>('CarAd', carAdSchema);
