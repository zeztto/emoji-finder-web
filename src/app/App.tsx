import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EmojiHistory } from './components/EmojiHistory';
import { EmojiCategory } from './components/EmojiCategory';
import { EmojiGrid } from './components/EmojiGrid';
import { CategoryNav } from './components/CategoryNav';
import { emojiCategories } from './data/emojis';
import { readEmojiList, writeEmojiList, addRecent, matchesEmoji } from './utils/emojiState';
import { Toaster } from './components/ui/sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Smile, Search } from 'lucide-react';

function App() {
  const [stored] = useState(() => ({
    history: readEmojiList('emojiHistory', 20),
    favorites: readEmojiList('emojiFavorites', 1000),
  }));
  const [history, setHistory] = useState<string[]>(stored.history.items);
  const [favorites, setFavorites] = useState<string[]>(stored.favorites.items);
  const [storageWarning, setStorageWarning] = useState(
    stored.history.unavailable || stored.favorites.unavailable
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!stored.history.unavailable && !writeEmojiList('emojiHistory', history))
      setStorageWarning(true);
  }, [history, stored]);
  useEffect(() => {
    if (!stored.favorites.unavailable && !writeEmojiList('emojiFavorites', favorites))
      setStorageWarning(true);
  }, [favorites, stored]);

  const handleEmojiClick = (emoji: string) => {
    setHistory((prev) => addRecent(prev, emoji));
  };

  const handleToggleFavorite = (emoji: string) => {
    setFavorites((prev) => {
      if (prev.includes(emoji)) {
        return prev.filter((e) => e !== emoji);
      } else {
        return [...prev, emoji];
      }
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleCategoryClick = (categoryName: string) => {
    const element = categoryRefs.current[categoryName];
    if (element) {
      const headerHeight =
        (document.querySelector('header')?.getBoundingClientRect().height ?? 0) + 16;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // 검색 필터링
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return emojiCategories;
    }

    return emojiCategories
      .map((category) => ({
        ...category,
        emojis: category.emojis.filter((emoji) => {
          return matchesEmoji(emoji, searchQuery);
        }),
      }))
      .filter((category) => category.emojis.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background break-keep [overflow-wrap:anywhere]">
      <Toaster position="top-center" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="w-6 h-6 text-primary" />
              <h1 className="text-xl">이모지 모음</h1>
            </div>

            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                aria-label="이모지 검색"
                placeholder="이모지·한국어 또는 영어 카테고리 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 탭 */}
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                전체
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                즐겨찾기 {favorites.length > 0 && `(${favorites.length})`}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                최근 사용 {history.length > 0 && `(${history.length})`}
              </TabsTrigger>
            </TabsList>

            {/* 카테고리 네비게이션 - 전체 탭에서만 표시 */}
            {activeTab === 'all' && !searchQuery.trim() && (
              <CategoryNav categories={emojiCategories} onCategoryClick={handleCategoryClick} />
            )}
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="w-full max-w-4xl mx-auto px-4 py-6">
          {storageWarning && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              저장 데이터를 읽거나 저장할 수 없습니다. 이 화면에서는 계속 사용할 수 있지만 다음
              방문에 기록이 유지되지 않을 수 있습니다.
            </p>
          )}
          {/* 전체 탭 */}
          <TabsContent value="all" className="space-y-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.name}
                  ref={(el) => {
                    categoryRefs.current[category.name] = el;
                  }}
                >
                  <EmojiCategory
                    name={category.name}
                    emojis={category.emojis}
                    favorites={favorites}
                    onEmojiClick={handleEmojiClick}
                    onToggleFavorite={handleToggleFavorite}
                    defaultOpen={true}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">검색 결과가 없습니다</div>
            )}
          </TabsContent>

          {/* 즐겨찾기 탭 */}
          <TabsContent value="favorites">
            {favorites.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg text-muted-foreground">즐겨찾기</h2>
                {favorites.filter((emoji) => matchesEmoji(emoji, searchQuery)).length === 0 && (
                  <p>검색 결과가 없습니다</p>
                )}
                <EmojiGrid
                  emojis={favorites.filter((emoji) => matchesEmoji(emoji, searchQuery))}
                  favorites={favorites}
                  onEmojiClick={handleEmojiClick}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                즐겨찾기한 이모지가 없습니다
              </div>
            )}
          </TabsContent>

          {/* 최근 사용 탭 */}
          <TabsContent value="history">
            {history.length > 0 ? (
              <>
                {history.filter((emoji) => matchesEmoji(emoji, searchQuery)).length === 0 && (
                  <p>검색 결과가 없습니다</p>
                )}
                <EmojiHistory
                  history={history.filter((emoji) => matchesEmoji(emoji, searchQuery))}
                  onClear={handleClearHistory}
                  onEmojiClick={handleEmojiClick}
                />
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">사용 기록이 없습니다</div>
            )}
          </TabsContent>
        </main>
      </Tabs>
      {/* 푸터 */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        이모지를 클릭하면 클립보드에 복사됩니다
      </footer>
    </div>
  );
}

export default App;
