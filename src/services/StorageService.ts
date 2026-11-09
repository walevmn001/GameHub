import { STORAGE_PREFIX } from '@/utils/constants';

/**
 * Giao diện lưu trữ trừu tượng.
 * Toàn bộ ứng dụng chỉ làm việc với giao diện này, KHÔNG gọi LocalStorage trực tiếp.
 * Khi có backend, chỉ cần thay `LocalStorageStore` bằng `RemoteStore` mà không sửa logic khác.
 */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
  readonly kind: 'local' | 'memory' | 'remote';
}

/** Triển khai trên LocalStorage của trình duyệt/WebView. */
export class LocalStorageStore implements KeyValueStore {
  readonly kind = 'local' as const;

  private available(): boolean {
    try {
      const probe = `${STORAGE_PREFIX}__probe__`;
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  private fullKey(key: string): string {
    return `${STORAGE_PREFIX}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.available()) return null;
    const raw = window.localStorage.getItem(this.fullKey(key));
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.available()) return;
    window.localStorage.setItem(this.fullKey(key), JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    if (!this.available()) return;
    window.localStorage.removeItem(this.fullKey(key));
  }

  async keys(): Promise<string[]> {
    if (!this.available()) return [];
    const prefix = `${STORAGE_PREFIX}:`;
    return Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.slice(prefix.length));
  }

  async clear(): Promise<void> {
    if (!this.available()) return;
    const all = await this.keys();
    await Promise.all(all.map((k) => this.remove(k)));
  }
}

/** Lưu trữ trong bộ nhớ (dùng cho môi trường không có DOM, hoặc kiểm thử). */
export class MemoryStore implements KeyValueStore {
  readonly kind = 'memory' as const;
  private map = new Map<string, string>();

  async get<T>(key: string): Promise<T | null> {
    const raw = this.map.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.map.set(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.map.keys());
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

/**
 * StorageService: cổng truy cập lưu trữ duy nhất của ứng dụng.
 * Mọi service khác (Auth, Rooms, Game) đều đi qua đây.
 */
class StorageService {
  private store: KeyValueStore;

  constructor() {
    this.store = this.resolveStore();
  }

  private resolveStore(): KeyValueStore {
    const canUseLocal =
      typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    return canUseLocal ? new LocalStorageStore() : new MemoryStore();
  }

  /** Cho phép thay thế backend lưu trữ (ví dụ RemoteStore) ở giai đoạn sau. */
  useStore(store: KeyValueStore): void {
    this.store = store;
  }

  get kind(): KeyValueStore['kind'] {
    return this.store.kind;
  }

  read<T>(key: string): Promise<T | null> {
    return this.store.get<T>(key);
  }

  write<T>(key: string, value: T): Promise<void> {
    return this.store.set<T>(key, value);
  }

  remove(key: string): Promise<void> {
    return this.store.remove(key);
  }

  keys(): Promise<string[]> {
    return this.store.keys();
  }

  clearAll(): Promise<void> {
    return this.store.clear();
  }
}

export const storage = new StorageService();
