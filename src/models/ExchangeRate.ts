import {Document, model, Schema} from 'mongoose';

export interface IExchangeRate extends Document {
    date: string;
    source: 'PrivatBank';
    USD_UAH: number;
    EUR_UAH: number;
}

const exchangeRateSchema = new Schema<IExchangeRate>({
    date: {type: String, required: true, unique: true},
    source: {type: String, required: true, default: 'PrivatBank'},
    USD_UAH: {type: Number, required: true},
    EUR_UAH: {type: Number, required: true},
});

export const ExchangeRate = model<IExchangeRate>('ExchangeRate', exchangeRateSchema);
