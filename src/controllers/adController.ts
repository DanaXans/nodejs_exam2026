import {NextFunction, Request, Response} from 'express';
import {CarAd} from '../models/CarAd.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {MOCK_ADS} from '../types/ads.js';

export const getAds = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dbAds = await CarAd.find();

        const formattedMockAds = MOCK_ADS.map((ad, index) => ({
            _id: `mock-${index + 1}`,
            ...ad,
            createdAt: new Date().toISOString()
        }));

        const allAds = [...formattedMockAds, ...dbAds];

        return res.json(allAds);
    } catch (error) {
        next(error);
    }
};
export const createAd = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const sellerId = authReq.user?.userId || authReq.user?.id || authReq.user?._id;

        if (!sellerId) {
            return res.status(401).json({message: 'Пользователь не авторизован'});
        }

        const {
            title,
            description,
            make,
            brand,
            model,
            region,
            originalPrice,
            originalCurrency,
        } = req.body;

        const priceNum = Number(originalPrice) || Number(req.body.price) || 0;
        const rawCurrency = originalCurrency || req.body.currency || 'USD';

        const calculatedPrices = {
            USD: priceNum,
            UAH: Math.round(priceNum * 41),
            EUR: Math.round(priceNum * 0.92)
        };

        const newAd = await CarAd.create({
            sellerId,
            title: title || `${brand || make || ''} ${model || ''}`.trim() || 'Автомобиль',
            description,
            make: make || brand || 'Не указано',
            brand: brand || make || 'Не указано',
            model: model || 'Не указано',
            region: region || 'Киев',
            originalPrice: priceNum,
            price: priceNum,
            originalCurrency: rawCurrency,
            currency: rawCurrency,
            calculatedPrices,
        });

        return res.status(201).json(newAd);
    } catch (error) {
        next(error);
    }
};

export const deleteAd = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const {id} = req.params;
        const userId = authReq.user?.userId || authReq.user?.id || authReq.user?._id;
        const userRole = authReq.user?.role;

        const ad = await CarAd.findById(id);

        if (!ad) {
            return res.status(404).json({message: 'Объявление не найдено'});
        }

        if (String(ad.sellerId) !== String(userId) && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            return res.status(403).json({message: 'Вы не можете удалить чужое объявление'});
        }

        await CarAd.findByIdAndDelete(id);

        return res.json({message: 'Объявление успешно удалено'});
    } catch (error) {
        next(error);
    }
};