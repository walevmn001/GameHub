import type { ShopItem, ShopItemKind } from '@/types';

/**
 * ============================================================================
 *  DANH MỤC CỬA HÀNG (SHOP CATALOG) — NGUỒN DỮ LIỆU DUY NHẤT
 * ============================================================================
 *  File này được dùng CHUNG cho cả client và server (server đọc để xác thực giá
 *  và quyền sở hữu). Vì vậy chỉ dùng mã thuần TypeScript, KHÔNG import React
 *  hay API trình duyệt.
 *
 *  ➜ Cách thêm một NHÃN DÁN mới:
 *      1. Thả tệp ảnh vào `public/stickers/<id>.svg` (đặt tên = `id`).
 *      2. Thêm một mục vào `SHOP_ITEMS` bên dưới (đặt `price: 0` để MIỄN PHÍ).
 *    Không cần sửa gì khác — cửa hàng, bộ chọn nhãn dán và server tự nhận.
 *
 *  ➜ Cách thêm LOẠI vật phẩm mới (khung chat, skin bài, khung avatar...):
 *      1. Thêm giá trị vào `ShopItemKind` trong `src/types/shop.ts`.
 *      2. Thêm nhãn hiển thị vào `SHOP_KINDS` bên dưới.
 *      3. Thêm các vật phẩm vào `SHOP_ITEMS` với `kind` tương ứng.
 *    Cửa hàng sẽ tự tạo tab cho loại mới và tự ẩn tab khi chưa có vật phẩm.
 *
 *  ➜ Đổi miễn phí / bán: chỉ cần sửa trường `price` (0 = miễn phí).
 * ============================================================================
 */

/** Nhãn hiển thị của từng bộ sưu tập (pack). Thêm bộ mới thì thêm dòng ở đây. */
export const SHOP_PACKS: Record<string, string> = {
  basic: 'Biểu cảm cơ bản',
  tienlen: 'Tiến Lên vui nhộn',
  cute: 'Dễ thương',
};

/** Thông tin hiển thị cho từng loại vật phẩm trong cửa hàng (thứ tự = thứ tự tab). */
export const SHOP_KINDS: { kind: ShopItemKind; label: string; note: string }[] = [
  { kind: 'sticker', label: 'Nhãn dán', note: 'Gửi trong mọi khung trò chuyện' },
  { kind: 'chatFrame', label: 'Khung chat', note: 'Sắp ra mắt' },
  { kind: 'cardSkin', label: 'Skin bài', note: 'Sắp ra mắt' },
  { kind: 'avatarFrame', label: 'Khung avatar', note: 'Sắp ra mắt' },
];

export const SHOP_ITEMS: readonly ShopItem[] = [
  // ----- Bộ MIỄN PHÍ: Biểu cảm cơ bản -----
  { id: 'smile', kind: 'sticker', pack: 'basic', name: 'Vui vẻ', description: 'Nụ cười thân thiện', price: 0, file: 'stickers/smile.svg' },
  { id: 'laugh', kind: 'sticker', pack: 'basic', name: 'Cười lớn', description: 'Cười không nhặt được mồm', price: 0, file: 'stickers/laugh.svg' },
  { id: 'love', kind: 'sticker', pack: 'basic', name: 'Yêu thích', description: 'Mắt trái tim', price: 0, file: 'stickers/love.svg' },
  { id: 'sad', kind: 'sticker', pack: 'basic', name: 'Buồn', description: 'Một giọt lệ', price: 0, file: 'stickers/sad.svg' },
  { id: 'angry', kind: 'sticker', pack: 'basic', name: 'Tức giận', description: 'Đỏ mặt giận dữ', price: 0, file: 'stickers/angry.svg' },
  { id: 'wow', kind: 'sticker', pack: 'basic', name: 'Ngạc nhiên', description: 'Mắt tròn miệng chữ O', price: 0, file: 'stickers/wow.svg' },
  { id: 'cool', kind: 'sticker', pack: 'basic', name: 'Ngầu', description: 'Đeo kính râm', price: 0, file: 'stickers/cool.svg' },
  { id: 'sleep', kind: 'sticker', pack: 'basic', name: 'Buồn ngủ', description: 'Đang ngủ ngon', price: 0, file: 'stickers/sleep.svg' },

  // ----- Bộ BÁN: Tiến Lên vui nhộn (800 xu) -----
  { id: 'win', kind: 'sticker', pack: 'tienlen', name: 'Thắng rồi!', description: 'Tay cầm cúp vô địch', price: 800, file: 'stickers/win.svg' },
  { id: 'pig', kind: 'sticker', pack: 'tienlen', name: 'Chặt heo!', description: 'Chú heo hồng ngơ ngác', price: 800, file: 'stickers/pig.svg' },
  { id: 'bomb', kind: 'sticker', pack: 'tienlen', name: 'Tới trắng!', description: 'Quả bom nổ tung', price: 800, file: 'stickers/bomb.svg' },
  { id: 'fire', kind: 'sticker', pack: 'tienlen', name: 'Sung mãn', description: 'Ngọn lửa bùng cháy', price: 800, file: 'stickers/fire.svg' },
  { id: 'lucky', kind: 'sticker', pack: 'tienlen', name: 'Vận may', description: 'Cỏ bốn lá may mắn', price: 800, file: 'stickers/lucky.svg' },
  { id: 'pass', kind: 'sticker', pack: 'tienlen', name: 'Bỏ lượt', description: 'Bàn tay xin bỏ lượt', price: 800, file: 'stickers/pass.svg' },

  // ----- Bộ BÁN: Dễ thương (500 xu) -----
  { id: 'cat', kind: 'sticker', pack: 'cute', name: 'Mèo con', description: 'Chú mèo đáng yêu', price: 500, file: 'stickers/cat.svg' },
  { id: 'dog', kind: 'sticker', pack: 'cute', name: 'Cún con', description: 'Chú cún lông xù', price: 500, file: 'stickers/dog.svg' },
  { id: 'bear', kind: 'sticker', pack: 'cute', name: 'Gấu con', description: 'Chú gấu nâu', price: 500, file: 'stickers/bear.svg' },
  { id: 'rabbit', kind: 'sticker', pack: 'cute', name: 'Thỏ con', description: 'Chú thỏ tai dài', price: 500, file: 'stickers/rabbit.svg' },
  { id: 'frog', kind: 'sticker', pack: 'cute', name: 'Ếch con', description: 'Chú ếch xanh', price: 500, file: 'stickers/frog.svg' },
  { id: 'chick', kind: 'sticker', pack: 'cute', name: 'Gà con', description: 'Chú gà vàng óng', price: 500, file: 'stickers/chick.svg' },
];

const ITEMS_BY_ID = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

/** Tra một vật phẩm theo id; trả về undefined nếu không tồn tại. */
export function getShopItem(id: string): ShopItem | undefined {
  return ITEMS_BY_ID.get(id);
}

/** Vật phẩm miễn phí (price <= 0) — mặc định ai cũng sở hữu. */
export function isFreeItem(item: ShopItem): boolean {
  return item.price <= 0;
}

/** Danh sách vật phẩm theo loại (dùng cho tab cửa hàng). */
export function itemsOfKind(kind: ShopItemKind): ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.kind === kind);
}

/** Nhãn dán gom theo bộ sưu tập (dùng cho bộ chọn nhãn dán trong khung chat). */
export function stickerPacks(): { pack: string; label: string; items: ShopItem[] }[] {
  const order: string[] = [];
  const grouped = new Map<string, ShopItem[]>();
  for (const item of SHOP_ITEMS) {
    if (item.kind !== 'sticker') continue;
    if (!grouped.has(item.pack)) {
      grouped.set(item.pack, []);
      order.push(item.pack);
    }
    grouped.get(item.pack)!.push(item);
  }
  return order.map((pack) => ({
    pack,
    label: SHOP_PACKS[pack] ?? pack,
    items: grouped.get(pack)!,
  }));
}
