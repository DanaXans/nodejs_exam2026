const BAD_WORDS = /пизд|хуй|бляд|блять|ебат|ебан|ебуч|сука|мудак|хер|говно|дерьмо|срань/i;

export const containsProfanity = (...texts: Array<string | undefined>): boolean => {
    return BAD_WORDS.test(texts.filter(Boolean).join(' ').toLowerCase());
};
