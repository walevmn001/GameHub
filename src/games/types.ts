import type { TienLenConfig } from '@/types';

/** Kết quả một trận đấu được báo về cho tầng quản lý (lưu lịch sử, thống kê). */
export interface MatchResult {
  gameId: string;
  win: boolean;
  placement: number;
  totalPlayers: number;
  score: number;
  durationMs: number;
  /** Chênh lệch xu của người chơi sau khi quyết toán (nếu có). */
  coinDelta?: number;
}

/** Một chỗ ngồi truyền từ phòng chơi xuống bàn (kèm số dư xu). */
export interface BoardSeat {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  /** Số dư xu hiện có của người chơi. */
  coins: number;
}

/**
 * Props chuẩn cho mọi bàn chơi game.
 * Nhờ hợp đồng này, trang chủ và GameService không cần biết chi tiết từng game.
 */
export interface GameBoardProps {
  onExit: () => void;
  onMatchEnd: (result: MatchResult) => void;
  /** Cấu hình bàn chơi khi vào từ phòng; bỏ trống dùng mặc định. */
  config?: TienLenConfig;
  /** Danh sách chỗ ngồi (kèm số dư xu) khi vào từ phòng; bỏ trống dùng 1 người + AI. */
  seats?: BoardSeat[];
  /** Bật luồng đấu trực tuyến (server-authoritative) thay cho AI cục bộ. */
  online?: boolean;
  /** Mã phòng khi chơi trực tuyến. */
  roomId?: string;
}
