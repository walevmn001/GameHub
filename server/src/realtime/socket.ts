import { REALTIME_EVENTS, type ChatMessage } from '@/types';
import { verifyToken } from '../auth/jwt';
import { prisma } from '../prisma';
import { getRoomRow, addMember, removeMember, setStatus } from '../rooms/service';
import { abortMatch, hasMatch, passInMatch, playInMatch, syncMatch } from '../matches/manager';
import { friendIdsOf } from '../social/service';
import {
  broadcastPresence,
  broadcastRoomClosed,
  broadcastRoomUpdate,
  notifySocialUpdate,
} from './broadcast';
import { addConnection, onlineUserIds, removeConnection } from './presence';
import { roomChannel, userChannel, type AppServer } from './io';

const MAX_CHAT_LENGTH = 200;

async function coinsOf(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
  return user?.coins ?? 0;
}

/** Báo cho bạn bè tải lại danh sách (trạng thái online/offline thay đổi). */
async function notifyFriends(userId: string): Promise<void> {
  try {
    const ids = await friendIdsOf(userId);
    for (const id of ids) notifySocialUpdate(id);
  } catch (error) {
    console.error('[socket] notifyFriends', error);
  }
}

/**
 * Đăng ký toàn bộ xử lý Socket.IO.
 * Xác thực bằng JWT ở handshake: mọi kết nối đều gắn `userId`/`displayName`.
 */
export function registerSocketHandlers(io: AppServer): void {
  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth?.token as string | undefined) ?? '';
      const payload = token ? verifyToken(token) : null;
      if (!payload) {
        next(new Error('unauthorized'));
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, displayName: true },
      });
      if (!user) {
        next(new Error('unauthorized'));
        return;
      }
      socket.data.userId = user.id;
      socket.data.displayName = user.displayName;
      socket.data.roomId = null;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('auth_failed'));
    }
  });

  io.on('connection', (socket) => {
    // Theo dõi trực tuyến + vào kênh riêng để nhận tin nhắn/thông báo cá nhân.
    addConnection(socket.data.userId);
    void socket.join(userChannel(socket.data.userId));
    broadcastPresence(onlineUserIds());
    void notifyFriends(socket.data.userId);

    /** Rời phòng rõ ràng: dừng ván (nếu đang chơi), xoá ghế và phát cập nhật. */
    const leaveCurrentRoom = async (): Promise<void> => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.data.roomId = null;
      try {
        const hadMatch = hasMatch(roomId);
        await socket.leave(roomChannel(roomId));

        if (hadMatch) {
          abortMatch(roomId);
          // Ván bị dừng giữa chừng: đưa phòng về trạng thái chờ và báo cho người còn lại.
          await setStatus(roomId, 'waiting').catch(() => undefined);
          io.to(roomChannel(roomId)).emit(REALTIME_EVENTS.serverError, {
            message: 'Một người chơi đã rời ván. Ván đấu đã kết thúc.',
          });
        }

        const room = await getRoomRow(roomId);
        if (!room) return;
        const result = await removeMember(room, socket.data.userId);
        if (result.closed) broadcastRoomClosed(roomId);
        else await broadcastRoomUpdate(roomId);
      } catch (error) {
        console.error('[socket] room:leave', error);
      }
    };

    socket.on(REALTIME_EVENTS.roomJoin, async (payload, ack) => {
      try {
        const roomId = payload?.roomId;
        if (!roomId) {
          ack?.({ ok: false, error: 'Thiếu mã phòng.' });
          return;
        }
        const room = await getRoomRow(roomId);
        if (!room) {
          ack?.({ ok: false, error: 'Không tìm thấy phòng.' });
          return;
        }

        await addMember(room, { id: socket.data.userId, coins: await coinsOf(socket.data.userId) });
        await socket.join(roomChannel(roomId));
        socket.data.roomId = roomId;

        await broadcastRoomUpdate(roomId);
        if (hasMatch(roomId)) await syncMatch(roomId);
        ack?.({ ok: true });
      } catch (error) {
        console.error('[socket] room:join', error);
        ack?.({ ok: false, error: 'Không thể vào phòng.' });
      }
    });

    socket.on(REALTIME_EVENTS.roomLeave, async (_payload, ack) => {
      try {
        await leaveCurrentRoom();
        ack?.({ ok: true });
      } catch (error) {
        console.error('[socket] room:leave', error);
        ack?.({ ok: false, error: 'Không thể rời phòng.' });
      }
    });

    socket.on(REALTIME_EVENTS.chatSend, (payload, ack) => {
      const roomId = socket.data.roomId;
      const text = (payload?.text ?? '').trim().slice(0, MAX_CHAT_LENGTH);
      if (!roomId || !text) {
        ack?.({ ok: false, error: 'Nội dung tin nhắn trống.' });
        return;
      }
      const message: ChatMessage = {
        roomId,
        fromId: socket.data.userId,
        from: socket.data.displayName,
        text,
        at: Date.now(),
      };
      io.to(roomChannel(roomId)).emit(REALTIME_EVENTS.chatMessage, message);
      ack?.({ ok: true });
    });

    socket.on(REALTIME_EVENTS.matchPlay, async (payload, ack) => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        ack?.({ ok: false, error: 'Bạn chưa ở trong phòng.' });
        return;
      }
      try {
        const result = await playInMatch(roomId, socket.data.userId, payload?.cardIds ?? []);
        ack?.(result);
      } catch (error) {
        console.error('[socket] match:play', error);
        ack?.({ ok: false, error: 'Không thể đánh bài.' });
      }
    });

    socket.on(REALTIME_EVENTS.matchPass, async (_payload, ack) => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        ack?.({ ok: false, error: 'Bạn chưa ở trong phòng.' });
        return;
      }
      try {
        const result = await passInMatch(roomId, socket.data.userId);
        ack?.(result);
      } catch (error) {
        console.error('[socket] match:pass', error);
        ack?.({ ok: false, error: 'Không thể bỏ lượt.' });
      }
    });

    socket.on(REALTIME_EVENTS.matchSync, async (_payload, ack) => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        ack?.({ ok: false, error: 'Bạn chưa ở trong phòng.' });
        return;
      }
      try {
        await syncMatch(roomId);
        ack?.({ ok: true });
      } catch (error) {
        console.error('[socket] match:sync', error);
        ack?.({ ok: false, error: 'Không thể đồng bộ ván đấu.' });
      }
    });

    socket.on('disconnect', () => {
      // Disconnect thường xảy ra khi F5/reconnect. Giữ ghế và ván trên server để client
      // mới có thể join lại rồi nhận trạng thái hiện tại; chỉ event room:leave mới rời hẳn.
      removeConnection(socket.data.userId);
      broadcastPresence(onlineUserIds());
      void notifyFriends(socket.data.userId);
    });
  });
}
