import { getShopItem, isFreeItem, SHOP_KINDS } from '@/data/shopCatalog';
import type { PurchaseResult, ShopItemKind, ShopLoadout } from '@/types';
import { prisma } from '../prisma';
import { badRequest, conflict, notFound } from '../http/errors';

/**
 * Nghiệp vụ cửa hàng: quyền sở hữu vật phẩm và mua bằng xu.
 *
 * Danh mục + giá lấy từ `src/data/shopCatalog.ts` (dùng CHUNG với client) nên giá và
 * quyền sở hữu không bao giờ lệch giữa hai phía. Vật phẩm MIỄN PHÍ (`price <= 0`) luôn
 * được coi là đã sở hữu và KHÔNG lưu trong CSDL.
 */

/** Danh sách id vật phẩm ĐÃ MUA của người dùng (không gồm vật phẩm miễn phí). */
export async function listPurchases(userId: string): Promise<string[]> {
  const rows = await prisma.purchase.findMany({
    where: { userId },
    select: { itemId: true },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((row) => row.itemId);
}

/** true nếu người dùng được phép dùng vật phẩm (miễn phí HOẶC đã mua). */
export async function canUseItem(userId: string, itemId: string): Promise<boolean> {
  const item = getShopItem(itemId);
  if (!item) return false;
  if (isFreeItem(item)) return true;
  const found = await prisma.purchase.findUnique({
    where: { userId_itemId: { userId, itemId } },
    select: { id: true },
  });
  return Boolean(found);
}

/** Vật phẩm đang trang bị theo từng loại của người dùng. */
export async function getLoadout(userId: string): Promise<ShopLoadout> {
  const rows = await prisma.userLoadout.findMany({
    where: { userId },
    select: { kind: true, itemId: true },
  });
  const loadout: ShopLoadout = {};
  for (const row of rows) {
    if (SHOP_KINDS.some((entry) => entry.kind === row.kind)) {
      loadout[row.kind as ShopItemKind] = row.itemId;
    }
  }
  return loadout;
}

/** Trang bị một vật phẩm đã sở hữu hoặc tháo vật phẩm hiện tại. */
export async function setLoadoutItem(
  userId: string,
  kind: ShopItemKind,
  itemId: string | null,
): Promise<ShopLoadout> {
  if (!SHOP_KINDS.some((entry) => entry.kind === kind)) throw badRequest('Loại vật phẩm không hợp lệ.');
  if (itemId === null) {
    await prisma.userLoadout.deleteMany({ where: { userId, kind } });
    return getLoadout(userId);
  }

  const item = getShopItem(itemId);
  if (!item || item.kind !== kind) throw notFound('Vật phẩm không đúng loại trang bị.');
  if (!(await canUseItem(userId, itemId))) throw badRequest('Bạn cần sở hữu vật phẩm trước khi trang bị.');

  await prisma.userLoadout.upsert({
    where: { userId_kind: { userId, kind } },
    create: { userId, kind, itemId },
    update: { itemId },
  });
  return getLoadout(userId);
}

/** Snapshot skin bài theo người chơi, lấy một lần lúc bắt đầu ván. */
export async function getCardSkinsForUsers(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.userLoadout.findMany({
    where: { userId: { in: userIds }, kind: 'cardSkin' },
    select: { userId: true, itemId: true },
  });
  return new Map(rows.map((row) => [row.userId, row.itemId]));
}

/** Mua một vật phẩm: ghi quyền sở hữu và trừ xu trong cùng một giao dịch. */
export async function purchaseItem(userId: string, itemId: string): Promise<PurchaseResult> {
  const item = getShopItem(itemId);
  if (!item) throw notFound('Vật phẩm không tồn tại.');
  if (isFreeItem(item)) throw badRequest('Vật phẩm này miễn phí, không cần mua.');

  const existing = await prisma.purchase.findUnique({
    where: { userId_itemId: { userId, itemId } },
    select: { id: true },
  });
  if (existing) throw conflict('Bạn đã sở hữu vật phẩm này.');

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
  if (!user) throw notFound('Không tìm thấy người dùng.');
  if (user.coins < item.price) {
    throw badRequest(
      `Bạn không đủ xu để mua vật phẩm này (cần ${item.price.toLocaleString('vi-VN')} xu, hiện có ${user.coins.toLocaleString('vi-VN')} xu).`,
    );
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { coins: { decrement: item.price } } }),
    prisma.purchase.create({ data: { userId, itemId } }),
  ]);

  return { coins: updatedUser.coins, owned: await listPurchases(userId) };
}
