import {NextFunction, Response} from 'express';
import {SentEmail} from '../services/emailService.js';

export const listEmails = async (_req: unknown, res: Response, next: NextFunction) => {
    try {
        const emails = await SentEmail.find().sort({createdAt: -1}).limit(50);
        return res.json(emails.map((email) => ({
            id: String(email._id),
            to: email.to,
            subject: email.subject,
            body: email.body,
            adId: email.adId,
            createdAt: email.createdAt,
        })));
    } catch (error) {
        next(error);
    }
};
