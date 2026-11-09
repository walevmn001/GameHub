import { lazy } from 'react';
import type { GameMeta } from '@/types';
import { buildImageUrl } from '@/utils/images';
import type { GameBoardProps } from './types';

/**
 * Game Registry — nguồn dữ liệu duy nhất về các trò chơi.
 *
 * Để thêm game mới: khai báo một entry ở đây với metadata + loader component bàn chơi.
 * Trang chủ, danh mục và hệ thống phòng chơi tự động đọc từ registry,
 * KHÔNG cần sửa code trang chủ.
 * Xem thêm: GAME_REGISTRY.md
 */

export interface GameRegistryEntry {
  meta: GameMeta;
  /**
   * Loader cho component bàn chơi. Bỏ trống với game chưa triển khai.
   * Dùng dynamic import để tách bundle theo từng game.
   */
  loadBoard?: () => Promise<{ default: React.ComponentType<GameBoardProps> }>;
}

const now = Date.now();
const day = 86_400_000;

const registry: GameRegistryEntry[] = [
  {
    meta: {
      id: 'tien-len',
      name: 'Tiến Lên Miền Nam',
      tagline: 'Đấu trí cùng 3 đối thủ AI',
      description:
        'Trò chơi bài lá kinh điển của Việt Nam. Đánh hết bài trước để về nhất, chặt Heo bằng tứ quý và đôi thông.',
      categories: ['cards', 'versus', 'multiplayer'],
      status: 'available',
      maxPlayers: 4,
      minPlayers: 2,
      coverImage: buildImageUrl(
        'dark moody game cover art of a fan of playing cards on a neon lit table, purple and cyan rim light, modern premium digital card game, high detail, cinematic',
        'landscape_4_3',
      ),
      badge: 'AI cục bộ',
      onlineReady: true,
      rating: 4.8,
      playCount: 128400,
      releasedAt: now - 30 * day,
      updatedAt: now - 2 * day,
    },
    loadBoard: () => import('@/games/tien-len/TienLenBoard'),
  },
  {
    meta: {
      id: 'phom',
      name: 'Phỏm',
      tagline: 'Gom phỏm, gửi bài, ù nhanh',
      description:
        'Sắp xếp bài thành phỏm và bộ để ù. Trò chơi đang trong quá trình phát triển, chưa thể chơi.',
      categories: ['cards', 'multiplayer'],
      status: 'in-development',
      maxPlayers: 4,
      minPlayers: 2,
      coverImage: buildImageUrl(
        'dark elegant game cover of mahjong and playing card tiles arranged in groups, purple neon accents, premium card game art',
        'landscape_4_3',
      ),
      badge: 'Đang phát triển',
      onlineReady: true,
      rating: 4.5,
      playCount: 51200,
      releasedAt: now - 12 * day,
      updatedAt: now - 1 * day,
    },
  },
  {
    meta: {
      id: 'xi-dach',
      name: 'Xì Dách',
      tagline: 'Rút bài tới 21 điểm',
      description: 'Đối kháng nhà cái, tính điểm gần 21 nhất. Sẽ ra mắt trong phiên bản tiếp theo.',
      categories: ['cards', 'versus'],
      status: 'planned',
      maxPlayers: 4,
      minPlayers: 2,
      coverImage: buildImageUrl(
        'dark casino table with two playing cards and cyan neon glow, minimal premium blackjack themed game cover, cinematic',
        'landscape_4_3',
      ),
      badge: 'Sắp ra mắt',
      onlineReady: true,
      rating: 4.3,
      playCount: 30400,
      releasedAt: now - 6 * day,
      updatedAt: now - 3 * day,
    },
  },
  {
    meta: {
      id: 'mau-binh',
      name: 'Mậu Binh',
      tagline: 'Binh xập xám đỉnh cao',
      description: 'Chia 13 lá thành 3 chi và so bài. Game chiến thuật dành cho người chơi kỳ cựu.',
      categories: ['cards', 'strategy'],
      status: 'planned',
      maxPlayers: 4,
      minPlayers: 4,
      coverImage: buildImageUrl(
        'dark strategic card game cover with three rows of playing cards, purple and blue neon light, premium board game art',
        'landscape_4_3',
      ),
      badge: 'Sắp ra mắt',
      onlineReady: true,
      rating: 4.4,
      playCount: 18600,
      releasedAt: now - 4 * day,
      updatedAt: now - 4 * day,
    },
  },
  {
    meta: {
      id: 'co-caro',
      name: 'Cờ Caro',
      tagline: 'Nối 5 quân để thắng',
      description: 'Đối kháng trên bàn cờ ô vuông. Chế độ AI và hai người chơi đang được phát triển.',
      categories: ['strategy', 'versus'],
      status: 'in-development',
      maxPlayers: 2,
      minPlayers: 2,
      coverImage: buildImageUrl(
        'dark minimalist gobang board game cover, glowing cyan and purple grid lines on black surface, modern abstract strategy game art',
        'landscape_4_3',
      ),
      badge: 'Đang phát triển',
      onlineReady: true,
      rating: 4.2,
      playCount: 9900,
      releasedAt: now - 8 * day,
      updatedAt: now - 2 * day,
    },
  },
  {
    meta: {
      id: 'xep-hinh-2048',
      name: 'Xếp Hình 2048',
      tagline: 'Ghép số, rèn tư duy',
      description: 'Trò chơi giải trí nhẹ nhàng giúp thư giãn. Sẽ bổ sung trong thời gian tới.',
      categories: ['casual', 'strategy'],
      status: 'planned',
      maxPlayers: 1,
      minPlayers: 1,
      coverImage: buildImageUrl(
        'dark minimal puzzle game cover with glowing numbered tiles arranged in a grid, purple and cyan neon, modern casual game art',
        'landscape_4_3',
      ),
      badge: 'Sắp ra mắt',
      onlineReady: false,
      rating: 4.1,
      playCount: 7200,
      releasedAt: now - 3 * day,
      updatedAt: now - 3 * day,
    },
  },
];

export const gameRegistry = registry;

export function getAllGames(): GameMeta[] {
  return registry.map((entry) => entry.meta);
}

export function getGameEntry(id: string): GameRegistryEntry | undefined {
  return registry.find((entry) => entry.meta.id === id);
}

export function getGameMeta(id: string): GameMeta | undefined {
  return getGameEntry(id)?.meta;
}

/** Game có thể chơi được ngay (đã có bàn chơi). */
export function getPlayableGames(): GameMeta[] {
  return registry.filter((entry) => entry.meta.status === 'available' && entry.loadBoard).map((e) => e.meta);
}

export function getGamesByCategory(category: string): GameMeta[] {
  return registry
    .filter((entry) => entry.meta.categories.includes(category as never))
    .map((entry) => entry.meta);
}

const lazyCache = new Map<string, ReturnType<typeof lazy>>();

/** Lấy component bàn chơi dưới dạng lazy component (dùng cho React.lazy/Suspense). */
export function getLazyBoard(id: string) {
  const entry = getGameEntry(id);
  if (!entry?.loadBoard) return null;
  const cached = lazyCache.get(id);
  if (cached) return cached;
  const created = lazy(entry.loadBoard);
  lazyCache.set(id, created);
  return created;
}
