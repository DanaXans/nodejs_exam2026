import {NextFunction, Response} from 'express';
import {Types} from 'mongoose';
import {CarAd, ICarAd} from '../models/CarAd.js';
import {User} from '../models/User.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {AccountType, AdStatus, Currency, UserRole} from '../types/index.js';
import {isKnownCar} from '../data/brands.js';
import {containsProfanity} from '../utils/profanity.js';
import {calculatePrices, getRates} from '../services/currencyService.js';

const MAX_PROFANITY_ATTEMPTS = 3;

type SellerInfo = {name: string; email: string};

const toDto = (ad: ICarAd, seller?: SellerInfo | null) => ({
    _id: String(ad._id),
    sellerId: String(ad.sellerId),
    sellerName: seller?.name ?? '',
    sellerEmail: seller?.email ?? '',
    title: ad.title,
    description: ad.description,
    make: ad.make,
    model: ad.model,
    region: ad.region,
    originalPrice: ad.originalPrice,
    originalCurrency: ad.originalCurrency,
    calculatedPrices: ad.calculatedPrices,
    status: ad.status,
    badWordsAttempts: ad.badWordsAttempts,
    views: ad.views,
    createdAt: ad.createdAt,
});

const loadSellers = async (sellerIds: Array<Types.ObjectId | string>) => {
    const sellers = await User.find({_id: {$in: sellerIds}}).select('name email');
    return new Map(sellers.map((seller) => [String(seller._id), {name: seller.name, email: seller.email}]));
};

const notifyManager = (adId: string, reason: string) => {
    console.log(`[MANAGER] Оголошення ${adId}: ${reason}`);
};

const moderateText = (title: string, description: string, previousAttempts: number) => {
    if (!containsProfanity(title, description)) {
        return {status: AdStatus.ACTIVE, attempts: previousAttempts, message: ''};
    }

    const attempts = previousAttempts + 1;
    if (attempts >= MAX_PROFANITY_ATTEMPTS) {
        return {
            status: AdStatus.INACTIVE,
            attempts,
            message: 'Оголошення деактивовано після 3 спроб. Менеджера повідомлено.',
        };
    }

    return {
        status: AdStatus.PENDING_EDIT,
        attempts,
        message: `Виявлено нецензурну лексику. Відредагуйте текст. Спроба ${attempts} з 3.`,
    };
};

const readAdInput = (body: Record<string, unknown>) => {
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const make = String(body.make ?? '').trim();
    const model = String(body.model ?? '').trim();
    const region = String(body.region ?? '').trim();
    const originalCurrency = String(body.originalCurrency ?? '').trim().toUpperCase();
    const originalPrice = Number(body.originalPrice);

    if (!title || !description || !make || !model || !region || !originalCurrency) {
        return {error: 'Всі поля обов\'язкові' as const};
    }
    if (title.length > 140 || description.length > 1000 || region.length > 80) {
        return {error: 'Заголовок, опис або регіон занадто довгі' as const};
    }
    if (!Object.values(Currency).includes(originalCurrency as Currency)) {
        return {error: 'Невалідна валюта. Дозволені USD, EUR, UAH' as const};
    }
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
        return {error: 'Невалідна ціна' as const};
    }
    if (!isKnownCar(make, model)) {
        return {error: 'Оберіть марку і модель зі списку. Якщо їх немає — повідомте адміністратора.' as const};
    }

    return {title, description, make, model, region, originalCurrency: originalCurrency as Currency, originalPrice};
};

const isStaff = (role?: UserRole) => role === UserRole.MANAGER || role === UserRole.ADMIN;

const readId = (value: string | string[] | undefined): string | null => {
    const id = Array.isArray(value) ? value[0] : value;
    if (!id || !Types.ObjectId.isValid(id)) {
        return null;
    }
    return id;
};

export const getAds = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const filter = isStaff(req.user?.role)
            ? {}
            : userId
                ? {$or: [{status: AdStatus.ACTIVE}, {sellerId: userId}]}
                : {status: AdStatus.ACTIVE};

        const ads = await CarAd.find(filter).sort({createdAt: -1});
        const sellers = await loadSellers(ads.map((ad) => ad.sellerId));
        return res.json(ads.map((ad) => toDto(ad, sellers.get(String(ad.sellerId)))));
    } catch (error) {
        next(error);
    }
};

export const getAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adId = readId(req.params.id);
        if (!adId) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const ad = await CarAd.findById(adId).select('+viewDates');
        if (!ad) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const isOwner = req.user?.userId === String(ad.sellerId);
        if (ad.status !== AdStatus.ACTIVE && !isOwner && !isStaff(req.user?.role)) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        if (ad.status === AdStatus.ACTIVE && !isOwner && !isStaff(req.user?.role)) {
            ad.viewDates = ad.viewDates ?? [];
            ad.viewDates.push(new Date());
            ad.views = ad.viewDates.length;
            await ad.save();
        }

        const seller = await User.findById(ad.sellerId).select('name email');
        return res.json(toDto(ad, seller));
    } catch (error) {
        next(error);
    }
};

export const createAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.userId;
        if (!sellerId) {
            return res.status(401).json({message: 'Не авторизовано'});
        }

        const user = await User.findById(sellerId);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено'});
        }
        if (user.role !== UserRole.SELLER) {
            return res.status(403).json({message: 'Створювати оголошення може лише продавець'});
        }

        const input = readAdInput(req.body as Record<string, unknown>);
        if ('error' in input) {
            return res.status(400).json({message: input.error});
        }

        if (user.accountType === AccountType.BASIC) {
            const listedCount = await CarAd.countDocuments({
                sellerId,
                status: {$in: [AdStatus.ACTIVE, AdStatus.PENDING_EDIT]},
            });
            if (listedCount >= 1) {
                return res.status(403).json({
                    message: 'BASIC-акаунт може мати лише одне активне оголошення. Перейдіть на PREMIUM для необмеженої кількості.',
                });
            }
        }

        const moderation = moderateText(input.title, input.description, 0);
        const rates = await getRates();
        const ad = await CarAd.create({
            sellerId,
            title: input.title,
            description: input.description,
            make: input.make,
            model: input.model,
            region: input.region,
            originalPrice: input.originalPrice,
            originalCurrency: input.originalCurrency,
            calculatedPrices: calculatePrices(input.originalPrice, input.originalCurrency, rates),
            status: moderation.status,
            badWordsAttempts: moderation.attempts,
            views: 0,
            viewDates: [],
        });

        if (moderation.status === AdStatus.INACTIVE) {
            notifyManager(String(ad._id), 'нецензурна лексика після 3 спроб');
        }

        return res.status(201).json({
            ...toDto(ad, user),
            ...(moderation.message ? {message: moderation.message} : {}),
        });
    } catch (error) {
        next(error);
    }
};

export const updateAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adId = readId(req.params.id);
        if (!adId) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const ad = await CarAd.findById(adId);
        if (!ad) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }
        if (String(ad.sellerId) !== req.user?.userId) {
            return res.status(403).json({message: 'Редагувати оголошення може лише його продавець'});
        }
        if (ad.status === AdStatus.INACTIVE) {
            return res.status(400).json({message: 'Неактивне оголошення не можна редагувати'});
        }

        const input = readAdInput(req.body as Record<string, unknown>);
        if ('error' in input) {
            return res.status(400).json({message: input.error});
        }

        const moderation = moderateText(input.title, input.description, ad.badWordsAttempts);
        const rates = await getRates();
        ad.set({
            title: input.title,
            description: input.description,
            make: input.make,
            model: input.model,
            region: input.region,
            originalPrice: input.originalPrice,
            originalCurrency: input.originalCurrency,
            calculatedPrices: calculatePrices(input.originalPrice, input.originalCurrency, rates),
            status: moderation.status,
            badWordsAttempts: moderation.attempts,
        });
        await ad.save();

        if (moderation.status === AdStatus.INACTIVE) {
            notifyManager(String(ad._id), 'нецензурна лексика після 3 спроб');
        }

        const seller = await User.findById(ad.sellerId).select('name email');
        return res.json({
            ...toDto(ad, seller),
            ...(moderation.message ? {message: moderation.message} : {}),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adId = readId(req.params.id);
        if (!adId) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const ad = await CarAd.findById(adId);
        if (!ad) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const isOwner = String(ad.sellerId) === req.user?.userId;
        if (!isOwner && !isStaff(req.user?.role)) {
            return res.status(403).json({message: 'Немає прав для видалення'});
        }

        await ad.deleteOne();
        return res.json({message: 'Оголошення видалено'});
    } catch (error) {
        next(error);
    }
};

export const getAdAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user || user.accountType !== AccountType.PREMIUM) {
            return res.status(403).json({message: 'Статистика доступна тільки PREMIUM-продавцям'});
        }

        const adId = readId(req.params.id);
        if (!adId) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const ad = await CarAd.findById(adId).select('+viewDates');
        if (!ad || String(ad.sellerId) !== String(user._id)) {
            return res.status(404).json({message: 'Оголошення не знайдено'});
        }

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const viewDates = ad.viewDates ?? [];
        const countSince = (period: number) => viewDates.filter((date) => now - new Date(date).getTime() <= period).length;

        const [regionAvg, ukraineAvg] = await Promise.all([
            CarAd.aggregate<{avg: number}>([
                {$match: {status: AdStatus.ACTIVE, region: ad.region, make: ad.make, model: ad.model}},
                {$group: {_id: null, avg: {$avg: '$calculatedPrices.USD'}}},
            ]),
            CarAd.aggregate<{avg: number}>([
                {$match: {status: AdStatus.ACTIVE, make: ad.make, model: ad.model}},
                {$group: {_id: null, avg: {$avg: '$calculatedPrices.USD'}}},
            ]),
        ]);

        const round = (value?: number) => Math.round((value || 0) * 100) / 100;

        return res.json({
            views: ad.views,
            viewsDay: countSince(day),
            viewsWeek: countSince(day * 7),
            viewsMonth: countSince(day * 30),
            avgPriceRegion: round(regionAvg[0]?.avg),
            avgPriceUkraine: round(ukraineAvg[0]?.avg),
            regionName: ad.region,
            currency: Currency.USD,
        });
    } catch (error) {
        next(error);
    }
};
