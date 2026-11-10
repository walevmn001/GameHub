import { useEffect, useState } from 'react';
import type { StipopFeed, StipopPackDetail } from '@/types';
import { shopService } from '@/services/ShopService';
import { cn } from '@/utils/cn';

/**
 * Duyệt nhãn dán Stipop (nguồn API bên thứ ba, do server làm proxy).
 *
 * - Tự ẩn HOÀN TOÀN khi server chưa cấu hình `STIPOP_API_KEY` (`feed.enabled = false`)
 *   hoặc khi gọi API thất bại — không hiện khung trống, không báo lỗi.
 * - Có `onPick` ⇒ bấm nhãn dán để GỬI (dùng trong bộ chọn nhãn dán của khung chat).
 * - Không có `onPick` ⇒ chỉ để XEM (dùng trong trang Cửa hàng).
 *
 * Hiển thị tên tác giả là bắt buộc theo điều khoản của Stipop.
 */
export function StipopStickers({
  onPick,
  className,
}: {
  onPick?: (url: string) => void;
  className?: string;
}) {
  const [feed, setFeed] = useState<StipopFeed | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StipopPackDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Tải danh sách gói nhãn dán một lần khi mount.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const result = await shopService.stipopPacks({ sort: 'trending', limit: 24 });
      if (alive) setFeed(result.ok ? result.data : { enabled: false, packs: [] });
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Tải chi tiết gói đang chọn.
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    setLoading(true);
    void (async () => {
      const result = await shopService.stipopPack(activeId);
      if (!alive) return;
      setDetail(result.ok ? result.data : null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [activeId]);

  if (!feed?.enabled || feed.packs.length === 0) return null;

  return (
    <div className={cn('border-t border-white/5 bg-base-900/60 p-2', className)}>
      <div className="mb-1 flex items-center justify-between gap-2 px-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Nhãn dán Stipop
        </p>
        <span className="text-[10px] text-slate-600">stipop.io</span>
      </div>

      {/* Danh sách gói */}
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {feed.packs.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setActiveId(pack.id)}
            title={`${pack.name} — ${pack.artist}`}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl border px-2 py-1 text-left text-[11px] transition-colors',
              pack.id === activeId
                ? 'border-neon-cyan/60 bg-white/10 text-white'
                : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10',
            )}
          >
            {pack.image && (
              <img
                src={pack.image}
                alt=""
                width={22}
                height={22}
                draggable={false}
                className="h-[22px] w-[22px] rounded-md object-contain"
              />
            )}
            <span className="max-w-[88px] truncate">{pack.name}</span>
          </button>
        ))}
      </div>

      {/* Nhãn dán của gói đang chọn */}
      {!activeId ? (
        <p className="px-0.5 py-2 text-center text-xs text-slate-500">
          Chọn một gói để xem nhãn dán.
        </p>
      ) : loading && !detail ? (
        <p className="px-0.5 py-3 text-center text-xs text-slate-500">Đang tải nhãn dán…</p>
      ) : detail && detail.stickers.length > 0 ? (
        <>
          <p className="mb-1 px-0.5 text-[10px] text-slate-500">
            Tác giả: <span className="font-semibold text-slate-400">{detail.artist}</span>
          </p>
          <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
            {detail.stickers.map((sticker) => (
              <button
                key={sticker.url}
                type="button"
                disabled={!onPick}
                onClick={() => onPick?.(sticker.url)}
                title={onPick ? 'Gửi nhãn dán' : `${detail.name} — ${detail.artist}`}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-xl p-1 transition-colors',
                  onPick ? 'hover:bg-white/10' : 'cursor-default',
                )}
              >
                <img
                  src={sticker.url}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  draggable={false}
                  className="h-11 w-11 object-contain"
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="px-0.5 py-3 text-center text-xs text-slate-500">
          Không tải được nhãn dán của gói này.
        </p>
      )}
    </div>
  );
}
