import {Types} from 'mongoose';
import {EmailLog} from '../models/EmailLog.js';

export async function sendEmailToManagers(input: {subject: string; body: string; adId?: string}) {
    const saved = await EmailLog.create({
        toRole: 'MANAGER',
        subject: input.subject,
        body: input.body,
        adId: input.adId ? new Types.ObjectId(input.adId) : undefined,
    });

    console.log('\n[EMAIL MOCK] Лист менеджерам');
    console.log(`Тема: ${input.subject}`);
    console.log(input.body);
    console.log('');

    return saved;
}
