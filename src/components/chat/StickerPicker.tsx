import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { stickerPacks } from '@/data/shopCatalog';
import { useShop } from '@/contexts/ShopContext';
import { cn } from '@/utils/cn';
import { StickerImage } from './StickerImage';

/**
 * Bộ chọn nhãn dán — dùng chung cho MỌI khung trò chuyện (chat riêng, phòng chờ, trong trận).
 * - Nhãn dán đã sở hữu: bấm để gửi (`onPick`).
 * - Nhãn dán chưa mở khoá: hiện ổ khoá, bấm để mở trang Cửa hàng.
 *
 * Danh sách lấy trực tiếp từ `src/data/shopCatalog.ts` nên thêm nhãn dán mới
 * không cần sửa component này.
 */
export function StickerPicker({
  onPick,
  className,
}: {
  onPick: (stickerId: string) => void;
  className?: string;
}) {
  const { isOwned } = useShop();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'max-h-56 overflow-y-auto border-t border-white/5 bg-base-900/80 p-2',
        className,
      )}
    >
      {stickerPacks().map(({ pack, label, items }) => (
        <div key={pack} className="mb-2 last:mb-0">
          <p className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
            {items.map((item) => {
              const owned = isOwned(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (owned ? onPick(item.id) : navigate('/shop'))}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-xl p-1 transition-colors',
                    owned ? 'hover:bg-white/10' : 'opacity-80 hover:bg-white/5',
                  )}
                  aria-label={owned ? `Gửi nhãn dán: ${item.name}` : `Mở khoá nhãn dán: ${item.name}`}
                  title={owned ? item.name : `${item.name} — mở khoá trong Cửa hàng`}
                >
                  <StickerImage stickerId={item.id} size={44} />
                  {!owned && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45">
                      <Lock className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
