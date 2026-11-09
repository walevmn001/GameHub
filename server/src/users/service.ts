import type { MatchRecord as ClientMatchRecord, PublicUser } from '@/types';
import { prisma } from '../prisma';
import { notFound } from '../http/errors';

/** Hàng người dùng kèm quan hệ cần thiết để dựng `PublicUser`. */
export interface UserRow {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  coins: number;
  createdAt: Date;
  sound: boolean;
  animations: boolean;
  preferLandscape: boolean;
  stats: { matches: number; wins: number; losses: number; score: number } | null;
  matches: Array<{
    id: string;
    gameId: string;
    gameName: string;
    placement: number;
    totalPlayers: number;
    win: boolean;
    score: number;
    coinDelta: number;
    durationMs: number | null;
    createdAt: Date;
  }>;
}

function toClientMatch(row: UserRow['matches'][number]): ClientMatchRecord {
  return {
    id: row.id,
    gameId: row.gameId,
    gameName: row.gameName,
    placement: row.placement,
    totalPlayers: row.totalPlayers,
    win: row.win,
    score: row.score,
    coinDelta: row.coinDelta,
    durationMs: row.durationMs ?? undefined,
    createdAt: row.createdAt.getTime(),
  };
}

/** Chuyển bản ghi CSDL thành `PublicUser` mà tầng UI đang dùng. */
export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar ?? '',
    coins: user.coins,
    createdAt: user.createdAt.getTime(),
    stats: user.stats
      ? {
          matches: user.stats.matches,
          wins: user.stats.wins,
          losses: user.stats.losses,
          score: user.stats.score,
        }
      : { matches: 0, wins: 0, losses: 0, score: 0 },
    history: user.matches.map(toClientMatch),
    preferences: {
      sound: user.sound,
      animations: user.animations,
      preferLandscape: user.preferLandscape,
    },
  };
}

/** Truy vấn hồ sơ đầy đủ (kèm thống kê + lịch sử) rồi map sang `PublicUser`. */
export async function loadPublicUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
      matches: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!user) throw notFound('Không tìm thấy người dùng.');
  return toPublicUser(user);
}
