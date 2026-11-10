import { fail, ok, type PurchaseResult, type ServiceResult } from '@/types';
import { getShopItem, isFreeItem } from '@/data/shopCatalog';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from './StorageService';
import { api } from './ApiService';
import { onlineEnabled } from './backend';
import { authService } from './AuthService';

/**
 * ShopService — Cửa hàng vật phẩm (nhãn dán, khung chat, skin bài, khung avatar...).
 *
 * - TRỰC TUYẾN: quyền sở hữu lưu trong CSDL; server kiểm tra giá và trừ xu trong một
 *   giao dịch (không thể mua khống).
 * - CỤC BỘ (Local/Demo): quyền sở hữu lưu trong LocalStorage; trừ xu qua AuthService.
 *
 * Vật phẩm MIỄN PHÍ (`price = 0`) không cần mua và không được lưu vào danh sách sở hữu
 * — chúng luôn được coi là đã sở hữu (xem `isFreeItem`).
 */

/** Khoá LocalStorage lưu danh sách id vật phẩm đã mua của một người dùng. */
function ownedKey(userId: string): string {
  return `${STORAGE_KEYS.shopOwned}:${userId}`;
}

class ShopService {
  get online(): boolean {
    return onlineEnabled;
  }

  /** Danh sách id vật phẩm ĐÃ MUA (không gồm vật phẩm miễn phí). */
  async owned(userId: string): Promise<ServiceResult<string[]>> {
    if (onlineEnabled) return api.request<string[]>('/shop/purchases');
    return ok((await storage.read<string[]>(ownedKey(userId))) ?? []);
  }

  /** Mua một vật phẩm bằng xu. */
  async purchase(userId: string, itemId: string): Promise<ServiceResult<PurchaseResult>> {
    if (onlineEnabled) {
      return api.request<PurchaseResult>('/shop/purchases', { method: 'POST', body: { itemId } });
    }

    // Chế độ cục bộ: tự kiểm tra và trừ xu trên thiết bị.
    const item = getShopItem(itemId);
    if (!item) return fail('Vật phẩm không tồn tại.');
    if (isFreeItem(item)) return fail('Vật phẩm này miễn phí, không cần mua.');

    const current = (await storage.read<string[]>(ownedKey(userId))) ?? [];
    if (current.includes(itemId)) return fail('Bạn đã sở hữu vật phẩm này.');

    const spend = await authService.spendCoins(item.price);
    if (!spend.ok) return fail(spend.error);

    const next = [...current, itemId];
    await storage.write(ownedKey(userId), next);
    return ok({ coins: spend.data.coins, owned: next });
  }
}

export const shopService = new ShopService();
