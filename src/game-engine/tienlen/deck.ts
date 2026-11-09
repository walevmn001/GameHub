import { SUIT_ORDER, type Card, type Rank, type Suit } from '@/types';

const RANKS: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const SUITS: Suit[] = ['spade', 'club', 'diamond', 'heart'];

/** Số lá mỗi người chơi nhận, dù bàn có 2, 3 hay 4 người. */
export const CARDS_PER_PLAYER = 13;

/** Giá trị so sánh của lá bài: hạng quan trọng hơn chất. */
export function cardValue(card: Card): number {
  return card.rank * 4 + SUIT_ORDER[card.suit];
}

/** Tạo bộ bài 52 lá đã sắp theo thứ tự chuẩn (3♠ … 2♥). */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank });
    }
  }
  return deck;
}

/** Xáo trộn Fisher–Yates. Có thể truyền rng tùy biến để kiểm thử. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Sắp bài tăng dần (3 trước, 2 sau). */
export function sortAscending(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => cardValue(a) - cardValue(b));
}

/** Sắp bài giảm dần (2 trước, 3 sau). */
export function sortDescending(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => cardValue(b) - cardValue(a));
}

/** Sắp xếp theo hạng rồi theo chất — dùng cho hiển thị thân thiện. */
export function sortByRank(cards: Card[]): Card[] {
  return sortAscending(cards);
}

/**
 * Chia bài cho n người, mỗi người 13 lá (chia lần lượt theo vòng ngược kim đồng hồ).
 * Phần bài dư (bàn 2 hoặc 3 người) không được sử dụng.
 */
export function dealCards(playerCount = 4, rng: () => number = Math.random): Card[][] {
  const invalidCount = playerCount < 2 || playerCount > 4;
  const count = invalidCount ? 4 : playerCount;
  const deck = shuffle(createDeck(), rng);
  const hands: Card[][] = Array.from({ length: count }, () => []);
  const total = count * CARDS_PER_PLAYER;
  for (let i = 0; i < total; i += 1) {
    hands[i % count].push(deck[i]);
  }
  return hands.map((hand) => sortAscending(hand));
}

/**
 * Tìm người đi trước: người giữ lá 3♠.
 * Với bàn 2–3 người, 3♠ có thể nằm trong phần bài dư — khi đó người giữ lá nhỏ nhất đi trước.
 */
export function findStartingPlayer(hands: Card[][]): number {
  const holder = hands.findIndex((hand) => hand.some((card) => card.id === 'spade-3'));
  if (holder !== -1) return holder;

  let bestSeat = 0;
  let bestValue = Number.POSITIVE_INFINITY;
  hands.forEach((hand, seat) => {
    for (const card of hand) {
      const value = cardValue(card);
      if (value < bestValue) {
        bestValue = value;
        bestSeat = seat;
      }
    }
  });
  return bestSeat;
}
