import { cn } from '@/utils/cn';

type AssetProps = { className?: string };

function Backdrop() {
  return (
    <>
      <rect x="8" y="8" width="184" height="124" rx="28" fill="#F4FFF0" />
      <circle cx="164" cy="30" r="25" fill="#8DEB68" opacity="0.2" />
      <circle cx="37" cy="112" r="20" fill="#D9F1FF" opacity="0.6" />
      <path d="M31 33c4-7 12-7 16 0-5 8-11 11-16 0Z" fill="#62D943" opacity="0.55" />
    </>
  );
}

export function PlayingCardsArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('h-full w-full', className)} aria-hidden="true">
      <Backdrop />
      <g transform="translate(39 42) rotate(-15 30 38)">
        <rect x="3" y="4" width="58" height="78" rx="11" fill="#207C2D" opacity="0.13" />
        <rect width="58" height="78" rx="11" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="10" y="24" fill="#269B35" fontSize="17" fontWeight="900">A</text>
        <path d="M29 37c-8-12-20 2 0 16 20-14 8-28 0-16Z" fill="#62D943" />
      </g>
      <g transform="translate(73 32) rotate(1 30 38)">
        <rect x="3" y="4" width="58" height="78" rx="11" fill="#207C2D" opacity="0.13" />
        <rect width="58" height="78" rx="11" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="10" y="24" fill="#E56875" fontSize="17" fontWeight="900">K</text>
        <path d="M29 37c-8-12-20 2 0 16 20-14 8-28 0-16Z" fill="#E56875" />
      </g>
      <g transform="translate(108 40) rotate(14 27 36)">
        <rect x="3" y="4" width="54" height="74" rx="11" fill="#207C2D" opacity="0.13" />
        <rect width="54" height="74" rx="11" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="9" y="23" fill="#5898D5" fontSize="16" fontWeight="900">Q</text>
        <path d="M27 36c-7-11-18 2 0 15 18-13 7-26 0-15Z" fill="#5898D5" />
      </g>
      <g transform="translate(144 51) rotate(20 21 28)">
        <rect width="42" height="58" rx="9" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="21" y="25" textAnchor="middle" fill="#A583DB" fontSize="13" fontWeight="900">J</text>
        <path d="M12 38h18M15 43h12" stroke="#A583DB" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M176 25l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFD66B" />
    </svg>
  );
}

export function PokerChipsArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('h-full w-full', className)} aria-hidden="true">
      <Backdrop />
      <g transform="translate(48 54)">
        <ellipse cx="42" cy="50" rx="39" ry="15" fill="#B83250" />
        <path d="M3 37v13c0 9 17 16 39 16s39-7 39-16V37" fill="#E56875" stroke="#B83250" strokeWidth="3" />
        <ellipse cx="42" cy="37" rx="39" ry="15" fill="#F27782" stroke="#B83250" strokeWidth="3" />
        <ellipse cx="42" cy="37" rx="25" ry="8" fill="none" stroke="#FFF4E9" strokeWidth="5" strokeDasharray="9 5" />
      </g>
      <g transform="translate(82 34)">
        <ellipse cx="40" cy="55" rx="38" ry="15" fill="#207C2D" />
        <path d="M2 40v15c0 8 17 15 38 15s38-7 38-15V40" fill="#62D943" stroke="#207C2D" strokeWidth="3" />
        <ellipse cx="40" cy="40" rx="38" ry="15" fill="#8DEB68" stroke="#207C2D" strokeWidth="3" />
        <ellipse cx="40" cy="40" rx="24" ry="8" fill="none" stroke="#FFF" strokeWidth="5" strokeDasharray="8 5" />
      </g>
      <g transform="translate(117 62)">
        <ellipse cx="25" cy="30" rx="24" ry="10" fill="#7054A8" />
        <path d="M1 20v10c0 6 11 10 24 10s24-4 24-10V20" fill="#A583DB" stroke="#7054A8" strokeWidth="2.5" />
        <ellipse cx="25" cy="20" rx="24" ry="10" fill="#B99AE9" stroke="#7054A8" strokeWidth="2.5" />
        <ellipse cx="25" cy="20" rx="15" ry="5" fill="none" stroke="#FFF" strokeWidth="4" strokeDasharray="6 4" />
      </g>
      <circle cx="44" cy="37" r="4" fill="#FFF" opacity="0.9" />
    </svg>
  );
}

export function ChessPiecesArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('h-full w-full', className)} aria-hidden="true">
      <Backdrop />
      <path d="M35 113h160" stroke="#B9DDAE" strokeWidth="4" strokeLinecap="round" />
      <g fill="#8DEB68" stroke="#269B35" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M47 107h38l-4-8H51zM54 99c2-8 8-10 12-16 4-7-1-11-4-16 11 0 19 8 19 18 0 7-4 11-6 14z" />
        <path d="M58 74c-4-8-2-17 5-23 4 8 10 12 17 12 0 9-6 16-15 16-3 0-5-2-7-5Z" />
        <circle cx="74" cy="65" r="2.3" fill="#164820" stroke="none" />
      </g>
      <g fill="#62D943" stroke="#269B35" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M98 108h42l-4-8h-34zM104 100c2-11 8-17 11-25l-6-10h21l-6 10c4 8 10 14 12 25z" />
        <path d="M107 65V51l9 5 4-14 4 14 9-5v14z" />
        <circle cx="120" cy="38" r="5" />
      </g>
      <g fill="#FFF3B8" stroke="#D6A63D" strokeWidth="2">
        <path d="M142 108h26l-3-7h-20zM147 101c1-7 5-10 9-15 4 5 8 8 9 15z" />
        <path d="m148 84 2-10 6 5 4-10 4 10 6-5 2 10z" />
        <circle cx="160" cy="78" r="2" fill="#FFF" stroke="none" />
      </g>
      <g fill="#FFF" stroke="#B9DDAE" strokeWidth="2">
        <path d="M171 108h24l-3-7h-18zM176 101c0-8 4-12 7-18 3 6 7 10 7 18z" />
        <circle cx="183" cy="79" r="6" />
      </g>
      <path d="M56 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFD66B" />
    </svg>
  );
}

export function TicTacToeArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('h-full w-full', className)} aria-hidden="true">
      <Backdrop />
      <rect x="47" y="18" width="106" height="104" rx="20" fill="#FFF" stroke="#D6E8CF" strokeWidth="3" />
      <path d="M82 30v80M118 30v80M58 54h84M58 84h84" stroke="#D7EED0" strokeWidth="4" strokeLinecap="round" />
      <path d="m65 35 13 13m0-13L65 48m60 40 13 13m0-13-13 13" stroke="#269B35" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="69" r="10" fill="none" stroke="#62D943" strokeWidth="6" />
      <circle cx="100" cy="99" r="10" fill="none" stroke="#62D943" strokeWidth="6" />
      <path d="M159 35l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFD66B" />
    </svg>
  );
}

export function ControllerArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('h-full w-full', className)} aria-hidden="true">
      <Backdrop />
      <path
        d="M58 48c-11 0-20 8-23 20l-8 31c-3 13 11 20 21 12l20-17h72l20 17c10 8 24 1 21-12l-8-31c-3-12-12-20-23-20H58Z"
        fill="#8DEB68"
        stroke="#269B35"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M57 66v25M44.5 78.5h25" stroke="#FFF" strokeWidth="7" strokeLinecap="round" />
      <circle cx="140" cy="70" r="6" fill="#FFF" />
      <circle cx="155" cy="84" r="6" fill="#FFF" />
      <circle cx="155" cy="62" r="5" fill="#269B35" />
      <circle cx="138" cy="92" r="5" fill="#269B35" />
      <path d="M98 54q-12-10-20 0M102 54q12-10 20 0" fill="none" stroke="#D9FFBF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function CloverArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-full w-full', className)} aria-hidden="true">
      <path d="M31 34c-16 9-19 19-18 24 11 0 19-7 21-21" fill="none" stroke="#269B35" strokeWidth="4" strokeLinecap="round" />
      <path d="M31 31C14 35 10 25 17 19c5-5 12-2 15 4 2-10 13-13 18-6 5 8-1 15-16 15 16 4 17 15 9 19-8 4-14-2-13-15-4 13-16 15-20 7-4-8 1-13 21-12Z" fill="#62D943" stroke="#269B35" strokeWidth="2.5" />
      <circle cx="31" cy="31" r="4" fill="#D8FFBE" />
    </svg>
  );
}

export function SparkleArt({ className }: AssetProps) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-full w-full', className)} aria-hidden="true">
      <path d="M31 5c3 16 7 20 23 23-16 3-20 7-23 23-3-16-7-20-23-23C24 25 28 21 31 5Z" fill="#FFD66B" />
      <path d="M52 39c1.5 7 3 8.5 10 10-7 1.5-8.5 3-10 10-1.5-7-3-8.5-10-10 7-1.5 8.5-3 10-10Z" fill="#8DEB68" />
    </svg>
  );
}

export function RewardArt({
  className,
  type = 'trophy',
}: AssetProps & { type?: 'gift' | 'crown' | 'trophy' | 'coins' | 'star' }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('h-full w-full', className)} aria-hidden="true">
      {type === 'gift' && (
        <>
          <rect x="19" y="47" width="82" height="57" rx="14" fill="#FFB64D" stroke="#D68A2F" strokeWidth="4" />
          <path d="M58 47v57M19 66h82" stroke="#FFF1BF" strokeWidth="11" />
          <path d="M59 47C28 43 29 21 43 22c12 1 16 13 16 25Zm2 0c31-4 30-26 16-25-12 1-16 13-16 25Z" fill="#F27965" stroke="#D65E52" strokeWidth="4" />
        </>
      )}
      {type === 'crown' && (
        <>
          <path d="m17 39 22 18 21-30 21 30 22-18-9 55H26z" fill="#FFD65E" stroke="#DAA42E" strokeWidth="4" strokeLinejoin="round" />
          <path d="M28 82h64" stroke="#FFF3B8" strokeWidth="8" strokeLinecap="round" />
          <circle cx="17" cy="35" r="8" fill="#F27965" />
          <circle cx="60" cy="25" r="8" fill="#8DEB68" />
          <circle cx="103" cy="35" r="8" fill="#F27965" />
        </>
      )}
      {type === 'trophy' && (
        <>
          <path d="M35 20h50v28c0 23-11 36-25 36S35 71 35 48z" fill="#FFD65E" stroke="#DAA42E" strokeWidth="4" />
          <path d="M35 31H18v12c0 17 11 25 26 24M85 31h17v12c0 17-11 25-26 24" fill="none" stroke="#DAA42E" strokeWidth="8" strokeLinecap="round" />
          <path d="M60 84v16M43 103h34" stroke="#DAA42E" strokeWidth="8" strokeLinecap="round" />
          <path d="m60 35 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFF9DB" />
        </>
      )}
      {type === 'coins' && (
        <>
          <ellipse cx="60" cy="90" rx="38" ry="15" fill="#E4A52D" />
          <path d="M22 69v21c0 8 17 15 38 15s38-7 38-15V69" fill="#FFC94F" stroke="#D99A27" strokeWidth="4" />
          <ellipse cx="60" cy="69" rx="38" ry="15" fill="#FFE078" stroke="#D99A27" strokeWidth="4" />
          <circle cx="60" cy="69" r="9" fill="none" stroke="#E4A52D" strokeWidth="3" />
          <path d="M60 62v14m-4-10h8m-8 6h8" stroke="#D99A27" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'star' && (
        <>
          <path d="m60 12 14 29 32 5-23 22 6 32-29-15-29 15 6-32-23-22 32-5z" fill="#FFD65E" stroke="#DAA42E" strokeWidth="4" strokeLinejoin="round" />
          <path d="m53 41 7-15 7 15" fill="none" stroke="#FFF3B8" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
