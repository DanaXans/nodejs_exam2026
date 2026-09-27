import {Document, model, Schema, Types} from 'mongoose';

export interface IEmailLog extends Document {
    toRole: string;
    subject: string;
    body: string;
    adId?: Types.ObjectId;
    createdAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
    {
        toRole: {type: String, required: true},
        subject: {type: String, required: true},
        body: {type: String, required: true},
        adId: {type: Schema.Types.ObjectId, ref: 'CarAd'},
    },
    {timestamps: {createdAt: true, updatedAt: false}},
);

export const EmailLog = model<IEmailLog>('EmailLog', emailLogSchema);
