import type { Card } from '@/types';
import { PlayCard, type CardSize } from '@/components/game/PlayCard';

/**
 * Khu vực bài trên tay người chơi.
 * Bài được xếp chồng (fan) bằng margin âm, lá đang chọn sẽ nâng lên.
 */
export function PlayerHand({
  cards,
  selected,
  onToggle,
  size = 'md',
  overlap = -34,
  disabled = false,
  animateDeal = false,
  dealKey = 0,
  skinId,
}: {
  cards: Card[];
  selected: string[];
  onToggle: (cardId: string) => void;
  size?: CardSize;
  overlap?: number;
  disabled?: boolean;
  animateDeal?: boolean;
  dealKey?: number;
  skinId?: string | null;
}) {
  return (
    <div className="flex w-full items-end justify-center px-1">
      <div className="flex items-end">
        {cards.map((card, index) => {
          const isSelected = selected.includes(card.id);
          return (
            <div
              key={card.id}
              style={{
                marginLeft: index === 0 ? 0 : overlap,
                // Giữ thứ tự xếp lớp theo vị trí trong bài: lá sau luôn nằm trên lá trước.
                // Nhờ vậy lá đang chọn (được nâng lên bằng transform) không che mất vùng bấm của các lá sau.
                zIndex: index,
              }}
            >
              <PlayCard
                key={`${card.id}-${dealKey}`}
                card={card}
                size={size}
                selected={isSelected}
                disabled={disabled}
                animate={animateDeal}
                skinId={skinId}
                onClick={() => !disabled && onToggle(card.id)}
                style={animateDeal ? { animationDelay: `${index * 45}ms` } : undefined}
              />
            </div>
          );
        })}
        {cards.length === 0 && (
          <span className="py-6 text-xs text-slate-500">Bạn đã đánh hết bài!</span>
        )}
      </div>
    </div>
  );
}
