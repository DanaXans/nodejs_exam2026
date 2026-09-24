export enum UserRole {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    MANAGER = 'MANAGER',
    ADMIN = 'ADMIN'
}

export enum AccountType {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM'
}

export interface IUserBase {
    name: string;
    email: string;
    role: UserRole;
    accountType: AccountType;
    permissions: string[];
    dealershipId?: string;
    createdAt?: Date;
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    UAH = 'UAH'
}

export enum AdStatus {
    ACTIVE = 'ACTIVE',
    PENDING_EDIT = 'PENDING_EDIT',
    INACTIVE = 'INACTIVE'
}

export interface CalculatedPrices {
    UAH: number;
    USD: number;
    EUR: number;
}

export interface ExchangeRates {
    USD_UAH: number;
    EUR_UAH: number;
}

export interface ICarAdBase {
    title: string;
    description: string;
    make: string;
    model: string;
    region: string;
    originalPrice: number;
    originalCurrency: Currency;
    calculatedPrices: CalculatedPrices;
    exchangeRatesUsed: ExchangeRates;
    status: AdStatus;
    badWordsAttempts: number;
    views: Date[];
    createdAt?: Date;
}