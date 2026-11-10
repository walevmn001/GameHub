import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { minCoinsToPlay, normalizeConfig, type TienLenConfig } from '@/types';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { badRequest, forbidden, notFound } from '../http/errors';
import { requireAuth } from '../auth/middleware';
import { broadcastRoomClosed, broadcastRoomUpdate } from '../realtime/broadcast';
import { disposeRoom, startMatchForRoom } from '../matches/manager';
import { getGameEntry } from '../games/catalog';
import { prisma } from '../prisma';
import { loadPublicUser } from '../users/service';
import {
  addBot,
  addMember,
  createRoom,
  deleteRoom,
  getRoomRow,
  isHost,
  listRooms,
  removeBot,
  removeMember,
  setStatus,
  toClientRoom,
} from './service';

export const roomsRouter = Router();

const createSchema = z.object({
  name: z.string().trim().min(1, 'Hãy nhập tên phòng.').max(40),
  gameId: z.string().trim().min(1),
  visibility: z.enum(['public', 'private']).default('public'),
  maxPlayers: z.number().int().min(2).max(4),
  password: z.string().max(64).optional(),
  config: z.record(z.unknown()).optional(),
});

const joinSchema = z.object({ password: z.string().max(64).optional() });
const statusSchema = z.object({ status: z.enum(['waiting', 'playing', 'closed']) });

async function currentCoins(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
  return user?.coins ?? 0;
}

/** Danh sách phòng công khai. */
roomsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rooms = await listRooms();
    res.json(rooms.map(toClientRoom));
  }),
);

/** Thông tin một phòng. */
roomsRouter.get(
  '/:roomId',
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    res.json(toClientRoom(room));
  }),
);

/** Tạo phòng mới — chủ phòng là người gọi API. */
roomsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(createSchema, req.body);
    const entry = getGameEntry(input.gameId);
    if (!entry) throw badRequest('Trò chơi không tồn tại trên máy chủ.');
    if (input.maxPlayers < entry.minPlayers || input.maxPlayers > entry.maxPlayers) {
      throw badRequest(`${entry.name} cần từ ${entry.minPlayers} đến ${entry.maxPlayers} người chơi.`);
    }
    if (input.visibility === 'private' && !input.password?.trim()) {
      throw badRequest('Phòng riêng cần có mật khẩu.');
    }

    const me = await loadPublicUser(req.auth!.userId);
    if (input.gameId === 'tien-len') {
      const required = minCoinsToPlay(normalizeConfig(input.config as Partial<TienLenConfig> | undefined));
      if (me.coins < required) {
        throw badRequest(
          `Bạn cần tối thiểu ${required.toLocaleString('vi-VN')} xu để tạo bàn này (đủ chịu một ván thua nặng, kể cả bị chặt/thối Heo). Số dư hiện tại: ${me.coins.toLocaleString('vi-VN')} xu.`,
        );
      }
    }
    const room = await createRoom(
      { id: me.id, displayName: me.displayName, coins: me.coins },
      {
        name: input.name,
        gameId: input.gameId,
        visibility: input.visibility ?? 'public',
        maxPlayers: input.maxPlayers,
        config: input.config as Partial<TienLenConfig> | undefined,
      },
    );

    if (input.visibility === 'private' && input.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      await prisma.room.update({ where: { id: room.id }, data: { passwordHash } });
    }

    const updated = await broadcastRoomUpdate(room.id);
    res.status(201).json(toClientRoom(updated ?? room));
  }),
);

/** Tham gia phòng. */
roomsRouter.post(
  '/:roomId/join',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(joinSchema, req.body ?? {});
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (room.status === 'closed') throw badRequest('Phòng đã đóng.');

    const already = room.members.some((m) => m.userId === req.auth!.userId);
    if (!already) {
      if (room.members.length >= room.maxPlayers) throw badRequest('Phòng đã đầy.');
      if (room.visibility === 'private') {
        const okPassword =
          room.passwordHash && input.password
            ? await bcrypt.compare(input.password, room.passwordHash)
            : false;
        if (!okPassword) throw forbidden('Mật khẩu phòng không đúng.');
      }
    }

    const coins = await currentCoins(req.auth!.userId);
    if (!already && room.gameId === 'tien-len') {
      const required = minCoinsToPlay(normalizeConfig(room.config as Partial<TienLenConfig>));
      if (coins < required) {
        throw badRequest(
          `Bạn cần tối thiểu ${required.toLocaleString('vi-VN')} xu để vào bàn này (đủ chịu một ván thua nặng, kể cả bị chặt/thối Heo). Số dư hiện tại: ${coins.toLocaleString('vi-VN')} xu.`,
        );
      }
    }
    await addMember(room, { id: req.auth!.userId, coins });
    const updated = await broadcastRoomUpdate(room.id);
    res.json(toClientRoom(updated ?? room));
  }),
);

/** Rời phòng. */
roomsRouter.post(
  '/:roomId/leave',
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) {
      res.json({ ok: true });
      return;
    }
    const result = await removeMember(room, req.auth!.userId);
    if (result.closed) broadcastRoomClosed(room.id);
    else await broadcastRoomUpdate(room.id);
    res.json({ ok: true });
  }),
);

/** Chủ phòng thêm ghế người máy. */
roomsRouter.post(
  '/:roomId/bots',
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (!isHost(room, req.auth!.userId)) throw forbidden();
    if (room.members.length >= room.maxPlayers) throw badRequest('Phòng đã đủ người.');

    await addBot(room);
    const updated = await broadcastRoomUpdate(room.id);
    res.json(toClientRoom(updated ?? room));
  }),
);

/** Chủ phòng xoá ghế người máy. */
roomsRouter.delete(
  '/:roomId/bots/:memberId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (!isHost(room, req.auth!.userId)) throw forbidden();

    await removeBot(room, req.params.memberId);
    const updated = await broadcastRoomUpdate(room.id);
    res.json(toClientRoom(updated ?? room));
  }),
);

/** Chủ phòng đổi trạng thái phòng (đang chờ / đang chơi). */
roomsRouter.patch(
  '/:roomId/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(statusSchema, req.body);
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (!isHost(room, req.auth!.userId)) throw forbidden();

    const updated = await setStatus(room.id, input.status);
    const broadcasted = await broadcastRoomUpdate(room.id);
    res.json(toClientRoom(broadcasted ?? updated ?? room));
  }),
);

/** Chủ phòng bắt đầu ván đấu — máy chủ là nguồn chân lý, phát trạng thái qua Socket.IO. */
roomsRouter.post(
  '/:roomId/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (!isHost(room, req.auth!.userId)) throw forbidden('Chỉ chủ phòng mới có thể bắt đầu.');

    const entry = getGameEntry(room.gameId);
    if (!entry) throw badRequest('Trò chơi không tồn tại trên máy chủ.');
    if (room.members.length < entry.minPlayers) {
      throw badRequest(`${entry.name} cần ít nhất ${entry.minPlayers} người chơi.`);
    }

    await setStatus(room.id, 'playing');
    await startMatchForRoom(room);
    const updated = await broadcastRoomUpdate(room.id);
    res.json(toClientRoom(updated ?? room));
  }),
);

/** Chủ phòng đóng/xoá phòng. */
roomsRouter.delete(
  '/:roomId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const room = await getRoomRow(req.params.roomId);
    if (!room) throw notFound('Không tìm thấy phòng.');
    if (!isHost(room, req.auth!.userId)) throw forbidden();

    await deleteRoom(room.id);
    disposeRoom(room.id);
    broadcastRoomClosed(room.id);
    res.json({ ok: true });
  }),
);
