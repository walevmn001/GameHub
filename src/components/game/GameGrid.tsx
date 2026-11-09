import type { GameMeta } from '@/types';
import { GameCard } from './GameCard';
import { cn } from '@/utils/cn';

export function GameGrid({
  games,
  onSelect,
  className,
}: {
  games: GameMeta[];
  onSelect: (game: GameMeta) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4',
        className,
      )}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} onSelect={onSelect} className="animate-fade-in" />
      ))}
    </div>
  );
}

/** Danh sách cuộn ngang cho màn hình nhỏ, hiển thị dạng thẻ gọn. */
export function GameRow({
  games,
  onSelect,
  className,
}: {
  games: GameMeta[];
  onSelect: (game: GameMeta) => void;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} onSelect={onSelect} variant="compact" />
      ))}
    </div>
  );
}
