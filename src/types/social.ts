import type { MessageType } from './shop';
import type { MatchRecord, PlayerStats, UserRole } from './user';

/** Kiểu dữ liệu cho tính năng xã hội: bạn bè, tìm người chơi và tin nhắn riêng. */
export type FriendRelation = 'none' | 'friend' | 'outgoing' | 'incoming' | 'self';

export interface DirectoryUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  role: UserRole;
  online: boolean;
  relation: FriendRelation;
  createdAt: number;
}

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
  /** Văn bản hoặc nhãn dán. */
  type: MessageType;
  /** Nội dung văn bản; rỗng khi `type === 'sticker'`. */
  text: string;
  /** Id nhãn dán trong danh mục cửa hàng; null khi là tin nhắn văn bản. */
  stickerId: string | null;
  at: number;
  readAt: number | null;
}

/** Nội dung tối thiểu để gửi một tin nhắn (văn bản HOẶC nhãn dán). */
export interface OutgoingMessage {
  text?: string;
  stickerId?: string;
}

export interface ConversationSummary {
  friend: DirectoryUser;
  lastMessage: DirectMessage | null;
  unread: number;
}

export interface SocialOverview {
  friends: DirectoryUser[];
  incoming: FriendRequestInfo[];
  outgoing: FriendRequestInfo[];
}
