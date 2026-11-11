import { cn } from '@/utils/cn';

/**
 * Bộ minh họa SVG theo từng trò chơi (phong cách cute, xanh lá & trắng).
 * Thuần SVG nên luôn hiển thị kể cả khi offline; mỗi game có hình riêng.
 */
export function GameArt({
  id,
  className,
  uid = 'art',
}: {
  id: string;
  className?: string;
  uid?: string;
}) {
  const props = { className: cn('h-full w-full', className), uid };
  switch (id) {
    case 'tien-len':
      return <TienLenArt {...props} />;
    case 'phom':
      return <PhomArt {...props} />;
    case 'xi-dach':
      return <XiDachArt {...props} />;
    case 'mau-binh':
      return <MauBinhArt {...props} />;
    case 'co-caro':
      return <CaroArt {...props} />;
    case 'xep-hinh-2048':
      return <Tile2048Art {...props} />;
    default:
      return <DiceArt {...props} />;
  }
}

interface ArtProps {
  className?: string;
  uid: string;
}

/** Nền chung: bàn chơi xanh pastel + vệt sáng. */
function Backdrop({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8F6E9" />
          <stop offset="100%" stopColor="#F7FBF7" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" rx="20" fill={`url(#bg-${uid})`} />
      <circle cx="168" cy="26" r="34" fill="#75C98A" opacity="0.16" />
      <circle cx="30" cy="120" r="28" fill="#A8DDB5" opacity="0.22" />
    </>
  );
}

function Card({
  x,
  y,
  rotate = 0,
  color = '#238B50',
  glyph = '♠',
}: {
  x: number;
  y: number;
  rotate?: number;
  color?: string;
  glyph?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect width="46" height="64" rx="8" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
      <text x="9" y="20" fontSize="15" fontWeight="700" fill={color}>
        {glyph}
      </text>
      <text x="23" y="52" fontSize="22" textAnchor="middle" fill={color} opacity="0.9">
        {glyph}
      </text>
    </g>
  );
}

function TienLenArt({ className, uid }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      <Card x={44} y={44} rotate={-16} color="#238B50" glyph="♣" />
      <Card x={74} y={38} rotate={-2} color="#1A2B20" glyph="♠" />
      <Card x={106} y={40} rotate={14} color="#E5484D" glyph="♥" />
    </svg>
  );
}

function PhomArt({ className, uid }: ArtProps) {
  const tiles = [
    { x: 44, c: '#238B50' },
    { x: 78, c: '#1A6B3D' },
    { x: 112, c: '#E5484D' },
  ];
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      {tiles.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${48 + (i % 2 === 0 ? 0 : 6)})`}>
          <rect width="40" height="52" rx="7" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
          <rect x="8" y="8" width="24" height="36" rx="4" fill={t.c} opacity="0.14" />
          <circle cx="20" cy="18" r="4" fill={t.c} />
          <circle cx="20" cy="30" r="4" fill={t.c} opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

function XiDachArt({ className, uid }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      <g transform="translate(60 36)">
        <rect width="44" height="62" rx="8" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
        <text x="22" y="40" fontSize="24" fontWeight="800" textAnchor="middle" fill="#1A2B20">
          A
        </text>
      </g>
      <g transform="translate(96 40) rotate(10)">
        <rect width="44" height="62" rx="8" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
        <text x="22" y="40" fontSize="24" fontWeight="800" textAnchor="middle" fill="#E5484D">
          K
        </text>
      </g>
      <circle cx="46" cy="106" r="16" fill="#238B50" />
      <circle cx="46" cy="106" r="11" fill="none" stroke="#A8DDB5" strokeWidth="3" />
      <text x="46" y="111" fontSize="12" fontWeight="800" textAnchor="middle" fill="#FFFFFF">
        21
      </text>
    </svg>
  );
}

function MauBinhArt({ className, uid }: ArtProps) {
  const rows = [36, 68, 100];
  const counts = [3, 2, 1];
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      {rows.map((y, r) =>
        Array.from({ length: counts[r] }).map((_, i) => (
          <rect
            key={`${r}-${i}`}
            x={40 + i * 26 + r * 12}
            y={y}
            width="30"
            height="20"
            rx="5"
            fill="#FFFFFF"
            stroke="#D4E5D6"
            strokeWidth="2"
          />
        )),
      )}
      <circle cx="150" cy="52" r="4" fill="#238B50" />
      <circle cx="150" cy="84" r="4" fill="#75C98A" />
    </svg>
  );
}

function CaroArt({ className, uid }: ArtProps) {
  const size = 22;
  const origin = 62;
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      <g transform={`translate(${origin} 18)`}>
        <rect x="0" y="0" width="132" height="104" rx="12" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
        {[1, 2, 3].map((i) => (
          <line key={`v${i}`} x1={i * size + 24} y1="10" x2={i * size + 24} y2="94" stroke="#E8F6E9" strokeWidth="2" />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={`h${i}`} x1="14" y1={i * size + 4} x2="118" y2={i * size + 4} stroke="#E8F6E9" strokeWidth="2" />
        ))}
        <path d="M36 18 l18 18 M54 18 l-18 18" stroke="#238B50" strokeWidth="4" strokeLinecap="round" />
        <circle cx="90" cy="52" r="11" fill="none" stroke="#75C98A" strokeWidth="4" />
      </g>
    </svg>
  );
}

function Tile2048Art({ className, uid }: ArtProps) {
  const tiles = [
    { v: '2', x: 0, y: 0, c: '#E8F6E9', t: '#238B50' },
    { v: '4', x: 50, y: 0, c: '#A8DDB5', t: '#14532D' },
    { v: '8', x: 0, y: 50, c: '#75C98A', t: '#FFFFFF' },
    { v: '16', x: 50, y: 50, c: '#238B50', t: '#FFFFFF' },
  ];
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      <g transform="translate(74 20)">
        <rect x="-8" y="-8" width="116" height="116" rx="16" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
        {tiles.map((t) => (
          <g key={t.v} transform={`translate(${t.x} ${t.y})`}>
            <rect width="42" height="42" rx="10" fill={t.c} />
            <text
              x="21"
              y="27"
              fontSize={t.v.length > 1 ? 15 : 18}
              fontWeight="800"
              textAnchor="middle"
              fill={t.t}
            >
              {t.v}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function DiceArt({ className, uid }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <Backdrop uid={uid} />
      <g transform="translate(52 34) rotate(-8)">
        <rect width="52" height="52" rx="12" fill="#FFFFFF" stroke="#D4E5D6" strokeWidth="2" />
        <circle cx="16" cy="16" r="4.5" fill="#238B50" />
        <circle cx="36" cy="36" r="4.5" fill="#238B50" />
        <circle cx="26" cy="26" r="4.5" fill="#75C98A" />
      </g>
      <g transform="translate(100 46) rotate(10)">
        <rect width="46" height="46" rx="11" fill="#238B50" />
        <circle cx="14" cy="14" r="4" fill="#FFFFFF" />
        <circle cx="32" cy="14" r="4" fill="#FFFFFF" />
        <circle cx="14" cy="32" r="4" fill="#FFFFFF" />
        <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
