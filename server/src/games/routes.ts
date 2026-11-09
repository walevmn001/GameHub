import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { requireAuth } from '../auth/middleware';
import { loadPublicUser } from '../users/service';

export const gamesRouter = Router();

const GAME_NAMES: Record<string, string> = {
  'tien-len': 'Tiến Lên Miền Nam',
};

const matchSchema = z.object({
  win: z.boolean(),
  placement: z.number().int().min(1).max(4),
  totalPlayers: z.number().int().min(2).max(4),
  durationMs: z.number().int().nonnegative().optional(),
  coinDelta: z.number().int().optional(),
  score: z.number().int().optional(),
  gameName: z.string().max(60).optional(),
});

/**
 * Ghi nhận kết quả một ván chơi tại máy (chế độ với AI).
 * Cập nhật thống kê + số dư xu và lưu vào lịch sử người dùng.
 */
gamesRouter.post(
  '/:gameId/matches',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(matchSchema, req.body);
    const gameId = req.params.gameId;
    const gameName = input.gameName ?? GAME_NAMES[gameId] ?? gameId;
    const score = input.score ?? (input.win ? 10 - Math.max(0, input.placement - 1) * 2 : -5);
    const coinDelta = input.coinDelta ?? (input.win ? 100 : -40);

    await prisma.$transaction(async (tx) => {
      await tx.matchRecord.create({
        data: {
          userId: req.auth!.userId,
          gameId,
          gameName,
          placement: input.placement,
          totalPlayers: input.totalPlayers,
          win: input.win,
          score,
          coinDelta,
          durationMs: input.durationMs ?? null,
        },
      });

      const user = await tx.user.findUnique({ where: { id: req.auth!.userId }, select: { coins: true } });
      const nextCoins = Math.max(0, (user?.coins ?? 0) + coinDelta);

      await tx.user.update({ where: { id: req.auth!.userId }, data: { coins: nextCoins } });
      await tx.stats.upsert({
        where: { userId: req.auth!.userId },
        create: {
          userId: req.auth!.userId,
          matches: 1,
          wins: input.win ? 1 : 0,
          losses: input.win ? 0 : 1,
          score,
        },
        update: {
          matches: { increment: 1 },
          wins: { increment: input.win ? 1 : 0 },
          losses: { increment: input.win ? 0 : 1 },
          score: { increment: score },
        },
      });

      // Chỉ giữ 50 trận gần nhất cho mỗi người dùng.
      const stale = await tx.matchRecord.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { createdAt: 'desc' },
        skip: 50,
        select: { id: true },
      });
      if (stale.length > 0) {
        await tx.matchRecord.deleteMany({ where: { id: { in: stale.map((m) => m.id) } } });
      }
    });

    res.json(await loadPublicUser(req.auth!.userId));
  }),
);
