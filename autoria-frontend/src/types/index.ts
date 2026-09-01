export type UserRole = 'BUYER' | 'SELLER' | 'MANAGER' | 'ADMIN';
export const UserRole = {
    BUYER: 'BUYER' as const,
    SELLER: 'SELLER' as const,
    MANAGER: 'MANAGER' as const,
    ADMIN: 'ADMIN' as const,
};

export type AccountType = 'BASIC' | 'PREMIUM';
export const AccountType = {
    BASIC: 'BASIC' as const,
    PREMIUM: 'PREMIUM' as const,
};

export type Currency = 'UAH' | 'USD' | 'EUR';
export const Currency = {
    UAH: 'UAH' as const,
    USD: 'USD' as const,
    EUR: 'EUR' as const,
};

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
