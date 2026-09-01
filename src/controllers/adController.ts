import {NextFunction, Request, Response} from 'express';
import {CarAd} from '../models/CarAd.js';
import {User} from '../models/User.js';
import {AuthRequest} from '../middleware/authMiddleware.js';

const BAD_WORDS = /пизде|хуй|блядь|ебать|сука|мудак|пизда|хер|ебучий|засранец|говно|дерьмо|срань/gi;
const RATES = {USD_UAH: 41, EUR_UAH: 45, USD_EUR: 0.92};

const MOCK_ADS = [
    {
        sellerId: 'mock-7',
        title: 'BMW 3 Series 2019',
        description: 'Стан ідеал!',
        make: 'BMW',
        model: '3 Series',
        region: 'Київ',
        originalPrice: 25000,
        originalCurrency: 'USD',
        calculatedPrices: {USD: 25000, UAH: 1025000, EUR: 23000},
        status: 'ACTIVE',
        badWordsAttempts: 0,
        views: 142
    },
    {
        sellerId: 'mock-12',
        title: 'Audi A4 Allroad 2020',
        description: 'Привезена з Німеччини...стан 9/10, за всіма питаннями пишіть',
        make: 'Audi',
        model: 'A4',
        region: 'Львів',
        originalPrice: 31000,
        originalCurrency: 'USD',
        calculatedPrices: {USD: 31000, UAH: 1271000, EUR: 28520},
        status: 'ACTIVE',
        badWordsAttempts: 0,
        views: 89
    },
    {
        sellerId: 'mock-146',
        title: 'Volkswagen Passat B8 2018',
        description: 'Продаю авто, без пробігу, в чудовому стані. Пишіть!',
        make: 'Volkswagen',
        model: 'Passat',
        region: 'Одеса',
        originalPrice: 16500,
        originalCurrency: 'USD',
        calculatedPrices: {USD: 16500, UAH: 676500, EUR: 15180},
        status: 'ACTIVE',
        badWordsAttempts: 0,
        views: 210
    }
];

export const getAds = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dbAds = await CarAd.find().lean();
        const allAds = [...MOCK_ADS, ...dbAds];
        return res.json(allAds);
    } catch (error) {
        next(error);
    }
};

export const createAd = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const sellerId = authReq.user?.userId;

        if (!sellerId) {
            return res.status(401).json({message: 'Не авторизовано'});
        }

        const user = await User.findById(sellerId);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено'});
        }

        const {title, description, make, model, region, originalPrice, originalCurrency} = req.body;

        if (!title || !description || !make || !model || !region || !originalPrice || !originalCurrency) {
            return res.status(400).json({message: 'Всі поля обов\'язкові'});
        }

        if (user.accountType === 'BASIC') {
            const userAdsCount = await CarAd.countDocuments({sellerId});
            if (userAdsCount >= 1) {
                return res.status(403).json({message: 'BASIC: максимум 1 оголошення'});
            }
        }

        const fullText = `${title} ${description}`.toLowerCase();
        if (BAD_WORDS.test(fullText)) {
            return res.status(400).json({message: 'Виявлено нецензурну лексику'});
        }

        const price = Number(originalPrice);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({message: 'Невалідна ціна'});
        }

        let calculatedPrices = {USD: 0, UAH: 0, EUR: 0};

        if (originalCurrency === 'USD') {
            calculatedPrices = {
                USD: price,
                UAH: Math.round(price * RATES.USD_UAH),
                EUR: Math.round(price * RATES.USD_EUR * 100) / 100
            };
        } else if (originalCurrency === 'EUR') {
            calculatedPrices = {
                EUR: price,
                USD: Math.round((price / RATES.USD_EUR) * 100) / 100,
                UAH: Math.round(price * RATES.EUR_UAH)
            };
        } else if (originalCurrency === 'UAH') {
            calculatedPrices = {
                UAH: price,
                USD: Math.round((price / RATES.USD_UAH) * 100) / 100,
                EUR: Math.round((price / RATES.EUR_UAH) * 100) / 100
            };
        } else {
            return res.status(400).json({message: 'Невалідна валюта'});
        }

        const newAd = await CarAd.create({
            sellerId,
            title,
            description,
            make,
            model,
            region,
            originalPrice: price,
            originalCurrency,
            calculatedPrices,
            status: 'ACTIVE',
            badWordsAttempts: 0,
            views: 0
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
        const userId = authReq.user?.userId;
        const userRole = authReq.user?.role;

        if (String(id).startsWith('mock-')) {
            return res.status(403).json({message: 'Нельзя удалить пример'});
        }

        const ad = await CarAd.findById(id);

        if (!ad) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        if (String(ad.sellerId) !== String(userId) && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
            return res.status(403).json({message: 'Немає прав для видалення'});
        }

        await CarAd.findByIdAndDelete(id);

        return res.json({message: 'Оголошення видалено'});
    } catch (error) {
        next(error);
    }
};

export const getAdAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const {id} = req.params;
        const userId = authReq.user?.userId;

        const user = await User.findById(userId);
        if (user?.accountType !== 'PREMIUM') {
            return res.status(403).json({message: 'Тільки PREMIUM користувачі'});
        }

        const ad = await CarAd.findById(id);
        if (!ad || String(ad.sellerId) !== String(userId)) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const regionAvg = await CarAd.aggregate([
            {$match: {region: ad.region, make: ad.make, model: ad.model}},
            {$group: {_id: null, avg: {$avg: '$originalPrice'}}}
        ]);

        const ukraineAvg = await CarAd.aggregate([
            {$match: {make: ad.make, model: ad.model}},
            {$group: {_id: null, avg: {$avg: '$originalPrice'}}}
        ]);

        return res.json({
            views: ad.views,
            avgPriceRegion: regionAvg[0]?.avg || 0,
            avgPriceUkraine: ukraineAvg[0]?.avg || 0
        });
    } catch (error) {
        next(error);
    }
};
