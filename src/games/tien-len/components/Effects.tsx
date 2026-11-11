import { useMemo } from 'react';
import { Coins, Sparkles, Swords } from 'lucide-react';
import { cn } from '@/utils/cn';

const CONFETTI_COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#34d399', '#f43f5e', '#38bdf8'];

/** Hoạt ảnh xào bài: các lá bài úp di chuyển/trộn ngẫu nhiên. */
export function ShuffleOverlay({ visible }: { visible: boolean }) {
  const cards = useMemo(
    () =>
      Array.from({ length: 11 }).map((_, index) => ({
        id: index,
        delay: index * 55,
      })),
    [],
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-4">
      <div className="relative h-40 w-32">
        {cards.map((card) => (
          <span
            key={card.id}
            className="absolute left-1/2 top-1/2 h-24 w-16 animate-shuffle-card rounded-lg border border-ink/15 bg-gradient-to-br from-base-600 to-base-850 shadow-soft"
            style={{ animationDelay: `${card.delay}ms` }}
          >
            <span className="absolute inset-1 rounded-md border border-neon-purple/30 bg-[repeating-linear-gradient(45deg,rgba(168,85,247,0.18)_0px,rgba(168,85,247,0.18)_4px,transparent_4px,transparent_8px)]" />
          </span>
        ))}
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-base-900/80 px-4 py-1.5 text-xs font-semibold text-neon-cyan">
        <Sparkles className="h-3.5 w-3.5" />
        Đang xào bài…
      </span>
    </div>
  );
}

/** Băng-rôn nhấn mạnh khi có lượt chặt, ví dụ "3 đôi thông chặt Heo đỏ!". */
export function CutBanner({ label, seq }: { label: string | null; seq: number }) {
  if (!label) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/4 z-40 flex justify-center">
      <div
        key={seq}
        className="flex animate-cut-flash items-center gap-2 rounded-2xl border border-rose-400/50 bg-rose-500/25 px-5 py-2.5 shadow-glow backdrop-blur-sm"
      >
        <Swords className="h-5 w-5 shrink-0 text-rose-200" />
        <span className="text-sm font-extrabold uppercase tracking-wide text-rose-50 sm:text-base">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Popup ăn trắng. */
export function WhiteWinPopup({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <div className="animate-white-win-pop rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-500/30 to-rose-500/25 px-8 py-6 text-center shadow-glow backdrop-blur-sm">
        <p className="text-3xl font-black tracking-tight text-amber-100 drop-shadow sm:text-4xl">
          ĂN TRẮNG
        </p>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-amber-200">{label}</p>
      </div>
    </div>
  );
}

/** Confetti rơi khi thắng ván. */
export function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo(
    () =>
      show
        ? Array.from({ length: 48 }).map((_, index) => ({
            id: index,
            left: Math.random() * 100,
            delay: Math.random() * 0.6,
            duration: 1.8 + Math.random() * 1.6,
            color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
            size: 6 + Math.random() * 6,
          }))
        : [],
    [show],
  );

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-0 animate-confetti-fall rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Hiệu ứng tiền xu bay lên kèm số xu thay đổi. */
export function CoinBurst({ show, amount }: { show: boolean; amount: number }) {
  const coins = useMemo(
    () =>
      show
        ? Array.from({ length: 8 }).map((_, index) => ({
            id: index,
            left: 36 + Math.random() * 28,
            delay: Math.random() * 0.4,
          }))
        : [],
    [show],
  );

  if (!show) return null;
  const positive = amount >= 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {coins.map((coin) => (
        <span
          key={coin.id}
          className="absolute bottom-24 animate-coin-pop"
          style={{ left: `${coin.left}%`, animationDelay: `${coin.delay}s` }}
        >
          <Coins className="h-6 w-6 text-amber-600 drop-shadow" />
        </span>
      ))}
      <div className="absolute inset-x-0 bottom-32 flex justify-center">
        <span
          className={cn(
            'animate-float-up rounded-full px-4 py-1.5 text-sm font-extrabold shadow-soft',
            positive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200',
          )}
        >
          {positive ? '+' : ''}
          {amount.toLocaleString('vi-VN')} xu
        </span>
      </div>
    </div>
  );
}
