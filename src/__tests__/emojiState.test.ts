import { beforeEach, expect, it } from 'vitest';
import { readEmojiList, addRecent, matchesEmoji } from '@/app/utils/emojiState';
beforeEach(() => localStorage.clear());
it('rejects malformed JSON independently without discarding the other list', () => {
  localStorage.setItem('emojiHistory', '[');
  localStorage.setItem('emojiFavorites', '["🐶"]');
  expect(readEmojiList('emojiHistory', 20)).toEqual({ items: [], unavailable: true });
  expect(readEmojiList('emojiFavorites', 1000).items).toEqual(['🐶']);
});
it('removes invalid items, deduplicates, preserves emoji sequences and caps history', () => {
  localStorage.setItem('emojiHistory', JSON.stringify(['❤️', '❤️', null, 5, 'not an emoji', '🐻‍❄️']));
  expect(readEmojiList('emojiHistory', 20)).toEqual({ items: ['❤️', '🐻‍❄️'], unavailable: true });
  const recent = addRecent(
    Array.from({ length: 20 }, (_, index) => String(index)),
    'new'
  );
  expect(recent).toHaveLength(20);
  expect(recent[0]).toBe('new');
  expect(addRecent(['❤️', '😀'], '😀')).toEqual(['😀', '❤️']);
});
it('matches multiword English and normalized Korean category phrases', () => {
  expect(matchesEmoji('⚽', 'SPORTS')).toBe(true);
  expect(matchesEmoji('😀', '스마일 & 감정'.normalize('NFD'))).toBe(true);
  expect(matchesEmoji('👩‍🦱', '👩‍🦱')).toBe(true);
  expect(matchesEmoji('❤️', '❤︎')).toBe(true);
  expect(matchesEmoji('🍔', 'animals')).toBe(false);
});
