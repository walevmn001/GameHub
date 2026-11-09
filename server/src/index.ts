import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '@/types';
import { env } from './env';
import { createApp } from './app';
import { disconnectPrisma } from './prisma';
import { setIo } from './realtime/io';
import { registerSocketHandlers } from './realtime/socket';

/** Khởi động HTTP server + Socket.IO và gắn xử lý tắt an toàn. */
async function main(): Promise<void> {
  const app = createApp();
  const httpServer = createServer(app);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : true,
      credentials: true,
    },
  });

  setIo(io);
  registerSocketHandlers(io);

  httpServer.listen(env.port, () => {
    console.log(`[server] Mini Game Hub đang chạy tại cổng ${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] Nhận ${signal}, đang tắt...`);
    io.close();
    httpServer.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

// Lưới an toàn: ghi log lỗi nền thay vì để cả tiến trình sập khi đang phục vụ người chơi.
process.on('unhandledRejection', (reason) => {
  console.error('[server] Promise bị từ chối không xử lý:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[server] Lỗi không bắt được:', error);
});

main().catch((error) => {
  console.error('[server] Khởi động thất bại:', error);
  process.exit(1);
});
