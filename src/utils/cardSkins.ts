import { RANK_LABEL, type Card, type Suit } from '@/types/game';

export interface CardSkinTheme {
  id: string;
  name: string;
  mark: string;
  faceClass: string;
  backClass: string;
  innerClass: string;
  previewClass: string;
  redTextClass: string;
  blackTextClass: string;
  /**
   * Thư mục ảnh SVG dựng sẵn trong `public/` (so với gốc site). Có trường này thì
   * skin dùng ảnh thay cho tranh vẽ procedural: mặt/mặt lưng/Joker đều lấy từ đây.
   */
  imageDeck?: string;
}

/** Cosmetic-only themes. Rank and suit remain unchanged for fair, readable play. */
export const CARD_SKINS: Record<string, CardSkinTheme> = {
  'card-skin-sakura': {
    id: 'card-skin-sakura',
    name: 'Hoa anh đào',
    mark: '🌸',
    faceClass: 'border-rose-300 bg-gradient-to-br from-rose-100 via-white to-pink-100',
    backClass: 'border-rose-200 bg-rose-950 bg-[repeating-linear-gradient(45deg,rgba(251,113,133,0.65)_0px,rgba(251,113,133,0.65)_2px,transparent_2px,transparent_6px)]',
    innerClass: 'border-rose-100/80',
    previewClass: 'from-rose-500 via-pink-600 to-rose-950',
    redTextClass: 'text-rose-700',
    blackTextClass: 'text-slate-900',
    imageDeck: 'card-skins/sakura',
  },
  'card-skin-dragon': {
    id: 'card-skin-dragon',
    name: 'Rồng',
    mark: '🐉',
    // Khung TCG nền xanh thẫm; nền thẻ trùng màu viền để không lộ dải sáng do tỉ lệ khung.
    faceClass: 'border-amber-400 bg-[#0b3b2b]',
    backClass: 'border-amber-300 bg-emerald-950 bg-[repeating-linear-gradient(135deg,rgba(251,191,36,0.6)_0px,rgba(251,191,36,0.6)_2px,transparent_2px,transparent_7px)]',
    innerClass: 'border-amber-200/80',
    previewClass: 'from-emerald-500 via-teal-700 to-amber-500',
    redTextClass: 'text-rose-300',
    blackTextClass: 'text-amber-100',
  },
  'card-skin-knight': {
    id: 'card-skin-knight',
    name: 'Hiệp sĩ',
    mark: '⚔',
    faceClass: 'border-slate-400 bg-gradient-to-br from-slate-200 via-white to-sky-100',
    backClass: 'border-slate-300 bg-slate-900 bg-[repeating-linear-gradient(45deg,rgba(203,213,225,0.55)_0px,rgba(203,213,225,0.55)_2px,transparent_2px,transparent_7px)]',
    innerClass: 'border-slate-200/80',
    previewClass: 'from-slate-300 via-indigo-700 to-slate-950',
    redTextClass: 'text-rose-600',
    blackTextClass: 'text-slate-900',
  },
  'card-skin-monster': {
    id: 'card-skin-monster',
    name: 'Thế giới quái vật',
    mark: '👾',
    faceClass: 'border-lime-400 bg-gradient-to-br from-lime-100 via-cyan-50 to-purple-100',
    backClass: 'border-purple-300 bg-purple-950 bg-[repeating-linear-gradient(45deg,rgba(163,230,53,0.55)_0px,rgba(163,230,53,0.55)_2px,transparent_2px,transparent_7px)]',
    innerClass: 'border-lime-200/70',
    previewClass: 'from-lime-400 via-purple-600 to-cyan-500',
    redTextClass: 'text-fuchsia-700',
    blackTextClass: 'text-purple-950',
  },
  'card-skin-vampire': {
    id: 'card-skin-vampire',
    name: 'Trăng máu',
    mark: '🧛',
    faceClass: 'border-purple-400 bg-gradient-to-br from-rose-100 via-slate-100 to-purple-100',
    backClass: 'border-rose-400 bg-[#140a1f] bg-[repeating-linear-gradient(135deg,rgba(190,18,60,0.62)_0px,rgba(190,18,60,0.62)_2px,transparent_2px,transparent_7px)]',
    innerClass: 'border-rose-300/60',
    previewClass: 'from-rose-600 via-purple-800 to-black',
    redTextClass: 'text-rose-700',
    blackTextClass: 'text-purple-950',
  },
};

export function getCardSkinTheme(id?: string | null): CardSkinTheme | undefined {
  return id ? CARD_SKINS[id] : undefined;
}

/* ----------------------- Ảnh dựng sẵn cho skin (Sakura) ---------------------- */

/** Tên thư mục theo chất trong bộ ảnh dựng sẵn (vd `spades-A.svg`). */
const SUIT_FILE: Record<Suit, string> = {
  spade: 'spades',
  club: 'clubs',
  diamond: 'diamonds',
  heart: 'hearts',
};

function deckBase(skinId: string | null | undefined): string | null {
  const deck = getCardSkinTheme(skinId)?.imageDeck;
  return deck ? `${import.meta.env.BASE_URL}${deck}` : null;
}

/** URL mặt bài từ bộ ảnh dựng sẵn; `null` nếu skin được vẽ procedural. */
export function cardSkinFaceUrl(skinId: string | null | undefined, card: Card): string | null {
  const base = deckBase(skinId);
  return base ? `${base}/${SUIT_FILE[card.suit]}-${RANK_LABEL[card.rank]}.svg` : null;
}

/** URL mặt lưng bài từ bộ ảnh dựng sẵn; `null` nếu skin được vẽ procedural. */
export function cardSkinBackUrl(skinId: string | null | undefined): string | null {
  const base = deckBase(skinId);
  return base ? `${base}/card-back.svg` : null;
}

/** URL lá Joker từ bộ ảnh dựng sẵn (`red` → joker-1, `black` → joker-2). */
export function cardSkinJokerUrl(
  skinId: string | null | undefined,
  variant: 'red' | 'black',
): string | null {
  const base = deckBase(skinId);
  return base ? `${base}/${variant === 'red' ? 'joker-1' : 'joker-2'}.svg` : null;
}
