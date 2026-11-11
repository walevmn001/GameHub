import { SUIT_SYMBOL, type Card } from '@/types';

interface CardSkinArtworkProps {
  skinId: string;
  card: Card;
}

/** Tranh vector cho mặt bài; hạng và chất vẫn giữ ở các góc. */
export function CardSkinArtwork({ skinId, card }: CardSkinArtworkProps) {
  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const suitColor = isRed ? '#be123c' : '#155e75';
  const suit = SUIT_SYMBOL[card.suit];

  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {skinId === 'card-skin-sakura' && (
        <g opacity="0.88">
          <path
            d="M12 124C32 105 40 87 53 68S75 39 89 19M42 84 25 75M60 59 43 47M73 41 83 50M30 103 17 99"
            fill="none"
            stroke="#805b43"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M20 77 13 69M44 48 39 37M82 49 92 48M18 100 9 104"
            fill="none"
            stroke="#805b43"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <Blossom x={14} y={66} color={isRed ? '#f472b6' : '#c4b5fd'} scale={0.8} />
          <Blossom x={39} y={35} color={isRed ? '#fb7185' : '#a5b4fc'} scale={0.75} />
          <Blossom x={91} y={46} color={isRed ? '#f9a8d4' : '#c4b5fd'} scale={0.8} />
          <Blossom x={8} y={106} color={isRed ? '#fda4af' : '#a5b4fc'} scale={0.65} />
          <Blossom x={55} y={68} color={isRed ? '#f472b6' : '#c4b5fd'} scale={0.55} />
          <circle cx="73" cy="98" r="17" fill="#fb7185" opacity="0.1" />
          <text x="73" y="104" textAnchor="middle" fill={suitColor} fontSize="19" fontWeight="700">
            {suit}
          </text>
        </g>
      )}

      {skinId === 'card-skin-dragon' && (
        <g opacity="0.9" transform={card.rank % 2 === 0 ? 'translate(100 0) scale(-1 1)' : undefined}>
          <path
            d="M16 112C29 97 57 111 68 94 79 77 52 72 38 65 20 56 34 37 51 39 65 40 73 50 70 61"
            fill="none"
            stroke="#064e3b"
            strokeLinecap="round"
            strokeWidth="13"
          />
          <path
            d="M16 112C29 97 57 111 68 94 79 77 52 72 38 65 20 56 34 37 51 39 65 40 73 50 70 61"
            fill="none"
            stroke="#d6a84f"
            strokeLinecap="round"
            strokeWidth="1.5"
            strokeDasharray="2 5"
          />
          <path d="m61 49 7-15 7 11 12-4-5 11 8 8-14-1-7 9-3-12Z" fill="#047857" stroke="#d6a84f" strokeWidth="2" />
          <path d="m66 38-5-12 13 7M78 41l9-11 1 15" fill="#92400e" stroke="#d6a84f" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="79" cy="51" r="2.3" fill="#fbbf24" />
          <path d="m27 103 5 4m7-7 5 4m5-6 5 3m-7-42 5 2m8 4 5 3" stroke="#fcd34d" strokeLinecap="round" strokeWidth="2" />
          <path d="M15 119c12-5 21 0 27 8M83 77c8 5 10 12 8 19" fill="none" stroke="#b45309" strokeLinecap="round" strokeWidth="2" />
          <text x="26" y="76" textAnchor="middle" fill={suitColor} fontSize="18" fontWeight="700">
            {suit}
          </text>
        </g>
      )}

      {skinId === 'card-skin-knight' && (
        <g opacity="0.9">
          <path d="m21 111 58-71M15 113l12 10m-8-15 13 10M72 32l13 11" stroke="#64748b" strokeLinecap="round" strokeWidth="4" />
          <path d="m22 28 7 12-8 3-7-12ZM78 112l-7-12 8-3 7 12Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <path d="M50 46 76 56 72 88 50 106 28 88 24 56Z" fill="#cbd5e1" stroke="#475569" strokeLinejoin="round" strokeWidth="3" />
          <path d="M50 53 68 60 65 84 50 97 35 84 32 60Z" fill="#475569" stroke="#e2e8f0" strokeWidth="2" />
          <path d="m50 58 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#fbbf24" opacity="0.9" />
          <path d="M35 50 39 34 50 26 61 34 65 50 58 58 42 58Z" fill="#94a3b8" stroke="#334155" strokeLinejoin="round" strokeWidth="3" />
          <path d="m39 35 11 6 11-6M45 47h10" fill="none" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="2" />
          <path d="m42 51 8 5 8-5" fill="none" stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" />
          <text x="50" y="83" textAnchor="middle" fill={isRed ? '#fecdd3' : '#e0f2fe'} fontSize="13" fontWeight="700">
            {suit}
          </text>
        </g>
      )}
    </svg>
  );
}

function Blossom({
  x,
  y,
  color,
  scale,
}: {
  x: number;
  y: number;
  color: string;
  scale: number;
}) {
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
