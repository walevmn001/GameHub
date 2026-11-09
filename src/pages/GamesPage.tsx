import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Search } from 'lucide-react';
import type { GameCategory, GameMeta } from '@/types';
import { GAME_CATEGORY_LABEL } from '@/types/game-registry';
import { gameService } from '@/services/GameService';
import { useToast } from '@/contexts/ToastContext';
import { EmptyState, Input, SectionHeader, SegmentedControl } from '@/components/ui';
import { GameGrid } from '@/components/game/GameGrid';
import type { SegmentOption } from '@/components/ui/SegmentedControl';

type FilterKey = 'all' | 'available' | GameCategory;

export function GamesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const allGames = useMemo(() => gameService.listAllGames(), []);

  const options: SegmentOption<FilterKey>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'available', label: 'Chơi được' },
    { value: 'cards', label: GAME_CATEGORY_LABEL.cards },
    { value: 'strategy', label: GAME_CATEGORY_LABEL.strategy },
    { value: 'casual', label: GAME_CATEGORY_LABEL.casual },
    { value: 'versus', label: GAME_CATEGORY_LABEL.versus },
    { value: 'multiplayer', label: GAME_CATEGORY_LABEL.multiplayer },
  ];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allGames.filter((game) => {
      const matchesQuery =
        q.length === 0 ||
        game.name.toLowerCase().includes(q) ||
        game.tagline.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'available'
            ? game.status === 'available'
            : game.categories.includes(filter);
      return matchesQuery && matchesFilter;
    });
  }, [allGames, query, filter]);

  const handleSelect = (game: GameMeta) => {
    if (gameService.isPlayable(game.id)) {
      navigate(`/play/${game.id}`);
      return;
    }
    toast.info(`${game.name} chưa mở`, 'Trò chơi này đang được phát triển hoặc sắp ra mắt.');
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Tất cả trò chơi"
        subtitle="Danh sách game trong Game Registry — tự động cập nhật khi thêm game mới"
        icon={<Gamepad2 className="h-5 w-5" />}
      />

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Tìm trò chơi theo tên hoặc mô tả…"
          icon={<Search className="h-4 w-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="overflow-x-auto no-scrollbar">
          <SegmentedControl options={options} value={filter} onChange={setFilter} size="sm" />
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Không tìm thấy trò chơi phù hợp"
          description="Thử từ khoá khác hoặc bỏ bộ lọc."
        />
      ) : (
        <GameGrid games={results} onSelect={handleSelect} />
      )}
    </div>
  );
}
