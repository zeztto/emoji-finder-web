import React from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface EmojiGridProps {
  emojis: string[];
  favorites: string[];
  onEmojiClick: (emoji: string) => void;
  onToggleFavorite: (emoji: string) => void;
}

export function EmojiGrid({ emojis, favorites, onEmojiClick, onToggleFavorite }: EmojiGridProps) {
  const handleCopy = async (emoji: string) => {
    const success = await copyToClipboard(emoji);
    if (success) {
      onEmojiClick(emoji);
      toast.success(`${emoji} 복사됨`);
    } else {
      toast.error('복사 실패');
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, emoji: string) => {
    e.stopPropagation();
    onToggleFavorite(emoji);
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {emojis.map((emoji, index) => {
        const isFavorite = favorites.includes(emoji);
        return (
          <div
            key={`${emoji}-${index}`}
            className="group overflow-hidden rounded-lg border border-border"
          >
            <button
              aria-label={`${emoji} 복사`}
              onClick={() => handleCopy(emoji)}
              className="w-full min-h-16 flex items-center justify-center text-3xl sm:text-4xl bg-card hover:bg-accent transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {emoji}
            </button>
            <button
              onClick={(e) => handleFavoriteClick(e, emoji)}
              className="w-full min-h-9 flex items-center justify-center border-t border-border bg-background hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={`${emoji} ${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}`}
              aria-pressed={isFavorite}
            >
              <Star
                className={`w-3 h-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
