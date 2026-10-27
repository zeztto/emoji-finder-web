import React from 'react';
import { EmojiCategory } from '../data/emojis';

interface CategoryNavProps {
  categories: EmojiCategory[];
  onCategoryClick: (categoryName: string) => void;
}

// 카테고리별 대표 이모지
const categoryIcons: Record<string, string> = {
  '스마일 & 감정': '😀',
  '감정 표현': '😢',
  손동작: '👋',
  사람: '👨',
  동물: '🐶',
  음식: '🍔',
  '스포츠 & 활동': '⚽',
  여행: '✈️',
  자연: '🌈',
  사물: '💻',
  심볼: '❤️',
};

export function CategoryNav({ categories, onCategoryClick }: CategoryNavProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryClick(category.name)}
            className="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg bg-card border border-border hover:bg-accent transition-colors active:scale-95 shrink-0"
          >
            <span className="text-2xl">{categoryIcons[category.name] || '📁'}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {category.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
