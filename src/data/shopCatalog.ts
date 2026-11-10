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
  'card-styles': 'Bộ bài sưu tầm',
};

/** Thông tin hiển thị cho từng loại vật phẩm trong cửa hàng (thứ tự = thứ tự tab). */
export const SHOP_KINDS: { kind: ShopItemKind; label: string; note: string }[] = [
  { kind: 'sticker', label: 'Nhãn dán', note: 'Gửi trong mọi khung trò chuyện' },
  { kind: 'chatFrame', label: 'Khung chat', note: 'Sắp ra mắt' },
  { kind: 'cardSkin', label: 'Skin bộ bài', note: 'Trang trí mặt và lưng bài' },
  { kind: 'avatarFrame', label: 'Khung avatar', note: 'Sắp ra mắt' },
];

export const SHOP_ITEMS: readonly ShopItem[] = [
  // ----- Skin bộ bài — áp dụng riêng cho bài của người trang bị -----
  { id: 'card-skin-sakura', kind: 'cardSkin', pack: 'card-styles', name: 'Hoa anh đào', description: 'Sắc hồng dịu dàng cùng họa tiết hoa anh đào.', price: 1800, emoji: '🌸' },
  { id: 'card-skin-dragon', kind: 'cardSkin', pack: 'card-styles', name: 'Rồng', description: 'Sắc ngọc lục bảo và ánh vàng uy nghi.', price: 2400, emoji: '🐉' },
  { id: 'card-skin-knight', kind: 'cardSkin', pack: 'card-styles', name: 'Hiệp sĩ', description: 'Giáp bạc xanh lạnh dành cho chiến binh.', price: 2400, emoji: '⚔️' },

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

  // ----- Bộ "Hangseed9" — ảnh .webp host ngoài trên GitHub qua jsDelivr, BÁN 1000 xu -----
  // Ảnh nằm ở repo: https://github.com/walevmn001/Sticker (nhánh main) → KHÔNG cần đặt file trong dự án.
  { id: 'hangseed9-agad-cqaaiuoiva', kind: 'sticker', pack: 'hangseed9', name: 'Vui vẻ', description: 'Nụ cười tươi rạng rỡ', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-CQAAiUOiVA.webp' },
  { id: 'hangseed9-agad-riaamppkve', kind: 'sticker', pack: 'hangseed9', name: 'Cười nghiêng ngả', description: 'Cười không nhặt được mồm', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-RIAAmPPkVE.webp' },
  { id: 'hangseed9-agad-xwaagoqkfa', kind: 'sticker', pack: 'hangseed9', name: 'Thả tim', description: 'Trao gửi yêu thương', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD-xwAAgoqkFA.webp' },
  { id: 'hangseed9-agad2beaauowmve', kind: 'sticker', pack: 'hangseed9', name: 'Buồn ngủ', description: 'Mắt díu lại lơ mơ', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD2BEAAuowmVE.webp' },
  { id: 'hangseed9-agad2x8aalf1ifa', kind: 'sticker', pack: 'hangseed9', name: 'Tức xỉu', description: 'Giận đến đỏ mặt', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD2x8AAlf1iFA.webp' },
  { id: 'hangseed9-agad3byaalyaofe', kind: 'sticker', pack: 'hangseed9', name: 'Sốc nặng', description: 'Mắt chữ O mồm chữ A', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD3BYAAlyAoFE.webp' },
  { id: 'hangseed9-agad3xsaathnmfa', kind: 'sticker', pack: 'hangseed9', name: 'Ngầu lòi', description: 'Đeo kính cực ngầu', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD3xsAAtHNmFA.webp' },
  { id: 'hangseed9-agad4gwaaih0gvm', kind: 'sticker', pack: 'hangseed9', name: 'Khóc ròng', description: 'Nước mắt lưng tròng', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4gwAAih0GVM.webp' },
  { id: 'hangseed9-agad4heaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Hết hồn', description: 'Giật mình hoảng hốt', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4hEAAqbxcR4.webp' },
  { id: 'hangseed9-agad4xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Tự tin', description: 'Vênh mặt đầy tự tin', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD4xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad5xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Đáng yêu', description: 'Xinh xắn dễ thương', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD5xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad6bcaavtdove', kind: 'sticker', pack: 'hangseed9', name: 'Nhõng nhẽo', description: 'Làm nũng đáng yêu', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6BcAAvtDoVE.webp' },
  { id: 'hangseed9-agad6reaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Đắc ý', description: 'Cười đắc thắng', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6REAAqbxcR4.webp' },
  { id: 'hangseed9-agad6gsaamwievm', kind: 'sticker', pack: 'hangseed9', name: 'Ngơ ngác', description: 'Mặt ngơ không hiểu', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6gsAAmwiEVM.webp' },
  { id: 'hangseed9-agad6h4aam9uifa', kind: 'sticker', pack: 'hangseed9', name: 'Ngại ngùng', description: 'Đỏ mặt xấu hổ', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6h4AAm9UiFA.webp' },
  { id: 'hangseed9-agad6haaalmxmve', kind: 'sticker', pack: 'hangseed9', name: 'Vui sướng', description: 'Reo mừng hạnh phúc', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD6hAAAlmxmVE.webp' },
  { id: 'hangseed9-agad7aoaal4liva', kind: 'sticker', pack: 'hangseed9', name: 'Haha', description: 'Cười sảng khoái', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7AoAAl4LIVA.webp' },
  { id: 'hangseed9-agad7rgaapjnofe', kind: 'sticker', pack: 'hangseed9', name: 'Nghiêm túc', description: 'Mặt lạnh như tiền', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7RgAApjnoFE.webp' },
  { id: 'hangseed9-agad7heaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Vỗ tay', description: 'Khen ngợi tán thưởng', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7hEAAqbxcR4.webp' },
  { id: 'hangseed9-agad7huaahaeofe', kind: 'sticker', pack: 'hangseed9', name: 'Cầu xin', description: 'Chắp tay van xin', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7hUAAhaeoFE.webp' },
  { id: 'hangseed9-agad7xeaaqbxcr4', kind: 'sticker', pack: 'hangseed9', name: 'Chán nản', description: 'Thở dài chán ngán', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD7xEAAqbxcR4.webp' },
  { id: 'hangseed9-agad9xwaavygova', kind: 'sticker', pack: 'hangseed9', name: 'Bất lực', description: 'Đành bó tay chịu thua', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgAD9xwAAvYgoVA.webp' },
  { id: 'hangseed9-agadaiaaaq07kfa', kind: 'sticker', pack: 'hangseed9', name: 'Sốt ruột', description: 'Nóng lòng chờ đợi', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADAiAAAq07kFA.webp' },
  { id: 'hangseed9-agadcb4aalcsifa', kind: 'sticker', pack: 'hangseed9', name: 'Bối rối', description: 'Không biết làm sao', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADCB4AAlCsiFA.webp' },
  { id: 'hangseed9-agaddcaaapvqiva', kind: 'sticker', pack: 'hangseed9', name: 'Đồng ý', description: 'Gật đầu ưng ý', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADDCAAApVqiVA.webp' },
  { id: 'hangseed9-agadeawaaryqevm', kind: 'sticker', pack: 'hangseed9', name: 'Từ chối', description: 'Lắc đầu nguầy nguậy', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADEAwAArYQEVM.webp' },
  { id: 'hangseed9-agadehqaakywqfe', kind: 'sticker', pack: 'hangseed9', name: 'Cảm ơn', description: 'Cúi đầu biết ơn', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADEhQAAkywqFE.webp' },
  { id: 'hangseed9-agadfqwaatujefm', kind: 'sticker', pack: 'hangseed9', name: 'Xin chào', description: 'Vẫy tay chào hỏi', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFQwAAtUjEFM.webp' },
  { id: 'hangseed9-agadfryaah7oove', kind: 'sticker', pack: 'hangseed9', name: 'Tạm biệt', description: 'Chào tạm biệt', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFRYAAh7OoVE.webp' },
  { id: 'hangseed9-agadfhuaakswkfe', kind: 'sticker', pack: 'hangseed9', name: 'Chúc mừng', description: 'Chúc mừng vui vẻ', price: 1000, file: 'https://cdn.jsdelivr.net/gh/walevmn001/Sticker@main/HANGSEED9-AgADFhUAAksWkFE.webp' },
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
