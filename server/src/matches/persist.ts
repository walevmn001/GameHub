import { prisma } from '../prisma';
import { gameNameOf } from '../games/catalog';

export interface RecordMatchInput {
  gameId: string;
  placement: number;
  totalPlayers: number;
  win: boolean;
  score: number;
  coinDelta: number;
  durationMs?: number;
}

/** Ghi một ván vào lịch sử người dùng, cập nhật thống kê và số dư xu. */
export async function recordMatchForUser(userId: string, input: RecordMatchInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.matchRecord.create({
      data: {
        userId,
        gameId: input.gameId,
        gameName: gameNameOf(input.gameId),
        placement: input.placement,
        totalPlayers: input.totalPlayers,
        win: input.win,
        score: input.score,
        coinDelta: input.coinDelta,
        durationMs: input.durationMs ?? null,
      },
    });

    const user = await tx.user.findUnique({ where: { id: userId }, select: { coins: true } });
    const nextCoins = Math.max(0, (user?.coins ?? 0) + input.coinDelta);
    await tx.user.update({ where: { id: userId }, data: { coins: nextCoins } });

    await tx.stats.upsert({
      where: { userId },
      create: {
        userId,
        matches: 1,
        wins: input.win ? 1 : 0,
        losses: input.win ? 0 : 1,
        score: input.score,
      },
      update: {
        matches: { increment: 1 },
        wins: { increment: input.win ? 1 : 0 },
        losses: { increment: input.win ? 0 : 1 },
        score: { increment: input.score },
      },
    });
  });
}

/** Giới hạn lịch sử mỗi người chơi còn 50 trận gần nhất. */
export async function trimHistory(userId: string): Promise<void> {
  const stale = await prisma.matchRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: 50,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.matchRecord.deleteMany({ where: { id: { in: stale.map((m) => m.id) } } });
  }
}
