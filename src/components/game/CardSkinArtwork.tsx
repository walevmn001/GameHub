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

/**
 * Bộ "Rồng" vẽ theo phong cách thẻ TCG: khung viền dát vàng, ô tên, hàng sao
 * cấp, cửa sổ tranh, thanh hệ và ô mô tả kèm chỉ số ATK/DEF. Hạng/chất vẫn hiện
 * ở hai góc thẻ (do `PlayCard` vẽ) nên vẫn dễ đọc khi chơi.
 */
const DRAGON_NAMES: Record<number, string> = {
  3: 'Kim Long',
  4: 'Thổ Long',
  5: 'Thủy Long',
  6: 'Băng Long',
  7: 'Phong Long',
  8: 'Lôi Long',
  9: 'Hỏa Long',
  10: 'Cổ Long',
  11: 'Long Kỵ Sĩ',
  12: 'Long Hậu',
  13: 'Long Vương',
  14: 'Rồng Thần',
  15: 'Thiên Long',
};

/** Tên tiếng Việt của chất để in lên thanh hệ. */
const SUIT_NAME_VN: Record<string, string> = {
  '♠': 'BÍCH',
  '♣': 'CHUỒN',
  '♦': 'RÔ',
  '♥': 'CƠ',
};

function dragonLevel(rank: number): number {
  return Math.min(Math.max(rank - 2, 1), 12);
}

/** Khung thẻ TCG dùng chung cho mọi lá của bộ Rồng. */
function DragonFrame({ rank, suit, children }: { rank: number; suit: string; children: React.ReactNode }) {
  const name = DRAGON_NAMES[rank] ?? 'Rồng';
  const level = dragonLevel(rank);
  const suitName = SUIT_NAME_VN[suit] ?? '';
  const atk = 800 + (rank - 2) * 320;
  const def = 600 + (rank - 2) * 260;

  return (
    <g>
      <defs>
        <linearGradient id="dragonFrame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b3b2b" />
          <stop offset="0.5" stopColor="#065f46" />
          <stop offset="1" stopColor="#0b3b2b" />
        </linearGradient>
        <linearGradient id="dragonGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e2a8" />
          <stop offset="0.5" stopColor="#d6a84f" />
          <stop offset="1" stopColor="#9c713b" />
        </linearGradient>
        <linearGradient id="dragonArt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1f17" />
          <stop offset="1" stopColor="#03211a" />
        </linearGradient>
        <clipPath id="dragonArtClip">
          <rect x="7" y="24" width="86" height="58" rx="2.5" />
        </clipPath>
      </defs>

      {/* Thân thẻ và viền dát vàng */}
      <rect x="2.5" y="2.5" width="95" height="135" rx="7" fill="url(#dragonFrame)" stroke="url(#dragonGold)" strokeWidth="1.6" />
      <rect x="6" y="6" width="88" height="128" rx="4.5" fill="#04160f" opacity="0.5" />

      {/* Ô tên — chừa góc phải cho biểu tượng bộ (do PlayCard vẽ) */}
      <rect x="16" y="5.5" width="70" height="12" rx="3" fill="url(#dragonGold)" opacity="0.92" />
      <rect x="16" y="5.5" width="70" height="12" rx="3" fill="none" stroke="#7c5a22" strokeWidth="0.7" />
      <text x="51" y="14.2" textAnchor="middle" fontSize="8.4" fontWeight="700" fill="#1b2a12" fontFamily="Georgia, serif">
        {name}
      </text>

      {/* Hàng sao cấp */}
      {Array.from({ length: level }).map((_, i) => (
        <path
          key={i}
          transform={`translate(${92 - i * 6.2} 21.5) scale(0.32)`}
          d="M0-8 2.4-2.6 8-2 3.8 1.9 5 7.4 0 4.4-5 7.4-3.8 1.9-8-2-2.4-2.6Z"
          fill="#f5d78a"
          stroke="#a16207"
          strokeWidth="1.3"
        />
      ))}

      {/* Cửa sổ tranh */}
      <rect x="7" y="24" width="86" height="58" rx="2.5" fill="url(#dragonArt)" />
      <g clipPath="url(#dragonArtClip)">{children}</g>
      <rect x="7" y="24" width="86" height="58" rx="2.5" fill="none" stroke="url(#dragonGold)" strokeWidth="1.3" />

      {/* Thanh hệ */}
      <rect x="6" y="84" width="88" height="9" rx="2.5" fill="#0b3b2b" stroke="url(#dragonGold)" strokeWidth="0.7" />
      <text x="50" y="90.3" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="#f5e6b8" letterSpacing="0.4">
        {`RỒNG / HỆ ${suitName}`}
      </text>

      {/* Ô mô tả và chỉ số */}
      <rect x="6" y="95" width="88" height="22" rx="2.5" fill="#0a2a1f" stroke="#1f5b47" strokeWidth="0.7" />
      <text x="9" y="101.4" fontSize="4.4" fill="#bfe3cf">Khi lá bài này được đánh ra, rồng phun</text>
      <text x="9" y="106.6" fontSize="4.4" fill="#bfe3cf">lửa thiêu rụi mọi thế lực cản đường.</text>
      <text x="9" y="113.4" fontSize="5.4" fontWeight="700" fill="#f5d78a">{`ATK/${atk}`}</text>
      <text x="91" y="113.4" textAnchor="end" fontSize="5.4" fontWeight="700" fill="#f5d78a">{`DEF/${def}`}</text>
    </g>
  );
}

function DragonArt({ kind, rank, suit }: ArtProps) {
  return (
    <DragonFrame rank={rank} suit={suit}>
      {kind === 'ace' ? <DragonEmblemArt /> : kind === 'face' ? <DragonFaceArt rank={rank} /> : <DragonPipArt rank={rank} suit={suit} />}
    </DragonFrame>
  );
}

/** Át: huy hiệu đầu rồng. */
function DragonEmblemArt() {
  return (
    <g>
      <circle cx="50" cy="52" r="23" fill="#064e3b" opacity="0.6" />
      <circle cx="50" cy="52" r="23" fill="none" stroke="#d6a84f" strokeWidth="1.3" />
      <path d="M28 40 17 34 30 53Z" fill="#065f46" stroke="#d6a84f" strokeWidth="0.9" />
      <path d="M72 40 83 34 70 53Z" fill="#065f46" stroke="#d6a84f" strokeWidth="0.9" />
      <path d="M50 30C60 30 68 38 68 52s-8 22-18 22-18-9-18-22 8-22 18-22Z" fill="#047857" stroke="#d6a84f" strokeWidth="1.3" />
      <path d="M50 32 42 21 50 25 58 21Z" fill="#a16207" stroke="#d6a84f" strokeWidth="1" />
      <ellipse cx="50" cy="53" rx="6.6" ry="12" fill="#f59e0b" stroke="#7c2d12" strokeWidth="1.2" />
      <ellipse cx="50" cy="53" rx="2.2" ry="9" fill="#0b1220" />
      <circle cx="50" cy="46" r="1.8" fill="#fde68a" />
      <text x="50" y="78.5" textAnchor="middle" fontSize="4.6" fill="#f5d78a" letterSpacing="0.6">
        DRAGON EMPEROR
      </text>
    </g>
  );
}

/** J/Q/K: chân dung rồng (vương miện / triều thiên / cặp sừng). */
function DragonFaceArt({ rank }: { rank: number }) {
  const isKing = rank === 13;
  const isQueen = rank === 12;
  return (
    <g>
      <circle cx="50" cy="50" r="24" fill="#065f46" opacity="0.4" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#d6a84f" strokeWidth="1" opacity="0.55" />
      <path d="M35 80C38 63 44 58 50 58s12 5 15 22Z" fill="#047857" stroke="#d6a84f" strokeWidth="1.1" />
      <circle cx="50" cy="44" r="10.5" fill="#059669" stroke="#d6a84f" strokeWidth="1.2" />
      {isKing ? (
        <path d="M39 32 42 23 46 29 50 21 54 29 58 23 61 32Z" fill="#d6a84f" stroke="#a16207" strokeWidth="0.9" />
      ) : isQueen ? (
        <path d="M41 31 50 20 59 31Z" fill="#d6a84f" stroke="#a16207" strokeWidth="0.9" />
      ) : (
        <>
          <path d="M50 33 43 23 50 27 57 23Z" fill="#a16207" stroke="#d6a84f" strokeWidth="1" />
          <path d="M30 36 22 27M70 36 78 27" stroke="#d6a84f" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      <circle cx="46" cy="44" r="1.7" fill="#fde68a" />
      <circle cx="54" cy="44" r="1.7" fill="#fde68a" />
      <path d="M45 51q5 4 10 0" fill="none" stroke="#f5d78a" strokeWidth="1.1" />
    </g>
  );
}

/** Lá số (2–10): rải pip cách điệu trong cửa sổ tranh nên mỗi hạng khác nhau. */
function DragonPipArt({ rank, suit }: { rank: number; suit: string }) {
  const pips = PIP_LAYOUT[rank] ?? PIP_LAYOUT[2];
  const fontSize = rank <= 3 ? 17 : rank <= 6 ? 13 : 11;
  return (
    <g transform="translate(50 53) scale(0.72) translate(-50 -70)">
      <circle cx="50" cy="70" r="46" fill="#064e3b" opacity="0.3" />
      <circle cx="50" cy="70" r="46" fill="none" stroke="#d6a84f" strokeWidth="1.6" opacity="0.5" />
      {pips.map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="700"
          fill="#f5d78a"
          stroke="#7c2d12"
          strokeWidth="1.1"
          paintOrder="stroke"
        >
          {suit}
        </text>
      ))}
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
          {/* Khung viền dát vàng cho khớp phong cách thẻ TCG của bộ Rồng */}
          <rect x="10" y="14" width="80" height="112" rx="5" fill="none" stroke="#d6a84f" strokeWidth="1.4" opacity="0.75" />
          <rect x="14" y="18" width="72" height="104" rx="3.5" fill="none" stroke="#047857" strokeWidth="1" opacity="0.7" />
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

/* ---------------------------------- Joker --------------------------------- */
/** Biến thể Joker: đỏ rực rỡ hoặc đen huyền bí (mỗi theme đều có đủ 2 lá). */
export type JokerVariant = 'red' | 'black';

interface JokerPalette {
  /** Màu nhấn sáng (mũ, cổ áo) — dùng cho lá Joker đỏ. */
  bright: string;
  /** Màu tối chủ đạo của theme — dùng cho lá Joker đen. */
  dark: string;
  /** Quầng sáng / màu phụ của theme. */
  halo: string;
  /** Họa tiết nhỏ đặc trưng theme ở chân tranh. */
  motif: React.ReactNode;
}

const JOKER_PALETTES: Record<string, JokerPalette> = {
  'card-skin-sakura': {
    bright: '#ec4899',
    dark: '#831843',
    halo: '#fbcfe8',
    motif: <Blossom x={50} y={120} color="#ec4899" scale={0.85} />,
  },
  'card-skin-knight': {
    bright: '#94a3b8',
    dark: '#334155',
    halo: '#e2e8f0',
    motif: <path d="M50 110 59 120 50 132 41 120Z" fill="#d4af37" stroke="#a16207" strokeWidth="1.2" />,
  },
  'card-skin-dragon': {
    bright: '#d6a84f',
    dark: '#064e3b',
    halo: '#fde68a',
    motif: (
      <g>
        <circle cx="50" cy="120" r="10" fill="#065f46" stroke="#d6a84f" strokeWidth="1.4" />
        <ellipse cx="50" cy="120" rx="2.4" ry="6.5" fill="#0b1220" />
        <circle cx="50" cy="115" r="1.5" fill="#fde68a" />
      </g>
    ),
  },
  'card-skin-monster': {
    bright: '#a3e635',
    dark: '#4a044e',
    halo: '#22d3ee',
    motif: (
      <g>
        <circle cx="50" cy="120" r="10" fill="#f8fafc" stroke="#a855f7" strokeWidth="1.6" />
        <circle cx="50" cy="120" r="3.6" fill="#22d3ee" />
        <circle cx="50" cy="120" r="1.5" fill="#0f172a" />
      </g>
    ),
  },
  'card-skin-vampire': {
    bright: '#be123c',
    dark: '#1e1b4b',
    halo: '#cbd5e1',
    motif: <path d="M38 130 45 116 50 124 55 116 62 130Z" fill="#1e1b4b" stroke="#be123c" strokeWidth="1.2" />,
  },
};

/** Tranh Joker: chú hề (jester) với màu/nhạc nền theo theme, 2 biến thể đỏ & đen. */
export function CardSkinJoker({ skinId, variant }: { skinId: string; variant: JokerVariant }) {
  const theme = JOKER_PALETTES[skinId] ?? JOKER_PALETTES['card-skin-sakura'];
  const isRed = variant === 'red';
  const hatA = isRed ? theme.bright : theme.dark;
  const hatB = isRed ? theme.dark : theme.halo;
  const face = isRed ? '#fff7ed' : '#e2e8f0';
  const ink = isRed ? theme.dark : '#0f172a';
  const bell = isRed ? '#facc15' : theme.halo;

  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <g opacity="0.98">
        <circle cx="50" cy="64" r="40" fill={theme.halo} opacity="0.18" />
        {/* Mũ hề 3 chóp + chuông */}
        <path d="M34 56 26 24 42 42Z" fill={hatA} stroke={ink} strokeLinejoin="round" strokeWidth="1.4" />
        <path d="M50 52 50 18 62 36Z" fill={hatB} stroke={ink} strokeLinejoin="round" strokeWidth="1.4" />
        <path d="M66 56 74 24 58 42Z" fill={hatA} stroke={ink} strokeLinejoin="round" strokeWidth="1.4" />
        <circle cx="26" cy="22" r="3" fill={bell} stroke={ink} strokeWidth="0.8" />
        <circle cx="50" cy="16" r="3" fill={bell} stroke={ink} strokeWidth="0.8" />
        <circle cx="74" cy="22" r="3" fill={bell} stroke={ink} strokeWidth="0.8" />
        <path d="M33 54q17 -9 34 0l-3 9q-14 -7 -28 0Z" fill={hatB} stroke={ink} strokeWidth="1.2" />
        {/* Mặt */}
        <circle cx="50" cy="66" r="15" fill={face} stroke={ink} strokeWidth="1.6" />
        <circle cx="44" cy="63" r="2" fill={ink} />
        <circle cx="56" cy="63" r="2" fill={ink} />
        <path d="M43 72q7 6 14 0" fill="none" stroke={ink} strokeLinecap="round" strokeWidth="2" />
        {/* Cổ áo */}
        <path d="M32 100 50 86 68 100 68 107 32 107Z" fill={hatA} stroke={ink} strokeWidth="1.2" />
        {theme.motif}
      </g>
    </svg>
  );
}
