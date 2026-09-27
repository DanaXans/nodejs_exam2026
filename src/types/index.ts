export enum UserRole {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    MANAGER = 'MANAGER',
    ADMIN = 'ADMIN',
}

export enum AccountType {
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    UAH = 'UAH',
}

export enum AdStatus {
    ACTIVE = 'ACTIVE',
    PENDING_EDIT = 'PENDING_EDIT',
    INACTIVE = 'INACTIVE',
}

export enum CatalogRequestType {
    MAKE = 'MAKE',
    MODEL = 'MODEL',
}

export enum CatalogRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum ContactPurpose {
    VIEWING = 'VIEWING',
    TEST_DRIVE = 'TEST_DRIVE',
    QUESTION = 'QUESTION',
}

export interface CalculatedPrices {
    UAH: number;
    USD: number;
    EUR: number;
}

export interface ExchangeRateSnapshot {
    source: 'PrivatBank';
    date: string;
    USD_UAH: number;
    EUR_UAH: number;
}
