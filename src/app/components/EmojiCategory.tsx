import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { EmojiGrid } from './EmojiGrid';

interface EmojiCategoryProps {
  name: string;
  emojis: string[];
  favorites: string[];
  onEmojiClick: (emoji: string) => void;
  onToggleFavorite: (emoji: string) => void;
  defaultOpen?: boolean;
}

export function EmojiCategory({
  name,
  emojis,
  favorites,
  onEmojiClick,
  onToggleFavorite,
  defaultOpen = true,
}: EmojiCategoryProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-3">
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full text-left group">
            <h2 className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
              {name}
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <EmojiGrid
            emojis={emojis}
            favorites={favorites}
            onEmojiClick={onEmojiClick}
            onToggleFavorite={onToggleFavorite}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
