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

/** Sticker từ MojiLaLa, lưu cùng tin nhắn dưới dạng payload nhỏ. */
export interface ChatSticker {
  id: string;
  url: string;
  previewUrl: string;
  pageUrl: string;
}

const STICKER_PREFIX = '[[gamehub-sticker:';

export function encodeStickerMessage(sticker: ChatSticker): string {
  return `${STICKER_PREFIX}${encodeURIComponent(JSON.stringify(sticker))}]]`;
}

export function decodeStickerMessage(text: string): ChatSticker | null {
  if (!text.startsWith(STICKER_PREFIX) || !text.endsWith(']]')) return null;
  try {
    const value = JSON.parse(decodeURIComponent(text.slice(STICKER_PREFIX.length, -2))) as Partial<ChatSticker>;
    if (typeof value.id !== 'string' || value.id.length > 200) return null;
    const validUrl = (raw: unknown, hostname: string) => {
      if (typeof raw !== 'string') return false;
      try {
        const url = new URL(raw);
        return url.protocol === 'https:' && url.hostname === hostname;
      } catch {
        return false;
      }
    };
    if (
      !validUrl(value.url, 'cdn-stickers.mojilala.com') ||
      !validUrl(value.previewUrl, 'cdn-stickers.mojilala.com') ||
      !validUrl(value.pageUrl, 'mojilala.com')
    ) return null;
    return value as ChatSticker;
  } catch {
    return null;
  }
}

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
