import type { MatchRecord as ClientMatchRecord, PublicPlayerProfile, PublicUser, UserRole } from '@/types';
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
  role: string;
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

function toStats(stats: UserRow['stats']) {
  return stats
    ? { matches: stats.matches, wins: stats.wins, losses: stats.losses, score: stats.score }
    : { matches: 0, wins: 0, losses: 0, score: 0 };
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
    stats: toStats(user.stats),
    history: user.matches.map(toClientMatch),
    preferences: {
      sound: user.sound,
      animations: user.animations,
      preferLandscape: user.preferLandscape,
    },
    role: user.role === 'admin' ? 'admin' : ('user' as UserRole),
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

/** Hồ sơ công khai của người chơi khác: không bao gồm tuỳ chọn tài khoản. */
export async function loadPlayerProfile(userId: string): Promise<PublicPlayerProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      coins: true,
      createdAt: true,
      stats: { select: { matches: true, wins: true, losses: true, score: true } },
      matches: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          gameId: true,
          gameName: true,
          placement: true,
          totalPlayers: true,
          win: true,
          score: true,
          coinDelta: true,
          durationMs: true,
          createdAt: true,
        },
      },
    },
  });
  if (!user) throw notFound('Không tìm thấy người chơi.');

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar ?? '',
    coins: user.coins,
    createdAt: user.createdAt.getTime(),
    stats: toStats(user.stats),
    history: user.matches.map((match) => ({
      id: match.id,
      gameId: match.gameId,
      gameName: match.gameName,
      placement: match.placement,
      totalPlayers: match.totalPlayers,
      win: match.win,
      score: match.score,
      coinDelta: match.coinDelta,
      durationMs: match.durationMs ?? undefined,
      createdAt: match.createdAt.getTime(),
    })),
  };
}
