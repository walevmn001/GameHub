import {
  SUIT_SYMBOL,
  type Card,
  type Combo,
  type ComboType,
  type CutRates,
  type TienLenConfig,
} from '@/types';
import { cardValue, sortAscending } from './deck';

const TWO_RANK = 15; // Hạng "2" (Heo)

function countByRank(cards: Card[]): Map<number, Card[]> {
  const map = new Map<number, Card[]>();
  for (const card of cards) {
    const list = map.get(card.rank) ?? [];
    list.push(card);
    map.set(card.rank, list);
  }
  return map;
}

function highest(cards: Card[]): Card {
  return cards.reduce((max, c) => (cardValue(c) > cardValue(max) ? c : max), cards[0]);
}

/**
 * Nhận diện tổ hợp bài hợp lệ trong Tiến Lên Miền Nam.
 * Trả về null nếu các lá không tạo thành tổ hợp hợp lệ.
 */
export function parseCombo(input: Card[]): Combo | null {
  if (input.length === 0) return null;
  const cards = sortAscending(input);
  const byRank = countByRank(cards);
  const distinctRanks = [...byRank.keys()].sort((a, b) => a - b);
  const maxValue = cardValue(highest(cards));

  if (cards.length === 1) {
    return { type: 'single', cards, value: maxValue, length: 1 };
  }

  // Đôi / Ba / Tứ quý (cùng hạng)
  if (cards.length >= 2 && cards.length <= 4 && byRank.size === 1) {
    const type: ComboType = cards.length === 2 ? 'pair' : cards.length === 3 ? 'triple' : 'four';
    return { type, cards, value: maxValue, length: cards.length };
  }

  const isConsecutive = distinctRanks.every((rank, index) => {
    if (index === 0) return true;
    return rank === distinctRanks[index - 1] + 1;
  });
  const containsTwo = distinctRanks.includes(TWO_RANK);

  // Sảnh: >= 3 lá, hạng liên tiếp, không chứa Heo
  if (cards.length >= 3 && byRank.size === cards.length && isConsecutive && !containsTwo) {
    return { type: 'straight', cards, value: maxValue, length: cards.length };
  }

  // Đôi thông: >= 3 đôi liên tiếp, không chứa Heo
  if (
    cards.length >= 6 &&
    cards.length % 2 === 0 &&
    [...byRank.values()].every((group) => group.length === 2) &&
    isConsecutive &&
    !containsTwo
  ) {
    return { type: 'doubleStraight', cards, value: maxValue, length: byRank.size };
  }

  return null;
}

/** Nhóm sức mạnh của một tổ hợp, dùng cho luật chặt. */
export type ComboCategory = 'normal' | 'triplePairs' | 'four' | 'quadPairs';

/** Phân nhóm tổ hợp: bom (3/4 đôi thông, tứ quý) hay bài thường. */
export function comboCategory(combo: Combo): ComboCategory {
  if (combo.type === 'four') return 'four';
  if (combo.type === 'doubleStraight') {
    if (combo.length >= 4) return 'quadPairs';
    if (combo.length === 3) return 'triplePairs';
  }
  return 'normal';
}

/** Tổ hợp có phải "bom" (chặt được Heo) hay không. */
export function isBomb(combo: Combo): boolean {
  return comboCategory(combo) !== 'normal';
}

function isTwoCombo(combo: Combo, size: number): boolean {
  return combo.cards.length === size && combo.cards[0].rank === TWO_RANK;
}

/**
 * Thứ tự mạnh của bom: 4 đôi thông > tứ quý > 3 đôi thông.
 * Trả về số càng lớn càng mạnh; 0 nghĩa là bài thường (không phải bom).
 */
function bombRank(category: ComboCategory): number {
  switch (category) {
    case 'quadPairs':
      return 3;
    case 'four':
      return 2;
    case 'triplePairs':
      return 1;
    default:
      return 0;
  }
}

/**
 * Kiểm tra tổ hợp `candidate` có chặt/đè được `target` hay không.
 *
 * Quy tắc:
 * - 3 đôi thông chặt 1 Heo đơn.
 * - Tứ quý chặt 1 Heo đơn, đôi Heo, ba Heo, 3 đôi thông, và tứ quý nhỏ hơn.
 * - 4 đôi thông chặt 1 Heo đơn, đôi Heo, ba Heo, 3 đôi thông, tứ quý, và 4 đôi thông nhỏ hơn.
 * - Bài thường: cùng loại & cùng số lá mới so giá trị; không đè được Heo hay bom.
 */
export function canBeat(candidate: Combo, target: Combo): boolean {
  const catCandidate = comboCategory(candidate);
  const catTarget = comboCategory(target);

  const singleTwo = isTwoCombo(target, 1);
  const pairTwo = isTwoCombo(target, 2);
  const tripleTwo = isTwoCombo(target, 3);

  // Ứng viên là bom
  if (catCandidate !== 'normal') {
    const rankCandidate = bombRank(catCandidate);
    if (singleTwo || pairTwo || tripleTwo) {
      // 3 đôi thông chỉ chặt Heo đơn; tứ quý & 4 đôi thông chặt được cả đôi/ba Heo.
      if (catCandidate === 'triplePairs' && !singleTwo) return false;
      return true;
    }
    if (catTarget === 'normal') return false;
    if (catTarget === catCandidate) return candidate.value > target.value;
    return rankCandidate > bombRank(catTarget);
  }

  // Ứng viên là bài thường: chỉ đè được bài thường, không đè Heo hay bom.
  if (catTarget !== 'normal') return false;
  if (singleTwo || pairTwo || tripleTwo) return false;
  if (candidate.type !== target.type) return false;
  if (candidate.length !== target.length) return false;
  return candidate.value > target.value;
}

/**
 * Mức chặt (tính theo số lần cược cơ bản) khi một tổ hợp bị chặt.
 * Trả về 0 nếu tổ hợp không thuộc diện bị chặt.
 */
export function cutRateFor(target: Combo, rates: CutRates): number {
  const category = comboCategory(target);
  if (category === 'quadPairs') return rates.quadPairs;
  if (category === 'four') return rates.fourOfKind;
  if (category === 'triplePairs') return rates.triplePairs;

  if (isTwoCombo(target, 2)) return rates.pairTwo;
  if (isTwoCombo(target, 1)) {
    const suit = target.cards[0].suit;
    return suit === 'heart' || suit === 'diamond' ? rates.redTwo : rates.blackTwo;
  }
  return 0;
}

/** Mô tả tổ hợp để hiển thị trên UI. */
export function describeCombo(combo: Combo): string {
  switch (combo.type) {
    case 'single':
      return 'Bài lẻ';
    case 'pair':
      return 'Đôi';
    case 'triple':
      return 'Sám cô';
    case 'four':
      return 'Tứ quý';
    case 'straight':
      return `Sảnh ${combo.length} lá`;
    case 'doubleStraight':
      return combo.length === 3 ? '3 đôi thông' : combo.length === 4 ? '4 đôi thông' : `${combo.length} đôi thông`;
    default:
      return 'Tổ hợp';
  }
}

/** Nhãn ngắn hiển thị trên lá bài. */
export function cardLabel(card: Card): string {
  const RANK_MAP: Record<number, string> = {
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
    15: '2',
  };
  return `${RANK_MAP[card.rank] ?? String(card.rank)}${SUIT_SYMBOL[card.suit]}`;
}

export interface WhiteWinResult {
  win: boolean;
  /** Nhãn kiểu ăn trắng, ví dụ "Sảnh rồng". */
  label?: string;
}

function hasConsecutiveRanks(ranks: number[], need: number): boolean {
  if (need <= 1) return ranks.length >= need;
  const unique = [...new Set(ranks)].sort((a, b) => a - b);
  let streak = 0;
  for (let i = 0; i < unique.length; i += 1) {
    streak = i > 0 && unique[i] === unique[i - 1] + 1 ? streak + 1 : 1;
    if (streak >= need) return true;
  }
  return false;
}

/**
 * Kiểm tra ăn trắng ngay khi chia bài.
 * Thứ tự ưu tiên: Sảnh rồng > Tứ quý Heo > 5 đôi thông > 6 đôi > 3 Heo + sảnh 3.
 */
export function detectWhiteWin(hand: Card[], config: TienLenConfig): WhiteWinResult {
  if (!config.enableWhiteWin) return { win: false };

  const byRank = countByRank(hand);
  const twos = byRank.get(TWO_RANK)?.length ?? 0;

  // Sảnh rồng: dãy 11 lá liên tiếp (3 → K).
  const nonTwoRanks = hand.filter((c) => c.rank !== TWO_RANK).map((c) => c.rank);
  if (hasConsecutiveRanks(nonTwoRanks, 11)) {
    return { win: true, label: 'Sảnh rồng' };
  }

  // Tứ quý Heo (4 lá 2).
  if (twos === 4) return { win: true, label: 'Tứ quý Heo' };

  // 5 đôi thông.
  const pairRanks = [...byRank.entries()]
    .filter(([rank, group]) => rank !== TWO_RANK && group.length >= 2)
    .map(([rank]) => rank);
  if (hasConsecutiveRanks(pairRanks, 5)) return { win: true, label: '5 đôi thông' };

  // 6 đôi bất kỳ (tùy cấu hình).
  if (config.whiteWinSixPairs) {
    const pairCount = [...byRank.values()].filter((group) => group.length >= 2).length;
    if (pairCount >= 6) return { win: true, label: '6 đôi' };
  }

  // 3 Heo + 1 sảnh 3 lá (tùy cấu hình).
  if (config.whiteWinThreeTwos && twos >= 3) {
    if (hasConsecutiveRanks(nonTwoRanks, 3)) {
      return { win: true, label: '3 Heo + sảnh' };
    }
  }

  return { win: false };
}
