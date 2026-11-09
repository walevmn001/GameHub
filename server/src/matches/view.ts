import type { MatchSeatView, MatchView } from '@/types';
import type { TienLenState } from '@/game-engine/tienlen';

export interface MatchMeta {
  matchId: string;
  roomId: string;
  gameId: string;
  deadline: number | null;
}

/**
 * Dựng trạng thái ván cho MỘT người chơi cụ thể.
 * Chỉ lộ bài của chính người nhận; bài người khác chỉ gửi số lượng.
 */
export function buildMatchView(state: TienLenState, seat: number, meta: MatchMeta): MatchView {
  const seats: MatchSeatView[] = state.players.map((player) => ({
    seat: player.seat,
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    isBot: player.isBot,
    coins: player.coins ?? 0,
    handCount: player.hand.length,
    placement: player.placement,
    isYou: player.seat === seat,
  }));

  return {
    matchId: meta.matchId,
    roomId: meta.roomId,
    gameId: meta.gameId,
    config: state.config,
    seats,
    you: { seat, hand: state.players[seat]?.hand ?? [] },
    currentTurn: state.currentTurn,
    lastCombo: state.lastCombo,
    lastPlaySeat: state.lastPlaySeat,
    passCount: state.passCount,
    phase: state.phase,
    history: state.history,
    whiteWinSeat: state.whiteWinSeat,
    whiteWinLabel: state.whiteWinLabel,
    finishOrder: state.finishOrder,
    settlement: state.settlement,
    deadline: meta.deadline,
  };
}
