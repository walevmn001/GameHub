import type { Card, CutRates, TienLenConfig } from '@/types';
import { describeCombo } from './rules';

/** Một lần chặt đã xảy ra trong ván. */
export interface CutEvent {
  /** Ghế thực hiện chặt. */
  bySeat: number;
  /** Ghế bị chặt. */
  victimSeat: number;
  /** Mức chặt theo số lần cược. */
  rate: number;
  /** Số xu tương ứng (rate × mức cược). */
  amount: number;
  /** Mô tả tổ hợp bị chặt, ví dụ "Heo đỏ". */
  label: string;
}

/** Kết quả tiền của một người chơi cuối ván. */
export interface PlayerSettlement {
  seat: number;
  position: number;
  cutLoss: number;
  cutGain: number;
  thoiLoss: number;
  baseChange: number;
  net: number;
}

export interface MatchSettlement {
  perSeat: PlayerSettlement[];
  cutEvents: CutEvent[];
  whiteWinSeat: number | null;
  whiteWinLabel: string | null;
  /** Tổng tiền chặt (dùng cho chặt cộng dồn). */
  stackedCutTotal: number;
  /** Ghế chịu tiền chặt cộng dồn (bị chặt cuối cùng). */
  stackedCutPayer: number | null;
}

export interface SettleInput {
  /** Danh sách ghế với vị trí xếp hạng (1 = nhất). */
  players: Array<{ seat: number; position: number; hand: Card[] }>;
  config: TienLenConfig;
  cutEvents: CutEvent[];
  whiteWinSeat: number | null;
  whiteWinLabel: string | null;
}

/** Mô tả một tổ hợp bị chặt (dùng cho nhãn tiền chặt). */
function describeCutTarget(label: string, isRedTwo: boolean): string {
  if (label === 'single-two') return isRedTwo ? 'Heo đỏ' : 'Heo đen';
  if (label === 'pair-two') return 'Đôi Heo';
  return label;
}

export function cutTargetLabel(cards: Card[], rates: CutRates): { label: string; rate: number } {
  void rates;
  const rank = cards[0]?.rank;
  const isTwo = cards.length <= 3 && rank === 15;
  if (isTwo) {
    if (cards.length === 2) return { label: 'Đôi Heo', rate: 0 };
    if (cards.length === 1) {
      const red = cards[0].suit === 'heart' || cards[0].suit === 'diamond';
      return { label: red ? 'Heo đỏ' : 'Heo đen', rate: 0 };
    }
  }
  return { label: 'Bom', rate: 0 };
}

/**
 * Tính tiền phạt thối cho bài còn lại trên tay (đơn vị: số lần cược).
 * Gồm: 4 lá Heo (2 đôi), lẻ Heo đen/đỏ, tứ quý, 3/4 đôi thông.
 */
export function computeThoiPenalty(hand: Card[], rates: CutRates): { units: number; items: string[] } {
  if (hand.length === 0) return { units: 0, items: [] };

  const items: string[] = [];
  let units = 0;

  const twoCards = hand.filter((c) => c.rank === 15);
  const pairs = Math.floor(twoCards.length / 2);
  const singles = twoCards.length % 2;
  for (let i = 0; i < pairs; i += 1) {
    units += rates.pairTwo;
    items.push(`Đôi Heo (+${rates.pairTwo})`);
  }
  if (singles === 1) {
    // Heo lẻ còn lại sau khi tách đôi — chọn lá đại diện (ưu tiên Heo đỏ vì phạt nặng hơn).
    const single = twoCards.find((c) => c.suit === 'heart' || c.suit === 'diamond') ?? twoCards[0];
    if (single) {
      const red = single.suit === 'heart' || single.suit === 'diamond';
      const rate = red ? rates.redTwo : rates.blackTwo;
      units += rate;
      items.push(`${red ? 'Heo đỏ' : 'Heo đen'} (+${rate})`);
    }
  }

  // Nhóm theo hạng để tìm tứ quý / đôi thông (không tính Heo).
  const byRank = new Map<number, number>();
  for (const card of hand) {
    if (card.rank === 15) continue;
    byRank.set(card.rank, (byRank.get(card.rank) ?? 0) + 1);
  }

  let fourOfKind = 0;
  for (const count of byRank.values()) if (count >= 4) fourOfKind += 1;
  if (fourOfKind > 0) {
    units += fourOfKind * rates.fourOfKind;
    items.push(`Tứ quý ×${fourOfKind} (+${fourOfKind * rates.fourOfKind})`);
  }

  const pairRanks = [...byRank.entries()].filter(([, c]) => c >= 2).map(([r]) => r).sort((a, b) => a - b);
  let bestRun = 0;
  let run = 1;
  for (let i = 0; i < pairRanks.length; i += 1) {
    run = i > 0 && pairRanks[i] === pairRanks[i - 1] + 1 ? run + 1 : 1;
    bestRun = Math.max(bestRun, run);
  }
  if (bestRun >= 4) {
    units += rates.quadPairs;
    items.push(`4 đôi thông (+${rates.quadPairs})`);
  } else if (bestRun === 3) {
    units += rates.triplePairs;
    items.push(`3 đôi thông (+${rates.triplePairs})`);
  }

  return { units, items };
}

function normalize(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum <= 0) return values.map(() => 0);
  return values.map((v) => v / sum);
}

/**
 * Tính kết quả tiền của cả ván. Tổng thay đổi của mọi người chơi luôn bằng 0.
 */
export function settleMatch(input: SettleInput): MatchSettlement {
  const { config, cutEvents, whiteWinSeat, whiteWinLabel } = input;
  const baseBet = config.baseBet;
  const ordered = [...input.players].sort((a, b) => a.position - b.position);
  const n = ordered.length;

  const perSeat: PlayerSettlement[] = ordered.map((p) => ({
    seat: p.seat,
    position: p.position,
    cutLoss: 0,
    cutGain: 0,
    thoiLoss: 0,
    baseChange: 0,
    net: 0,
  }));
  const bySeat = new Map(perSeat.map((s) => [s.seat, s]));

  // 1) Tiền thắng thua cơ bản theo xếp hạng.
  const applyBase = () => {
    if (config.payoutMode === 'winner-takes-all') {
      const winner = ordered[0];
      const losers = ordered.filter((_, index) => {
        const position = index + 1;
        if (position === 1) return false;
        if (position === 2 && n >= 3) return false; // Nhì không mất khi bàn từ 3 người.
        return true;
      });
      const gain = baseBet * losers.length;
      bySeat.get(winner.seat)!.baseChange += gain;
      for (const loser of losers) bySeat.get(loser.seat)!.baseChange -= baseBet;
      return;
    }

    // "Nhất và Nhì ăn".
    const winners = ordered.slice(0, Math.min(2, n));
    const losers = ordered.slice(Math.min(2, n));
    if (winners.length === 0 || losers.length === 0) {
      // Bàn ít người: quy về Nhất ăn từ người cuối.
      const winner = ordered[0];
      const last = ordered[n - 1];
      if (winner.seat !== last.seat) {
        bySeat.get(winner.seat)!.baseChange += baseBet;
        bySeat.get(last.seat)!.baseChange -= baseBet;
      }
      return;
    }

    const winnerShares = normalize(
      winners.map((_, index) => (index === 0 ? config.winnerShares.first : config.winnerShares.second)),
    );
    const loserShares = normalize(
      losers.map((loser, index) => {
        const isLast = loser.position === ordered[n - 1].position;
        if (isLast) return config.loserShares.last;
        if (index === 0 && !isLast) return config.loserShares.third;
        return config.loserShares.last;
      }),
    );
    const pot = baseBet * losers.length;
    winners.forEach((w, index) => {
      bySeat.get(w.seat)!.baseChange += Math.round(pot * winnerShares[index]);
    });
    losers.forEach((l, index) => {
      bySeat.get(l.seat)!.baseChange -= Math.round(pot * loserShares[index]);
    });
  };

  // Ăn trắng: người ăn trắng được tính Nhất; những người khác chịu phạt.
  applyBase();

  // 2) Tiền chặt.
  let stackedCutTotal = 0;
  let stackedCutPayer: number | null = null;

  if (cutEvents.length > 0) {
    if (config.enableStackedCut) {
      stackedCutTotal = cutEvents.reduce((sum, e) => sum + e.amount, 0);
      stackedCutPayer = cutEvents[cutEvents.length - 1].victimSeat;
      for (const event of cutEvents) {
        bySeat.get(event.bySeat)!.cutGain += event.amount;
      }
      bySeat.get(stackedCutPayer)!.cutLoss += stackedCutTotal;
    } else {
      for (const event of cutEvents) {
        bySeat.get(event.victimSeat)!.cutLoss += event.amount;
        bySeat.get(event.bySeat)!.cutGain += event.amount;
      }
    }
  }

  // 3) Phạt thối cho người về Bét.
  if (config.enableThoiPenalty) {
    const bet = ordered[n - 1];
    const penalty = computeThoiPenalty(bet.hand, config.cutRates);
    if (penalty.units > 0) {
      const amount = penalty.units * baseBet;
      bySeat.get(bet.seat)!.thoiLoss += amount;
      const winner = ordered[0];
      if (winner.seat !== bet.seat) {
        bySeat.get(winner.seat)!.baseChange += amount;
      }
    }
  }

  // 4) Tổng hợp (giữ cân bằng 0 tuyệt đối bằng cách bù lệch làm tròn vào người Nhất).
  for (const seat of perSeat) {
    seat.net = seat.baseChange + seat.cutGain - seat.cutLoss - seat.thoiLoss;
  }
  const total = perSeat.reduce((sum, s) => sum + s.net, 0);
  if (total !== 0) {
    const winner = bySeat.get(ordered[0].seat)!;
    winner.net -= total;
    winner.baseChange -= total;
  }

  return {
    perSeat,
    cutEvents,
    whiteWinSeat,
    whiteWinLabel,
    stackedCutTotal,
    stackedCutPayer,
  };
}

export { describeCombo, describeCutTarget };
