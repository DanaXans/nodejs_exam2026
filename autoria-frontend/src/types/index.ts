export type UserRole = 'BUYER' | 'SELLER' | 'MANAGER' | 'ADMIN';
export type AccountType = 'BASIC' | 'PREMIUM';
export type Currency = 'UAH' | 'USD' | 'EUR';
export type AdStatus = 'ACTIVE' | 'PENDING_EDIT' | 'INACTIVE';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accountType: AccountType;
}

export interface PublicUser extends User {
    isBanned: boolean;
}

export interface CalculatedPrices {
    UAH: number;
    USD: number;
    EUR: number;
}

export interface ExchangeRatesUsed {
    USD_UAH: number;
    EUR_UAH: number;
    source: 'privatbank' | 'mock';
    date: string;
}

export interface CarAd {
    _id: string;
    title: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
    calculatedPrices: CalculatedPrices;
    exchangeRatesUsed?: ExchangeRatesUsed;
    description: string;
    status: AdStatus;
    badWordsAttempts: number;
    views: number;
    sellerId: string;
    sellerName: string;
    sellerEmail: string;
    createdAt?: string;
    message?: string;
}

export interface AdInput {
    title: string;
    description: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
}

export interface AdAnalytics {
    views: number;
    viewsDay: number;
    viewsWeek: number;
    viewsMonth: number;
    avgPriceRegion: number;
    avgPriceUkraine: number;
    regionName: string;
    currency: Currency;
}

export interface SentEmail {
    id: string;
    to: string;
    subject: string;
    body: string;
    adId: string;
    createdAt: string;
}

export interface BrandRequest {
    id: string;
    make: string;
    model: string;
    sellerId: string;
    createdAt: string;
}
