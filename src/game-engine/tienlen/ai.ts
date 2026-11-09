import type { AiDifficulty, Card, Combo } from '@/types';
import { cardValue, sortAscending } from './deck';
import { canBeat, comboCategory, parseCombo } from './rules';

/**
 * Sinh tất cả tổ hợp hợp lệ có thể tạo từ một bộ bài trên tay.
 * Với 13 lá, số lượng tổ hợp vẫn nhỏ nên có thể duyệt trực tiếp.
 */
export function findAllCombos(hand: Card[]): Combo[] {
  const cards = sortAscending(hand);
  const combos: Combo[] = [];
  const byRank = new Map<number, Card[]>();
  for (const card of cards) {
    const list = byRank.get(card.rank) ?? [];
    list.push(card);
    byRank.set(card.rank, list);
  }
  const ranks = [...byRank.keys()].sort((a, b) => a - b);

  const push = (candidate: Card[]) => {
    const combo = parseCombo(candidate);
    if (combo) combos.push(combo);
  };

  for (const card of cards) push([card]);

  for (const rank of ranks) {
    const group = byRank.get(rank)!;
    if (group.length >= 2) push(group.slice(0, 2));
    if (group.length >= 3) push(group.slice(0, 3));
    if (group.length >= 4) push(group.slice(0, 4));
  }

  // Sảnh: mọi dãy liên tiếp >= 3 lá, không chứa Heo (2)
  const straightRanks = ranks.filter((r) => r < 15);
  for (let start = 0; start < straightRanks.length; start += 1) {
    for (let end = start + 2; end < straightRanks.length; end += 1) {
      const slice = straightRanks.slice(start, end + 1);
      const consecutive = slice.every((r, i) => i === 0 || r === slice[i - 1] + 1);
      if (!consecutive) break;
      push(slice.flatMap((r) => byRank.get(r)!));
    }
  }

  // Đôi thông: chuỗi >= 3 đôi liên tiếp, không chứa Heo
  const pairRanks = ranks.filter((r) => r < 15 && (byRank.get(r)?.length ?? 0) >= 2);
  for (let start = 0; start < pairRanks.length; start += 1) {
    for (let end = start + 2; end < pairRanks.length; end += 1) {
      const slice = pairRanks.slice(start, end + 1);
      const consecutive = slice.every((r, i) => i === 0 || r === slice[i - 1] + 1);
      if (!consecutive) break;
      push(slice.flatMap((r) => byRank.get(r)!.slice(0, 2)));
    }
  }

  return combos;
}

/** Lọc các tổ hợp có thể đè lên `target`. */
export function findBeatingCombos(hand: Card[], target: Combo): Combo[] {
  return findAllCombos(hand).filter((combo) => canBeat(combo, target));
}

function isBombCombo(combo: Combo): boolean {
  return comboCategory(combo) !== 'normal';
}

/** Tổ hợp có chứa lá Heo (2) hoặc là bom — thứ nên giữ lại. */
function holdsPower(combo: Combo): boolean {
  return isBombCombo(combo) || combo.cards.some((card) => card.rank === 15);
}

function byCheapest(a: Combo, b: Combo): number {
  return a.value - b.value || a.cards.length - b.cards.length;
}

/** Chọn ngẫu nhiên trong nhóm nước đi rẻ nhất (một nửa danh sách). */
function pickRandomCheap(pool: Combo[]): Combo | null {
  if (pool.length === 0) return null;
  const sorted = [...pool].sort(byCheapest);
  const window = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
  return window[Math.floor(Math.random() * window.length)] ?? null;
}

/** AI dễ: đi nước ngẫu nhiên, đôi khi bỏ lỡ cơ hội đè bài. */
function easyMove(hand: Card[], target: Combo | null): Combo | null {
  if (hand.length === 0) return null;

  if (target) {
    const moves = findBeatingCombos(hand, target);
    if (moves.length === 0) return null;
    // Thỉnh thoảng bỏ lượt dù có thể đè.
    if (moves.length > 1 && Math.random() < 0.25) return null;
    return pickRandomCheap(moves);
  }

  const all = findAllCombos(hand);
  return pickRandomCheap(all);
}

/** AI trung bình: ưu tiên tổ hợp nhỏ nhất, tiết kiệm bom và Heo. */
function mediumMove(hand: Card[], target: Combo | null): Combo | null {
  if (hand.length === 0) return null;

  if (target) {
    const moves = findBeatingCombos(hand, target);
    if (moves.length === 0) return null;
    const normal = moves.filter((m) => !isBombCombo(m));
    const pool = normal.length > 0 ? normal : moves;
    return [...pool].sort(byCheapest)[0];
  }

  const all = findAllCombos(hand);
  const safe = all.filter((combo) => !holdsPower(combo));
  const pool = safe.length > 0 ? safe : all;
  return [...pool].sort((a, b) => a.value - b.value || b.cards.length - a.cards.length)[0] ?? null;
}

/** AI khó: chặt khi có thể, dẫn bài dài để xả bài và tránh lộ Heo/bom sớm. */
function hardMove(hand: Card[], target: Combo | null): Combo | null {
  if (hand.length === 0) return null;

  if (target) {
    const moves = findBeatingCombos(hand, target);
    if (moves.length === 0) return null;
    const normal = moves.filter((m) => !isBombCombo(m));
    // Chỉ dùng Heo/bom khi thật cần, tránh phá bom cho nước thường.
    const pool = normal.length > 0 ? normal : moves;
    return [...pool].sort(byCheapest)[0];
  }

  const all = findAllCombos(hand);
  // Dẫn bài: ưu tiên tổ hợp dài xả được nhiều bài, không dùng Heo/bom nếu còn lựa chọn.
  const safe = all.filter((combo) => !holdsPower(combo));
  const pool = safe.length > 0 ? safe : all;
  return (
    [...pool].sort((a, b) => a.value - b.value || b.cards.length - a.cards.length)[0] ?? null
  );
}

/**
 * AI chọn nước đi theo độ khó.
 * Trả về null nếu nên bỏ lượt.
 */
export function chooseMove(
  hand: Card[],
  target: Combo | null,
  difficulty: AiDifficulty = 'medium',
): Combo | null {
  switch (difficulty) {
    case 'easy':
      return easyMove(hand, target);
    case 'hard':
      return hardMove(hand, target);
    default:
      return mediumMove(hand, target);
  }
}

/** Gợi ý nước đi cho người chơi (nút "Gợi ý") — luôn dùng mức thông minh nhất. */
export function suggestMove(hand: Card[], target: Combo | null): Combo | null {
  return hardMove(hand, target);
}

export { cardValue };
