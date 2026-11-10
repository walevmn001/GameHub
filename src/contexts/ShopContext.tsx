import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fail, type PurchaseResult, type ServiceResult } from '@/types';
import { getShopItem, isFreeItem } from '@/data/shopCatalog';
import { shopService } from '@/services/ShopService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ShopContextValue {
  /** true khi đã đăng nhập (cửa hàng cần người dùng để gắn quyền sở hữu). */
  enabled: boolean;
  /** Danh sách id vật phẩm đã mua (không gồm vật phẩm miễn phí). */
  ownedIds: string[];
  loading: boolean;
  refresh: () => Promise<void>;
  purchase: (itemId: string) => Promise<ServiceResult<PurchaseResult>>;
  /** true nếu người dùng được phép dùng vật phẩm (miễn phí HOẶC đã mua). */
  isOwned: (itemId: string) => boolean;
}

const ShopContext = createContext<ShopContextValue | null>(null);

/**
 * ShopProvider — quản lý quyền sở hữu vật phẩm và thao tác mua.
 * Đặt bên trong AuthProvider (cần người dùng) và ToastProvider (cần thông báo).
 */
export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, refresh: refreshUser } = useAuth();
  const toast = useToast();
  const myId = user?.id ?? null;
  const enabled = Boolean(user);

  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!myId) {
      setOwnedIds([]);
      return;
    }
    setLoading(true);
    const result = await shopService.owned(myId);
    if (result.ok) setOwnedIds(result.data);
    setLoading(false);
  }, [myId]);

  /** Nạp quyền sở hữu khi đăng nhập/đổi tài khoản; xoá khi đăng xuất. */
  useEffect(() => {
    if (!myId) {
      setOwnedIds([]);
      return;
    }
    void refresh();
  }, [myId, refresh]);

  const ownedSet = useMemo(() => new Set(ownedIds), [ownedIds]);

  const isOwned = useCallback(
    (itemId: string) => {
      const item = getShopItem(itemId);
      if (!item) return false;
      return isFreeItem(item) || ownedSet.has(itemId);
    },
    [ownedSet],
  );

  const purchase = useCallback<ShopContextValue['purchase']>(
    async (itemId) => {
      if (!myId) {
        const message = 'Bạn cần đăng nhập để mua vật phẩm.';
        toast.error(message);
        return fail(message);
      }
      const item = getShopItem(itemId);
      const result = await shopService.purchase(myId, itemId);
      if (result.ok) {
        setOwnedIds(result.data.owned);
        await refreshUser();
        toast.success(`Đã mở khoá: ${item?.name ?? 'vật phẩm'}.`);
      } else {
        toast.error(result.error);
      }
      return result;
    },
    [myId, refreshUser, toast],
  );

  const value = useMemo<ShopContextValue>(
    () => ({ enabled, ownedIds, loading, refresh, purchase, isOwned }),
    [enabled, ownedIds, loading, refresh, purchase, isOwned],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop phải được dùng bên trong ShopProvider.');
  return ctx;
}
