import {Response} from 'express';
import {Permission} from '../constants/permissions.js';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {AdView} from '../models/AdView.js';
import {CarAd} from '../models/CarAd.js';
import {ContactRequest} from '../models/ContactRequest.js';
import {User} from '../models/User.js';
import {
    applyProfanityStatus,
    assertCanCreateListing,
    copyInputOntoAd,
    ensureDailyPriceSync,
    moderationMessage,
    parseAdInput,
    toAdDto,
} from '../services/adService.js';
import {sendEmailToManagers} from '../services/emailService.js';
import {AccountType, AdStatus, ContactPurpose, UserRole} from '../types/index.js';

async function notifyManagers(adId: string, sellerEmail: string, title: string) {
    await sendEmailToManagers({
        adId,
        subject: 'Оголошення потребує ручної перевірки',
        body: [
            'Автоматична перевірка не пропустила оголошення після 3 редагувань.',
            `Оголошення: ${adId}`,
            `Заголовок: ${title}`,
            `Продавець: ${sellerEmail}`,
            'Перевірте текст і або активуйте оголошення, або видаліть його.',
        ].join('\n'),
    });
}

export const getAds = async (req: AuthRequest, res: Response) => {
    await ensureDailyPriceSync();
    const filter: Record<string, unknown> = {status: AdStatus.ACTIVE};
    if (req.query.make) filter.make = String(req.query.make);
    if (req.query.model) filter.model = String(req.query.model);
    if (req.query.region) filter.region = String(req.query.region);

    const ads = await CarAd.find(filter).sort({createdAt: -1}).limit(100);
    res.json(ads.map(toAdDto));
};

export const getMyAds = async (req: AuthRequest, res: Response) => {
    await ensureDailyPriceSync();
    const ads = await CarAd.find({sellerId: req.auth?.id}).sort({createdAt: -1});
    res.json(ads.map(toAdDto));
};

export const getAd = async (req: AuthRequest, res: Response) => {
    await ensureDailyPriceSync();
    const ad = await CarAd.findById(req.params.id);
    if (!ad) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    const isOwner = req.auth?.id && String(ad.sellerId) === req.auth.id;
    const canModerate = req.auth?.permissions.includes(Permission.AD_MODERATE);
    if (ad.status !== AdStatus.ACTIVE && !isOwner && !canModerate) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    if (ad.status === AdStatus.ACTIVE) {
        await AdView.create({adId: ad._id, viewedAt: new Date()});
    }

    res.json(toAdDto(ad));
};

export const createAd = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.auth?.id);
    if (!user) {
        throw new HttpError(404, 'Користувача не знайдено');
    }

    await assertCanCreateListing(user);
    const input = await parseAdInput(req.body ?? {});
    const ad = new CarAd({sellerId: user._id});
    await copyInputOntoAd(ad, input);
    const moderation = applyProfanityStatus(ad, true);
    await ad.save();

    res.status(201).json({
        message: moderationMessage(ad, moderation.becameInactive),
        moderation: {
            passed: ad.status === AdStatus.ACTIVE,
            status: ad.status,
            attemptsUsed: ad.badWordsAttempts,
            attemptsLeft: ad.status === AdStatus.PENDING_EDIT ? 3 - ad.badWordsAttempts : 0,
        },
        ad: toAdDto(ad),
    });
};

export const updateAd = async (req: AuthRequest, res: Response) => {
    const ad = await CarAd.findById(req.params.id);
    if (!ad) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    const isOwner = String(ad.sellerId) === req.auth?.id;
    const isAdmin = req.auth?.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
        throw new HttpError(403, 'Редагувати можна лише власне оголошення');
    }
    if (isOwner && !req.auth?.permissions.includes(Permission.AD_UPDATE_OWN) && !isAdmin) {
        throw new HttpError(403, 'Недостатньо прав для редагування');
    }

    const input = await parseAdInput({
        title: req.body?.title ?? ad.title,
        description: req.body?.description ?? ad.description,
        make: req.body?.make ?? ad.make,
        model: req.body?.model ?? ad.model,
        region: req.body?.region ?? ad.region,
        originalPrice: req.body?.originalPrice ?? ad.originalPrice,
        originalCurrency: req.body?.originalCurrency ?? ad.originalCurrency,
    });

    await copyInputOntoAd(ad, input);
    const moderation = applyProfanityStatus(ad, false);
    await ad.save();

    if (moderation.becameInactive) {
        const seller = await User.findById(ad.sellerId);
        await notifyManagers(String(ad._id), seller?.email ?? 'unknown', ad.title);
    }

    res.json({
        message: moderationMessage(ad, moderation.becameInactive),
        moderation: {
            passed: ad.status === AdStatus.ACTIVE,
            status: ad.status,
            attemptsUsed: ad.badWordsAttempts,
            attemptsLeft: ad.status === AdStatus.PENDING_EDIT ? 3 - ad.badWordsAttempts : 0,
        },
        ad: toAdDto(ad),
    });
};

export const deleteAd = async (req: AuthRequest, res: Response) => {
    const ad = await CarAd.findById(req.params.id);
    if (!ad) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    const isOwner = String(ad.sellerId) === req.auth?.id;
    const canDeleteAny = req.auth?.permissions.includes(Permission.AD_DELETE_ANY);
    const canDeleteOwn = req.auth?.permissions.includes(Permission.AD_DELETE_OWN);
    if (canDeleteAny || (isOwner && canDeleteOwn)) {
        await CarAd.findByIdAndDelete(ad._id);
        res.json({message: 'Оголошення видалено'});
        return;
    }
    throw new HttpError(403, 'Немає прав для видалення');
};

export const getAdAnalytics = async (req: AuthRequest, res: Response) => {
    const ad = await CarAd.findById(req.params.id);
    if (!ad) {
        throw new HttpError(404, 'Оголошення не знайдено');
    }

    const isOwner = String(ad.sellerId) === req.auth?.id;
    const isAdmin = req.auth?.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
        throw new HttpError(403, 'Статистика доступна власнику оголошення');
    }
    if (req.auth?.accountType !== AccountType.PREMIUM && !isAdmin) {
        throw new HttpError(403, 'Статистика оголошень доступна лише для PREMIUM-акаунта');
    }

    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [total, day, week, month] = await Promise.all([
        AdView.countDocuments({adId: ad._id}),
        AdView.countDocuments({adId: ad._id, viewedAt: {$gte: dayAgo}}),
        AdView.countDocuments({adId: ad._id, viewedAt: {$gte: weekAgo}}),
        AdView.countDocuments({adId: ad._id, viewedAt: {$gte: monthAgo}}),
    ]);

    const baseMatch = {status: AdStatus.ACTIVE, make: ad.make, model: ad.model};
    const [regionStats, ukraineStats] = await Promise.all([
        CarAd.aggregate([
            {$match: {...baseMatch, region: ad.region}},
            {$group: {_id: null, avg: {$avg: '$calculatedPrices.UAH'}, count: {$sum: 1}}},
        ]),
        CarAd.aggregate([
            {$match: baseMatch},
            {$group: {_id: null, avg: {$avg: '$calculatedPrices.UAH'}, count: {$sum: 1}}},
        ]),
    ]);

    const avgPriceRegion = Math.round((regionStats[0]?.avg ?? 0) * 100) / 100;
    const avgPriceUkraine = Math.round((ukraineStats[0]?.avg ?? 0) * 100) / 100;

    res.json({
        adId: String(ad._id),
        currency: 'UAH',
        regionName: ad.region,
        views: {total, day, week, month},
        avgPriceRegion,
        avgPriceUkraine,
        samples: {
            region: regionStats[0]?.count ?? 0,
            ukraine: ukraineStats[0]?.count ?? 0,
        },
        listingPrice: {
            originalPrice: ad.originalPrice,
            originalCurrency: ad.originalCurrency,
            calculatedPrices: ad.calculatedPrices,
            exchangeRate: ad.exchangeRate,
        },
    });
};

export const contactSeller = async (req: AuthRequest, res: Response) => {
    const ad = await CarAd.findById(req.params.id);
    if (!ad || ad.status !== AdStatus.ACTIVE) {
        throw new HttpError(404, 'Активне оголошення не знайдено');
    }
    if (String(ad.sellerId) === req.auth?.id) {
        throw new HttpError(400, 'Не можна звʼязатися із самим собою');
    }

    const message = String(req.body?.message ?? '').trim();
    const purpose = String(req.body?.purpose ?? ContactPurpose.QUESTION).toUpperCase();
    if (!message) {
        throw new HttpError(400, 'Напишіть повідомлення продавцю');
    }
    if (!Object.values(ContactPurpose).includes(purpose as ContactPurpose)) {
        throw new HttpError(400, 'purpose має бути VIEWING, TEST_DRIVE або QUESTION');
    }

    const contact = await ContactRequest.create({
        adId: ad._id,
        buyerId: req.auth?.id,
        sellerId: ad.sellerId,
        message,
        purpose,
    });

    res.status(201).json({
        message: 'Повідомлення надіслано продавцю',
        contact,
    });
};

export const listContacts = async (req: AuthRequest, res: Response) => {
    const userId = req.auth?.id;
    const contacts = await ContactRequest.find({
        $or: [{buyerId: userId}, {sellerId: userId}],
    }).sort({createdAt: -1});
    res.json(contacts);
};
