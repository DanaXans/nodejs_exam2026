import {ExchangeRate} from '../models/ExchangeRate.js';
import {CalculatedPrices, Currency, ExchangeRateSnapshot} from '../types/index.js';
import {roundMoney} from '../utils/money.js';

export function kyivDate(date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Kyiv',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

/**
 * Мок курсу ПриватБанку. Для однієї календарної дати (Київ) курс завжди однаковий,
 * наступного дня змінюється. Реальний HTTP-запит до банку не потрібен для перевірки.
 */
export function mockPrivatBankRate(date: string): ExchangeRateSnapshot {
    let hash = 0;
    for (const char of date) {
        hash = (hash * 33 + char.charCodeAt(0)) % 1000;
    }
    const usd = 41.2 + (hash % 100) / 100;
    const eur = 44.8 + ((hash * 7) % 120) / 100;
    return {
        source: 'PrivatBank',
        date,
        USD_UAH: roundMoney(usd),
        EUR_UAH: roundMoney(eur),
    };
}

export async function getTodayRate(): Promise<ExchangeRateSnapshot> {
    const date = kyivDate();
    const existing = await ExchangeRate.findOne({date});
    if (existing) {
        return {
            source: 'PrivatBank',
            date: existing.date,
            USD_UAH: existing.USD_UAH,
            EUR_UAH: existing.EUR_UAH,
        };
    }

    const mock = mockPrivatBankRate(date);
    try {
        await ExchangeRate.create(mock);
    } catch (error) {
        const duplicate = typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
        if (!duplicate) {
            throw error;
        }
    }

    const stored = await ExchangeRate.findOne({date});
    if (!stored) {
        return mock;
    }
    return {
        source: 'PrivatBank',
        date: stored.date,
        USD_UAH: stored.USD_UAH,
        EUR_UAH: stored.EUR_UAH,
    };
}

export function convertPrice(price: number, currency: Currency, rate: ExchangeRateSnapshot): CalculatedPrices {
    let uah = price;
    if (currency === Currency.USD) {
        uah = price * rate.USD_UAH;
    } else if (currency === Currency.EUR) {
        uah = price * rate.EUR_UAH;
    }

    const calculated: CalculatedPrices = {
        UAH: roundMoney(uah),
        USD: roundMoney(uah / rate.USD_UAH),
        EUR: roundMoney(uah / rate.EUR_UAH),
    };
    calculated[currency] = roundMoney(price);
    return calculated;
}
