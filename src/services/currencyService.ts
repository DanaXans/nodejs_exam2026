export interface ExchangeRates {
    USD_UAH: number;
    EUR_UAH: number;
}

export interface CalculatedPrices {
    USD: number;
    EUR: number;
    UAH: number;
}

const FALLBACK_RATES: ExchangeRates = {USD_UAH: 41.5, EUR_UAH: 45.2};
const DAY_MS = 24 * 60 * 60 * 1000;
const PRIVAT_URL = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

let cached: {rates: ExchangeRates; updatedAt: number} | null = null;

const roundPrice = (value: number): number => Math.round(value * 100) / 100;

export const getRates = async (): Promise<ExchangeRates> => {
    if (cached && Date.now() - cached.updatedAt < DAY_MS) {
        return cached.rates;
    }

    try {
        const response = await fetch(PRIVAT_URL);
        if (!response.ok) {
            throw new Error(`PrivatBank responded with ${response.status}`);
        }

        const data = (await response.json()) as Array<{ccy?: string; sale?: string}>;
        const usd = Number(data.find((item) => item.ccy === 'USD')?.sale);
        const eur = Number(data.find((item) => item.ccy === 'EUR')?.sale);
        if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(eur) || eur <= 0) {
            throw new Error('PrivatBank rates are missing');
        }

        cached = {rates: {USD_UAH: usd, EUR_UAH: eur}, updatedAt: Date.now()};
        return cached.rates;
    } catch (error) {
        console.error('Не вдалося оновити курс ПриватБанку, використано останній відомий:', error);
        return cached?.rates ?? FALLBACK_RATES;
    }
};

export const calculatePrices = (price: number, currency: string, rates: ExchangeRates): CalculatedPrices => {
    let priceUAH = price;
    if (currency === 'USD') {
        priceUAH = price * rates.USD_UAH;
    } else if (currency === 'EUR') {
        priceUAH = price * rates.EUR_UAH;
    }

    return {
        UAH: roundPrice(priceUAH),
        USD: roundPrice(priceUAH / rates.USD_UAH),
        EUR: roundPrice(priceUAH / rates.EUR_UAH),
    };
};
