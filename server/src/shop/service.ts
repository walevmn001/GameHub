import { getShopItem, isFreeItem } from '@/data/shopCatalog';
import type { PurchaseResult } from '@/types';
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
