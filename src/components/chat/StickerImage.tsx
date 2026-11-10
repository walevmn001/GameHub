import { getShopItem } from '@/data/shopCatalog';
import { cn } from '@/utils/cn';

/** Ảnh host bên ngoài (GitHub/jsDelivr, Cloudinary...) dùng URL tuyệt đối. */
function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Hiển thị một nhãn dán theo `id` trong danh mục cửa hàng.
 * `item.file` có thể là tệp ảnh tĩnh trong `public/` HOẶC URL tuyệt đối (ảnh host
 * bên ngoài); không có `file` thì dùng emoji thay thế.
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
    // `file` có thể là đường dẫn tương đối trong `public/` HOẶC URL tuyệt đối
    // (ảnh host bên ngoài: GitHub/jsDelivr, Cloudinary, S3...). URL tuyệt đối dùng trực tiếp.
    const src = isRemoteUrl(item.file)
      ? item.file
      : `${import.meta.env.BASE_URL}${item.file}`;
    return (
      <img
        src={src}
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
