import { SUIT_SYMBOL, type Card } from '@/types';
import { RANK_LABEL } from '@/types/game';
import { cn } from '@/utils/cn';
import { getCardSkinTheme } from '@/utils/cardSkins';
import { CardSkinArtwork } from '@/components/game/CardSkinArtwork';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<CardSize, string> = {
  xs: 'h-14 w-10 text-[11px]',
  sm: 'h-20 w-14 text-xs',
  md: 'h-24 w-16 text-sm',
  lg: 'h-32 w-[5.5rem] text-base',
};

const CENTER_SIZE: Record<CardSize, string> = {
  xs: 'text-lg',
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

export interface PlayCardProps {
  card: Card;
  selected?: boolean;
  faceDown?: boolean;
  disabled?: boolean;
  size?: CardSize;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
  skinId?: string | null;
}

/** Lá bài. Hỗ trợ cả mặt úp (bài đối thủ) và mặt ngửa. */
export function PlayCard({
  card,
  selected = false,
  faceDown = false,
  disabled = false,
  size = 'md',
  onClick,
  className,
  style,
  animate = false,
  skinId,
}: PlayCardProps) {
  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const symbol = SUIT_SYMBOL[card.suit];
  const rank = RANK_LABEL[card.rank];
  const skin = getCardSkinTheme(skinId);

  if (faceDown) {
    return (
      <div
        className={cn(
          'relative shrink-0 rounded-lg border shadow-soft',
          skin?.backClass ?? 'border-ink/10 bg-gradient-to-br from-base-700 to-base-850',
          SIZE_CLASSES[size],
          className,
        )}
        style={style}
        aria-hidden
      >
        <div className={cn(
          'absolute inset-1 rounded-md border',
          skin?.innerClass ?? 'border-neon-purple/25 bg-[repeating-linear-gradient(45deg,rgba(168,85,247,0.18)_0px,rgba(168,85,247,0.18)_4px,transparent_4px,transparent_8px)]',
        )} />
        {skin && <span className="absolute inset-0 flex items-center justify-center text-lg">{skin.mark}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      style={style}
      className={cn(
        'relative isolate shrink-0 select-none overflow-hidden rounded-lg border p-1 text-left shadow-soft transition-all duration-200',
        skin?.faceClass ?? 'bg-slate-50',
        skin ? (isRed ? skin.redTextClass : skin.blackTextClass) : (isRed ? 'text-rose-600' : 'text-slate-900'),
        selected
          ? '-translate-y-4 border-neon-cyan ring-2 ring-neon-cyan/70'
          : 'border-black/10 hover:-translate-y-1.5',
        onClick && !disabled ? 'cursor-pointer' : 'cursor-default',
        animate && 'animate-play-card',
        SIZE_CLASSES[size],
        className,
      )}
      aria-pressed={selected}
    >
      {skin && <CardSkinArtwork skinId={skin.id} card={card} />}
      {skin && <span className="pointer-events-none absolute right-1 top-1 z-10 text-[0.55em] opacity-55">{skin.mark}</span>}
      <div className="relative z-10 flex flex-col items-start leading-none">
        <span className="font-bold">{rank}</span>
        <span className="text-[0.9em]">{symbol}</span>
      </div>
      {!skin && (
        <span
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center font-bold opacity-90',
            CENTER_SIZE[size],
          )}
        >
          {symbol}
        </span>
      )}
      <div className="absolute bottom-1 right-1 z-10 rotate-180 leading-none">
        <span className="block font-bold">{rank}</span>
        <span className="block text-[0.9em]">{symbol}</span>
      </div>
    </button>
  );
}
