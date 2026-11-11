import { cn } from '@/utils/cn';
import { getCardSkinTheme } from '@/utils/cardSkins';
import { CardSkinJoker, type JokerVariant } from '@/components/game/CardSkinArtwork';
import { SIZE_CLASSES, type CardSize } from '@/components/game/PlayCard';

/**
 * Lá Joker — chỉ mang tính sưu tầm/trang trí (không dùng trong ván Tiến Lên).
 * Mỗi theme có 2 biến thể: đỏ và đen, dùng chung khung/mặt bài với `PlayCard`.
 */
export function JokerCard({
  skinId,
  variant,
  size = 'md',
  className,
}: {
  skinId: string | null;
  variant: JokerVariant;
  size?: CardSize;
  className?: string;
}) {
  const skin = getCardSkinTheme(skinId);
  if (!skin) return null;

  const isRed = variant === 'red';

  return (
    <div
      className={cn(
        'relative isolate shrink-0 select-none overflow-hidden rounded-lg border p-1 shadow-soft',
        skin.faceClass,
        isRed ? skin.redTextClass : skin.blackTextClass,
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={`Joker ${isRed ? 'đỏ' : 'đen'} — ${skin.name}`}
    >
      <CardSkinJoker skinId={skin.id} variant={variant} />
      <div className="relative z-10 flex flex-col items-start leading-none">
        <span className="font-bold tracking-tight">JOKER</span>
      </div>
      <div className="absolute bottom-1 right-1 z-10 rotate-180 leading-none">
        <span className="block font-bold tracking-tight">JOKER</span>
      </div>
    </div>
  );
}
