import { Crown, Frown, Home, RotateCcw } from 'lucide-react';
import type { MatchSettlement, TienLenPlayer } from '@/game-engine/tienlen';
import { Avatar, Button, Modal } from '@/components/ui';
import { RewardArt } from '@/components/illustrations/GameIllustrationAssets';
import { cn } from '@/utils/cn';

const PLACE_LABEL = ['', 'Nhất', 'Nhì', 'Ba', 'Bốn'];

/** Bảng kết quả sau trận đấu. */
export function ResultModal({
  open,
  players,
  humanSeat,
  settlement,
  onRematch,
  onExit,
}: {
  open: boolean;
  players: TienLenPlayer[];
  humanSeat: number;
  settlement?: MatchSettlement | null;
  onRematch: () => void;
  onExit: () => void;
}) {
  const ranked = [...players].sort(
    (a, b) => (a.placement ?? 99) - (b.placement ?? 99),
  );
  const human = players[humanSeat];
  const won = human.placement === 1;
  const netBySeat = new Map((settlement?.perSeat ?? []).map((s) => [s.seat, s.net]));

  return (
    <Modal
      open={open}
      onClose={onExit}
      size="md"
      footer={
        <>
          <Button variant="outline" icon={<Home className="h-4 w-4" />} onClick={onExit}>
            Về trang chủ
          </Button>
          <Button icon={<RotateCcw className="h-4 w-4" />} onClick={onRematch}>
            Chơi lại
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'flex w-full flex-col items-center gap-2 rounded-3xl border p-5 text-center shadow-soft',
            won
              ? 'border-amber-200 bg-gradient-to-br from-pastel-yellow via-white to-brand-50'
              : 'border-pastel-pink bg-gradient-to-br from-pastel-pink via-white to-pastel-blue',
          )}
        >
          {won ? (
            <div className="flex h-24 items-center justify-center">
              <RewardArt type="trophy" className="h-20 w-20" />
            </div>
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-soft">
              <Frown className="h-9 w-9 text-slate-500" />
            </span>
          )}
          <h2 className="text-xl font-extrabold text-slate-100">
            {won ? 'Bạn đã thắng ván!' : 'Chúc bạn may mắn lần sau'}
          </h2>
          <p className="text-xs text-slate-400">
            {won
              ? 'Xuất sắc về nhất. Kết quả đã được lưu vào lịch sử chơi thử.'
              : `Bạn về vị trí ${human.placement ?? '-'} trong ván này.`}
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-ink/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/5 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Hạng</th>
                <th className="px-4 py-2.5 font-semibold">Người chơi</th>
                <th className="px-4 py-2.5 text-right font-semibold">Còn lại</th>
                {settlement && <th className="px-4 py-2.5 text-right font-semibold">Xu</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {ranked.map((player) => {
                const isHuman = player.seat === humanSeat;
                return (
                  <tr
                    key={player.seat}
                    className={cn(isHuman && 'bg-brand-50')}
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
                        {(player.placement ?? 0) === 1 && (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {PLACE_LABEL[player.placement ?? 0] ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <Avatar src={player.avatar} name={player.name} size="xs" />
                        <span
                          className={cn(
                            'truncate text-xs font-medium',
                            isHuman ? 'text-neon-cyan' : 'text-slate-200',
                          )}
                        >
                          {player.name}
                          {isHuman && ' (bạn)'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-slate-400">
                      {player.hand.length} lá
                    </td>
                    {settlement && (
                      <td
                        className={cn(
                          'px-4 py-2.5 text-right text-xs font-semibold',
                          (netBySeat.get(player.seat) ?? 0) >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-600',
                        )}
                      >
                        {(netBySeat.get(player.seat) ?? 0) >= 0 ? '+' : ''}
                        {(netBySeat.get(player.seat) ?? 0).toLocaleString('vi-VN')}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
