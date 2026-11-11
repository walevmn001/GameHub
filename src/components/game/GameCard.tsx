import { Play, Star, Users, Lock } from 'lucide-react';
import type { GameMeta } from '@/types';
import { GAME_CATEGORY_LABEL, GAME_STATUS_LABEL } from '@/types/game-registry';
import { Badge } from '@/components/ui';
import { GameArt } from '@/components/illustrations/GameArt';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

const STATUS_TONE = {
  available: 'green',
  'in-development': 'amber',
  planned: 'neutral',
} as const;

export interface GameCardProps {
  game: GameMeta;
  onSelect: (game: GameMeta) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function GameCard({ game, onSelect, variant = 'default', className }: GameCardProps) {
  const playable = game.status === 'available';
  const primaryCategory = game.categories[0];

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => onSelect(game)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-2xl border border-base-700 bg-base-900 p-2.5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover',
          className,
        )}
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-base-700">
          <GameArt id={game.id} uid={`c-${game.id}`} className="h-full w-full" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-slate-100">{game.name}</span>
            {!playable && <Lock className="h-3 w-3 shrink-0 text-slate-500" />}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{game.tagline}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className={cn(
          'group relative flex flex-col overflow-hidden rounded-3xl border border-brand-200 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover',
        className,
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-50 via-base-850 to-brand-100">
        <GameArt id={game.id} uid={`g-${game.id}`} className="absolute inset-0 h-full w-full" />
        <span className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <Badge tone={STATUS_TONE[game.status]}>{GAME_STATUS_LABEL[game.status]}</Badge>
        </span>
        <span className="absolute right-2.5 top-2.5">
          <Badge tone="cyan" icon={<Users className="h-3 w-3" />}>
            {game.maxPlayers > 1 ? `${game.maxPlayers} người` : '1 người'}
          </Badge>
        </span>
      </span>

      <span className="flex flex-1 flex-col p-3.5">
        <span className="block truncate font-display text-base font-extrabold tracking-tight text-slate-100">
          {game.name}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-500 sm:text-xs">
          {game.tagline}
        </span>

        <span className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {game.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {formatNumber(game.playCount)}
          </span>
          <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 ring-1 ring-brand-100">
            {GAME_CATEGORY_LABEL[primaryCategory]}
          </span>
        </span>

        <span
          className={cn(
            'mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ease-out',
            playable
              ? 'btn-shine border border-brand-700/20 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-white drop-shadow-[0_1px_1px_rgba(22,72,32,0.28)] shadow-pop group-hover:-translate-y-0.5 group-hover:shadow-btn-hover'
              : 'border border-base-700 bg-base-800 text-slate-500',
          )}
        >
          {playable ? (
            <>
              <Play className="h-3.5 w-3.5" /> Chơi ngay
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Chưa mở
            </>
          )}
        </span>
      </span>
    </button>
  );
}
