import type { MatchRecord, PlayerStats, UserRole } from './user';

/**
 * Kiểu dữ liệu cho tính năng xã hội: bạn bè, tìm người chơi và tin nhắn riêng.
 * Các luồng này chỉ hoạt động khi ứng dụng chạy ở chế độ trực tuyến (đã cấu hình backend).
 */

/** Trạng thái quan hệ giữa người dùng hiện tại và một tài khoản khác. */
export type FriendRelation = 'none' | 'friend' | 'outgoing' | 'incoming' | 'self';

/** Thông tin rút gọn của một người chơi khác (an toàn để hiển thị trong danh bạ). */
export interface DirectoryUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  role: UserRole;
  /** true nếu người này đang có ít nhất một kết nối Socket.IO. */
  online: boolean;
  /** Quan hệ với người dùng hiện tại. */
  relation: FriendRelation;
  /** Thời điểm tham gia (ms epoch). */
  createdAt: number;
}

/** Hồ sơ công khai của người chơi, dùng trong cửa sổ xem hồ sơ. */
export interface PublicPlayerProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  createdAt: number;
  stats: PlayerStats;
  history: MatchRecord[];
}

/** Lời mời kết bạn kèm thông tin người gửi/nhận. */
export interface FriendRequestInfo {
  id: string;
  user: DirectoryUser;
  createdAt: number;
}

/** Một tin nhắn riêng tư. */
export interface DirectMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  at: number;
  /** Thời điểm đã đọc (ms epoch) hoặc null nếu chưa đọc. */
  readAt: number | null;
}

/** Tóm tắt một cuộc trò chuyện với bạn bè. */
export interface ConversationSummary {
  friend: DirectoryUser;
  lastMessage: DirectMessage | null;
  /** Số tin chưa đọc do bạn bè gửi cho người dùng hiện tại. */
  unread: number;
}

/** Dữ liệu tổng hợp cho trang Bạn bè. */
export interface SocialOverview {
  friends: DirectoryUser[];
  incoming: FriendRequestInfo[];
  outgoing: FriendRequestInfo[];
}
