import { Bot, CheckCircle2, Coins, Crown } from 'lucide-react';
import type { TienLenPlayer } from '@/game-engine/tienlen';
import { Avatar } from '@/components/ui';
import { PlayerProfileButton } from '@/components/social/PlayerProfileButton';
import { ChatBubble } from '@/components/game/ChatBubble';
import { useRoomChat } from '@/contexts/RoomChatContext';
import { cn } from '@/utils/cn';
import { getCardSkinTheme } from '@/utils/cardSkins';

export type SeatPosition = 'top' | 'left' | 'right';

/**
 * Khung hiển thị một đối thủ quanh bàn chơi.
 * Bài của đối thủ được úp, chỉ hiển thị số lượng lá còn lại.
 */
export function SeatPanel({
  player,
  position,
  isTurn,
  passed,
  isThinking,
  online = false,
}: {
  player: TienLenPlayer;
  position: SeatPosition;
  isTurn: boolean;
  passed: boolean;
  isThinking: boolean;
  /** Ván trực tuyến — hiện nút kết bạn với đối thủ thật (không áp dụng cho AI). */
  online?: boolean;
}) {
  const finished = player.placement !== null;
  const placeLabel = finished ? ['', 'Nhất', 'Nhì', 'Ba', 'Bốn'][player.placement ?? 0] : null;

  const horizontal = position === 'top';
  const showSocial = online && !player.isBot;

  const { bubbleFor } = useRoomChat();
  const bubble = showSocial ? bubbleFor(player.id) : null;
  const profileRole = player.isBot ? 'Người máy' : finished ? placeLabel ?? 'Đã hoàn thành' : 'Người chơi';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-base-900/80 p-2.5 backdrop-blur-sm transition-all duration-300',
        isTurn ? 'border-neon-cyan/60 shadow-glow-cyan' : 'border-ink/5',
        position === 'left' && 'flex-col',
        position === 'right' && 'flex-col',
      )}
    >
      <div className="relative w-fit">
        {isTurn && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-neon-cyan" />
        )}
        <PlayerProfileButton
          contact={{ id: player.id, displayName: player.name, avatar: player.avatar }}
          summary={`${profileRole} · ${player.hand.length} lá còn lại`}
          disableSocial={player.isBot}
        >
          <Avatar
            src={player.avatar}
            name={player.name}
            size={horizontal ? 'md' : 'sm'}
            ring={isTurn}
          />
        </PlayerProfileButton>
        {finished && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
            {(player.placement ?? 0) === 1 ? <Crown className="h-3 w-3" /> : player.placement}
          </span>
        )}
        {bubble && (
          <ChatBubble
            type={bubble.type}
            text={bubble.text}
            stickerId={bubble.stickerId}
            className={cn(horizontal && 'max-w-[8rem]')}
          />
        )}
      </div>

      <div className={cn('min-w-0', !horizontal && 'text-center')}>
        <p className="flex items-center justify-center gap-1 truncate text-xs font-semibold text-slate-200">
          {player.isBot && <Bot className="h-3 w-3 shrink-0 text-slate-500" />}
          <span className="truncate">{player.name}</span>
        </p>

        {/* Số lá bài còn lại */}
        <div className={cn('mt-1 flex flex-wrap items-center gap-1', !horizontal && 'justify-center')}>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
            {player.hand.length} lá
          </span>
          {typeof player.coins === 'number' && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              <Coins className="h-2.5 w-2.5" />
              {player.coins.toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        {/* Trạng thái lượt */}
        <div className={cn('mt-1 flex gap-1', !horizontal && 'justify-center')}>
          {finished && placeLabel ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {placeLabel}
            </span>
          ) : isTurn ? (
            <span className="rounded-full bg-neon-cyan/15 px-2 py-0.5 text-[10px] font-semibold text-neon-cyan">
              {isThinking ? 'Đang suy nghĩ…' : 'Lượt này'}
            </span>
          ) : passed ? (
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Bỏ lượt
            </span>
          ) : null}
        </div>

      </div>

      {/* Úp bài đối thủ */}
      <div className={cn('flex items-center', position === 'top' && 'ml-auto pl-1')}>
        <MiniStack
          count={player.hand.length}
          vertical={position === 'top'}
          skinId={player.cardSkinId}
        />
      </div>

      {finished && (
        <CheckCircle2 className="hidden h-4 w-4 shrink-0 text-emerald-400 sm:block" />
      )}
    </div>
  );
}

/** Chồng bài úp thu nhỏ đại diện số lá còn lại. */
function MiniStack({
  count,
  vertical,
  skinId,
}: {
  count: number;
  vertical: boolean;
  skinId?: string | null;
}) {
  const shown = Math.min(Math.max(count, 0), 6);
  const skin = getCardSkinTheme(skinId);
  return (
    <div className={cn('flex', vertical ? '-space-x-3' : 'flex-col -space-y-3')}>
      {Array.from({ length: shown }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'relative h-6 w-4 rounded-[3px] border',
            skin?.backClass ?? 'border-ink/10 bg-gradient-to-br from-base-600 to-base-800',
          )}
        >
          {skin && index === shown - 1 && (
            <span className="absolute inset-0 flex items-center justify-center text-[7px]">{skin.mark}</span>
          )}
        </span>
      ))}
    </div>
  );
}
