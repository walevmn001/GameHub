/** Kiểu dữ liệu cho Game Registry: mô tả metadata của mỗi trò chơi. */

export type GameCategory =
  | 'cards'
  | 'strategy'
  | 'casual'
  | 'versus'
  | 'multiplayer';

export const GAME_CATEGORY_LABEL: Record<GameCategory, string> = {
  cards: 'Bài lá',
  strategy: 'Chiến thuật',
  casual: 'Giải trí',
  versus: 'Đối kháng',
  multiplayer: 'Nhiều người chơi',
};

/** Trạng thái phát triển của game, hiển thị minh bạch cho người dùng. */
export type GameStatus = 'available' | 'in-development' | 'planned';

export const GAME_STATUS_LABEL: Record<GameStatus, string> = {
  available: 'Có thể chơi',
  'in-development': 'Đang phát triển',
  planned: 'Sắp ra mắt',
};

export interface GameMeta {
  /** Định danh dùng trong route: /play/:id */
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: GameCategory[];
  status: GameStatus;
  /** Số người chơi tối đa hỗ trợ (ở chế độ cục bộ). */
  maxPlayers: number;
  /** Số người chơi tối thiểu để có thể bắt đầu ván. */
  minPlayers: number;
  /** Đường dẫn ảnh bìa (ưu tiên dùng cho card nổi bật). */
  coverImage: string;
  /** Nhãn nhỏ hiển thị trên card, ví dụ "AI cục bộ". */
  badge?: string;
  /** Game có hỗ trợ chơi nhiều người qua mạng trong tương lai hay không. */
  onlineReady: boolean;
  /** Điểm đánh giá tạm thời (dữ liệu mẫu, chỉ mang tính minh hoạ UI). */
  rating: number;
  playCount: number;
  releasedAt: number;
  updatedAt: number;
}
