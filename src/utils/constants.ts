/** Hằng số dùng chung toàn ứng dụng. */

export const APP_NAME = 'Mini Game Hub';
export const APP_TAGLINE = 'Nền tảng chơi game mini trên trình duyệt';
export const APP_VERSION = '0.1.0';

/** Tiền tố khoá lưu trữ cục bộ, tránh xung đột với ứng dụng khác cùng origin. */
export const STORAGE_PREFIX = 'mgh';

export const STORAGE_KEYS = {
  accounts: 'accounts',
  session: 'session',
  rooms: 'rooms',
  recentActivity: 'recent-activity',
  settings: 'settings',
  /** JWT khi kết nối backend trực tuyến. */
  token: 'auth-token',
  /** Tiền tố khoá lưu danh sách vật phẩm đã mua (ghép thêm id người dùng). */
  shopOwned: 'shop-owned',
  /** Tiền tố khoá lưu vật phẩm đang trang bị theo loại (ghép thêm id người dùng). */
  shopLoadout: 'shop-loadout',
} as const;

/** Số xu khởi tạo cho tài khoản thử nghiệm. */
export const STARTING_COINS = 5000;

/** Thời lượng 1 lượt chơi Tiến Lên (ms). */
export const TIEN_LEN_TURN_MS = 20000;
