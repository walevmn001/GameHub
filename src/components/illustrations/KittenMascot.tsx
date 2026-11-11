import { cn } from '@/utils/cn';

export type KittenPose = 'happy' | 'wink' | 'cards' | 'gift' | 'victory' | 'wave';

export function KittenMascot({
  className,
  uid = 'kitten',
  pose = 'happy',
}: {
  className?: string;
  uid?: string;
  pose?: KittenPose;
}) {
  const furId = `kitten-fur-${uid}`;
  const greenId = `kitten-green-${uid}`;
  const cheekId = `kitten-cheek-${uid}`;
  const isWinking = pose === 'wink';

  return (
    <svg
      viewBox="0 0 240 230"
      className={cn('h-full w-full drop-shadow-xl', className)}
      role="img"
      aria-label="Mèo con GameHub đeo tai nghe chơi game"
    >
      <defs>
        <linearGradient id={furId} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#EAF6E6" />
        </linearGradient>
        <linearGradient id={greenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8DEB68" />
          <stop offset="58%" stopColor="#62D943" />
          <stop offset="100%" stopColor="#269B35" />
        </linearGradient>
        <radialGradient id={cheekId}>
          <stop offset="0%" stopColor="#FF9FB0" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#FF9FB0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="214" rx="59" ry="9" fill="#269B35" opacity="0.14" />

      {pose === 'victory' && (
        <g fill="#FFD66B">
          <path d="M30 60l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
          <path d="M206 49l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
          <circle cx="30" cy="116" r="3" />
          <circle cx="211" cy="120" r="3" />
        </g>
      )}
      <path
        d="M47 112C32 57 66 18 120 18s88 39 73 94"
        fill="none"
        stroke="#207C2D"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M48 105C39 57 72 27 120 27s81 30 72 78"
        fill="none"
        stroke={`url(#${greenId})`}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path d="M85 34c10-7 21-10 35-10" fill="none" stroke="#D8FFBE" strokeWidth="4" strokeLinecap="round" />

      <path
        d="M71 155c-14 9-21 25-17 42 3 12 14 18 29 18h74c15 0 26-6 29-18 4-17-3-33-17-42"
        fill={`url(#${furId})`}
        stroke="#D7E9D0"
        strokeWidth="3"
      />
      <path d="M89 165c8 11 19 16 31 16s23-5 31-16" fill="none" stroke="#8DEB68" strokeWidth="8" strokeLinecap="round" />
      <circle cx="120" cy="178" r="9" fill={`url(#${greenId})`} stroke="#269B35" strokeWidth="2" />
      <path d="M116 178h8M120 174v8" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />

      <path
        d="M69 80 61 40c-2-10 5-15 14-9l35 25c7-2 14-2 21 0l35-25c9-6 16-1 14 9l-8 40c10 13 15 28 15 44 0 39-29 67-67 67s-67-28-67-67c0-16 5-31 16-44Z"
        fill={`url(#${furId})`}
        stroke="#BFDDB5"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="m74 48 24 16-19 9zM166 48l-24 16 19 9z" fill="#FFCBD2" />
      <path d="M76 45l19 13M164 45l-19 13" stroke="#FFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <ellipse cx="120" cy="83" rx="47" ry="17" fill="#FFF" opacity="0.58" />

      <rect x="34" y="82" width="29" height="61" rx="14" fill={`url(#${greenId})`} stroke="#207C2D" strokeWidth="4" />
      <rect x="177" y="82" width="29" height="61" rx="14" fill={`url(#${greenId})`} stroke="#207C2D" strokeWidth="4" />
      <path d="M40 93v28M183 93v28" stroke="#D7FFBF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <path d="M185 105c-3-4-8-3-10 1l-2 7c-1 4 3 7 6 5l3-2 4 2c4 2 7-1 6-5l-2-7c-1-4-6-5-9-1Z" fill="#FFF" stroke="#269B35" strokeWidth="1.5" />
      <path d="M179 110v5M177 112.5h5M187 111h.1M190 115h.1" stroke="#269B35" strokeWidth="2" strokeLinecap="round" />

      {isWinking ? (
        <>
          <path d="M83 117q10-12 20 0" fill="none" stroke="#24452A" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="145" cy="116" rx="7" ry="10" fill="#24452A" />
          <circle cx="147" cy="112" r="2.5" fill="#FFF" />
        </>
      ) : (
        <>
          <ellipse cx="94" cy="116" rx="7" ry="10" fill="#24452A" />
          <ellipse cx="146" cy="116" rx="7" ry="10" fill="#24452A" />
          <circle cx="96.5" cy="112" r="2.6" fill="#FFF" />
          <circle cx="148.5" cy="112" r="2.6" fill="#FFF" />
        </>
      )}
      <ellipse cx="77" cy="133" rx="14" ry="8" fill={`url(#${cheekId})`} />
      <ellipse cx="163" cy="133" rx="14" ry="8" fill={`url(#${cheekId})`} />
      <path d="m115 129 5-4 5 4-5 5z" fill="#E98D9A" />
      <path d="M120 134q-8 11-15 2M120 134q8 11 15 2" fill="none" stroke="#34543A" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M61 128 44 124M62 136l-19 2M179 128l17-4M178 136l19 2" stroke="#A7BF9F" strokeWidth="2" strokeLinecap="round" />

      {pose === 'cards' && (
        <g stroke="#BFDDB5" strokeWidth="2">
          <g transform="translate(85 153) rotate(-12)">
            <rect width="29" height="40" rx="5" fill="#FFF" />
            <text x="7" y="17" fill="#269B35" fontSize="12" fontWeight="800">A</text>
            <path d="M15 19c-5-7-12 1 0 9 12-8 5-16 0-9Z" fill="#62D943" stroke="none" />
          </g>
          <g transform="translate(111 150) rotate(8)">
            <rect width="29" height="40" rx="5" fill="#FFF" />
            <text x="7" y="17" fill="#F06B72" fontSize="12" fontWeight="800">K</text>
            <path d="M15 19c-5-7-12 1 0 9 12-8 5-16 0-9Z" fill="#F06B72" stroke="none" />
          </g>
        </g>
      )}
      {pose === 'gift' && (
        <g transform="translate(94 163)">
          <rect x="0" y="12" width="52" height="36" rx="7" fill="#62D943" stroke="#269B35" strokeWidth="3" />
          <path d="M25 12v36M0 25h52" stroke="#FFF7D6" strokeWidth="6" />
          <path d="M26 12C8 10 8-2 17 0c7 1 9 7 9 12Zm0 0c18-2 18-14 9-12-7 1-9 7-9 12Z" fill="#FFD66B" stroke="#E1A834" strokeWidth="2" />
        </g>
      )}
      {pose === 'victory' && (
        <g fill="none" stroke="#FFFDF8" strokeWidth="11" strokeLinecap="round">
          <path d="M70 174 47 151" />
          <path d="M170 174 193 151" />
        </g>
      )}
      {pose === 'wave' && (
        <g fill={`url(#${furId})`} stroke="#BFDDB5" strokeWidth="3">
          <path d="M58 178c-17 1-24-8-20-16l9-17c3-6 11-4 10 2l-2 8c10-7 21-4 21 5 0 10-8 17-18 18Z" />
          <path d="m49 148-4-10M57 147l1-11M43 150l-8-6" stroke="#BFDDB5" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
