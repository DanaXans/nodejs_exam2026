import {Document, model, Schema, Types} from 'mongoose';

export interface IAdView extends Document {
    adId: Types.ObjectId;
    viewedAt: Date;
}

const adViewSchema = new Schema<IAdView>({
    adId: {type: Schema.Types.ObjectId, ref: 'CarAd', required: true, index: true},
    viewedAt: {type: Date, required: true, default: Date.now},
});

adViewSchema.index({adId: 1, viewedAt: -1});

export const AdView = model<IAdView>('AdView', adViewSchema);
