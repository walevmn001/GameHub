/** Bốn chất bài theo thứ tự sức mạnh: Bích < Chuồn < Rô < Cơ. */
export type Suit = 'spade' | 'club' | 'diamond' | 'heart';

/**
 * Hạng bài.
 * 3..10 giữ nguyên, 11=J, 12=Q, 13=K, 14=A, 15=2 (Heo).
 */
export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface Card {
  /** Định danh duy nhất, ví dụ "spade-3". */
  id: string;
  suit: Suit;
  rank: Rank;
}

/** Thứ tự chất dùng để so sánh khi cùng hạng. */
export const SUIT_ORDER: Record<Suit, number> = {
  spade: 0,
  club: 1,
  diamond: 2,
  heart: 3,
};

export const SUIT_SYMBOL: Record<Suit, string> = {
  spade: '\u2660',
  club: '\u2663',
  diamond: '\u2666',
  heart: '\u2665',
};

export const RANK_LABEL: Record<Rank, string> = {
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
  15: '2',
};

/** Loại tổ hợp bài hợp lệ trong Tiến Lên Miền Nam. */
export type ComboType = 'single' | 'pair' | 'triple' | 'straight' | 'four' | 'doubleStraight';

export interface Combo {
  type: ComboType;
  cards: Card[];
  /** Giá trị so sánh = giá trị lá cao nhất trong tổ hợp. */
  value: number;
  /** Số lá (với straight/doubleStraight là độ dài chuỗi). */
  length: number;
}
