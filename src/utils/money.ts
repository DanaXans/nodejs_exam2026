export function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
