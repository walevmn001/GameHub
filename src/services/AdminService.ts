import {
  fail,
  ok,
  type AdminCoinResult,
  type AdminStats,
  type AdminUser,
  type Room,
  type ServiceResult,
  type UserRole,
} from '@/types';
import { api } from './ApiService';
import { onlineEnabled } from './backend';

/**
 * AdminService — bảng quản trị (tặng xu, đổi vai trò, xoá tài khoản).
 * Mọi endpoint đều kiểm tra quyền admin ở phía máy chủ.
 */

function unavailable<T>(): ServiceResult<T> {
  return fail('Khu quản trị cần backend trực tuyến (chưa cấu hình VITE_API_URL).');
}

class AdminService {
  get enabled(): boolean {
    return onlineEnabled;
  }

  async stats(): Promise<ServiceResult<AdminStats>> {
    if (!onlineEnabled) return unavailable();
    return api.request<AdminStats>('/admin/stats');
  }

  async users(query: string): Promise<ServiceResult<AdminUser[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<AdminUser[]>(`/admin/users?q=${encodeURIComponent(query)}`);
  }

  async giftCoins(userId: string, delta: number): Promise<ServiceResult<AdminCoinResult>> {
    if (!onlineEnabled) return unavailable();
    return api.request<AdminCoinResult>(`/admin/users/${userId}/coins`, {
      method: 'POST',
      body: { delta },
    });
  }

  async setRole(userId: string, role: UserRole): Promise<ServiceResult<AdminUser>> {
    if (!onlineEnabled) return unavailable();
    return api.request<AdminUser>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    });
  }

  async deleteUser(userId: string): Promise<ServiceResult<true>> {
    if (!onlineEnabled) return unavailable();
    const result = await api.request<{ ok: true }>(`/admin/users/${userId}`, { method: 'DELETE' });
    return result.ok ? ok(true) : fail(result.error);
  }

  async rooms(): Promise<ServiceResult<Room[]>> {
    if (!onlineEnabled) return unavailable();
    return api.request<Room[]>('/admin/rooms');
  }

  async deleteRoom(roomId: string): Promise<ServiceResult<true>> {
    if (!onlineEnabled) return unavailable();
    const result = await api.request<{ ok: true }>(`/admin/rooms/${encodeURIComponent(roomId)}`, {
      method: 'DELETE',
    });
    return result.ok ? ok(true) : fail(result.error);
  }
}

export const adminService = new AdminService();
