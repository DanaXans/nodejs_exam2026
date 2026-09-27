import {CarAd, ICarAd} from '../models/CarAd.js';
import {CarMake} from '../models/CarMake.js';
import {IUser} from '../models/User.js';
import {REGIONS} from '../constants/regions.js';
import {HttpError} from '../errors/HttpError.js';
import {AccountType, AdStatus, Currency, UserRole} from '../types/index.js';
import {escapeRegex} from '../utils/money.js';
import {convertPrice, getTodayRate} from './currencyService.js';
import {containsProfanity} from './profanityService.js';

export const MAX_PROFANITY_EDITS = 3;

export interface AdInput {
    title: string;
    description: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
}

let syncedRateDate: string | null = null;

export async function ensureDailyPriceSync(): Promise<void> {
    const rate = await getTodayRate();
    if (syncedRateDate === rate.date) {
        return;
    }

    const staleAds = await CarAd.find({'exchangeRate.date': {$ne: rate.date}});
    for (const ad of staleAds) {
        ad.calculatedPrices = convertPrice(ad.originalPrice, ad.originalCurrency, rate);
        ad.exchangeRate = rate;
        await ad.save();
    }
    syncedRateDate = rate.date;
}

export function resetPriceSyncCache(): void {
    syncedRateDate = null;
}

export async function parseAdInput(body: Record<string, unknown>): Promise<AdInput> {
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const makeName = String(body.make ?? '').trim();
    const modelName = String(body.model ?? '').trim();
    const region = String(body.region ?? '').trim();
    const originalCurrency = String(body.originalCurrency ?? '').trim().toUpperCase();
    const originalPrice = Number(body.originalPrice);

    if (!title || !description || !makeName || !modelName || !region || !originalCurrency) {
        throw new HttpError(400, 'Усі поля оголошення є обовʼязковими');
    }
    if (title.length > 140) {
        throw new HttpError(400, 'Заголовок має бути не довшим за 140 символів');
    }
    if (description.length > 2000) {
        throw new HttpError(400, 'Опис має бути не довшим за 2000 символів');
    }
    if (!Object.values(Currency).includes(originalCurrency as Currency)) {
        throw new HttpError(400, 'Валюта має бути USD, EUR або UAH');
    }
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
        throw new HttpError(400, 'Ціна має бути додатним числом');
    }
    if (!REGIONS.includes(region as (typeof REGIONS)[number])) {
        throw new HttpError(400, 'Оберіть регіон зі списку. Список: GET /api/catalog/regions');
    }

    const make = await CarMake.findOne({name: new RegExp(`^${escapeRegex(makeName)}$`, 'i')});
    if (!make) {
        throw new HttpError(400, 'Такої марки немає в каталозі. Повідомте адміністрацію через POST /api/catalog/requests');
    }
    const model = make.models.find((item) => item.name.toLowerCase() === modelName.toLowerCase());
    if (!model) {
        throw new HttpError(400, 'Такої моделі немає для обраної марки. Повідомте адміністрацію через POST /api/catalog/requests');
    }

    return {
        title,
        description,
        make: make.name,
        model: model.name,
        region,
        originalPrice,
        originalCurrency: originalCurrency as Currency,
    };
}

export async function assertCanCreateListing(user: IUser): Promise<void> {
    if (user.role === UserRole.ADMIN || user.accountType === AccountType.PREMIUM) {
        return;
    }

    const activeCount = await CarAd.countDocuments({
        sellerId: user._id,
        status: {$in: [AdStatus.ACTIVE, AdStatus.PENDING_EDIT]},
    });
    if (activeCount >= 1) {
        throw new HttpError(
            403,
            'BASIC-акаунт може мати лише одне оголошення на продаж. Для необмеженої кількості потрібен PREMIUM.',
        );
    }
}

export async function applyPrices(ad: ICarAd, input: AdInput): Promise<void> {
    const rate = await getTodayRate();
    ad.originalPrice = input.originalPrice;
    ad.originalCurrency = input.originalCurrency;
    ad.calculatedPrices = convertPrice(input.originalPrice, input.originalCurrency, rate);
    ad.exchangeRate = rate;
}

export function applyProfanityStatus(ad: ICarAd, isCreate: boolean): {dirty: boolean; becameInactive: boolean} {
    const dirty = containsProfanity(ad.title, ad.description);

    if (isCreate) {
        ad.badWordsAttempts = 0;
        ad.status = dirty ? AdStatus.PENDING_EDIT : AdStatus.ACTIVE;
        return {dirty, becameInactive: false};
    }

    if (ad.status === AdStatus.INACTIVE) {
        throw new HttpError(403, 'Оголошення неактивне після 3 невдалих перевірок. Його розглядає менеджер, редагування закрите.');
    }

    if (ad.status === AdStatus.PENDING_EDIT) {
        ad.badWordsAttempts += 1;
        if (!dirty) {
            ad.status = AdStatus.ACTIVE;
            return {dirty: false, becameInactive: false};
        }
        if (ad.badWordsAttempts >= MAX_PROFANITY_EDITS) {
            ad.status = AdStatus.INACTIVE;
            return {dirty: true, becameInactive: true};
        }
        ad.status = AdStatus.PENDING_EDIT;
        return {dirty: true, becameInactive: false};
    }

    if (dirty) {
        ad.status = AdStatus.PENDING_EDIT;
        ad.badWordsAttempts = 0;
        return {dirty: true, becameInactive: false};
    }

    return {dirty: false, becameInactive: false};
}

export function moderationMessage(ad: ICarAd, becameInactive: boolean): string {
    if (becameInactive || ad.status === AdStatus.INACTIVE) {
        return 'Оголошення не пройшло перевірку після 3 редагувань. Статус: неактивне. Менеджеру надіслано лист.';
    }
    if (ad.status === AdStatus.PENDING_EDIT) {
        const left = MAX_PROFANITY_EDITS - ad.badWordsAttempts;
        return `Знайдено нецензурну лексику. Відредагуйте оголошення. Залишилось спроб: ${left}.`;
    }
    return 'Оголошення активне і опубліковане на платформі.';
}

export function toAdDto(ad: ICarAd) {
    return {
        _id: String(ad._id),
        sellerId: String(ad.sellerId),
        title: ad.title,
        description: ad.description,
        make: ad.make,
        model: ad.model,
        region: ad.region,
        originalPrice: ad.originalPrice,
        originalCurrency: ad.originalCurrency,
        calculatedPrices: ad.calculatedPrices,
        exchangeRate: ad.exchangeRate,
        status: ad.status,
        badWordsAttempts: ad.badWordsAttempts,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
    };
}

export async function copyInputOntoAd(ad: ICarAd, input: AdInput): Promise<void> {
    ad.title = input.title;
    ad.description = input.description;
    ad.make = input.make;
    ad.model = input.model;
    ad.region = input.region;
    await applyPrices(ad, input);
}
