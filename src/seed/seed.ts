import bcrypt from 'bcryptjs';
import {CATALOG_SEED} from '../constants/catalogSeed.js';
import {AdView} from '../models/AdView.js';
import {CarAd} from '../models/CarAd.js';
import {CarMake} from '../models/CarMake.js';
import {User} from '../models/User.js';
import {applyPrices, copyInputOntoAd} from '../services/adService.js';
import {AccountType, Currency, UserRole} from '../types/index.js';

const DEMO_USERS = [
    {
        name: 'Адміністратор',
        email: 'admin@autoria.local',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        accountType: AccountType.BASIC,
    },
    {
        name: 'Преміум продавець',
        email: 'seller.premium@autoria.local',
        password: 'Seller123!',
        role: UserRole.SELLER,
        accountType: AccountType.PREMIUM,
    },
    {
        name: 'Базовий продавець',
        email: 'seller.basic@autoria.local',
        password: 'Seller123!',
        role: UserRole.SELLER,
        accountType: AccountType.BASIC,
    },
    {
        name: 'Покупець',
        email: 'buyer@autoria.local',
        password: 'Buyer123!',
        role: UserRole.BUYER,
        accountType: AccountType.BASIC,
    },
];

async function seedUsers() {
    for (const demo of DEMO_USERS) {
        const existing = await User.findOne({email: demo.email});
        if (existing) {
            continue;
        }
        await User.create({
            name: demo.name,
            email: demo.email,
            passwordHash: await bcrypt.hash(demo.password, 10),
            role: demo.role,
            accountType: demo.accountType,
            extraPermissions: [],
        });
    }
}

async function seedCatalog() {
    const count = await CarMake.countDocuments();
    if (count > 0) {
        return;
    }
    await CarMake.insertMany(CATALOG_SEED.map((make) => ({
        name: make.name,
        models: make.models.map((name) => ({name})),
    })));
}

async function seedSampleAds() {
    const count = await CarAd.countDocuments();
    if (count > 0) {
        return;
    }

    const seller = await User.findOne({email: 'seller.premium@autoria.local'});
    if (!seller) {
        return;
    }

    const samples = [
        {
            title: 'BMW X5 2019, Київ',
            description: 'Один власник, сервісна книжка, без ДТП.',
            make: 'BMW',
            model: 'X5',
            region: 'Київ',
            originalPrice: 25000,
            originalCurrency: Currency.USD,
        },
        {
            title: 'BMW X5 2018, Київ',
            description: 'Після ТО, гума нова, торг біля капота.',
            make: 'BMW',
            model: 'X5',
            region: 'Київ',
            originalPrice: 22000,
            originalCurrency: Currency.USD,
        },
        {
            title: 'BMW X5 2017, Львівщина',
            description: 'Пригнана з Німеччини, всі документи.',
            make: 'BMW',
            model: 'X5',
            region: 'Львівська область',
            originalPrice: 19000,
            originalCurrency: Currency.USD,
        },
        {
            title: 'Daewoo Lanos 2008',
            description: 'Міський автомобіль, їде своїм ходом.',
            make: 'Daewoo',
            model: 'Lanos',
            region: 'Одеська область',
            originalPrice: 2500,
            originalCurrency: Currency.USD,
        },
    ];

    const hoursAgo = [1, 5, 30, 24 * 3, 24 * 10, 24 * 20, 24 * 40];

    for (const sample of samples) {
        const ad = new CarAd({sellerId: seller._id, badWordsAttempts: 0, status: 'ACTIVE'});
        await copyInputOntoAd(ad, sample);
        ad.status = 'ACTIVE' as typeof ad.status;
        await applyPrices(ad, sample);
        await ad.save();

        await AdView.insertMany(hoursAgo.map((hours) => ({
            adId: ad._id,
            viewedAt: new Date(Date.now() - hours * 60 * 60 * 1000),
        })));
    }
}

export async function seedDatabase(): Promise<void> {
    await seedUsers();
    await seedCatalog();
    await seedSampleAds();
}
