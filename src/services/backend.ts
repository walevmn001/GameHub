import { api } from './ApiService';
import { storage } from './StorageService';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Cấu hình kết nối backend.
 *
 * - Đặt biến môi trường `VITE_API_URL` (ví dụ `https://mini-game-hub.onrender.com`) để bật
 *   chế độ trực tuyến: tài khoản, phòng chơi và ván đấu đều chạy trên server.
 * - Không đặt biến này thì ứng dụng chạy ở chế độ Local/Demo như trước.
 */

const rawUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');

/** Gốc backend (không gồm `/api`). Rỗng khi chạy Local. */
export const BACKEND_URL = rawUrl;

/** true khi đã cấu hình backend và nên dùng các luồng trực tuyến. */
export const onlineEnabled = rawUrl.length > 0;

if (onlineEnabled) {
  api.configure({ baseUrl: `${rawUrl}/api`, enabled: true, timeoutMs: 15000 });
  // Mọi yêu cầu REST tự động gắn JWT đã lưu (nếu có).
  api.setTokenProvider(() => readToken());
}

/**
 * Token chỉ tồn tại trong phiên trình duyệt hiện tại — dùng khi người dùng bỏ chọn
 * "Ghi nhớ đăng nhập". Không ghi xuống thiết bị nên sẽ mất khi tải lại trang.
 */
let sessionToken: string | null = null;

/** Đọc JWT đã lưu (nếu có). */
export async function readToken(): Promise<string | null> {
  return sessionToken ?? storage.read<string>(STORAGE_KEYS.token);
}

/**
 * Lưu JWT sau khi đăng nhập/đăng ký.
 * `remember = true` (mặc định): ghi xuống thiết bị để tự đăng nhập lại lần sau.
 * `remember = false`: chỉ giữ trong phiên trình duyệt hiện tại (mất khi tải lại trang).
 */
export async function saveToken(token: string, remember = true): Promise<void> {
  if (remember) {
    sessionToken = null;
    await storage.write(STORAGE_KEYS.token, token);
    return;
  }
  sessionToken = token;
  await storage.remove(STORAGE_KEYS.token);
}

/** Xoá JWT khi đăng xuất. */
export async function clearToken(): Promise<void> {
  sessionToken = null;
  await storage.remove(STORAGE_KEYS.token);
}
