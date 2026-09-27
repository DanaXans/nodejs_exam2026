const BAD_FRAGMENTS = [
    'хуй',
    'хуї',
    'хуя',
    'хує',
    'пізд',
    'пизд',
    'бляд',
    'блять',
    'єба',
    'еба',
    'їба',
    'сука',
    'мудак',
    'залуп',
    'підар',
    'пидор',
    'гандон',
    'йобан',
];

export function containsProfanity(...parts: Array<string | undefined>): boolean {
    const text = parts
        .filter((part): part is string => Boolean(part))
        .join(' ')
        .toLowerCase()
        .replace(/ё/g, 'е');

    return BAD_FRAGMENTS.some((fragment) => text.includes(fragment));
}
