import { SUIT_SYMBOL, type Card } from '@/types';
import { RANK_LABEL } from '@/types/game';
import { cn } from '@/utils/cn';
import { getCardSkinTheme, cardSkinFaceUrl, cardSkinBackUrl } from '@/utils/cardSkins';
import { CardSkinArtwork, CardSkinBack } from '@/components/game/CardSkinArtwork';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg';

export const SIZE_CLASSES: Record<CardSize, string> = {
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
  /** Ván đã kết thúc — lá bài phát sáng ăn mừng. */
  victory?: boolean;
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
  victory = false,
}: PlayCardProps) {
  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const symbol = SUIT_SYMBOL[card.suit];
  const rank = RANK_LABEL[card.rank];
  const skin = getCardSkinTheme(skinId);

  if (faceDown) {
    const backUrl = skin ? cardSkinBackUrl(skin.id) : null;
    if (backUrl) {
      return (
        <div
          className={cn('relative shrink-0 overflow-hidden rounded-lg shadow-soft', SIZE_CLASSES[size], className)}
          style={style}
          aria-hidden
        >
          <img
            src={backUrl}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>
      );
    }
    return (
      <div
        className={cn(
          'relative shrink-0 rounded-lg border shadow-soft',
          skin?.backClass ?? 'border-brand-500/60 bg-gradient-to-br from-brand-400 to-brand-600',
          SIZE_CLASSES[size],
          className,
        )}
        style={style}
        aria-hidden
      >
        {skin && <CardSkinBack skinId={skin.id} />}
        <div className={cn(
          'absolute inset-1 rounded-md border',
          skin?.innerClass ?? 'border-white/25 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_4px,transparent_4px,transparent_8px)]',
        )} />
        {skin && <span className="absolute inset-0 flex items-center justify-center text-lg">{skin.mark}</span>}
      </div>
    );
  }

  const faceUrl = skin ? cardSkinFaceUrl(skin.id, card) : null;
  if (faceUrl) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        style={style}
        aria-pressed={selected}
        aria-label={`${rank}${symbol}`}
        className={cn(
          'relative isolate shrink-0 select-none overflow-hidden rounded-lg shadow-soft transition-all duration-200',
          selected
            ? 'scale-105 -translate-y-4 ring-2 ring-neon-cyan/70 shadow-glow-cyan'
            : 'hover:-translate-y-1.5 hover:shadow-glow-cyan',
          onClick && !disabled ? 'cursor-pointer' : 'cursor-default',
          animate && 'animate-play-card',
          victory && 'animate-card-victory',
          SIZE_CLASSES[size],
          className,
        )}
      >
        <img
          src={faceUrl}
          alt={`${rank}${symbol}`}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {/*
          Ảnh dựng sẵn vẽ sẵn hạng/chất ở góc nhưng quá nhỏ khi thu về cỡ thẻ.
          Phủ nhãn hạng + chất cỡ lớn (theo tỉ lệ thẻ) lên hai góc để luôn đọc được.
        */}
        <span className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          <span
            className={cn(
              'absolute left-[6%] top-[4%] flex flex-col items-center rounded-md bg-white/85 px-1 py-px font-bold leading-tight shadow-sm ring-1 ring-black/5',
              isRed ? 'text-rose-600' : 'text-slate-900',
            )}
          >
            <span className="text-[1.1em]">{rank}</span>
            <span className="text-[0.95em]">{symbol}</span>
          </span>
          <span
            className={cn(
              'absolute bottom-[4%] right-[6%] flex rotate-180 flex-col items-center rounded-md bg-white/85 px-1 py-px font-bold leading-tight shadow-sm ring-1 ring-black/5',
              isRed ? 'text-rose-600' : 'text-slate-900',
            )}
          >
            <span className="text-[1.1em]">{rank}</span>
            <span className="text-[0.95em]">{symbol}</span>
          </span>
        </span>
      </button>
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
          ? 'scale-105 -translate-y-4 border-neon-cyan ring-2 ring-neon-cyan/70 shadow-glow-cyan'
          : 'border-black/10 hover:-translate-y-1.5 hover:shadow-glow-cyan',
        onClick && !disabled ? 'cursor-pointer' : 'cursor-default',
        animate && 'animate-play-card',
        victory && 'animate-card-victory',
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
