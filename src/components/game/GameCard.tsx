import { Play, Star, Users, Lock } from 'lucide-react';
import type { GameMeta } from '@/types';
import { GAME_CATEGORY_LABEL, GAME_STATUS_LABEL } from '@/types/game-registry';
import { Badge } from '@/components/ui';
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
          'group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-base-900/60 p-2.5 text-left transition-all hover:border-white/10 hover:bg-base-850',
          className,
        )}
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-neon-purple/40 to-neon-cyan/30">
          <img
            src={game.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-slate-100">{game.name}</span>
            {!playable && <Lock className="h-3 w-3 shrink-0 text-slate-500" />}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-slate-400">{game.tagline}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-base-850 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-glow',
        className,
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-neon-purple/40 via-base-800 to-neon-cyan/30">
        <img
          src={game.coverImage}
          alt={game.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent" />
        <span className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <Badge tone={STATUS_TONE[game.status]}>{GAME_STATUS_LABEL[game.status]}</Badge>
        </span>
        <span className="absolute right-2.5 top-2.5">
          <Badge tone="cyan" icon={<Users className="h-3 w-3" />}>
            {game.maxPlayers > 1 ? `${game.maxPlayers} người` : '1 người'}
          </Badge>
        </span>
      </span>

      <span className="flex flex-1 flex-col p-3">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-100 sm:text-base">
              {game.name}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-slate-400 sm:text-xs">
              {game.tagline}
            </span>
          </span>
        </span>

        <span className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            {game.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            {formatNumber(game.playCount)}
          </span>
          <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300">
            {GAME_CATEGORY_LABEL[primaryCategory]}
          </span>
        </span>

        <span
          className={cn(
            'mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors',
            playable
              ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white group-hover:brightness-110'
              : 'bg-white/5 text-slate-400',
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
