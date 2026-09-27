import http from 'node:http';
import type {AddressInfo} from 'node:net';
import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';

process.env.JWT_SECRET = 'verify_secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();

const {createApp, initDatabase} = await import('../src/app.ts');
await initDatabase();

const app = createApp();
const server = http.createServer(app);
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = (server.address() as AddressInfo).port;
const base = `http://127.0.0.1:${port}`;

type Json = Record<string, any>;

async function req(method: string, path: string, body?: Json, token?: string) {
    const response = await fetch(`${base}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return {status: response.status, data};
}

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

try {
    const health = await req('GET', '/api/health');
    assert(health.status === 200, 'health');

    const adminLogin = await req('POST', '/api/auth/login', {email: 'admin@autoria.local', password: 'Admin123!'});
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', 'admin login');
    const adminToken = adminLogin.data.token as string;

    const premiumLogin = await req('POST', '/api/auth/login', {email: 'seller.premium@autoria.local', password: 'Seller123!'});
    assert(premiumLogin.status === 200 && premiumLogin.data.user.accountType === 'PREMIUM', 'premium login');
    const premiumToken = premiumLogin.data.token as string;

    const basicLogin = await req('POST', '/api/auth/login', {email: 'seller.basic@autoria.local', password: 'Seller123!'});
    const basicToken = basicLogin.data.token as string;

    const buyerLogin = await req('POST', '/api/auth/login', {email: 'buyer@autoria.local', password: 'Buyer123!'});
    const buyerToken = buyerLogin.data.token as string;

    const forbiddenRole = await req('POST', '/api/auth/register', {
        name: 'Хтось',
        email: 'manager-self@autoria.local',
        password: '123456',
        role: 'MANAGER',
    });
    assert(forbiddenRole.status === 403, 'self register manager must fail');

    const makes = await req('GET', '/api/catalog/makes');
    assert(makes.status === 200 && makes.data.some((item: Json) => item.name === 'BMW'), 'makes');
    const models = await req('GET', '/api/catalog/makes/BMW/models');
    assert(models.data.models.includes('X5'), 'models');
    const regions = await req('GET', '/api/catalog/regions');
    assert(regions.data.includes('Київ') && regions.data.includes('Львівська область'), 'regions');
    const rates = await req('GET', '/api/catalog/rates');
    assert(rates.data.source === 'PrivatBank' && rates.data.USD_UAH > 0, 'rates');

    const ads = await req('GET', '/api/ads');
    assert(Array.isArray(ads.data) && ads.data.length >= 3, 'seed ads');
    assert(ads.data.every((ad: Json) => ad.status === 'ACTIVE' && ad.exchangeRate && ad.originalPrice), 'public ads shape');
    const kyivAd = ads.data.find((ad: Json) => ad.make === 'BMW' && ad.model === 'X5' && ad.region === 'Київ');
    assert(kyivAd, 'kyiv x5');

    const analyticsDenied = await req('GET', `/api/ads/${kyivAd._id}/analytics`, undefined, basicToken);
    assert(analyticsDenied.status === 403, 'basic analytics denied');

    const analytics = await req('GET', `/api/ads/${kyivAd._id}/analytics`, undefined, premiumToken);
    assert(analytics.status === 200, `premium analytics ${analytics.status} ${JSON.stringify(analytics.data)}`);
    assert(analytics.data.views.day === 2, `day views ${analytics.data.views.day}`);
    assert(analytics.data.views.week === 4, `week views ${analytics.data.views.week}`);
    assert(analytics.data.views.month === 6, `month views ${analytics.data.views.month}`);
    assert(analytics.data.views.total === 7, `total views ${analytics.data.views.total}`);
    assert(analytics.data.avgPriceRegion > 0 && analytics.data.avgPriceUkraine > 0, 'averages');
    assert(analytics.data.currency === 'UAH', 'average currency');

    const viewed = await req('GET', `/api/ads/${kyivAd._id}`);
    assert(viewed.status === 200, 'view ad');
    const analyticsAfterView = await req('GET', `/api/ads/${kyivAd._id}/analytics`, undefined, premiumToken);
    assert(analyticsAfterView.data.views.total === 8, 'view counted');

    const basicAd = await req('POST', '/api/ads', {
        title: 'Єдине авто базового продавця',
        description: 'Чисте оголошення без заборонених слів.',
        make: 'Daewoo',
        model: 'Lanos',
        region: 'Київ',
        originalPrice: 1800,
        originalCurrency: 'EUR',
    }, basicToken);
    assert(basicAd.status === 201 && basicAd.data.ad.status === 'ACTIVE', 'basic create');
    assert(basicAd.data.ad.originalCurrency === 'EUR', 'original currency kept');
    assert(basicAd.data.ad.calculatedPrices.EUR === 1800, 'original amount kept exactly');
    assert(basicAd.data.ad.exchangeRate.date === rates.data.date, 'rate date stored');

    const secondBasic = await req('POST', '/api/ads', {
        title: 'Друге авто',
        description: 'Має бути відхилене лімітом.',
        make: 'Kia',
        model: 'Ceed',
        region: 'Київ',
        originalPrice: 9000,
        originalCurrency: 'USD',
    }, basicToken);
    assert(secondBasic.status === 403, 'basic limit');

    const basicStats = await req('GET', `/api/ads/${basicAd.data.ad._id}/analytics`, undefined, basicToken);
    assert(basicStats.status === 403, 'own basic analytics denied');

    const dirty = await req('POST', '/api/ads', {
        title: 'Підозріле авто',
        description: 'Продаю машину, блядь, терміново.',
        make: 'BMW',
        model: 'X5',
        region: 'Одеська область',
        originalPrice: 10000,
        originalCurrency: 'USD',
    }, premiumToken);
    assert(dirty.status === 201 && dirty.data.ad.status === 'PENDING_EDIT', 'profanity keeps draft');
    assert(dirty.data.moderation.attemptsLeft === 3, 'three edits left');
    const hidden = await req('GET', '/api/ads');
    assert(!hidden.data.some((ad: Json) => ad._id === dirty.data.ad._id), 'pending is hidden');

    const dirtyPayload = {
        title: 'Підозріле авто',
        description: 'Знову блядь в тексті.',
        make: 'BMW',
        model: 'X5',
        region: 'Одеська область',
        originalPrice: 10000,
        originalCurrency: 'USD',
    };
    const edit1 = await req('PATCH', `/api/ads/${dirty.data.ad._id}`, dirtyPayload, premiumToken);
    const edit2 = await req('PATCH', `/api/ads/${dirty.data.ad._id}`, dirtyPayload, premiumToken);
    const edit3 = await req('PATCH', `/api/ads/${dirty.data.ad._id}`, dirtyPayload, premiumToken);
    assert(edit1.data.ad.status === 'PENDING_EDIT' && edit1.data.moderation.attemptsLeft === 2, 'edit 1');
    assert(edit2.data.ad.status === 'PENDING_EDIT' && edit2.data.moderation.attemptsLeft === 1, 'edit 2');
    assert(edit3.data.ad.status === 'INACTIVE', `edit 3 ${JSON.stringify(edit3.data)}`);

    const emails = await req('GET', '/api/moderation/emails', undefined, adminToken);
    assert(emails.status === 200 && emails.data.some((email: Json) => String(email.adId) === dirty.data.ad._id), 'manager email');

    const activated = await req('PATCH', `/api/moderation/ads/${dirty.data.ad._id}`, {action: 'ACTIVATE'}, adminToken);
    assert(activated.status === 200 && activated.data.ad.status === 'ACTIVE', 'manual activate');

    const fixed = await req('POST', '/api/ads', {
        title: 'Ще одне підозріле',
        description: 'Текст із словом блядь.',
        make: 'Audi',
        model: 'A4',
        region: 'Київ',
        originalPrice: 15000,
        originalCurrency: 'UAH',
    }, premiumToken);
    const fixedEdit = await req('PATCH', `/api/ads/${fixed.data.ad._id}`, {
        title: 'Audi A4 після правки',
        description: 'Нормальний опис без заборонених слів.',
        make: 'Audi',
        model: 'A4',
        region: 'Київ',
        originalPrice: 15000,
        originalCurrency: 'UAH',
    }, premiumToken);
    assert(fixedEdit.data.ad.status === 'ACTIVE', 'clean edit publishes');

    const missingMake = await req('POST', '/api/catalog/requests', {type: 'MAKE', name: 'Tesla'}, premiumToken);
    assert(missingMake.status === 201, 'catalog request');
    const approvedMake = await req('PATCH', `/api/catalog/requests/${missingMake.data.request._id}`, {action: 'APPROVE'}, adminToken);
    assert(approvedMake.status === 200, 'approve make');
    const missingModel = await req('POST', '/api/catalog/requests', {type: 'MODEL', make: 'Tesla', name: 'Model 3'}, premiumToken);
    await req('PATCH', `/api/catalog/requests/${missingModel.data.request._id}`, {action: 'APPROVE'}, adminToken);
    const tesla = await req('POST', '/api/ads', {
        title: 'Tesla Model 3',
        description: 'Нова марка після схвалення запиту.',
        make: 'Tesla',
        model: 'Model 3',
        region: 'Київ',
        originalPrice: 20000,
        originalCurrency: 'USD',
    }, premiumToken);
    assert(tesla.status === 201 && tesla.data.ad.make === 'Tesla', 'ad after catalog request');

    const unknownMake = await req('POST', '/api/ads', {
        title: 'Невідома марка',
        description: 'Цієї марки немає в списку.',
        make: 'Неіснуюча',
        model: 'X5',
        region: 'Київ',
        originalPrice: 1000,
        originalCurrency: 'USD',
    }, premiumToken);
    assert(unknownMake.status === 400, 'unknown make rejected');

    const contact = await req('POST', `/api/ads/${kyivAd._id}/contact`, {
        message: 'Хочу тест-драйв у суботу.',
        purpose: 'TEST_DRIVE',
    }, buyerToken);
    assert(contact.status === 201, 'contact');
    const inbox = await req('GET', '/api/contacts', undefined, premiumToken);
    assert(inbox.data.some((item: Json) => item.purpose === 'TEST_DRIVE'), 'seller sees contact');

    const upgradeBuyer = await req('POST', '/api/auth/upgrade-to-premium', undefined, buyerToken);
    assert(upgradeBuyer.status === 403, 'buyer cannot buy premium');
    const registered = await req('POST', '/api/auth/register', {
        name: 'Новий продавець',
        email: 'new.seller@autoria.local',
        password: '123456',
        role: 'SELLER',
    });
    const upgraded = await req('POST', '/api/auth/upgrade-to-premium', undefined, registered.data.token);
    assert(upgraded.status === 200 && upgraded.data.user.accountType === 'PREMIUM', 'mock payment');

    const manager = await req('POST', '/api/users/managers', {
        name: 'Менеджер платформи',
        email: 'manager@autoria.local',
        password: 'Manager123!',
    }, adminToken);
    assert(manager.status === 201 && manager.data.user.role === 'MANAGER', 'admin creates manager');
    const managerBySeller = await req('POST', '/api/users/managers', {
        name: 'Чужий',
        email: 'bad.manager@autoria.local',
        password: 'Manager123!',
    }, premiumToken);
    assert(managerBySeller.status === 403, 'seller cannot create manager');

    const managerLogin = await req('POST', '/api/auth/login', {email: 'manager@autoria.local', password: 'Manager123!'});
    const ban = await req('PATCH', `/api/users/${buyerLogin.data.user.id}/ban`, {banned: true, reason: 'спам'}, managerLogin.data.token);
    assert(ban.status === 200 && ban.data.user.banned === true, 'ban');
    const bannedLogin = await req('POST', '/api/auth/login', {email: 'buyer@autoria.local', password: 'Buyer123!'});
    assert(bannedLogin.status === 403, 'banned login');

    const salon = await req('POST', '/api/dealerships', {name: 'Київ Авто', city: 'Київ'}, adminToken);
    assert(salon.status === 201, 'dealership');
    const staff = await req('POST', `/api/dealerships/${salon.data.dealership._id}/staff`, {
        userId: registered.data.user.id,
        permissions: ['ad:create', 'dealership:view'],
    }, adminToken);
    assert(staff.status === 200 && staff.data.user.dealershipId, 'staff permissions');

    console.log('Усі перевірки пройшли');
} finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await mongoose.disconnect();
    await mongod.stop();
}
