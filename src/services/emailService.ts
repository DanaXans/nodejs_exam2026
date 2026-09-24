import {model, Schema} from 'mongoose';

export interface ISentEmail {
    to: string;
    subject: string;
    body: string;
    adId: string;
    createdAt: Date;
}

const sentEmailSchema = new Schema<ISentEmail>(
    {
        to: {type: String, required: true},
        subject: {type: String, required: true},
        body: {type: String, required: true},
        adId: {type: String, required: true},
    },
    {timestamps: {createdAt: true, updatedAt: false}},
);

export const SentEmail = model<ISentEmail>('SentEmail', sentEmailSchema);

export const sendManagerEmail = async (adId: string, reason: string) => {
    const to = process.env.MANAGER_EMAIL || 'manager@autoria.local';
    const subject = 'Потрібна перевірка оголошення';
    const body = `Оголошення ${adId} не пройшло автоматичну перевірку: ${reason}`;
    const email = await SentEmail.create({to, subject, body, adId});
    console.log(`[EMAIL MOCK] Лист для ${to}: ${subject}. ${body}`);
    return email;
};
