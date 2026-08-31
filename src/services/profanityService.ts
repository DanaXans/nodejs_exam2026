export class ProfanityService {
    private static forbiddenWords = ['обман', 'кидалово', 'лохотрон', 'хлам', 'дурень'];

    static containsBadWords(text: string): boolean {
        const lowerText = text.toLowerCase();
        return this.forbiddenWords.some(word => lowerText.includes(word));
    }
}