/**
 * Kiểu dữ liệu tài khoản.
 * LƯU Ý: Đây là tài khoản thử nghiệm lưu cục bộ trên thiết bị (LocalStorage),
 * KHÔNG phải hệ thống xác thực trực tuyến an toàn.
 */

/** Vai trò người dùng: người chơi thường hoặc quản trị viên (bảng quản trị). */
export type UserRole = 'user' | 'admin';

export interface PlayerStats {
  matches: number;
  wins: number;
  losses: number;
  /** Tổng điểm thắng/thua tích luỹ (thắng +1, thua -1 mặc định). */
  score: number;
}

export interface MatchRecord {
  id: string;
  gameId: string;
  gameName: string;
  /** Vị trí đạt được trong ván (1 = nhất). */
  placement: number;
  totalPlayers: number;
  /** true nếu người chơi thắng ván (vị trí 1). */
  win: boolean;
  score: number;
  createdAt: number;
  durationMs?: number;
  /** Chênh lệch xu thực tế sau khi quyết toán ván (dương = được xu). */
  coinDelta?: number;
}

export interface UserPreferences {
  sound: boolean;
  animations: boolean;
  /** Ưu tiên hiển thị bàn chơi ở chế độ ngang trên điện thoại. */
  preferLandscape: boolean;
}

/**
 * Bản ghi tài khoản được lưu cục bộ.
 * `passwordHash` KHÔNG bao giờ là mật khẩu thô — xem AuthService.
 */
export interface AccountRecord {
  id: string;
  username: string;
  displayName: string;
  /** URL dữ liệu (data URI) hoặc đường dẫn ảnh đại diện có sẵn trong app. */
  avatar: string;
  passwordHash: string;
  passwordSalt: string;
  coins: number;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  stats: PlayerStats;
  history: MatchRecord[];
  preferences: UserPreferences;
  /** true nếu là tài khoản khách tạo nhanh, chưa gắn mật khẩu do người dùng đặt. */
  isGuest?: boolean;
}

/** Thông tin người dùng an toàn để đưa vào UI (không có hash/salt). */
export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  createdAt: number;
  stats: PlayerStats;
  history: MatchRecord[];
  preferences: UserPreferences;
  /** Vai trò tài khoản; mặc định "user". */
  role: UserRole;
}

export function toPublicUser(account: AccountRecord): PublicUser {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    avatar: account.avatar,
    coins: account.coins,
    createdAt: account.createdAt,
    stats: account.stats,
    history: account.history,
    preferences: account.preferences,
    role: 'user',
  };
}
