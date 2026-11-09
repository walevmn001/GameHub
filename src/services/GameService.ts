import { fail, ok, type GameMeta, type PublicUser, type ServiceResult } from '@/types';
import type { ComponentType } from 'react';
import type { GameBoardProps } from '@/games/types';
import {
  getGameEntry,
  getGameMeta,
  getLazyBoard,
  getPlayableGames,
  getAllGames,
} from '@/games/registry';
import { authService } from './AuthService';
import { activityService } from './ActivityService';
import { createId } from '@/utils/id';

/**
 * GameService — lớp trung gian giữa UI và game engine.
 * Tầng UI không truy cập registry hay engine trực tiếp mà đi qua service này,
 * giúp việc thay đổi nguồn dữ liệu (local → API) về sau không ảnh hưởng giao diện.
 */

export interface CompleteMatchInput {
  gameId: string;
  win: boolean;
  placement: number;
  totalPlayers: number;
  durationMs: number;
  /** Chênh lệch xu từ quyết toán ván; bỏ trống dùng mức thưởng/phạt mặc định. */
  coinDelta?: number;
}

class GameService {
  listAllGames(): GameMeta[] {
    return getAllGames();
  }

  listPlayableGames(): GameMeta[] {
    return getPlayableGames();
  }

  getGame(id: string): GameMeta | undefined {
    return getGameMeta(id);
  }

  isPlayable(id: string): boolean {
    const entry = getGameEntry(id);
    return entry?.meta.status === 'available' && Boolean(entry.loadBoard);
  }

  getBoardComponent(id: string): ComponentType<GameBoardProps> | null {
    return getLazyBoard(id);
  }

  /** Ghi nhận kết quả trận đấu: cập nhật thống kê, lịch sử và nhật ký hoạt động. */
  async completeMatch(input: CompleteMatchInput): Promise<ServiceResult<PublicUser | null>> {
    const meta = this.getGame(input.gameId);
    const score = input.win ? 10 - Math.max(0, input.placement - 1) * 2 : -5;

    const result = await authService.recordMatch({
      id: createId('match'),
      gameId: input.gameId,
      gameName: meta?.name ?? input.gameId,
      placement: input.placement,
      totalPlayers: input.totalPlayers,
      win: input.win,
      score,
      createdAt: Date.now(),
      durationMs: input.durationMs,
      coinDelta: input.coinDelta,
    });

    if (!result.ok) {
      // Chưa đăng nhập: vẫn ghi nhật ký nhưng không lưu vào tài khoản.
      await activityService.log(
        'match',
        `Hoàn thành ván ${meta?.name ?? input.gameId} (chưa đăng nhập, không lưu lịch sử).`,
      );
      return ok(null);
    }

    await activityService.log(
      'match',
      input.win
        ? `Thắng ván ${meta?.name ?? input.gameId} — về nhất!`
        : `Kết thúc ván ${meta?.name ?? input.gameId} — vị trí ${input.placement}/${input.totalPlayers}.`,
    );
    return ok(result.data);
  }

  /** Không có backend: thông báo rõ ràng cho các tính năng nhiều người chơi trực tuyến. */
  async joinOnlineMatch(): Promise<ServiceResult<never>> {
    return fail('Chế độ chơi trực tuyến cần backend. Hiện chỉ hỗ trợ chơi tại máy.');
  }
}

export const gameService = new GameService();
