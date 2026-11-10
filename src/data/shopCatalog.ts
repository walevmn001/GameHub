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
 *      1. Có ảnh: đặt tệp vào `public/stickers/<id>.svg` HOẶC host ảnh ở nơi khác
 *         (GitHub/jsDelivr, Cloudinary, S3...) và điền URL TUYỆT ĐỐI vào `file`.
 *      2. Thêm một mục vào `SHOP_ITEMS` bên dưới (đặt `price: 0` để MIỄN PHÍ).
 *    Không cần sửa gì khác — cửa hàng, bộ chọn nhãn dán và server tự nhận.
 *    (Server chỉ xác thực theo `id` nên KHÔNG cần biết ảnh nằm ở đâu.)
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
  hangseed9: 'Hangseed9',
};

/** Thông tin hiển thị cho từng loại vật phẩm trong cửa hàng (thứ tự = thứ tự tab). */
export const SHOP_KINDS: { kind: ShopItemKind; label: string; note: string }[] = [
  { kind: 'sticker', label: 'Nhãn dán', note: 'Gửi trong mọi khung trò chuyện' },
  { kind: 'chatFrame', label: 'Khung chat', note: 'Sắp ra mắt' },
  { kind: 'cardSkin', label: 'Skin bài', note: 'Sắp ra mắt' },
  { kind: 'avatarFrame', label: 'Khung avatar', note: 'Sắp ra mắt' },
];

export const SHOP_ITEMS: readonly ShopItem[] = [
  // ----- Bộ "Biểu cảm cơ bản" — miễn phí -----
  { id: 'smile', kind: 'sticker', pack: 'basic', name: 'Vui vẻ', description: 'Nụ cười thân thiện', price: 0, file: 'stickers/smile.svg' },
  { id: 'laugh', kind: 'sticker', pack: 'basic', name: 'Cười lớn', description: 'Cười không nhặt được mồm', price: 0, file: 'stickers/laugh.svg' },
  { id: 'love', kind: 'sticker', pack: 'basic', name: 'Yêu thích', description: 'Mắt trái tim', price: 0, file: 'stickers/love.svg' },
  { id: 'sad', kind: 'sticker', pack: 'basic', name: 'Buồn', description: 'Một giọt lệ', price: 0, file: 'stickers/sad.svg' },
  { id: 'angry', kind: 'sticker', pack: 'basic', name: 'Tức giận', description: 'Đỏ mặt giận dữ', price: 0, file: 'stickers/angry.svg' },
  { id: 'wow', kind: 'sticker', pack: 'basic', name: 'Ngạc nhiên', description: 'Mắt tròn miệng chữ O', price: 0, file: 'stickers/wow.svg' },
  { id: 'cool', kind: 'sticker', pack: 'basic', name: 'Ngầu', description: 'Đeo kính râm', price: 0, file: 'stickers/cool.svg' },
  { id: 'sleep', kind: 'sticker', pack: 'basic', name: 'Buồn ngủ', description: 'Đang ngủ ngon', price: 0, file: 'stickers/sleep.svg' },

  // ----- Bộ "Tiến Lên vui nhộn" — hiện MIỄN PHÍ (đặt price > 0 để bán bằng xu) -----
  { id: 'win', kind: 'sticker', pack: 'tienlen', name: 'Thắng rồi!', description: 'Tay cầm cúp vô địch', price: 0, file: 'stickers/win.svg' },
  { id: 'pig', kind: 'sticker', pack: 'tienlen', name: 'Chặt heo!', description: 'Chú heo hồng ngơ ngác', price: 0, file: 'stickers/pig.svg' },
  { id: 'bomb', kind: 'sticker', pack: 'tienlen', name: 'Tới trắng!', description: 'Quả bom nổ tung', price: 0, file: 'stickers/bomb.svg' },
  { id: 'fire', kind: 'sticker', pack: 'tienlen', name: 'Sung mãn', description: 'Ngọn lửa bùng cháy', price: 0, file: 'stickers/fire.svg' },
  { id: 'lucky', kind: 'sticker', pack: 'tienlen', name: 'Vận may', description: 'Cỏ bốn lá may mắn', price: 0, file: 'stickers/lucky.svg' },
  { id: 'pass', kind: 'sticker', pack: 'tienlen', name: 'Bỏ lượt', description: 'Bàn tay xin bỏ lượt', price: 0, file: 'stickers/pass.svg' },

  // ----- Bộ "Dễ thương" — hiện MIỄN PHÍ (đặt price > 0 để bán bằng xu) -----
  { id: 'cat', kind: 'sticker', pack: 'cute', name: 'Mèo con', description: 'Chú mèo đáng yêu', price: 0, file: 'stickers/cat.svg' },
  { id: 'dog', kind: 'sticker', pack: 'cute', name: 'Cún con', description: 'Chú cún lông xù', price: 0, file: 'stickers/dog.svg' },
  { id: 'bear', kind: 'sticker', pack: 'cute', name: 'Gấu con', description: 'Chú gấu nâu', price: 0, file: 'stickers/bear.svg' },
  { id: 'rabbit', kind: 'sticker', pack: 'cute', name: 'Thỏ con', description: 'Chú thỏ tai dài', price: 0, file: 'stickers/rabbit.svg' },
  { id: 'frog', kind: 'sticker', pack: 'cute', name: 'Ếch con', description: 'Chú ếch xanh', price: 0, file: 'stickers/frog.svg' },
  { id: 'chick', kind: 'sticker', pack: 'cute', name: 'Gà con', description: 'Chú gà vàng óng', price: 0, file: 'stickers/chick.svg' },

  // ----- Bộ "Hangseed9" — ảnh .webp host ngoài trên GitHub qua jsDelivr (miễn phí) -----
  // Ảnh nằm ở repo: https://github.com/walevmn001/Sticker (nhánh main) → KHÔNG cần đặt file trong dự án.
  { id: 'hangseed9-agad-cqaaiuoiva', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 01', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-CQAAiUOiVA.webp' },
  { id: 'hangseed9-agad-riaamppkve', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 02', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-RIAAmPPkVE.webp' },
  { id: 'hangseed9-agad-xwaagoqkfa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 03', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-xwAAgoqkFA.webp' },
  { id: 'hangseed9-agad2beaauowmve', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 04', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD2BEAAuowmVE.webp' },
  { id: 'hangseed9-agad2x8aalf1ifa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 05', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD2x8AAlf1iFA.webp' },
  { id: 'hangseed9-agad3byaalyaofe', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 06', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD3BYAAlyAoFE.webp' },
  { id: 'hangseed9-agad3xsaathnmfa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 07', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD3xsAAtHNmFA.webp' },
  { id: 'hangseed9-agad4gwaaih0gvm', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 08', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4gwAAih0GVM.webp' },
  { id: 'hangseed9-agad4heaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 09', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4hEAAqbxcR4.webp' },
  { id: 'hangseed9-agad4xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 10', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad5xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 11', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD5xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad6bcaavtdove', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 12', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6BcAAvtDoVE.webp' },
  { id: 'hangseed9-agad6reaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 13', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6REAAqbxcR4.webp' },
  { id: 'hangseed9-agad6gsaamwievm', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 14', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6gsAAmwiEVM.webp' },
  { id: 'hangseed9-agad6h4aam9uifa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 15', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6h4AAm9UiFA.webp' },
  { id: 'hangseed9-agad6haaalmxmve', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 16', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6hAAAlmxmVE.webp' },
  { id: 'hangseed9-agad7aoaal4liva', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 17', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7AoAAl4LIVA.webp' },
  { id: 'hangseed9-agad7rgaapjnofe', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 18', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7RgAApjnoFE.webp' },
  { id: 'hangseed9-agad7heaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 19', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7hEAAqbxcR4.webp' },
  { id: 'hangseed9-agad7huaahaeofe', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 20', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7hUAAhaeoFE.webp' },
  { id: 'hangseed9-agad7xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 21', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad9xwaavygova', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 22', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD9xwAAvYgoVA.webp' },
  { id: 'hangseed9-agadaiaaaq07kfa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 23', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADAiAAAq07kFA.webp' },
  { id: 'hangseed9-agadcb4aalcsifa', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 24', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADCB4AAlCsiFA.webp' },
  { id: 'hangseed9-agaddcaaapvqiva', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 25', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADDCAAApVqiVA.webp' },
  { id: 'hangseed9-agadeawaaryqevm', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 26', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADEAwAArYQEVM.webp' },
  { id: 'hangseed9-agadehqaakywqfe', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 27', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADEhQAAkywqFE.webp' },
  { id: 'hangseed9-agadfqwaatujefm', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 28', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFQwAAtUjEFM.webp' },
  { id: 'hangseed9-agadfryaah7oove', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 29', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFRYAAh7OoVE.webp' },
  { id: 'hangseed9-agadfhuaakswkfe', kind: 'sticker', pack: 'hangseed9', name: 'Hangseed 30', description: 'Nhãn dán Hangseed9', price: 0, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFhUAAksWkFE.webp' },
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
