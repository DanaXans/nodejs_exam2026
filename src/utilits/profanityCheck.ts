const BAD_WORDS_REGEX = /((сук|бля|хуй|пизд|жоп|еба|еб|ганд|муд)[а-яеёіїє]*)/i;

export const containsProfanity = (...texts: (string | undefined)[]): boolean => {
    return texts.some((text) => {
        if (!text) return false;
        return BAD_WORDS_REGEX.test(text);
    });
};