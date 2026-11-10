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
  text: string;
  at: number;
  readAt: number | null;
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
