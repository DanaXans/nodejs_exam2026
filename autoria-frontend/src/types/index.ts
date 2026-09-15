export type UserRole = 'BUYER' | 'SELLER' | 'MANAGER' | 'ADMIN';
export const UserRole = {
    BUYER: 'BUYER',
    SELLER: 'SELLER',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
} as const;

export type AccountType = 'BASIC' | 'PREMIUM';
export const AccountType = {
    BASIC: 'BASIC',
    PREMIUM: 'PREMIUM',
} as const;

export type Currency = 'UAH' | 'USD' | 'EUR';
export const Currency = {
    UAH: 'UAH',
    USD: 'USD',
    EUR: 'EUR',
} as const;

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accountType: AccountType;
    token?: string;
}

export interface CalculatedPrices {
    UAH: number;
    USD: number;
    EUR: number;
}

export interface CarAd {
    _id: string;
    title: string;
    make: string;
    brand?: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
    currency?: Currency;
    calculatedPrices: CalculatedPrices;
    description: string;
    status?: string;
    views: number;
    sellerId: string;
    createdAt?: string;
}

export interface AdAnalytics {
    views: number;
    avgPriceRegion: number;
    avgPriceUkraine: number;
    regionName: string;
}
