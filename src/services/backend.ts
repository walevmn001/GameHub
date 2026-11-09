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

/** Đọc JWT đã lưu (nếu có). */
export async function readToken(): Promise<string | null> {
  return storage.read<string>(STORAGE_KEYS.token);
}

/** Lưu JWT sau khi đăng nhập/đăng ký. */
export async function saveToken(token: string): Promise<void> {
  await storage.write(STORAGE_KEYS.token, token);
}

/** Xoá JWT khi đăng xuất. */
export async function clearToken(): Promise<void> {
  await storage.remove(STORAGE_KEYS.token);
}
