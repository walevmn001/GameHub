import express from 'express';
import cors from 'cors';
import { env } from './env';
import { authRouter } from './auth/routes';
import { usersRouter } from './users/routes';
import { gamesRouter } from './games/routes';
import { roomsRouter } from './rooms/routes';
import { socialRouter } from './social/routes';
import { adminRouter } from './admin/routes';
import { errorHandler, notFoundHandler } from './http/errors';

/** Dựng ứng dụng Express: CORS, JSON, các router REST và xử lý lỗi cuối chuỗi. */
export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : true,
      credentials: true,
    }),
  );
  // Ảnh đại diện dạng data URI có thể khá lớn nên nới giới hạn body.
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'mini-game-hub', time: Date.now() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/rooms', roomsRouter);
  app.use('/api/social', socialRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
