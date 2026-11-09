import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { unauthorized } from '../http/errors';
import { requireAuth } from '../auth/middleware';
import { loadPublicUser } from './service';

export const usersRouter = Router();

const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Tên hiển thị cần từ 2 đến 24 ký tự.').max(24).optional(),
  avatar: z.string().max(400_000).optional(),
});

const preferencesSchema = z.object({
  sound: z.boolean().optional(),
  animations: z.boolean().optional(),
  preferLandscape: z.boolean().optional(),
});

/** Hồ sơ người dùng hiện tại. */
usersRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await loadPublicUser(req.auth!.userId));
  }),
);

/** Cập nhật tên hiển thị / ảnh đại diện. */
usersRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(profileSchema, req.body);
    const data: { displayName?: string; avatar?: string } = {};
    if (input.displayName !== undefined) data.displayName = input.displayName.trim();
    if (input.avatar !== undefined) data.avatar = input.avatar;

    await prisma.user.update({ where: { id: req.auth!.userId }, data });
    res.json(await loadPublicUser(req.auth!.userId));
  }),
);

/** Cập nhật tuỳ chọn (âm thanh, hiệu ứng, chế độ ngang). */
usersRouter.patch(
  '/me/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(preferencesSchema, req.body);
    const data: Partial<{ sound: boolean; animations: boolean; preferLandscape: boolean }> = {};
    if (input.sound !== undefined) data.sound = input.sound;
    if (input.animations !== undefined) data.animations = input.animations;
    if (input.preferLandscape !== undefined) data.preferLandscape = input.preferLandscape;

    await prisma.user.update({ where: { id: req.auth!.userId }, data });
    res.json(await loadPublicUser(req.auth!.userId));
  }),
);

/** Lịch sử trận đấu gần đây. */
usersRouter.get(
  '/me/matches',
  requireAuth,
  asyncHandler(async (req, res) => {
    const matches = await prisma.matchRecord.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(
      matches.map((match) => ({
        id: match.id,
        gameId: match.gameId,
        gameName: match.gameName,
        placement: match.placement,
        totalPlayers: match.totalPlayers,
        win: match.win,
        score: match.score,
        coinDelta: match.coinDelta,
        durationMs: match.durationMs ?? undefined,
        createdAt: match.createdAt.getTime(),
      })),
    );
  }),
);

/** Xoá toàn bộ lịch sử trận đấu. */
usersRouter.delete(
  '/me/matches',
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.matchRecord.deleteMany({ where: { userId: req.auth!.userId } });
    res.json(await loadPublicUser(req.auth!.userId));
  }),
);

/** Xoá tài khoản hiện tại (kèm dữ liệu liên quan nhờ cascade). */
usersRouter.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) throw unauthorized();
    await prisma.user.delete({ where: { id: user.id } });
    res.json({ ok: true });
  }),
);
