export class CurrencyService {
    static getRates() {
        return {USD_UAH: 41.50, EUR_UAH: 45.20};
    }

    static calculatePrices(price: number, currency: string) {
        const rates = this.getRates();
        let priceUAH = price;
        if (currency === 'USD') {
            priceUAH = price * rates.USD_UAH;
        } else if (currency === 'EUR') {
            priceUAH = price * rates.EUR_UAH;
        }
        return {
            rates,
            calculatedPrices: {
                UAH: Math.round(priceUAH),
                USD: Math.round(priceUAH / rates.USD_UAH),
                EUR: Math.round(priceUAH / rates.EUR_UAH)
            }
        };
    }
}
