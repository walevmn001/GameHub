import {
  fail,
  ok,
  type ChatSticker,
  type ConversationSummary,
  type DirectMessage,
  type DirectoryUser,
  type FriendRequestInfo,
  type PublicPlayerProfile,
  type ServiceResult,
  type SocialOverview,
} from '@/types';
import { api } from './ApiService';
import { onlineEnabled } from './backend';

function unavailable<T>(): ServiceResult<T> {
  return fail('Tính năng bạn bè cần backend trực tuyến (chưa cấu hình VITE_API_URL).');
}

class SocialService {
  get enabled(): boolean { return onlineEnabled; }

  async overview(): Promise<ServiceResult<SocialOverview>> {
    if (!onlineEnabled) return unavailable();
    return api.request<SocialOverview>('/social/overview');
  }
  async friends(): Promise<ServiceResult<DirectoryUser[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<DirectoryUser[]>('/social/friends');
  }
  async search(query: string): Promise<ServiceResult<DirectoryUser[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<DirectoryUser[]>(`/social/search?q=${encodeURIComponent(query)}`);
  }
  async playerProfile(userId: string): Promise<ServiceResult<PublicPlayerProfile>> {
    if (!onlineEnabled) return unavailable();
    return api.request<PublicPlayerProfile>(`/users/${encodeURIComponent(userId)}/profile`);
  }
  async requests(): Promise<ServiceResult<{ incoming: FriendRequestInfo[]; outgoing: FriendRequestInfo[] }>> {
    if (!onlineEnabled) return unavailable();
    return api.request('/social/requests');
  }
  async sendRequest(targetId: string): Promise<ServiceResult<true>> {
    if (!onlineEnabled) return unavailable();
    const result = await api.request<{ ok: true }>('/social/requests', { method: 'POST', body: { targetId } });
    return result.ok ? ok(true) : fail(result.error);
  }
  async acceptRequest(requestId: string): Promise<ServiceResult<SocialOverview>> {
    if (!onlineEnabled) return unavailable();
    return api.request<SocialOverview>(`/social/requests/${requestId}/accept`, { method: 'POST', body: {} });
  }
  async rejectRequest(requestId: string): Promise<ServiceResult<SocialOverview>> {
    if (!onlineEnabled) return unavailable();
    return api.request<SocialOverview>(`/social/requests/${requestId}/reject`, { method: 'POST', body: {} });
  }
  async unfriend(friendId: string): Promise<ServiceResult<SocialOverview>> {
    if (!onlineEnabled) return unavailable();
    return api.request<SocialOverview>(`/social/friends/${friendId}`, { method: 'DELETE' });
  }
  async conversations(): Promise<ServiceResult<ConversationSummary[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<ConversationSummary[]>('/social/conversations');
  }
  async messages(friendId: string): Promise<ServiceResult<DirectMessage[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<DirectMessage[]>(`/social/messages/${friendId}`);
  }
  async sendMessage(friendId: string, text: string): Promise<ServiceResult<DirectMessage>> {
    if (!onlineEnabled) return unavailable();
    return api.request<DirectMessage>(`/social/messages/${friendId}`, { method: 'POST', body: { text } });
  }
  async sendSticker(friendId: string, sticker: ChatSticker): Promise<ServiceResult<DirectMessage>> {
    if (!onlineEnabled) return unavailable();
    return api.request<DirectMessage>(`/social/messages/${friendId}`, { method: 'POST', body: { sticker } });
  }
  async trendingStickers(): Promise<ServiceResult<ChatSticker[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<ChatSticker[]>('/social/stickers/trending');
  }
  async markRead(friendId: string): Promise<ServiceResult<true>> {
    if (!onlineEnabled) return unavailable();
    const result = await api.request<{ ok: true }>(`/social/messages/${friendId}/read`, { method: 'POST', body: {} });
    return result.ok ? ok(true) : fail(result.error);
  }
}

export const socialService = new SocialService();
