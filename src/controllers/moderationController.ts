import {Response} from 'express';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {CarAd} from '../models/CarAd.js';
import {EmailLog} from '../models/EmailLog.js';
import {toAdDto} from '../services/adService.js';
import {AdStatus} from '../types/index.js';

export const listModerationAds = async (req: AuthRequest, res: Response) => {
    const status = req.query.status ? String(req.query.status).toUpperCase() : AdStatus.INACTIVE;
    if (!Object.values(AdStatus).includes(status as AdStatus)) {
        throw new HttpError(400, 'Невідомий статус');
    }
    const ads = await CarAd.find({status}).sort({updatedAt: -1});
    res.json(ads.map(toAdDto));
};

export const moderateAd = async (req: AuthRequest, res: Response) => {
    const action = String(req.body?.action ?? '').toUpperCase();
    const ad = await CarAd.findById(req.params.id);
    if (!ad) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    if (action === 'ACTIVATE') {
        ad.status = AdStatus.ACTIVE;
        await ad.save();
        res.json({message: 'Оголошення активовано після ручної перевірки', ad: toAdDto(ad)});
        return;
    }
    if (action === 'REJECT') {
        await CarAd.findByIdAndDelete(ad._id);
        res.json({message: 'Оголошення відхилено і видалено'});
        return;
    }
    throw new HttpError(400, 'action має бути ACTIVATE або REJECT');
};

export const listEmails = async (_req: AuthRequest, res: Response) => {
    const emails = await EmailLog.find().sort({createdAt: -1}).limit(50);
    res.json(emails);
};
