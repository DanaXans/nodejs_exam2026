export interface ExchangeRates {
    USD_UAH: number;
    EUR_UAH: number;
    source: 'privatbank' | 'mock';
    date: string;
}

export interface CalculatedPrices {
    USD: number;
    EUR: number;
    UAH: number;
}

const MOCK_RATES = {USD_UAH: 41.5, EUR_UAH: 45.2};
const PRIVAT_URL = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

let cached: ExchangeRates | null = null;

const today = () => new Date().toISOString().slice(0, 10);

const mockRates = (): ExchangeRates => ({
    ...MOCK_RATES,
    source: 'mock',
    date: today(),
});

const roundPrice = (value: number): number => Math.round(value * 100) / 100;

export const getRates = async (): Promise<ExchangeRates> => {
    const date = today();
    if (cached?.date === date) {
        return cached;
    }

    if (process.env.USE_MOCK_RATES === 'true') {
        cached = mockRates();
        return cached;
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

        cached = {USD_UAH: usd, EUR_UAH: eur, source: 'privatbank', date};
        return cached;
    } catch (error) {
        console.error('Не вдалося оновити курс ПриватБанку, використано mock:', error);
        cached = mockRates();
        return cached;
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
