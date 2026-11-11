import { SUIT_SYMBOL, type Card } from '@/types';

interface CardSkinArtworkProps {
  skinId: string;
  card: Card;
}

type ArtKind = 'ace' | 'face' | 'number';

interface ArtProps {
  kind: ArtKind;
  rank: number;
  suit: string;
  suitColor: string;
}

/** Phân loại lá bài để vẽ tranh: át = huy hiệu, J/Q/K = chân dung, còn lại = họa tiết. */
function artKind(rank: number): ArtKind {
  if (rank === 14) return 'ace';
  if (rank >= 11 && rank <= 13) return 'face';
  return 'number';
}

/** Tranh vector cho mặt bài; hạng và chất vẫn giữ nguyên ở các góc để dễ đọc. */
export function CardSkinArtwork({ skinId, card }: CardSkinArtworkProps) {
  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const suitColor = isRed ? '#be123c' : '#155e75';
  const suit = SUIT_SYMBOL[card.suit];
  const kind = artKind(card.rank);
  const artProps: ArtProps = { kind, rank: card.rank, suit, suitColor };

  let content: React.ReactNode = null;
  if (skinId === 'card-skin-sakura') content = <SakuraArt {...artProps} />;
  else if (skinId === 'card-skin-knight') content = <KnightArt {...artProps} />;
  else if (skinId === 'card-skin-dragon') content = <DragonArt {...artProps} />;
  else if (skinId === 'card-skin-monster') content = <MonsterArt {...artProps} />;
  else if (skinId === 'card-skin-vampire') content = <VampireArt {...artProps} />;

  if (!content) return null;

  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  );
}

/* ------------------------------- Họa tiết chung ------------------------------ */

function SuitSeal({ x, y, suit, color, size = 18 }: { x: number; y: number; suit: string; color: string; size?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={size} fontWeight="700">
      {suit}
    </text>
  );
}

function Blossom({ x, y, color, scale }: { x: number; y: number; color: string; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="-5" rx="3" ry="5" fill={color} />
      <ellipse cy="-5" rx="3" ry="5" fill={color} transform="rotate(72)" />
      <ellipse cy="-5" rx="3" ry="5" fill={color} transform="rotate(144)" />
      <ellipse cy="-5" rx="3" ry="5" fill={color} transform="rotate(216)" />
      <ellipse cy="-5" rx="3" ry="5" fill={color} transform="rotate(288)" />
      <circle r="2.2" fill="#fbbf24" />
    </g>
  );
}

/** Bố cục pip truyền thống cho lá số (2–10): mỗi hạng một cách xếp riêng. */
const PIP_LAYOUT: Record<number, ReadonlyArray<readonly [number, number]>> = {
  2: [[50, 40], [50, 100]],
  3: [[50, 40], [50, 70], [50, 100]],
  4: [[31, 40], [69, 40], [31, 100], [69, 100]],
  5: [[31, 40], [69, 40], [50, 70], [31, 100], [69, 100]],
  6: [[31, 40], [69, 40], [31, 70], [69, 70], [31, 100], [69, 100]],
  7: [[31, 40], [69, 40], [50, 55], [31, 70], [69, 70], [31, 100], [69, 100]],
  8: [[31, 40], [69, 40], [50, 52], [31, 70], [69, 70], [50, 88], [31, 100], [69, 100]],
  9: [[31, 40], [69, 40], [31, 58], [69, 58], [50, 70], [31, 82], [69, 82], [31, 100], [69, 100]],
  10: [[31, 40], [69, 40], [50, 50], [31, 58], [69, 58], [31, 82], [69, 82], [50, 90], [31, 100], [69, 100]],
};

/**
 * Lá số (2–10): rải pip theo bố cục bài Tây nên mỗi hạng trông rõ ràng khác nhau,
 * `decor` là lớp nền trang trí riêng của từng theme (vẽ phía sau pip).
 */
function PipField({
  rank,
  suit,
  color,
  accent,
  decor,
}: {
  rank: number;
  suit: string;
  color: string;
  accent: string;
  decor?: React.ReactNode;
}) {
  const pips = PIP_LAYOUT[rank] ?? PIP_LAYOUT[2];
  const fontSize = rank <= 3 ? 21 : rank <= 6 ? 16 : 14;
  return (
    <g>
      {decor}
      {pips.map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="700"
          fill={color}
          stroke={accent}
          strokeWidth="1.1"
          paintOrder="stroke"
        >
          {suit}
        </text>
      ))}
    </g>
  );
}

/** Khung huy chương tròn dùng cho chân dung J/Q/K của mọi theme. */
function Medallion({ ring, glow }: { ring: string; glow: string }) {
  return (
    <>
      <circle cx="50" cy="68" r="32" fill={glow} opacity="0.28" />
      <circle cx="50" cy="68" r="32" fill="none" stroke={ring} strokeWidth="2" />
      <circle cx="50" cy="68" r="27" fill="none" stroke={ring} strokeWidth="0.9" opacity="0.6" />
    </>
  );
}

/* --------------------------------- Sakura --------------------------------- */

function SakuraArt({ kind, rank, suit, suitColor }: ArtProps) {
  if (kind === 'ace') {
    return (
      <g opacity="0.95">
        <circle cx="50" cy="70" r="34" fill="#fdf2f8" opacity="0.7" />
        <circle cx="50" cy="70" r="34" fill="none" stroke="#f472b6" strokeWidth="2" />
        <circle cx="50" cy="70" r="29" fill="none" stroke="#f9a8d4" strokeWidth="1" />
        <Blossom x={50} y={74} color="#ec4899" scale={2.4} />
        <SuitSeal x={50} y={128} suit={suit} color={suitColor} size={15} />
      </g>
    );
  }
  if (kind === 'face') return <SakuraPortrait rank={rank} suit={suit} suitColor={suitColor} />;

  const blossomSpots: [number, number][] = [
    [20, 36], [80, 42], [76, 104], [24, 100], [16, 72], [84, 68],
  ];
  return (
    <PipField
      rank={rank}
      suit={suit}
      color={suitColor}
      accent="#fdf2f8"
      decor={
        <g opacity="0.28">
          <path
            d="M14 126C32 108 40 90 54 70S76 42 90 22M44 86 26 76M62 60 45 48M76 42 86 52"
            fill="none"
            stroke="#805b43"
            strokeLinecap="round"
            strokeWidth="3"
          />
          {blossomSpots.map(([x, y], i) => (
            <Blossom key={i} x={x} y={y} color={i % 2 === 0 ? '#f472b6' : '#fda4af'} scale={0.62} />
          ))}
        </g>
      }
    />
  );
}

function SakuraPortrait({ rank, suit, suitColor }: { rank: number; suit: string; suitColor: string }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  const robe = isKing ? '#831843' : isQueen ? '#db2777' : '#a16207';
  return (
    <g opacity="0.95">
      <Medallion ring="#f472b6" glow="#fbcfe8" />
      <path d="M28 96C32 79 40 73 50 73s18 6 22 23Z" fill={robe} />
      <circle cx="50" cy="54" r="13" fill="#ffe4e6" stroke="#f472b6" strokeWidth="1.5" />
      <path d="M37 53c0-9 6-15 13-15s13 6 13 15c-1-4-3-6-6-7-4 2-9 3-14 1-3 2-6 3-6 6Z" fill="#3f2b2b" />
      {isKing && <path d="M36 44l4-11 5 6 5-8 5 8 5-6 4 11Z" fill="#f4c7a1" stroke="#b76e79" strokeWidth="1.5" />}
      {isQueen && (
        <>
          <Blossom x={50} y={39} color="#fb7185" scale={0.85} />
          <path d="M38 45c4 3 20 3 24 0" fill="none" stroke="#be185d" strokeWidth="1.5" />
        </>
      )}
      {!isKing && !isQueen && <path d="M38 46h24" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />}
      <circle cx="45" cy="55" r="1.6" fill="#3f2b2b" />
      <circle cx="55" cy="55" r="1.6" fill="#3f2b2b" />
      <SuitSeal x={50} y={122} suit={suit} color={suitColor} size={14} />
    </g>
  );
}

/* --------------------------------- Knight --------------------------------- */

function KnightArt({ kind, rank, suit, suitColor }: ArtProps) {
  if (kind === 'ace') {
    return (
      <g opacity="0.95">
        <path d="M50 30 84 42 79 96 50 116 21 96 16 42Z" fill="#e2e8f0" stroke="#475569" strokeLinejoin="round" strokeWidth="3" />
        <path d="M50 40 74 49 70 90 50 105 30 90 26 49Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <path d="M50 44 57 74 50 98 43 74Z" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
        <path d="M38 62h24l-4 8H42Z" fill="#d4af37" stroke="#a16207" strokeWidth="1.5" />
        <SuitSeal x={50} y={128} suit={suit} color={suitColor} size={14} />
      </g>
    );
  }
  if (kind === 'face') return <KnightPortrait rank={rank} suit={suit} />;
  return (
    <PipField
      rank={rank}
      suit={suit}
      color={suitColor}
      accent="#f8fafc"
      decor={
        <g opacity="0.3">
          <circle cx="50" cy="70" r="32" fill="#e2e8f0" opacity="0.7" />
          <path d="M50 32 76 43 72 94 50 110 28 94 24 43Z" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <path d="M24 38 76 104M76 38 24 104" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="4" />
        </g>
      }
    />
  );
}

function KnightPortrait({ rank, suit }: { rank: number; suit: string }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  return (
    <g opacity="0.95">
      <Medallion ring="#64748b" glow="#cbd5e1" />
      <path d="M28 98C32 80 40 74 50 74s18 6 22 24Z" fill="#475569" stroke="#334155" strokeWidth="1.5" />
      <path d="M35 52 39 36 50 28 61 36 65 52 58 60 42 60Z" fill="#94a3b8" stroke="#334155" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M42 53 50 58 58 53" fill="none" stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" />
      {isQueen && (
        <path d="M32 40C24 36 20 28 22 20M68 40C76 36 80 28 78 20" fill="none" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="4" />
      )}
      {isKing && <path d="M36 30 40 18 46 24 50 14 54 24 60 18 64 30Z" fill="#d4af37" stroke="#a16207" strokeWidth="1.5" />}
      {!isKing && !isQueen && <path d="M50 28 50 16M44 22 50 16 56 22" fill="none" stroke="#dc2626" strokeLinecap="round" strokeWidth="3" />}
      <SuitSeal x={50} y={100} suit={suit} color={isRedSuit(suit) ? '#fecdd3' : '#e0f2fe'} size={13} />
    </g>
  );
}

/* --------------------------------- Dragon --------------------------------- */

function DragonArt({ kind, rank, suit, suitColor }: ArtProps) {
  if (kind === 'ace') {
    return (
      <g opacity="0.95">
        <circle cx="50" cy="70" r="33" fill="#064e3b" opacity="0.16" />
        <circle cx="50" cy="70" r="33" fill="none" stroke="#d6a84f" strokeWidth="2" />
        <path d="M50 40C64 40 76 50 76 68s-12 30-26 30-26-12-26-30 12-28 26-28Z" fill="#065f46" stroke="#d6a84f" strokeWidth="2" />
        <ellipse cx="50" cy="68" rx="9" ry="16" fill="#f59e0b" stroke="#7c2d12" strokeWidth="2" />
        <ellipse cx="50" cy="68" rx="3" ry="12" fill="#0b1220" />
        <circle cx="50" cy="60" r="2.4" fill="#fde68a" />
        <SuitSeal x={50} y={130} suit={suit} color={suitColor} size={14} />
      </g>
    );
  }
  if (kind === 'face') return <DragonPortrait rank={rank} suit={suit} />;
  return (
    <PipField
      rank={rank}
      suit={suit}
      color={suitColor}
      accent="#fde68a"
      decor={
        <g opacity="0.34">
          <circle cx="50" cy="70" r="34" fill="#064e3b" opacity="0.16" />
          <circle cx="50" cy="70" r="34" fill="none" stroke="#d6a84f" strokeWidth="2" />
          {[42, 58, 74, 90].map((y) => (
            <path key={y} d={`M30 ${y} l5 3 5 -3 5 3 5 -3 5 3 5 -3`} fill="none" stroke="#047857" strokeWidth="2" />
          ))}
        </g>
      }
    />
  );
}

function DragonPortrait({ rank, suit }: { rank: number; suit: string }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  return (
    <g opacity="0.95">
      <Medallion ring="#d6a84f" glow="#065f46" />
      <path d="M26 100C30 80 40 73 50 73s20 7 24 27Z" fill="#065f46" stroke="#d6a84f" strokeWidth="1.5" />
      <circle cx="50" cy="54" r="13" fill="#047857" stroke="#d6a84f" strokeWidth="1.5" />
      <path d="M50 40 42 26 50 30 58 26Z" fill="#a16207" stroke="#d6a84f" strokeWidth="1.5" />
      {isQueen && <path d="M34 42 26 30M66 42 74 30" fill="none" stroke="#d6a84f" strokeLinecap="round" strokeWidth="2.5" />}
      {isKing && (
        <path d="M36 42 40 30 46 36 50 26 54 36 60 30 64 42Z" fill="#d6a84f" stroke="#a16207" strokeWidth="1.4" />
      )}
      {isKing ? (
        <>
          <circle cx="50" cy="52" r="2" fill="#fbbf24" />
          <path d="M42 60q8 6 16 0" fill="none" stroke="#fbbf24" strokeWidth="1.6" />
        </>
      ) : (
        <>
          <circle cx="45" cy="54" r="1.8" fill="#fde68a" />
          <circle cx="55" cy="54" r="1.8" fill="#fde68a" />
        </>
      )}
      {!isKing && !isQueen && <path d="M22 92C30 84 40 88 46 96" fill="none" stroke="#d6a84f" strokeWidth="2" />}
      <SuitSeal x={50} y={100} suit={suit} color={isRedSuit(suit) ? '#fecaca' : '#fde68a'} size={13} />
    </g>
  );
}

/* --------------------------------- Monster --------------------------------- */

function MonsterArt({ kind, rank, suit, suitColor }: ArtProps) {
  if (kind === 'ace') {
    return (
      <g opacity="0.95">
        <circle cx="50" cy="70" r="33" fill="#a855f7" opacity="0.14" />
        <circle cx="50" cy="70" r="33" fill="none" stroke="#a3e635" strokeWidth="2.4" />
        <ellipse cx="50" cy="70" rx="22" ry="15" fill="#f8fafc" stroke="#a855f7" strokeWidth="2" />
        <circle cx="50" cy="70" r="8" fill="#22d3ee" />
        <circle cx="50" cy="70" r="3.4" fill="#0f172a" />
        <path d="M40 58 44 50M60 58 56 50M50 52 50 44" stroke="#a3e635" strokeLinecap="round" strokeWidth="2.4" />
        <SuitSeal x={50} y={130} suit={suit} color={suitColor} size={14} />
      </g>
    );
  }
  if (kind === 'face') return <MonsterPortrait rank={rank} suit={suit} />;
  return (
    <PipField
      rank={rank}
      suit={suit}
      color={suitColor}
      accent="#ecfccb"
      decor={
        <g opacity="0.4">
          <path d="M20 100C20 78 34 66 50 66s30 12 30 34Z" fill="#a3e635" stroke="#65a30d" strokeWidth="2" />
          {[28, 72].map((x) => (
            <circle key={x} cx={x} cy={34} r="3.4" fill="#a855f7" opacity="0.85" />
          ))}
          {[36, 64].map((x) => (
            <circle key={x} cx={x} cy={110} r="2.6" fill="#22d3ee" opacity="0.85" />
          ))}
        </g>
      }
    />
  );
}

function MonsterPortrait({ rank, suit }: { rank: number; suit: string }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  return (
    <g opacity="0.95">
      <Medallion ring="#a855f7" glow="#a3e635" />
      <path d="M28 100C32 80 40 74 50 74s18 6 22 26Z" fill="#7c3aed" stroke="#4c1d95" strokeWidth="1.5" />
      <circle cx="50" cy="54" r="13" fill="#bbf7d0" stroke="#a3e635" strokeWidth="1.5" />
      {isKing && <path d="M36 44 34 28M50 42 50 24M64 44 66 28" stroke="#facc15" strokeLinecap="round" strokeWidth="3.4" />}
      {isQueen && <path d="M34 40 50 20 66 40Z" fill="#7c3aed" stroke="#a855f7" strokeWidth="1.5" />}
      {!isKing && !isQueen && <path d="M36 46q14 -12 28 0Z" fill="#0ea5e9" stroke="#0369a1" strokeWidth="1.4" />}
      <circle cx="45" cy="54" r="2.4" fill="#0f172a" />
      <circle cx="55" cy="54" r="2.4" fill="#0f172a" />
      {isKing && <circle cx="50" cy="48" r="1.8" fill="#f43f5e" />}
      <path d="M44 62q6 4 12 0" fill="none" stroke="#4d7c0f" strokeLinecap="round" strokeWidth="2" />
      <SuitSeal x={50} y={100} suit={suit} color={isRedSuit(suit) ? '#a21caf' : '#4a044e'} size={13} />
    </g>
  );
}

/* --------------------------------- Vampire --------------------------------- */

function VampireArt({ kind, rank, suit, suitColor }: ArtProps) {
  if (kind === 'ace') {
    return (
      <g opacity="0.95">
        <circle cx="50" cy="66" r="32" fill="#be123c" opacity="0.88" />
        <circle cx="50" cy="66" r="32" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="40" cy="56" r="6" fill="#e11d48" opacity="0.5" />
        <circle cx="60" cy="74" r="9" fill="#7f1d1d" opacity="0.5" />
        <circle cx="54" cy="60" r="5" fill="#9f1239" opacity="0.55" />
        <path d="M28 84q6 -8 12 0 6 -8 12 0 6 -8 12 0" fill="none" stroke="#0b0b12" strokeLinecap="round" strokeWidth="3" />
        <SuitSeal x={50} y={128} suit={suit} color={suitColor} size={14} />
      </g>
    );
  }
  if (kind === 'face') return <VampirePortrait rank={rank} suit={suit} />;
  return (
    <PipField
      rank={rank}
      suit={suit}
      color={suitColor}
      accent="#f8fafc"
      decor={
        <g opacity="0.36">
          <circle cx="50" cy="70" r="31" fill="#be123c" opacity="0.22" />
          <circle cx="50" cy="70" r="31" fill="none" stroke="#cbd5e1" strokeWidth="1.6" />
          <path d="M22 110 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0" fill="none" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="2.2" />
        </g>
      }
    />
  );
}

function VampirePortrait({ rank, suit }: { rank: number; suit: string }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  return (
    <g opacity="0.95">
      <Medallion ring="#be123c" glow="#4c1d95" />
      <path d="M26 100 34 74 50 82 66 74 74 100Z" fill="#1e1b4b" stroke="#be123c" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="13" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M37 50c0-9 6-15 13-15s13 6 13 15c-2-5-5-7-8-8-3 3-9 4-13 2-2 2-5 3-5 6Z" fill="#1e1b4b" />
      {isKing && (
        <path d="M36 42 36 28 44 34 50 24 56 34 64 28 64 42Z" fill="#7f1d1d" stroke="#cbd5e1" strokeWidth="1.2" />
      )}
      {isQueen && <path d="M38 42 50 26 62 42Z" fill="#4c1d95" stroke="#cbd5e1" strokeWidth="1.2" />}
      {!isKing && !isQueen && <path d="M30 40h40" stroke="#0b0b12" strokeWidth="4" strokeLinecap="round" />}
      <circle cx="45" cy="53" r="1.7" fill="#be123c" />
      <circle cx="55" cy="53" r="1.7" fill="#be123c" />
      <path d="M45 61 45 66 48 61M52 61 55 66 55 61" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
      <SuitSeal x={50} y={100} suit={suit} color={isRedSuit(suit) ? '#fecdd3' : '#e9d5ff'} size={13} />
    </g>
  );
}

function isRedSuit(suit: string): boolean {
  return suit === '♥' || suit === '♦';
}

/* ------------------------------- Mặt lưng bài ------------------------------ */

/** Họa tiết mặt lưng đối xứng riêng cho từng theme; không chứa hạng/chất. */
export function CardSkinBack({ skinId }: { skinId: string }) {
  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {skinId === 'card-skin-sakura' && (
        <g opacity="0.95">
          <path d="M50 20 80 70 50 120 20 70Z" fill="none" stroke="#fb7185" strokeWidth="1.4" opacity="0.6" />
          <path d="M50 30 70 70 50 110 30 70Z" fill="none" stroke="#fdba74" strokeWidth="1" opacity="0.55" />
          <Blossom x={50} y={70} color="#f472b6" scale={1.4} />
          <Blossom x={50} y={38} color="#fda4af" scale={0.7} />
          <Blossom x={50} y={102} color="#fda4af" scale={0.7} />
          <Blossom x={30} y={70} color="#f9a8d4" scale={0.65} />
          <Blossom x={70} y={70} color="#f9a8d4" scale={0.65} />
        </g>
      )}
      {skinId === 'card-skin-knight' && (
        <g opacity="0.95">
          <path d="M50 26 78 38 74 92 50 112 26 92 22 38Z" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M50 36 70 45 67 88 50 102 33 88 30 45Z" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M30 40 70 100M70 40 30 100" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="3" opacity="0.8" />
          <path d="M50 58 58 70 50 84 42 70Z" fill="#d4af37" stroke="#a16207" strokeWidth="1.2" />
        </g>
      )}
      {skinId === 'card-skin-dragon' && (
        <g opacity="0.95">
          <path d="M50 20 80 70 50 120 20 70Z" fill="none" stroke="#d6a84f" strokeWidth="1.6" opacity="0.7" />
          {[34, 48, 62, 76, 90].map((y) => (
            <path key={y} d={`M32 ${y} l6 4 6 -4 6 4 6 -4 6 4 6 -4`} fill="none" stroke="#047857" strokeWidth="1.6" opacity="0.8" />
          ))}
          <circle cx="50" cy="70" r="14" fill="#065f46" stroke="#d6a84f" strokeWidth="1.6" />
          <ellipse cx="50" cy="70" rx="3.4" ry="9" fill="#0b1220" />
          <circle cx="50" cy="64" r="1.8" fill="#fde68a" />
        </g>
      )}
      {skinId === 'card-skin-monster' && (
        <g opacity="0.95">
          <path d="M24 96C24 74 36 62 50 62s26 12 26 34Z" fill="#a3e635" stroke="#65a30d" strokeWidth="1.6" opacity="0.5" />
          <circle cx="50" cy="70" r="22" fill="none" stroke="#22d3ee" strokeWidth="1.6" opacity="0.8" />
          <ellipse cx="50" cy="70" rx="12" ry="9" fill="#f8fafc" />
          <circle cx="50" cy="70" r="4.4" fill="#22d3ee" />
          <circle cx="50" cy="70" r="1.8" fill="#0f172a" />
          {[30, 70].map((x) => (
            <circle key={x} cx={x} cy={34} r="3" fill="#a855f7" opacity="0.8" />
          ))}
          {[26, 74].map((x) => (
            <circle key={x} cx={x} cy={106} r="3" fill="#facc15" opacity="0.8" />
          ))}
        </g>
      )}
      {skinId === 'card-skin-vampire' && (
        <g opacity="0.95">
          <circle cx="50" cy="58" r="24" fill="none" stroke="#cbd5e1" strokeWidth="1.4" opacity="0.6" />
          <circle cx="50" cy="58" r="18" fill="#be123c" opacity="0.85" />
          <circle cx="43" cy="52" r="4" fill="#7f1d1d" opacity="0.6" />
          <path d="M26 92 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0" fill="none" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="2.4" />
          <path d="M36 118 44 104 50 114 56 104 64 118Z" fill="#1e1b4b" stroke="#be123c" strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
}
