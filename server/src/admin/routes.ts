import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { requireAdmin } from '../auth/middleware';
import { broadcastRoomClosed } from '../realtime/broadcast';
import { disposeRoom } from '../matches/manager';
import * as admin from './service';

/**
 * Router quản trị: liệt kê người dùng, tặng xu, đổi vai trò và xoá tài khoản.
 * Toàn bộ router được bảo vệ bởi `requireAdmin`.
 */
export const adminRouter = Router();

adminRouter.use(requireAdmin);

/** Danh sách các phòng đang hoạt động. */
adminRouter.get(
  '/rooms',
  asyncHandler(async (_req, res) => {
    res.json(await admin.listRooms());
  }),
);

/** Admin xoá phòng và buộc người chơi đang ở trong phòng rời ra. */
adminRouter.delete(
  '/rooms/:roomId',
  asyncHandler(async (req, res) => {
    await admin.deleteRoom(req.params.roomId);
    disposeRoom(req.params.roomId);
    broadcastRoomClosed(req.params.roomId, 'admin');
    res.json({ ok: true });
  }),
);

const coinsBody = z.object({
  delta: z.number().int('Số xu phải là số nguyên.').refine((v) => v !== 0, {
    message: 'Số xu phải khác 0.',
  }),
});

const roleBody = z.object({
  role: z.enum(['user', 'admin']),
});

/** Số liệu tổng quan. */
adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json(await admin.adminStats());
  }),
);

/** Danh sách người dùng (kèm lọc theo từ khoá). */
adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const take = Number(req.query.take ?? 100);
    const skip = Number(req.query.skip ?? 0);
    res.json(await admin.listUsers(q, Number.isFinite(take) ? take : 100, Number.isFinite(skip) ? skip : 0));
  }),
);

/** Tặng (hoặc trừ) xu cho một tài khoản. */
adminRouter.post(
  '/users/:id/coins',
  asyncHandler(async (req, res) => {
    const { delta } = parseBody(coinsBody, req.body);
    res.json(await admin.giftCoins(req.params.id, delta));
  }),
);

/** Đổi vai trò của một tài khoản. */
adminRouter.patch(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const { role } = parseBody(roleBody, req.body);
    res.json(await admin.setRole(req.params.id, req.auth!.userId, role));
  }),
);

/** Xoá một tài khoản. */
adminRouter.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    await admin.deleteUser(req.params.id, req.auth!.userId);
    res.json({ ok: true });
  }),
);
