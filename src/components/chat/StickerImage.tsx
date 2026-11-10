import { getShopItem } from '@/data/shopCatalog';
import { cn } from '@/utils/cn';

/**
 * Hiển thị một nhãn dán theo id trong danh mục cửa hàng.
 * Ưu tiên tệp ảnh tĩnh (`item.file`); nếu vật phẩm không có tệp thì dùng emoji thay thế.
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
