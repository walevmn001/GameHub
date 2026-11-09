import {
  fail,
  ok,
  normalizeConfig,
  type Room,
  type RoomPlayerSlot,
  type RoomStatus,
  type ServiceResult,
  type CreateRoomInput,
} from '@/types';
import { STORAGE_KEYS, STARTING_COINS } from '@/utils/constants';
import { makeAvatarDataUri } from '@/utils/avatar';
import { createId, createShortCode } from '@/utils/id';
import { getGameMeta } from '@/games/registry';
import { storage } from './StorageService';
import { api } from './ApiService';
import { onlineEnabled } from './backend';

/**
 * RoomService — hệ thống phòng chơi.
 *
 * - TRỰC TUYẾN: phòng nằm trên server (PostgreSQL). Nhiều người chơi qua Internet cùng vào
 *   một phòng, trạng thái phòng được đẩy realtime qua Socket.IO.
 * - CỤC BỘ (mặc định): phòng chỉ tồn tại trên thiết bị, gắn nhãn Demo.
 */

const LOCAL_NOTE = 'Phòng cục bộ — chỉ tồn tại trên thiết bị này';

/** Tên người máy dùng khi chủ phòng chủ động thêm vào ghế trống. */
const BOT_NAMES = ['Bảo Long', 'Thu Hà', 'Minh Khoa', 'An Nhiên', 'Gia Bảo', 'Hoàng Nam'];

function makeBot(name: string, id: string): RoomPlayerSlot {
  // Mỗi người máy có số dư xu ngẫu nhiên trong khoảng thử nghiệm.
  const coins = 1000 + Math.floor(Math.random() * 9) * 500;
  return {
    id,
    name,
    avatar: makeAvatarDataUri(name, id),
    isHost: false,
    isBot: true,
    coins,
  };
}

/** Phòng mẫu để giao diện danh sách phòng có nội dung ngay lần đầu mở. */
function seedRooms(): Room[] {
  const now = Date.now();
  const tienLen = getGameMeta('tien-len');
  const base: Array<Partial<Room> & { name: string; playerCount: number; botNames: string[] }> = [
    {
      name: 'Bàn Cao Thủ',
      playerCount: 3,
      botNames: ['Bảo Long', 'Minh Khoa', 'Thu Hà'],
    },
    {
      name: 'Sới Vui Vẻ',
      playerCount: 2,
      botNames: ['An Nhiên', 'Gia Bảo'],
    },
    {
      name: 'Phòng Tân Binh',
      playerCount: 1,
      botNames: ['Hoàng Nam'],
    },
  ];

  return base.map((item, index) => {
    const hostName = item.botNames[0];
    const players: RoomPlayerSlot[] = item.botNames.map((name, i) =>
      makeBot(name, `bot_${index}_${i}`),
    );
    if (players[0]) players[0].isHost = true;
    return {
      id: createId('room'),
      name: item.name,
      gameId: tienLen?.id ?? 'tien-len',
      gameName: tienLen?.name ?? 'Tiến Lên Miền Nam',
      visibility: 'public',
      status: 'waiting',
      maxPlayers: 4,
      players,
      config: normalizeConfig(),
      hostName,
      createdAt: now - (index + 1) * 600000,
      updatedAt: now - index * 120000,
      source: { mode: 'demo', note: LOCAL_NOTE },
    };
  });
}

class RoomService {
  private get online(): boolean {
    return onlineEnabled;
  }

  private async readRooms(): Promise<Room[]> {
    const rooms = await storage.read<Room[]>(STORAGE_KEYS.rooms);
    if (rooms && rooms.length > 0) return rooms;
    const seeded = seedRooms();
    await storage.write(STORAGE_KEYS.rooms, seeded);
    return seeded;
  }

  private async writeRooms(rooms: Room[]): Promise<void> {
    await storage.write(STORAGE_KEYS.rooms, rooms);
  }

  async listRooms(): Promise<Room[]> {
    if (this.online) {
      const result = await api.request<Room[]>('/rooms');
      return result.ok && Array.isArray(result.data) ? result.data : [];
    }
    const rooms = await this.readRooms();
    return rooms.filter((room) => room.status !== 'closed');
  }

  async getRoom(id: string): Promise<Room | null> {
    if (this.online) {
      const result = await api.request<Room>(`/rooms/${encodeURIComponent(id)}`);
      return result.ok ? result.data : null;
    }
    const rooms = await this.readRooms();
    return rooms.find((room) => room.id === id) ?? null;
  }

  async createRoom(input: CreateRoomInput, hostId: string): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>('/rooms', {
        method: 'POST',
        body: {
          name: input.name.trim(),
          gameId: input.gameId,
          visibility: input.visibility,
          maxPlayers: input.maxPlayers,
          password: input.visibility === 'private' ? input.password : undefined,
          config: input.config,
        },
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    if (!input.name.trim()) return fail('Hãy nhập tên phòng.');
    if (input.visibility === 'private' && !input.password?.trim()) {
      return fail('Phòng riêng cần có mật khẩu.');
    }

    const meta = getGameMeta(input.gameId);
    if (meta && (input.maxPlayers < meta.minPlayers || input.maxPlayers > meta.maxPlayers)) {
      return fail(
        `${meta.name} cần từ ${meta.minPlayers} đến ${meta.maxPlayers} người chơi.`,
      );
    }

    const rooms = await this.readRooms();
    const now = Date.now();
    const host: RoomPlayerSlot = {
      id: hostId,
      name: input.hostName,
      avatar: input.hostAvatar,
      isHost: true,
      isBot: false,
      coins: input.hostCoins ?? STARTING_COINS,
    };

    const room: Room = {
      id: createId('room'),
      name: input.name.trim(),
      gameId: input.gameId,
      gameName: input.gameName,
      visibility: input.visibility,
      status: 'waiting',
      maxPlayers: input.maxPlayers,
      players: [host],
      config: normalizeConfig(input.config),
      password: input.visibility === 'private' ? input.password : undefined,
      hostName: input.hostName,
      createdAt: now,
      updatedAt: now,
      source: { mode: 'demo', note: LOCAL_NOTE },
    };

    await this.writeRooms([room, ...rooms]);
    return ok(room);
  }

  async joinRoom(
    id: string,
    user: { id: string; name: string; avatar: string; coins?: number },
    password?: string,
  ): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>(`/rooms/${encodeURIComponent(id)}/join`, {
        method: 'POST',
        body: { password: password?.trim() || undefined },
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const rooms = await this.readRooms();
    const index = rooms.findIndex((room) => room.id === id);
    if (index === -1) return fail('Không tìm thấy phòng.');
    const room = rooms[index];

    if (room.status === 'closed') return fail('Phòng đã đóng.');
    if (room.visibility === 'private' && room.password && room.password !== password) {
      return fail('Mật khẩu phòng không đúng.');
    }
    if (room.players.some((p) => p.id === user.id)) return ok(room);
    if (room.players.length >= room.maxPlayers) return fail('Phòng đã đầy.');

    /**
     * Nếu phòng chưa có chủ phòng là người thật (ví dụ phòng demo toàn AI),
     * người tham gia đầu tiên sẽ trở thành chủ phòng để có thể bắt đầu ván.
     */
    const hasHumanHost = room.players.some((p) => p.isHost && !p.isBot);
    const becomesHost = !hasHumanHost;
    const basePlayers = becomesHost
      ? room.players.map((p) => ({ ...p, isHost: false }))
      : room.players;

    room.players = [
      ...basePlayers,
      {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: becomesHost,
        isBot: false,
        coins: user.coins ?? STARTING_COINS,
      },
    ];
    if (becomesHost) room.hostName = user.name;
    room.updatedAt = Date.now();
    room.status = 'waiting';
    rooms[index] = room;
    await this.writeRooms(rooms);
    return ok(room);
  }

  /** Chủ phòng thêm một người máy vào ghế trống (chủ động chơi với AI). */
  async addBot(roomId: string): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>(`/rooms/${encodeURIComponent(roomId)}/bots`, {
        method: 'POST',
        body: {},
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const rooms = await this.readRooms();
    const index = rooms.findIndex((room) => room.id === roomId);
    if (index === -1) return fail('Không tìm thấy phòng.');
    const room = rooms[index];
    if (room.players.length >= room.maxPlayers) return fail('Phòng đã đủ người.');

    const botCount = room.players.filter((p) => p.isBot).length;
    const name = BOT_NAMES[botCount % BOT_NAMES.length];
    const id = createId('bot');
    room.players = [...room.players, makeBot(name, id)];
    room.updatedAt = Date.now();
    room.status = 'waiting';
    rooms[index] = room;
    await this.writeRooms(rooms);
    return ok(room);
  }

  /** Xoá một người máy khỏi phòng (chỉ áp dụng cho ghế AI). */
  async removeBot(roomId: string, botId: string): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>(
        `/rooms/${encodeURIComponent(roomId)}/bots/${encodeURIComponent(botId)}`,
        { method: 'DELETE' },
      );
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const rooms = await this.readRooms();
    const index = rooms.findIndex((room) => room.id === roomId);
    if (index === -1) return fail('Không tìm thấy phòng.');
    const room = rooms[index];
    const target = room.players.find((p) => p.id === botId);
    if (!target || !target.isBot) return fail('Chỉ có thể xoá người máy khỏi phòng.');

    room.players = room.players.filter((p) => p.id !== botId);
    room.updatedAt = Date.now();
    rooms[index] = room;
    await this.writeRooms(rooms);
    return ok(room);
  }

  async leaveRoom(id: string, playerId: string): Promise<ServiceResult<Room | null>> {
    if (this.online) {
      const snapshot = await this.getRoom(id);
      const result = await api.request(`/rooms/${encodeURIComponent(id)}/leave`, {
        method: 'POST',
        body: {},
      });
      return result.ok ? ok(snapshot) : fail(result.error);
    }

    const rooms = await this.readRooms();
    const index = rooms.findIndex((room) => room.id === id);
    if (index === -1) return fail('Không tìm thấy phòng.');
    const room = rooms[index];
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      room.status = 'closed';
    } else if (!room.players.some((p) => p.isHost)) {
      room.players[0].isHost = true;
      room.hostName = room.players[0].name;
    }
    room.updatedAt = Date.now();
    rooms[index] = room;
    await this.writeRooms(rooms);
    return ok(room);
  }

  async setStatus(id: string, status: RoomStatus): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>(`/rooms/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status },
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const rooms = await this.readRooms();
    const index = rooms.findIndex((room) => room.id === id);
    if (index === -1) return fail('Không tìm thấy phòng.');
    rooms[index].status = status;
    rooms[index].updatedAt = Date.now();
    await this.writeRooms(rooms);
    return ok(rooms[index]);
  }

  /**
   * Bắt đầu ván đấu (chủ phòng). Trực tuyến: server khởi tạo ván và phát trạng thái
   * qua Socket.IO. Cục bộ: bàn chơi tự khởi tạo khi điều hướng.
   */
  async startMatch(id: string): Promise<ServiceResult<Room>> {
    if (this.online) {
      const result = await api.request<Room>(`/rooms/${encodeURIComponent(id)}/start`, {
        method: 'POST',
        body: {},
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }
    return fail('Chế độ cục bộ không cần gọi máy chủ để bắt đầu.');
  }

  async deleteRoom(id: string): Promise<ServiceResult<true>> {
    if (this.online) {
      const result = await api.request(`/rooms/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return result.ok ? ok(true) : fail(result.error);
    }

    const rooms = await this.readRooms();
    await this.writeRooms(rooms.filter((room) => room.id !== id));
    return ok(true);
  }

  /** Xoá phòng đã đóng khỏi danh sách (thao tác tiện ích cục bộ). */
  async pruneClosedRooms(): Promise<ServiceResult<number>> {
    if (this.online) return ok(0);
    const rooms = await this.readRooms();
    const kept = rooms.filter((room) => room.status !== 'closed');
    const removed = rooms.length - kept.length;
    await this.writeRooms(kept);
    return ok(removed);
  }

  /** Tạo mã phòng ngắn gợi ý cho người dùng. */
  suggestRoomCode(): string {
    return createShortCode(6);
  }
}

export const roomService = new RoomService();
