import { Suspense, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import type { TienLenConfig } from '@/types';
import { gameService } from '@/services/GameService';
import { onlineEnabled } from '@/services/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button, FullPageLoader } from '@/components/ui';
import type { BoardSeat, MatchResult } from '@/games/types';

/** Dữ liệu phòng chơi được truyền kèm khi bắt đầu ván (nếu vào từ phòng chờ). */
interface BoardLocationState {
  config?: TienLenConfig;
  seats?: BoardSeat[];
  /** Mã phòng khi chơi trực tuyến — có mã nghĩa là ván chạy trên máy chủ. */
  roomId?: string;
}

export function PlayGamePage() {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, refresh } = useAuth();

  const boardState = (location.state ?? null) as BoardLocationState | null;
  const roomId = new URLSearchParams(location.search).get('roomId') || boardState?.roomId;
  const online = onlineEnabled && Boolean(roomId);

  const meta = gameService.getGame(gameId);
  const Board = gameService.getBoardComponent(gameId);

  const handleMatchEnd = useCallback(
    async (result: MatchResult) => {
      // Trực tuyến: máy chủ đã ghi lịch sử và cập nhật xu, client chỉ đồng bộ lại hồ sơ.
      if (online) {
        await refresh();
        toast.success(
          result.win ? 'Thắng ván đấu trực tuyến!' : 'Ván đấu đã kết thúc.',
          `${meta?.name ?? result.gameId} · vị trí ${result.placement}/${result.totalPlayers}`,
        );
        return;
      }

      const saved = await gameService.completeMatch({
        gameId: result.gameId,
        win: result.win,
        placement: result.placement,
        totalPlayers: result.totalPlayers,
        durationMs: result.durationMs,
        coinDelta: result.coinDelta,
      });
      if (saved.ok && saved.data) {
        await refresh();
        toast.success(
          result.win ? 'Thắng ván — đã lưu vào lịch sử!' : 'Đã lưu kết quả ván đấu.',
          `${meta?.name ?? result.gameId} · vị trí ${result.placement}/${result.totalPlayers}`,
        );
      } else if (!user) {
        toast.info(
          'Chưa đăng nhập',
          'Kết quả chỉ hiển thị tạm thời, không được lưu vào tài khoản.',
        );
      }
    },
    [meta, refresh, toast, user, online],
  );

  const handleExit = useCallback(
    () => navigate(online ? '/rooms' : '/'),
    [navigate, online],
  );

  if (!meta || !Board) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Trò chơi chưa sẵn sàng</h1>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {meta
              ? `"${meta.name}" đang ở trạng thái phát triển hoặc sắp ra mắt.`
              : 'Không tìm thấy trò chơi bạn yêu cầu.'}
          </p>
        </div>
        <Button icon={<Home className="h-4 w-4" />} onClick={handleExit}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={<FullPageLoader label="Đang tải bàn chơi…" />}>
      <Board
        onExit={handleExit}
        onMatchEnd={handleMatchEnd}
        config={boardState?.config}
        seats={boardState?.seats}
        online={online}
        roomId={online ? roomId : undefined}
      />
    </Suspense>
  );
}
