/**
 * Kiểu dữ liệu cho Cửa hàng (shop) và Nhãn dán (sticker).
 *
 * Cửa hàng được thiết kế để MỞ RỘNG: hiện bán nhãn dán chat, sau này có thể bán
 * khung chat, skin bài, khung avatar... bằng cách thêm giá trị vào `ShopItemKind`
 * và thêm vật phẩm tương ứng trong `src/data/shopCatalog.ts`.
 */

/** Loại vật phẩm bán trong cửa hàng. Thêm giá trị mới khi muốn bán thêm loại khác. */
export type ShopItemKind = 'sticker' | 'chatFrame' | 'cardSkin' | 'avatarFrame';

/** Một vật phẩm trong cửa hàng. */
export interface ShopItem {
  id: string;
  kind: ShopItemKind;
  /** Nhóm hiển thị (bộ sưu tập) — dùng để gom nhóm trong cửa hàng và bộ chọn nhãn dán. */
  pack: string;
  name: string;
  /** Mô tả ngắn hiển thị trong cửa hàng. */
  description: string;
  /** Giá bằng xu. `0` = MIỄN PHÍ (mặc định đã sở hữu, không cần mua). */
  price: number;
  /**
   * Ảnh của nhãn dán. Có thể là:
   * - Đường dẫn TƯƠNG ĐỐI trong thư mục `public` (ví dụ `stickers/smile.svg`).
   * - HOẶC URL TUYỆT ĐỐI (`https://...`) trỏ tới ảnh host bên ngoài (GitHub/jsDelivr,
   *   Cloudinary, S3...) — dùng khi KHÔNG muốn lưu ảnh trên server web.
   * Không có `file` thì dùng `emoji` thay thế.
   */
  file?: string;
  /** Ký tự emoji dùng khi vật phẩm không có tệp ảnh. */
  emoji?: string;
}

/** Vật phẩm đang trang bị theo loại; mở rộng được cho các loại cosmetic sau này. */
export type ShopLoadout = Partial<Record<ShopItemKind, string>>;

/** Kết quả sau khi mua: số xu còn lại và danh sách id vật phẩm đã mua. */
export interface PurchaseResult {
  coins: number;
  owned: string[];
}

/** Loại nội dung một tin nhắn chat: văn bản thuần hoặc nhãn dán. */
export type MessageType = 'text' | 'sticker';
