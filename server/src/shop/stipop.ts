import type { StipopFeed, StipopPack, StipopPackDetail } from '@/types';
import { env } from '../env';
import { badGateway, badRequest, notFound } from '../http/errors';

/**
 * ============================================================================
 *  CẦU NỐI STIPOP STICKER API (https://docs.stipop.io)
 * ============================================================================
 *  Server đóng vai trò PROXY để giữ `STIPOP_API_KEY` bí mật (key không bao giờ
 *  lộ ra client). Ảnh nhãn dán nằm trên CDN `img.stipop.io` nên client tải trực
 *  tiếp; server chỉ trả về metadata + URL.
 *
 *  Không cấu hình API key ⇒ `stipopEnabled()` = false ⇒ mọi nơi tự ẩn phần Stipop
 *  (cửa hàng, bộ chọn nhãn dán) mà không gây lỗi.
 *
 *  LƯU Ý BẢN QUYỀN: theo tài liệu Stipop, giao diện hiển thị nhãn dán PHẢI ghi rõ
 *  tên tác giả (`artist`) — component `StipopStickers` đã làm việc này.
 * ============================================================================
 */

const STIPOP_BASE = 'https://messenger.stipop.io/v1';
/** Kích thước ảnh xin từ CDN Stipop (px). Tài liệu khuyến nghị mặc định 300. */
const IMAGE_SIZE = 300;
/** Thời gian chờ tối đa mỗi lời gọi tới Stipop (ms) để không treo request của client. */
const REQUEST_TIMEOUT = 8000;

/** Bật tính năng Stipop khi đã cấu hình API key. */
export function stipopEnabled(): boolean {
  return env.stipopApiKey.length > 0;
}

/**
 * Có phải URL ảnh nhãn dán Stipop hợp lệ không.
 * Dùng để CHO PHÉP gửi nhãn dán Stipop mà không cần kiểm tra trong danh mục cửa hàng.
 */
export function isStipopStickerUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /(^|\.)stipop\.io$/.test(url.hostname);
  } catch {
    return false;
  }
}

/** Thêm tham số `d=<size>x<size>` để CDN trả ảnh nhỏ gọn hơn. */
function sized(url: string): string {
  if (!url) return url;
  const dim = `${IMAGE_SIZE}x${IMAGE_SIZE}`;
  return url.includes('?') ? `${url}&d=${dim}` : `${url}?d=${dim}`;
}

/** Hình dạng dữ liệu gói nhãn dán mà Stipop trả về (đã lược bớt trường không dùng). */
interface RawPack {
  packageId: number | string;
  packageName?: string;
  packageImg?: string;
  packageAnimated?: string;
  artistName?: string;
}
interface RawPackInfo extends RawPack {
  stickers?: { stickerId: number | string; stickerImg?: string }[];
}

/**
 * Gọi Stipop API và bóc lớp vỏ `{ header, body }`.
 * Ném ApiError 502 nếu Stipop lỗi mạng hoặc trả mã khác thành công.
 */
async function callStipop<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)] as [string, string]),
  ).toString();

  let response: Response;
  try {
    response = await fetch(`${STIPOP_BASE}${path}?${query}`, {
      headers: { apikey: env.stipopApiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch {
    throw badGateway('Không kết nối được tới Stipop. Vui lòng thử lại sau.');
  }

  if (!response.ok) throw badGateway(`Stipop phản hồi lỗi (${response.status}).`);

  const payload = (await response.json()) as {
    header?: { code?: string; message?: string };
    body?: T;
  };
  if (payload.header && payload.header.code !== '0000') {
    throw badGateway(payload.header.message || 'Stipop từ chối yêu cầu.');
  }
  if (!payload.body) throw badGateway('Stipop không trả về dữ liệu.');

  return payload.body;
}

/** Chuyển một gói thô của Stipop thành kiểu dùng chung với client. */
function toPack(raw: RawPack): StipopPack {
  return {
    id: String(raw.packageId),
    name: raw.packageName || 'Gói nhãn dán',
    artist: raw.artistName || 'Stipop',
    image: sized(raw.packageImg ?? ''),
    animated: raw.packageAnimated === 'Y',
  };
}

/** Danh sách gói nhãn dán Stipop (thịnh hành hoặc mới nhất). */
export async function listStipopPacks(
  userId: string,
  options: { sort?: 'trending' | 'new'; page?: number; limit?: number; lang?: string; country?: string },
): Promise<StipopFeed> {
  if (!stipopEnabled()) return { enabled: false, packs: [] };

  const body = await callStipop<{ packageList?: RawPack[] }>(
    options.sort === 'new' ? '/package/new' : '/package',
    {
      userId,
      pageNumber: options.page ?? 1,
      limit: options.limit ?? 24,
      lang: options.lang ?? 'vi',
      countryCode: options.country ?? 'VN',
    },
  );

  return { enabled: true, packs: (body.packageList ?? []).map(toPack) };
}

/** Chi tiết một gói Stipop kèm danh sách URL ảnh nhãn dán. */
export async function getStipopPack(userId: string, packId: string): Promise<StipopPackDetail> {
  if (!stipopEnabled()) throw badRequest('Tính năng nhãn dán Stipop chưa được bật.');

  const body = await callStipop<{ package?: RawPackInfo }>(
    `/package/${encodeURIComponent(packId)}`,
    { userId },
  );
  const pack = body.package;
  if (!pack) throw notFound('Không tìm thấy gói nhãn dán.');

  return {
    ...toPack(pack),
    stickers: (pack.stickers ?? [])
      .map((sticker) => ({ url: sized(sticker.stickerImg ?? '') }))
      .filter((sticker) => sticker.url.length > 0),
  };
}
