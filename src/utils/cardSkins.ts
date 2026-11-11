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
  },
  'card-skin-dragon': {
    id: 'card-skin-dragon',
    name: 'Rồng',
    mark: '🐉',
    faceClass: 'border-amber-400 bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-100',
    backClass: 'border-amber-300 bg-emerald-950 bg-[repeating-linear-gradient(135deg,rgba(251,191,36,0.6)_0px,rgba(251,191,36,0.6)_2px,transparent_2px,transparent_7px)]',
    innerClass: 'border-amber-200/80',
    previewClass: 'from-emerald-500 via-teal-700 to-amber-500',
    redTextClass: 'text-red-700',
    blackTextClass: 'text-emerald-950',
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
};

export function getCardSkinTheme(id?: string | null): CardSkinTheme | undefined {
  return id ? CARD_SKINS[id] : undefined;
}
