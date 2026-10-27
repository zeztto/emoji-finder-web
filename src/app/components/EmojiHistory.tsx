import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface EmojiHistoryProps {
  history: string[];
  onClear: () => void;
  onEmojiClick: (emoji: string) => void;
}

export function EmojiHistory({ history, onClear, onEmojiClick }: EmojiHistoryProps) {
  const handleCopy = async (emoji: string) => {
    const success = await copyToClipboard(emoji);
    if (success) {
      onEmojiClick(emoji);
      toast.success(`${emoji} 복사됨`);
    } else {
      toast.error('복사 실패');
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>최근 사용</CardTitle>
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
            aria-label="기록 지우기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {history.map((emoji, index) => (
            <button
              key={`history-${emoji}-${index}`}
              aria-label={`${emoji} 복사`}
              onClick={() => handleCopy(emoji)}
              className="w-12 h-12 flex items-center justify-center text-2xl bg-secondary rounded-lg hover:bg-accent transition-colors active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
