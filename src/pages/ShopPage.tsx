import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, Coins, Layers, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import type { Card, ShopItem, ShopItemKind } from '@/types';
import { SHOP_KINDS, SHOP_PACKS, isFreeItem, itemsOfKind } from '@/data/shopCatalog';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';
import { Button, FullPageLoader, SectionHeader, Surface } from '@/components/ui';
import { StickerImage } from '@/components/chat/StickerImage';
import { PlayCard, type CardSize } from '@/components/game/PlayCard';
import { formatCoins } from '@/utils/format';
import { cn } from '@/utils/cn';
import { getCardSkinTheme } from '@/utils/cardSkins';

/**
 * Trang Cửa hàng — bán vật phẩm bằng xu (nhãn dán, khung chat, skin bài, khung avatar...).
 *
 * Danh mục lấy từ `src/data/shopCatalog.ts`: thêm vật phẩm/loại mới ở đó thì trang này
 * tự hiển thị, không cần sửa component. Vật phẩm `price = 0` là MIỄN PHÍ (không cần mua).
 */
export function ShopPage() {
  const { user, initializing } = useAuth();
  const { isOwned, purchase, equip, loadout, loading } = useShop();

  // Chỉ hiện tab của những loại đang có vật phẩm (loại "sắp ra mắt" sẽ tự ẩn).
  const tabs = useMemo(
    () => SHOP_KINDS.filter((entry) => itemsOfKind(entry.kind).length > 0),
    [],
  );
  const [activeKind, setActiveKind] = useState<ShopItemKind>(tabs[0]?.kind ?? 'sticker');
  const [activeView, setActiveView] = useState<'shop' | 'closet'>('shop');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const items = useMemo(() => itemsOfKind(activeKind), [activeKind]);
  const cardSkinItems = useMemo(() => itemsOfKind('cardSkin'), []);
  const ownedCardSkins = cardSkinItems.filter((item) => isOwned(item.id));
  const activeCardSkin = cardSkinItems.find((item) => item.id === loadout.cardSkin) ?? null;

  if (initializing) return <FullPageLoader label="Đang tải cửa hàng…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: '/shop' }} />;

  const handleBuy = async (item: ShopItem) => {
    setBuyingId(item.id);
    try {
      const result = await purchase(item.id);
      if (result.ok && item.kind === 'cardSkin') setActiveView('closet');
    } finally {
      setBuyingId(null);
    }
  };

  const handleEquipCardSkin = async (itemId: string | null) => {
    const actionId = itemId ?? 'default';
    setEquippingId(actionId);
    try {
      await equip('cardSkin', itemId);
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-5">
      <SectionHeader
        title="Cửa hàng"
        subtitle="Mở khoá nhãn dán và vật phẩm bằng xu của bạn."
        icon={<ShoppingBag className="h-5 w-5" />}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-ink/5 bg-base-900/70 px-3 py-2 text-sm font-semibold text-amber-600">
            <Coins className="h-4 w-4" />
            {formatCoins(user.coins)}
          </span>
        }
      />

      <div className="mb-5 flex max-w-md rounded-2xl border border-ink/5 bg-base-900/70 p-1">
        <button
          type="button"
          aria-pressed={activeView === 'shop'}
          onClick={() => setActiveView('shop')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
            activeView === 'shop' ? 'bg-neon-purple/10 text-neon-purple shadow-soft' : 'text-slate-400 hover:text-neon-purple',
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          Cửa hàng
        </button>
        <button
          type="button"
          aria-pressed={activeView === 'closet'}
          onClick={() => setActiveView('closet')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
            activeView === 'closet'
              ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-glow'
              : 'text-slate-400 hover:text-neon-purple',
          )}
        >
          <Layers className="h-4 w-4" />
          Tủ đồ
          <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">
            {ownedCardSkins.length}
          </span>
        </button>
      </div>

      {activeView === 'shop' ? (
        <>
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
                    : 'bg-ink/5 text-slate-300 hover:bg-ink/10',
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
              const equipped = loadout[item.kind] === item.id;
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

                  {owned && item.kind === 'cardSkin' ? (
                    <Button
                      size="sm"
                      fullWidth
                      variant={equipped ? 'secondary' : 'outline'}
                      disabled={loading || equipped || equippingId !== null}
                      onClick={() => void handleEquipCardSkin(item.id)}
                    >
                      {equipped ? 'Đang trang bị' : 'Trang bị'}
                    </Button>
                  ) : owned ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
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
        </>
      ) : (
        <CardSkinCloset
          ownedItems={ownedCardSkins}
          activeItem={activeCardSkin}
          activeSkinId={loadout.cardSkin ?? null}
          loading={loading}
          equippingId={equippingId}
          onEquip={handleEquipCardSkin}
          onBrowse={() => {
            setActiveKind('cardSkin');
            setActiveView('shop');
          }}
        />
      )}
    </div>
  );
}

function CardSkinCloset({
  ownedItems,
  activeItem,
  activeSkinId,
  loading,
  equippingId,
  onEquip,
  onBrowse,
}: {
  ownedItems: ShopItem[];
  activeItem: ShopItem | null;
  activeSkinId: string | null;
  loading: boolean;
  equippingId: string | null;
  onEquip: (itemId: string | null) => Promise<void>;
  onBrowse: () => void;
}) {
  const choices: Array<{ id: string | null; name: string; description: string }> = [
    { id: null, name: 'Bộ tiêu chuẩn', description: 'Giao diện bài cổ điển, luôn có sẵn.' },
    ...ownedItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
    })),
  ];

  return (
    <div className="space-y-6">
      <Surface className="overflow-hidden border border-neon-cyan/15 bg-gradient-to-br from-neon-cyan/10 via-base-900 to-neon-purple/10 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          <CardStackPreview skinId={activeSkinId} size="md" />
          <div className="min-w-0 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <Check className="h-3 w-3" />
              Bộ bài đang dùng
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {activeItem?.name ?? 'Bộ tiêu chuẩn'}
            </h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-400">
              {activeItem?.description ?? 'Mặt bài mặc định. Chọn một skin bên dưới để đổi giao diện.'}
              {' '}Người chơi khác cũng sẽ thấy skin bạn đang dùng khi bạn đánh bài.
            </p>
          </div>
        </div>
      </Surface>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chọn bộ bài</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {ownedItems.length} skin đã mở khóa
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowse}
            className="text-xs font-semibold text-neon-cyan transition hover:text-neon-purple"
          >
            Khám phá skin
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {choices.map((choice) => {
            const selected = activeSkinId === choice.id;
            const actionId = choice.id ?? 'default';
            const equipping = equippingId === actionId;
            return (
              <Surface
                key={choice.id ?? 'default'}
                className={cn(
                  'flex flex-col gap-3 p-3 transition',
                  selected
                    ? 'border-neon-cyan/50 bg-neon-cyan/5 shadow-glow'
                    : 'border-ink/5 hover:border-ink/15',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-base-950/70">
                    <CardStackPreview skinId={choice.id} size="xs" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-100">{choice.name}</p>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {choice.description}
                    </p>
                    {selected && (
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
                        Đang mặc
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  fullWidth
                  variant={selected ? 'secondary' : 'outline'}
                  disabled={loading || selected || equippingId !== null}
                  loading={equipping}
                  onClick={() => void onEquip(choice.id)}
                >
                  {selected ? 'Đang sử dụng' : equipping ? 'Đang áp dụng' : 'Mặc bộ bài này'}
                </Button>
              </Surface>
            );
          })}
        </div>

        {ownedItems.length === 0 && (
          <Surface className="mt-4 flex flex-col items-center gap-2 px-5 py-6 text-center">
            <Sparkles className="h-5 w-5 text-neon-purple" />
            <p className="text-sm font-semibold text-slate-200">Tủ đồ đang chờ skin đầu tiên</p>
            <p className="text-xs text-slate-500">Mở khóa skin trong cửa hàng rồi quay lại đây để mặc.</p>
            <Button size="sm" variant="outline" onClick={onBrowse}>Đến cửa hàng skin</Button>
          </Surface>
        )}
      </div>
    </div>
  );
}

const PREVIEW_CARDS: Card[] = [
  { id: 'preview-spade-3', suit: 'spade', rank: 3 },
  { id: 'preview-heart-7', suit: 'heart', rank: 7 },
  { id: 'preview-club-king', suit: 'club', rank: 13 },
];

function CardStackPreview({ skinId, size }: { skinId: string | null; size: CardSize }) {
  const step = size === 'md' ? 28 : size === 'xs' ? 14 : 20;
  return (
    <div className={cn('relative shrink-0', size === 'md' ? 'h-28 w-36' : size === 'xs' ? 'h-16 w-24' : 'h-20 w-28')}>
      {PREVIEW_CARDS.map((card, index) => (
        <div
          key={card.id}
          className="absolute top-0"
          style={{
            left: index * step,
            zIndex: index,
            transform: `rotate(${(index - 1) * 7}deg)`,
          }}
        >
          <PlayCard card={card} skinId={skinId} size={size} />
        </div>
      ))}
    </div>
  );
}

/** Xem trước vật phẩm theo loại. */
function ItemPreview({ item, owned }: { item: ShopItem; owned: boolean }) {
  if (item.kind === 'sticker') {
    return <StickerImage stickerId={item.id} size={72} className={cn(!owned && 'opacity-90')} />;
  }
  if (item.kind === 'cardSkin') {
    const theme = getCardSkinTheme(item.id);
    return (
      <div className={cn('flex h-16 w-12 items-center justify-center rounded-lg border-2 bg-gradient-to-br shadow-lg', theme?.previewClass)}>
        <span className="flex h-[3.25rem] w-9 items-center justify-center rounded-md border border-ink/50 bg-ink/10 text-2xl">
          {theme?.mark ?? item.emoji}
        </span>
      </div>
    );
  }
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-ink/15 text-slate-600">
      <Lock className="h-5 w-5" />
    </span>
  );
}
