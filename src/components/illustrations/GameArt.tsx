import { cn } from '@/utils/cn';
import {
  ChessPiecesArt,
  ControllerArt,
  PlayingCardsArt,
  PokerChipsArt,
  TicTacToeArt,
} from '@/components/illustrations/GameIllustrationAssets';

/** Chọn minh họa SVG riêng theo game, luôn sẵn có offline và không cần ảnh nền. */
export function GameArt({
  id,
  className,
  uid = 'art',
}: {
  id: string;
  className?: string;
  uid?: string;
}) {
  let illustration;
  switch (id) {
    case 'tien-len':
    case 'phom':
    case 'xi-dach':
    case 'mau-binh':
      illustration = <PlayingCardsArt />;
      break;
    case 'poker':
      illustration = <PokerChipsArt />;
      break;
    case 'co-vua':
    case 'chess':
      illustration = <ChessPiecesArt />;
      break;
    case 'co-caro':
      illustration = <TicTacToeArt />;
      break;
    case 'xep-hinh-2048':
      illustration = <Tile2048Art />;
      break;
    default:
      illustration = <ControllerArt />;
  }
  return (
    <div className={cn('h-full w-full', className)} data-illustration={`${id}-${uid}`}>
      {illustration}
    </div>
  );
}

function Tile2048Art() {
  const tiles = [
    { v: '2', x: 0, y: 0, c: '#F4FFF0', t: '#269B35' },
    { v: '4', x: 50, y: 0, c: '#CFF3BD', t: '#207C2D' },
    { v: '8', x: 0, y: 50, c: '#8DEB68', t: '#164820' },
    { v: '16', x: 50, y: 50, c: '#62D943', t: '#164820' },
  ];
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
      <rect x="8" y="8" width="184" height="124" rx="28" fill="#F4FFF0" />
      <circle cx="164" cy="30" r="25" fill="#8DEB68" opacity="0.2" />
      <g transform="translate(74 20)">
        <rect x="-8" y="-8" width="116" height="116" rx="16" fill="#FFFFFF" stroke="#D6E8CF" strokeWidth="2" />
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
