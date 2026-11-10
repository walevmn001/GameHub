import type { Card, Combo, TienLenConfig } from '@/types';
import { normalizeConfig } from '@/types';
import { dealCards, findStartingPlayer, sortAscending } from './deck';
import {
  canBeat,
  comboCategory,
  cutRateFor,
  describeCombo,
  detectWhiteWin,
  parseCombo,
} from './rules';
import { settleMatch, type CutEvent, type MatchSettlement } from './money';

export interface TienLenSeatConfig {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  /** Số dư xu hiện có (dùng để hiển thị trong phòng chơi). */
  coins?: number;
  /** Mã skin bài công khai đã chốt khi bắt đầu ván. */
  cardSkinId?: string | null;
}

export interface TienLenPlayer extends TienLenSeatConfig {
  seat: number;
  hand: Card[];
  /** Vị trí về đích (1 = nhất). null khi còn chơi. */
  placement: number | null;
}

export type TienLenActionType = 'play' | 'pass' | 'cut' | 'white-win';

export interface PlayRecord {
  seat: number;
  combo: Combo | null;
  at: number;
  type: TienLenActionType;
  /** Ghế bị chặt (chỉ có khi type = 'cut'). */
  cutVictimSeat?: number;
  /** Nhãn hiệu ứng, ví dụ "3 đôi thông chặt Heo đỏ!". */
  effectLabel?: string;
}

export type TienLenPhase = 'playing' | 'finished';

export interface TienLenState {
  players: TienLenPlayer[];
  /** Cấu hình bàn chơi — nguồn chân lý cho luật và cách tính tiền. */
  config: TienLenConfig;
  currentTurn: number;
  lastCombo: Combo | null;
  lastPlaySeat: number | null;
  passCount: number;
  phase: TienLenPhase;
  finishOrder: number[];
  history: PlayRecord[];
  /** Các lần chặt đã xảy ra trong ván. */
  cutEvents: CutEvent[];
  /** Ghế ăn trắng (nếu có). */
  whiteWinSeat: number | null;
  whiteWinLabel: string | null;
  /** Kết quả tiền cuối ván (null khi ván chưa kết thúc). */
  settlement: MatchSettlement | null;
  turnCount: number;
  startedAt: number;
}

export interface ActionResult {
  state: TienLenState;
  error?: string;
}

/** Thứ tự ưu tiên ăn trắng (số nhỏ = mạnh hơn). */
const WHITE_WIN_PRIORITY = ['Sảnh rồng', 'Tứ quý Heo', '5 đôi thông', '6 đôi', '3 Heo + sảnh'];

function cloneState(state: TienLenState): TienLenState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player, hand: [...player.hand] })),
    finishOrder: [...state.finishOrder],
    history: [...state.history],
    cutEvents: [...state.cutEvents],
  };
}

/** Mô tả một lần chặt để hiển thị hiệu ứng, ví dụ "3 đôi thông chặt Heo đỏ!". */
function cutEffectLabel(combo: Combo, target: Combo): string {
  let targetLabel: string;
  if (comboCategory(target) !== 'normal') {
    targetLabel = describeCombo(target);
  } else if (target.cards[0]?.rank === 15 && target.cards.length === 1) {
    const suit = target.cards[0].suit;
    targetLabel = suit === 'heart' || suit === 'diamond' ? 'Heo đỏ' : 'Heo đen';
  } else if (target.cards[0]?.rank === 15 && target.cards.length === 2) {
    targetLabel = 'Đôi Heo';
  } else {
    targetLabel = describeCombo(target);
  }
  return `${describeCombo(combo)} chặt ${targetLabel}!`;
}

/** Ghế ăn trắng mạnh nhất (nếu có), duyệt từ người đi trước theo vòng. */
function detectWhiteWinner(
  state: TienLenState,
  startSeat: number,
): { seat: number; label: string } | null {
  if (!state.config.enableWhiteWin) return null;
  const total = state.players.length;
  let best: { seat: number; label: string; priority: number } | null = null;

  for (let step = 0; step < total; step += 1) {
    const seat = (startSeat + step) % total;
    const result = detectWhiteWin(state.players[seat].hand, state.config);
    if (!result.win || !result.label) continue;
    const priority = WHITE_WIN_PRIORITY.indexOf(result.label);
    if (!best || priority < best.priority) {
      best = { seat, label: result.label, priority };
    }
  }
  return best ? { seat: best.seat, label: best.label } : null;
}

/** Quyết toán tiền cuối ván dựa trên xếp hạng, chặt và phạt thối. */
function finishMatch(state: TienLenState): TienLenState {
  state.phase = 'finished';
  state.settlement = settleMatch({
    players: state.players.map((player) => ({
      seat: player.seat,
      position: player.placement ?? state.players.length,
      hand: player.hand,
    })),
    config: state.config,
    cutEvents: state.cutEvents,
    whiteWinSeat: state.whiteWinSeat,
    whiteWinLabel: state.whiteWinLabel,
  });
  return state;
}

/** Xử lý ăn trắng: gán xếp hạng, kết thúc ván và quyết toán. */
function applyWhiteWin(state: TienLenState, seat: number, label: string): void {
  const total = state.players.length;
  state.whiteWinSeat = seat;
  state.whiteWinLabel = label;
  state.finishOrder = [seat];
  state.players[seat].placement = 1;

  let place = 2;
  for (let step = 1; step < total; step += 1) {
    const other = (seat + step) % total;
    if (other === seat) continue;
    state.players[other].placement = place;
    state.finishOrder.push(other);
    place += 1;
  }

  state.currentTurn = seat;
  state.history.push({
    seat,
    combo: null,
    at: Date.now(),
    type: 'white-win',
    effectLabel: `ĂN TRẮNG — ${label}!`,
  });
  finishMatch(state);
}

/** Tạo ván mới: chia bài theo cấu hình và kiểm tra ăn trắng. */
export function createGame(
  seats: TienLenSeatConfig[],
  inputConfig?: Partial<TienLenConfig> | null,
): TienLenState {
  const config = normalizeConfig(inputConfig);
  const hands = dealCards(seats.length);
  const startSeat = findStartingPlayer(hands);
  const players: TienLenPlayer[] = seats.map((seat, index) => ({
    ...seat,
    seat: index,
    hand: hands[index],
    placement: null,
  }));

  const state: TienLenState = {
    players,
    config,
    currentTurn: startSeat,
    lastCombo: null,
    lastPlaySeat: null,
    passCount: 0,
    phase: 'playing',
    finishOrder: [],
    history: [],
    cutEvents: [],
    whiteWinSeat: null,
    whiteWinLabel: null,
    settlement: null,
    turnCount: 0,
    startedAt: Date.now(),
  };

  const white = detectWhiteWinner(state, startSeat);
  if (white) applyWhiteWin(state, white.seat, white.label);

  return state;
}

function nextActiveSeat(state: TienLenState, from: number): number {
  const total = state.players.length;
  for (let step = 1; step <= total; step += 1) {
    const seat = (from + step) % total;
    if (state.players[seat].placement === null) return seat;
  }
  return from;
}

function activeSeats(state: TienLenState): number[] {
  return state.players.filter((p) => p.placement === null).map((p) => p.seat);
}

/** Người chơi tại `seat` có bắt buộc phải đè bài không (đang trong vòng đấu). */
export function mustFollow(state: TienLenState, seat: number): boolean {
  return state.lastCombo !== null && state.lastPlaySeat !== seat;
}

/**
 * Đánh bài từ tay người chơi. Trả về state mới kèm thông báo lỗi nếu thao tác không hợp lệ.
 */
export function playCards(
  state: TienLenState,
  seat: number,
  cardIds: string[],
): ActionResult {
  if (state.phase !== 'playing') {
    return { state, error: 'Ván đấu đã kết thúc.' };
  }
  if (seat !== state.currentTurn) {
    return { state, error: 'Chưa tới lượt của bạn.' };
  }
  if (cardIds.length === 0) {
    return { state, error: 'Hãy chọn ít nhất một lá bài.' };
  }

  const player = state.players[seat];
  const uniqueIds = new Set(cardIds);
  if (uniqueIds.size !== cardIds.length) {
    return { state, error: 'Lựa chọn chứa lá bài trùng lặp.' };
  }

  const cards = player.hand.filter((card) => uniqueIds.has(card.id));
  if (cards.length !== cardIds.length) {
    return { state, error: 'Có lá bài không nằm trên tay bạn.' };
  }

  const combo = parseCombo(cards);
  if (!combo) {
    return { state, error: 'Tổ hợp bài không hợp lệ.' };
  }

  const following = mustFollow(state, seat);
  if (following && state.lastCombo && !canBeat(combo, state.lastCombo)) {
    return { state, error: 'Bài của bạn không đè được bài trên bàn.' };
  }

  const next = cloneState(state);
  const nextPlayer = next.players[seat];
  nextPlayer.hand = nextPlayer.hand.filter((card) => !uniqueIds.has(card.id));

  // Ghi nhận hiệu ứng chặt nếu nước đi này chặt một tổ hợp có thể bị chặt.
  let recordType: PlayRecord['type'] = 'play';
  let cutVictimSeat: number | undefined;
  let effectLabel: string | undefined;

  if (following && next.lastCombo) {
    const target = next.lastCombo;
    const rate = cutRateFor(target, next.config.cutRates);
    if (rate > 0 && next.lastPlaySeat !== null) {
      cutVictimSeat = next.lastPlaySeat;
      const amount = rate * next.config.baseBet;
      next.cutEvents.push({
        bySeat: seat,
        victimSeat: cutVictimSeat,
        rate,
        amount,
        label: describeCombo(target),
      });
      effectLabel = cutEffectLabel(combo, target);
      recordType = 'cut';
    }
  }

  next.lastCombo = combo;
  next.lastPlaySeat = seat;
  next.passCount = 0;
  next.turnCount += 1;
  next.history.push({
    seat,
    combo,
    at: Date.now(),
    type: recordType,
    cutVictimSeat,
    effectLabel,
  });

  if (nextPlayer.hand.length === 0) {
    nextPlayer.placement = next.finishOrder.length + 1;
    next.finishOrder.push(seat);

    const remaining = activeSeats(next);
    if (remaining.length <= 1) {
      if (remaining.length === 1) {
        const lastSeat = remaining[0];
        next.players[lastSeat].placement = next.finishOrder.length + 1;
        next.finishOrder.push(lastSeat);
      }
      next.currentTurn = seat;
      return { state: finishMatch(next) };
    }

    // Người vừa hết bài rời ván; người kế tiếp mở vòng mới tự do.
    next.lastCombo = null;
    next.lastPlaySeat = null;
    next.passCount = 0;
    next.currentTurn = nextActiveSeat(next, seat);
    return { state: next };
  }

  next.currentTurn = nextActiveSeat(next, seat);
  return { state: next };
}

/** Bỏ lượt. */
export function passTurn(state: TienLenState, seat: number): ActionResult {
  if (state.phase !== 'playing') {
    return { state, error: 'Ván đấu đã kết thúc.' };
  }
  if (seat !== state.currentTurn) {
    return { state, error: 'Chưa tới lượt của bạn.' };
  }
  if (state.lastCombo === null) {
    return { state, error: 'Bạn đang dẫn lượt, không thể bỏ lượt.' };
  }

  const next = cloneState(state);
  next.passCount += 1;
  next.history.push({ seat, combo: null, at: Date.now(), type: 'pass' });

  const totalActive = activeSeats(next).length;
  if (next.passCount >= totalActive - 1) {
    // Tất cả đã bỏ lượt: mở vòng mới cho người vừa đánh.
    const starter =
      next.lastPlaySeat !== null && next.players[next.lastPlaySeat].placement === null
        ? next.lastPlaySeat
        : nextActiveSeat(next, seat);
    next.lastCombo = null;
    next.lastPlaySeat = null;
    next.passCount = 0;
    next.currentTurn = starter;
  } else {
    next.currentTurn = nextActiveSeat(next, seat);
  }

  return { state: next };
}

/** Kiểm tra bộ bài người chơi đang chọn có hợp lệ để đánh. */
export function validateSelection(
  state: TienLenState,
  seat: number,
  cardIds: string[],
): { combo: Combo | null; canPlay: boolean; reason?: string } {
  if (cardIds.length === 0) return { combo: null, canPlay: false };
  const cards = state.players[seat].hand.filter((card) => cardIds.includes(card.id));
  const combo = parseCombo(cards);
  if (!combo) return { combo: null, canPlay: false, reason: 'Tổ hợp không hợp lệ' };
  if (mustFollow(state, seat) && state.lastCombo && !canBeat(combo, state.lastCombo)) {
    return { combo, canPlay: false, reason: 'Không đè được bài trên bàn' };
  }
  return { combo, canPlay: true };
}

export function isPlayerTurn(state: TienLenState, seat: number): boolean {
  return state.phase === 'playing' && state.currentTurn === seat;
}

export function getWinner(state: TienLenState): TienLenPlayer | null {
  if (state.phase !== 'finished' || state.finishOrder.length === 0) return null;
  return state.players[state.finishOrder[0]];
}

export { sortAscending, cutEffectLabel };
