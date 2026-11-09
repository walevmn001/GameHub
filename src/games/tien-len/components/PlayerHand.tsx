import type { Card } from '@/types';
import { PlayCard, type CardSize } from '@/components/game/PlayCard';
import { cn } from '@/utils/cn';

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
}: {
  cards: Card[];
  selected: string[];
  onToggle: (cardId: string) => void;
  size?: CardSize;
  overlap?: number;
  disabled?: boolean;
  animateDeal?: boolean;
  dealKey?: number;
}) {
  return (
    <div className="flex w-full items-end justify-center px-1">
      <div className="flex items-end">
        {cards.map((card, index) => {
          const isSelected = selected.includes(card.id);
          return (
            <div
              key={card.id}
              className={cn(index > 0 && 'z-0')}
              style={{
                marginLeft: index === 0 ? 0 : overlap,
                zIndex: isSelected ? 20 : index,
              }}
            >
              <PlayCard
                key={`${card.id}-${dealKey}`}
                card={card}
                size={size}
                selected={isSelected}
                disabled={disabled}
                animate={animateDeal}
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
