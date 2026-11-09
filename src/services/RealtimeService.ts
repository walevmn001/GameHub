/**
 * RealtimeService: giao diện độc lập cho kết nối thời gian thực.
 *
 * Mục tiêu: tầng UI và game engine chỉ phụ thuộc `RealtimeClient`,
 * không phụ thuộc trực tiếp Socket.IO hay bất kỳ thư viện mạng nào.
 * - `LocalRealtimeClient`: bus sự kiện trong bộ nhớ, dùng cho chế độ chơi tại máy.
 * - `SocketIORealtimeClient`: điểm nối Socket.IO khi có backend (chưa kích hoạt).
 */

export type RealtimeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type Unsubscribe = () => void;

export interface RealtimeClient {
  readonly transport: 'local' | 'socketio';
  connect(url?: string, token?: string): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  getStatus(): RealtimeStatus;
  on<T = unknown>(event: string, handler: (payload: T) => void): Unsubscribe;
  emit<T = unknown>(event: string, payload?: T): void;
  onStatusChange(handler: (status: RealtimeStatus) => void): Unsubscribe;
}

/** Bus sự kiện trong bộ nhớ — chạy hoàn toàn cục bộ, không kết nối Internet. */
export class LocalRealtimeClient implements RealtimeClient {
  readonly transport = 'local' as const;
  private handlers = new Map<string, Set<(payload: unknown) => void>>();
  private statusHandlers = new Set<(status: RealtimeStatus) => void>();
  private status: RealtimeStatus = 'disconnected';

  async connect(): Promise<void> {
    this.setStatus('connecting');
    // Không có I/O mạng; mô phỏng bắc cầu cục bộ để tầng UI có cùng luồng xử lý.
    await Promise.resolve();
    this.setStatus('connected');
  }

  disconnect(): void {
    this.setStatus('disconnected');
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  on<T = unknown>(event: string, handler: (payload: T) => void): Unsubscribe {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as (payload: unknown) => void);
    this.handlers.set(event, set);
    return () => set.delete(handler as (payload: unknown) => void);
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.forEach((handler) => handler(payload));
  }

  onStatusChange(handler: (status: RealtimeStatus) => void): Unsubscribe {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private setStatus(status: RealtimeStatus): void {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

/**
 * Điểm nối Socket.IO chuẩn bị cho backend realtime.
 * Chưa cài `socket.io-client` ở giai đoạn này nên lớp này chỉ giữ chỗ,
 * báo lỗi rõ ràng thay vì giả lập kết nối thành công.
 */
export class SocketIORealtimeClient implements RealtimeClient {
  readonly transport = 'socketio' as const;
  private statusHandlers = new Set<(status: RealtimeStatus) => void>();

  async connect(): Promise<void> {
    this.setStatus('error');
    throw new Error(
      'Socket.IO chưa được cấu hình. Hãy cài socket.io-client và bật backend realtime.',
    );
  }

  disconnect(): void {
    this.setStatus('disconnected');
  }

  isConnected(): boolean {
    return false;
  }

  getStatus(): RealtimeStatus {
    return 'error';
  }

  on<T = unknown>(_event: string, _handler: (payload: T) => void): Unsubscribe {
    return () => {};
  }

  emit<T = unknown>(_event: string, _payload?: T): void {
    /* Không có kết nối. */
  }

  onStatusChange(handler: (status: RealtimeStatus) => void): Unsubscribe {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private setStatus(status: RealtimeStatus): void {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

/**
 * Factory: trả về client phù hợp với cấu hình hiện tại.
 * Mặc định dùng LocalRealtimeClient cho tới khi backend sẵn sàng.
 */
export function createRealtimeClient(transport: 'local' | 'socketio' = 'local'): RealtimeClient {
  return transport === 'socketio' ? new SocketIORealtimeClient() : new LocalRealtimeClient();
}

/** Instance dùng chung cho chế độ chơi tại máy. */
export const localRealtime = new LocalRealtimeClient();
