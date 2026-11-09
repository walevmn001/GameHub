import type { DataSourceMeta } from './common';
import type { TienLenConfig } from './tienlen';

/**
 * Phòng chơi.
 * GIAI ĐOẠN HIỆN TẠI: phòng chỉ tồn tại trong dữ liệu thử nghiệm trên thiết bị.
 * Chưa có kết nối nhiều người chơi qua Internet.
 */
export type RoomStatus = 'waiting' | 'playing' | 'closed';
export type RoomVisibility = 'public' | 'private';

export interface RoomPlayerSlot {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  /** true nếu là người chơi ảo (AI) dùng trong chế độ chơi tại máy. */
  isBot: boolean;
  /** Số dư xu hiện có của người chơi (xu thử nghiệm). */
  coins: number;
}

export interface Room {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  visibility: RoomVisibility;
  status: RoomStatus;
  /** Số người chơi tối đa của bàn. */
  maxPlayers: number;
  players: RoomPlayerSlot[];
  /** Cấu hình bàn chơi (luật + cách tính tiền). */
  config: TienLenConfig;
  /** Mật khẩu dạng thô chỉ dùng cho luồng demo cục bộ — sẽ thay bằng server khi có backend. */
  password?: string;
  hostName: string;
  createdAt: number;
  updatedAt: number;
  source: DataSourceMeta;
}

export interface CreateRoomInput {
  name: string;
  gameId: string;
  gameName: string;
  visibility: RoomVisibility;
  maxPlayers: number;
  password?: string;
  hostName: string;
  hostAvatar: string;
  /** Số dư xu của chủ phòng tại thời điểm tạo phòng. */
  hostCoins?: number;
  /** Cấu hình bàn chơi; bỏ trống sẽ dùng mặc định. */
  config?: Partial<TienLenConfig>;
}

