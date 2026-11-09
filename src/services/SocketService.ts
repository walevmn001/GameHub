import { io, type Socket } from 'socket.io-client';
import {
  REALTIME_EVENTS,
  type AckResult,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@/types';
import { BACKEND_URL, readToken } from './backend';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type AnyHandler = (...args: unknown[]) => void;

const ACK_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ACK_TIMEOUT_MS)),
  ]);
}

/**
 * Duy trì một kết nối Socket.IO duy nhất tới backend.
 *
 * Tầng UI đăng ký sự kiện qua `on(...)` và gửi hành động qua các phương thức có ack.
 * Handler được ghi nhớ và tự gắn lại mỗi khi kết nối (kể cả trước khi `connect` được gọi),
 * nên context có thể đăng ký sự kiện ngay khi khởi tạo mà không lo mất sự kiện.
 */
class SocketService {
  private socket: AppSocket | null = null;
  private handlers = new Map<string, Set<AnyHandler>>();
  /** Mã phòng mà kết nối hiện đang gắn vào (để tự rời khi người chơi rời trang phòng/bàn). */
  private roomId: string | null = null;

  get currentRoomId(): string | null {
    return this.roomId;
  }

  /** Gắn toàn bộ handler đã đăng ký vào một socket vừa tạo. */
  private attachHandlers(socket: AppSocket): void {
    for (const [event, set] of this.handlers) {
      for (const handler of set) socket.on(event as never, handler as never);
    }
  }

  /** Kết nối (hoặc tái sử dụng kết nối) với JWT. */
  connect(token: string): AppSocket {
    if (this.socket && this.socket.connected) return this.socket;
    this.socket?.disconnect();
    // BACKEND_URL có thể là URL tuyệt đối (Render) hoặc giá trị tương đối khi backend
    // được proxy cùng domain với frontend (ví dụ lúc chạy dev) — khi đó dùng origin hiện tại.
    const target = /^https?:\/\//i.test(BACKEND_URL) ? BACKEND_URL : window.location.origin;
    const socket: AppSocket = io(target, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    this.attachHandlers(socket);
    this.socket = socket;
    return socket;
  }

  /**
   * Kết nối bằng JWT đã lưu trên thiết bị.
   * Trả về null khi chưa đăng nhập (không có token).
   */
  async connectWithStoredToken(): Promise<AppSocket | null> {
    const token = await readToken();
    if (!token) return null;
    return this.connect(token);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.roomId = null;
  }

  get connected(): boolean {
    return Boolean(this.socket?.connected);
  }

  /**
   * Đăng ký một sự kiện từ server; trả về hàm huỷ đăng ký.
   * Có thể gọi trước khi kết nối — handler sẽ được gắn ngay khi socket sẵn sàng.
   */
  on<E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E],
  ): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set<AnyHandler>();
      this.handlers.set(event, set);
    }
    const fn = handler as unknown as AnyHandler;
    set.add(fn);
    this.socket?.on(event as never, handler as never);
    return () => {
      set?.delete(fn);
      this.socket?.off(event as never, handler as never);
    };
  }

  private ackEmit(
    run: (socket: AppSocket, done: (result: AckResult) => void) => void,
  ): Promise<AckResult> {
    const socket = this.socket;
    if (!socket) return Promise.resolve({ ok: false, error: 'Chưa kết nối máy chủ.' });
    const promise = new Promise<AckResult>((resolve) => {
      run(socket, (result) => resolve(result));
    });
    return withTimeout(promise, { ok: false, error: 'Máy chủ không phản hồi.' });
  }

  joinRoom(roomId: string): Promise<AckResult> {
    this.roomId = roomId;
    return this.ackEmit((socket, done) =>
      socket.emit(REALTIME_EVENTS.roomJoin, { roomId }, done),
    );
  }

  leaveRoom(roomId: string): Promise<AckResult> {
    this.roomId = null;
    return this.ackEmit((socket, done) =>
      socket.emit(REALTIME_EVENTS.roomLeave, { roomId }, done),
    );
  }

  play(cardIds: string[]): Promise<AckResult> {
    return this.ackEmit((socket, done) =>
      socket.emit(REALTIME_EVENTS.matchPlay, { cardIds }, done),
    );
  }

  pass(): Promise<AckResult> {
    return this.ackEmit((socket, done) => socket.emit(REALTIME_EVENTS.matchPass, {}, done));
  }

  sync(): Promise<AckResult> {
    return this.ackEmit((socket, done) => socket.emit(REALTIME_EVENTS.matchSync, {}, done));
  }

  sendChat(text: string): Promise<AckResult> {
    return this.ackEmit((socket, done) =>
      socket.emit(REALTIME_EVENTS.chatSend, { text }, done),
    );
  }
}

export const socketService = new SocketService();
