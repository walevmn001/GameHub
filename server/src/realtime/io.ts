import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '@/types';

/** Kiểu server Socket.IO dùng xuyên suốt ứng dụng. */
export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

let ioRef: AppServer | null = null;

export function setIo(io: AppServer): void {
  ioRef = io;
}

export function getIo(): AppServer | null {
  return ioRef;
}

/** Tên kênh (socket room) theo phòng chơi. */
export function roomChannel(roomId: string): string {
  return `room:${roomId}`;
}
