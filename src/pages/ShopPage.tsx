import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import type { ShopItem, ShopItemKind } from '@/types';
import { SHOP_KINDS, SHOP_PACKS, isFreeItem, itemsOfKind } from '@/data/shopCatalog';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';
import { Button, SectionHeader, Surface } from '@/components/ui';
import { StickerImage } from '@/components/chat/StickerImage';
import { formatCoins } from '@/utils/format';
import { cn } from '@/utils/cn';

/**
 * Trang Cửa hàng — bán vật phẩm bằng xu (nhãn dán, khung chat, skin bài, khung avatar...).
 *
 * Danh mục lấy từ `src/data/shopCatalog.ts`: thêm vật phẩm/loại mới ở đó thì trang này
 * tự hiển thị, không cần sửa component. Vật phẩm `price = 0` là MIỄN PHÍ (không cần mua).
 */
export function ShopPage() {
  const { user } = useAuth();
  const { isOwned, purchase, loading } = useShop();
  const navigate = useNavigate();

  // Chỉ hiện tab của những loại đang có vật phẩm (loại "sắp ra mắt" sẽ tự ẩn).
  const tabs = useMemo(
    () => SHOP_KINDS.filter((entry) => itemsOfKind(entry.kind).length > 0),
    [],
  );
  const [activeKind, setActiveKind] = useState<ShopItemKind>(tabs[0]?.kind ?? 'sticker');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const items = useMemo(() => itemsOfKind(activeKind), [activeKind]);

  const handleBuy = async (item: ShopItem) => {
    setBuyingId(item.id);
    try {
      await purchase(item.id);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-5">
      <SectionHeader
        title="Cửa hàng"
        subtitle="Mở khoá nhãn dán và vật phẩm bằng xu của bạn."
        icon={<ShoppingBag className="h-5 w-5" />}
        action={
          user ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-base-900/70 px-3 py-2 text-sm font-semibold text-amber-300">
              <Coins className="h-4 w-4" />
              {formatCoins(user.coins)}
            </span>
          ) : undefined
        }
      />

      {!user && (
        <Surface className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-slate-300">
            Bạn cần đăng nhập để mua và sử dụng vật phẩm.
          </p>
          <Button size="sm" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Surface>
      )}

      {/* Tab loại vật phẩm */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            onClick={() => setActiveKind(tab.kind)}
            className={cn(
              'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
              tab.kind === activeKind
                ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-glow'
                : 'bg-white/5 text-slate-300 hover:bg-white/10',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const owned = isOwned(item.id);
          const free = isFreeItem(item);
          const buying = buyingId === item.id;
          return (
            <Surface key={item.id} interactive className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center">
                <ItemPreview item={item} owned={owned} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{item.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{item.description}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  {SHOP_PACKS[item.pack] ?? item.pack}
                </p>
              </div>

              {owned ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" /> {free ? 'Miễn phí' : 'Đã sở hữu'}
                </span>
              ) : (
                <Button
                  size="sm"
                  fullWidth
                  loading={buying}
                  disabled={loading || !user || buyingId !== null}
                  onClick={() => void handleBuy(item)}
                  icon={<Coins className="h-3.5 w-3.5" />}
                >
                  {formatCoins(item.price)}
                </Button>
              )}
            </Surface>
          );
        })}
      </div>
    </div>
  );
}

/** Xem trước vật phẩm: nhãn dán dùng ảnh trong danh mục, loại khác hiện biểu tượng chờ. */
function ItemPreview({ item, owned }: { item: ShopItem; owned: boolean }) {
  if (item.kind === 'sticker') {
    return <StickerImage stickerId={item.id} size={72} className={cn(!owned && 'opacity-90')} />;
  }
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/15 text-slate-600">
      <Lock className="h-5 w-5" />
    </span>
  );
}
