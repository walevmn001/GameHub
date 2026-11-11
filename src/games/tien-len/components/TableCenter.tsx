import type { Combo } from '@/types';
import { PlayCard } from '@/components/game/PlayCard';
import { TurnTimer } from '@/components/game/TurnTimer';
import { cn } from '@/utils/cn';

/**
 * Khu vực trung tâm bàn chơi: đồng hồ lượt, bài vừa đánh và người đánh.
 */
export function TableCenter({
  combo,
  playerName,
  comboLabel,
  animKey,
  timer,
  waitingLabel,
  animate,
  skinId,
  victory = false,
}: {
  combo: Combo | null;
  playerName: string | null;
  comboLabel: string | null;
  animKey: number;
  /** Có giá trị khi đang là lượt người chơi. */
  timer: { progress: number; seconds: number } | null;
  waitingLabel: string | null;
  animate: boolean;
  skinId?: string | null;
  /** Ván đã kết thúc — lá bài trên bàn phát sáng ăn mừng. */
  victory?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {timer ? (
        <div className="flex flex-col items-center gap-1">
          <TurnTimer progress={timer.progress} seconds={timer.seconds} active size={52} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neon-cyan">
            Lượt của bạn
          </span>
        </div>
      ) : (
        waitingLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-base-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
            {waitingLabel}
          </span>
        )
      )}

      <div className="flex min-h-[6.5rem] w-full flex-col items-center justify-center gap-1.5">
        {combo ? (
          <>
            <p className="text-[11px] font-medium text-slate-400">
              <span className="font-semibold text-slate-200">{playerName}</span>
              {' · '}
              {comboLabel}
            </p>
            <div className="flex items-end justify-center">
              {combo.cards.map((card, index) => (
                <div
                  key={`${card.id}-${animKey}`}
                  style={{ marginLeft: index === 0 ? 0 : -30, zIndex: index }}
                >
                  <PlayCard
                    card={card}
                    size="sm"
                    skinId={skinId}
                    animate={animate}
                    victory={victory && !animate}
                    style={animate ? { animationDelay: `${index * 50}ms` } : undefined}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className={cn(
              'rounded-2xl border border-dashed border-ink/10 px-4 py-3 text-center',
            )}
          >
            <p className="text-xs font-medium text-slate-400">Vòng mới</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {playerName ? `${playerName} được quyền đánh tự do` : 'Đang chia bài…'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
