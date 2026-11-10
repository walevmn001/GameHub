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
   * Đường dẫn ảnh tĩnh tương đối trong thư mục `public` (ví dụ `stickers/smile.svg`).
   * Chỉ dùng cho nhãn dán. Không có `file` thì dùng `emoji` thay thế.
   */
  file?: string;
  /** Ký tự emoji dùng khi vật phẩm không có tệp ảnh. */
  emoji?: string;
}

/** Kết quả sau khi mua: số xu còn lại và danh sách id vật phẩm đã mua. */
export interface PurchaseResult {
  coins: number;
  owned: string[];
}

/** Loại nội dung một tin nhắn chat: văn bản thuần hoặc nhãn dán. */
export type MessageType = 'text' | 'sticker';

/* --------------------------------------------------------------------------
 * Nhãn dán Stipop (lấy từ API bên thứ ba).
 * Chỉ khả dụng khi server cấu hình `STIPOP_API_KEY`; server đóng vai trò proxy để
 * giữ key bí mật. Ảnh nằm trên CDN `img.stipop.io` nên `url` được dùng TRỰC TIẾP
 * làm `stickerId` khi gửi.
 * ------------------------------------------------------------------------ */

/** Một gói nhãn dán Stipop. */
export interface StipopPack {
  id: string;
  name: string;
  /** Tên tác giả — BẮT BUỘC hiển thị (yêu cầu của Stipop để tránh vấn đề bản quyền). */
  artist: string;
  /** Ảnh đại diện của gói. */
  image: string;
  animated: boolean;
}

/** Một nhãn dán trong gói Stipop. */
export interface StipopSticker {
  /** URL ảnh trên CDN của Stipop — dùng trực tiếp làm `stickerId`. */
  url: string;
}

/** Chi tiết một gói Stipop (kèm danh sách nhãn dán). */
export interface StipopPackDetail extends StipopPack {
  stickers: StipopSticker[];
}

/** Kết quả danh sách gói Stipop. `enabled = false` khi server chưa cấu hình API key. */
export interface StipopFeed {
  enabled: boolean;
  packs: StipopPack[];
}
