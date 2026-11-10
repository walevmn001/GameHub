import type { UserRole } from './user';

/**
 * Kiểu dữ liệu cho bảng quản trị (dành riêng cho tài khoản có vai trò "admin").
 * Chỉ chạy ở chế độ trực tuyến.
 */

/** Người dùng nhìn từ bảng quản trị. */
export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  role: UserRole;
  /** true nếu là tài khoản khách tạo nhanh. */
  isGuest: boolean;
  /** true nếu đang có kết nối Socket.IO. */
  online: boolean;
  createdAt: number;
  /** Số trận đã chơi (từ thống kê). */
  matches: number;
}

/** Số liệu tổng quan cho bảng quản trị. */
export interface AdminStats {
  totalUsers: number;
  admins: number;
  guests: number;
  online: number;
  totalCoins: number;
  totalMatches: number;
  /** Số tài khoản tạo trong 24 giờ gần nhất. */
  newUsersToday: number;
}

/** Kết quả trả về sau khi admin tặng/trừ xu. */
export interface AdminCoinResult {
  user: AdminUser;
  /** Số xu thực tế đã thay đổi (có thể khác yêu cầu nếu bị chặn ở mức 0). */
  applied: number;
}
