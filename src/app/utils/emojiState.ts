import { emojiCategories } from '../data/emojis';
const knownEmoji = new Set(emojiCategories.flatMap((category) => category.emojis));
export function readEmojiList(
  key: string,
  limit: number
): { items: string[]; unavailable: boolean } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { items: [], unavailable: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], unavailable: true };
    const items = [
      ...new Set(
        parsed.filter(
          (value): value is string => typeof value === 'string' && knownEmoji.has(value)
        )
      ),
    ].slice(0, limit);
    return { items, unavailable: items.length !== parsed.length };
  } catch {
    return { items: [], unavailable: true };
  }
}
export function writeEmojiList(key: string, items: string[]): boolean {
  const current = readEmojiList(key, key === 'emojiHistory' ? 20 : 1000);
  if (current.unavailable) return false;
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
export function addRecent(history: string[], emoji: string): string[] {
  return [emoji, ...history.filter((item) => item !== emoji)].slice(0, 20);
}
const aliases: Record<string, string> = {
  '스마일 & 감정': 'smile smiles happy emotion emotions 웃음 행복',
  '감정 표현': 'expression expressions sad angry 감정 슬픔 분노',
  손동작: 'hand hands gesture gestures 손 제스처',
  사람: 'people person human 사람 인물',
  동물: 'animal animals 동물',
  음식: 'food foods fruit meal 음식 과일 식사',
  '스포츠 & 활동': 'sport sports activity activities 운동 활동',
  여행: 'travel transport vehicle vehicles 여행 교통',
  자연: 'nature weather earth sky 자연 날씨 하늘',
  사물: 'object objects device devices 사물 기기',
  심볼: 'symbol symbols heart hearts 기호 하트',
};
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[\uFE0E\uFE0F]/g, '')
    .trim();
}
export function matchesEmoji(emoji: string, query: string): boolean {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  const category = emojiCategories.find((item) => item.emojis.includes(emoji));
  const categoryText = normalizeSearch(
    `${category?.name ?? ''} ${aliases[category?.name ?? ''] ?? ''}`
  );
  return normalizeSearch(emoji).includes(normalized) || categoryText.includes(normalized);
}
