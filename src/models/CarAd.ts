import {model, Schema, Types} from 'mongoose';

export interface ICarAd {
    sellerId: Types.ObjectId;
    title: string;
    description: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: string;
    calculatedPrices: {
        USD: number;
        UAH: number;
        EUR: number;
    };
    createdAt: Date;
}

const carAdSchema = new Schema({
    sellerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    make: {type: String, required: true},
    model: {type: String, required: true},
    region: {type: String, required: true},
    originalPrice: {type: Number, required: true},
    originalCurrency: {type: String, required: true},
    calculatedPrices: {
        USD: {type: Number},
        UAH: {type: Number},
        EUR: {type: Number}
    }
}, {
    timestamps: true
});

export const CarAd = model<ICarAd>('CarAd', carAdSchema);