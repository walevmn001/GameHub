import { STORAGE_KEYS } from '@/utils/constants';
import { createId } from '@/utils/id';
import { storage } from './StorageService';

/** Nhật ký hoạt động gần đây — lưu cục bộ, phục vụ hiển thị trên trang chủ. */

export type ActivityType = 'auth' | 'match' | 'room' | 'profile' | 'system';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  at: number;
}

const MAX_ENTRIES = 20;

class ActivityService {
  async list(): Promise<ActivityEntry[]> {
    return (await storage.read<ActivityEntry[]>(STORAGE_KEYS.recentActivity)) ?? [];
  }

  async log(type: ActivityType, message: string): Promise<ActivityEntry[]> {
    const entries = await this.list();
    const entry: ActivityEntry = { id: createId('act'), type, message, at: Date.now() };
    const next = [entry, ...entries].slice(0, MAX_ENTRIES);
    await storage.write(STORAGE_KEYS.recentActivity, next);
    return next;
  }

  async clear(): Promise<void> {
    await storage.remove(STORAGE_KEYS.recentActivity);
  }
}

export const activityService = new ActivityService();
