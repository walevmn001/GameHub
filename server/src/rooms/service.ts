import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { normalizeConfig, type Room, type RoomPlayerSlot, type TienLenConfig } from '@/types';
import { getGameEntry, gameNameOf } from '../games/catalog';

/** Quan hệ cần nạp khi dựng phòng. */
export const ROOM_INCLUDE = {
  host: true,
  members: { orderBy: { seat: 'asc' }, include: { user: true } },
} satisfies Prisma.RoomInclude;

export type RoomRow = Prisma.RoomGetPayload<{ include: typeof ROOM_INCLUDE }>;

/** Tên người máy dùng khi chủ phòng thêm ghế AI. */
const BOT_NAMES = ['Bảo Long', 'Thu Hà', 'Minh Khoa', 'An Nhiên', 'Gia Bảo', 'Hoàng Nam'];

/** Chuyển bản ghi CSDL sang kiểu `Room` mà tầng UI dùng (không bao giờ lộ mật khẩu). */
export function toClientRoom(room: RoomRow): Room {
  const players: RoomPlayerSlot[] = room.members.map((member) => ({
    id: member.userId ?? member.id,
    name: member.isBot ? (member.botName ?? 'Máy') : (member.user?.displayName ?? 'Người chơi'),
    avatar: member.user?.avatar ?? '',
    isHost: member.isHost,
    isBot: member.isBot,
    coins: member.coins,
  }));

  return {
    id: room.id,
    name: room.name,
    gameId: room.gameId,
    gameName: room.gameName,
    visibility: room.visibility as Room['visibility'],
    status: room.status as Room['status'],
    maxPlayers: room.maxPlayers,
    players,
    config: normalizeConfig(room.config as Partial<TienLenConfig>),
    hostName: room.host.displayName,
    createdAt: room.createdAt.getTime(),
    updatedAt: room.updatedAt.getTime(),
    source: { mode: 'online', note: 'Phòng trực tuyến' },
  };
}

export interface CreateRoomParams {
  name: string;
  gameId: string;
  visibility: 'public' | 'private';
  maxPlayers: number;
  password?: string;
  config?: Partial<TienLenConfig>;
}

/** Tạo phòng mới, chủ phòng trở thành thành viên đầu tiên (ghế 0). */
export async function createRoom(
  host: { id: string; displayName: string; coins: number },
  params: CreateRoomParams,
): Promise<RoomRow> {
  const entry = getGameEntry(params.gameId);
  const maxPlayers = entry
    ? Math.min(Math.max(params.maxPlayers, entry.minPlayers), entry.maxPlayers)
    : params.maxPlayers;

  const config = normalizeConfig(params.config);

  const room = await prisma.room.create({
    data: {
      name: params.name,
      gameId: params.gameId,
      gameName: gameNameOf(params.gameId),
      visibility: params.visibility,
      maxPlayers,
      config: config as unknown as Prisma.InputJsonValue,
      hostId: host.id,
      members: {
        create: {
          userId: host.id,
          isHost: true,
          seat: 0,
          coins: host.coins,
        },
      },
    },
    include: ROOM_INCLUDE,
  });

  return room;
}

/** Danh sách phòng chưa đóng (mới nhất trước). */
export async function listRooms(): Promise<RoomRow[]> {
  return prisma.room.findMany({
    where: { status: { not: 'closed' } },
    include: ROOM_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getRoomRow(roomId: string): Promise<RoomRow | null> {
  return prisma.room.findUnique({ where: { id: roomId }, include: ROOM_INCLUDE });
}

export async function deleteRoom(roomId: string): Promise<void> {
  await prisma.room.delete({ where: { id: roomId } }).catch(() => undefined);
}

/** Thêm người chơi vào phòng (đã kiểm tra mật khẩu ở tầng route). */
export async function addMember(
  room: RoomRow,
  user: { id: string; coins: number },
): Promise<RoomRow> {
  const already = room.members.some((m) => m.userId === user.id);
  if (already) return room;

  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: user.id,
      isHost: false,
      seat: room.members.length,
      coins: user.coins,
    },
  });
  await prisma.room.update({ where: { id: room.id }, data: { status: 'waiting' } });
  return (await getRoomRow(room.id))!;
}

/**
 * Rời phòng. Nếu chủ phòng rời, chuyển quyền chủ cho người thật kế tiếp.
 * Trả về phòng sau khi cập nhật, hoặc null nếu phòng đã bị xoá (hết người).
 */
export async function removeMember(
  room: RoomRow,
  userId: string,
): Promise<{ room: RoomRow | null; closed: boolean }> {
  const member = room.members.find((m) => m.userId === userId);
  if (!member) return { room, closed: false };

  // Nhiều socket có thể ngắt gần như cùng lúc; dùng deleteMany để không ném lỗi nếu bản ghi đã bị xoá.
  await prisma.roomMember.deleteMany({ where: { roomId: room.id, userId } });

  const fresh = await getRoomRow(room.id);
  if (!fresh || fresh.members.length === 0) {
    await deleteRoom(room.id);
    return { room: null, closed: true };
  }

  if (member.isHost) {
    const nextHost = fresh.members.find((m) => !m.isBot) ?? fresh.members[0];
    await prisma.roomMember.updateMany({ where: { id: nextHost.id }, data: { isHost: true } });
    if (nextHost.userId) {
      await prisma.room.updateMany({ where: { id: room.id }, data: { hostId: nextHost.userId } });
    }
  }

  return { room: await getRoomRow(room.id), closed: false };
}

/** Chủ phòng thêm một người máy vào ghế trống. */
export async function addBot(room: RoomRow): Promise<RoomRow> {
  const botCount = room.members.filter((m) => m.isBot).length;
  const name = BOT_NAMES[botCount % BOT_NAMES.length];
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      isBot: true,
      botName: name,
      seat: room.members.length,
      coins: 1000 + (botCount % 5) * 500,
    },
  });
  return (await getRoomRow(room.id))!;
}

/** Chủ phòng xoá một ghế người máy. */
export async function removeBot(room: RoomRow, memberId: string): Promise<RoomRow> {
  const member = room.members.find((m) => m.id === memberId && m.isBot);
  if (member) await prisma.roomMember.delete({ where: { id: member.id } });
  return (await getRoomRow(room.id))!;
}

export async function setStatus(roomId: string, status: 'waiting' | 'playing' | 'closed'): Promise<RoomRow | null> {
  await prisma.room.update({ where: { id: roomId }, data: { status } }).catch(() => undefined);
  return getRoomRow(roomId);
}

export function isHost(room: RoomRow, userId: string): boolean {
  return room.hostId === userId;
}
