import { getShopItem } from '@/data/shopCatalog';
import { cn } from '@/utils/cn';

/** Nhãn dán ngoài danh mục (Stipop) dùng URL ảnh trực tiếp làm `stickerId`. */
function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Hiển thị một nhãn dán.
 * - Nhãn trong danh mục cửa hàng: dùng tệp ảnh tĩnh (`item.file`), hoặc emoji thay thế.
 * - Nhãn Stipop: `stickerId` là URL ảnh trên CDN nên tải trực tiếp.
 * Dùng chung cho mọi khung chat: riêng, phòng chờ và trong trận.
 */
export function StickerImage({
  stickerId,
  size = 84,
  className,
}: {
  stickerId: string;
  size?: number;
  className?: string;
}) {
  if (isRemoteUrl(stickerId)) {
    return (
      <img
        src={stickerId}
        alt="Nhãn dán"
        width={size}
        height={size}
        loading="lazy"
        draggable={false}
        className={cn('pointer-events-none select-none object-contain', className)}
      />
    );
  }

  const item = getShopItem(stickerId);
  if (!item) return <span className={className}>❓</span>;

  if (item.file) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}${item.file}`}
        alt={item.name}
        width={size}
        height={size}
        draggable={false}
        className={cn('pointer-events-none select-none', className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={item.name}
      className={className}
      style={{ fontSize: size * 0.8, lineHeight: 1 }}
    >
      {item.emoji ?? '❓'}
    </span>
  );
}
