import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Bộ vật phẩm trang trí dạng SVG cho hệ thống xác thực (bài Poker, chip, vương miện,
 * sao, clover, sparkle, hộp quà). Tất cả vẽ nội tuyến nên sắc nét và không cần tải ảnh.
 */

function DecorCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="44" height="60" rx="9" fill="#FFFFFF" stroke="#CFEBC0" strokeWidth="3" />
      <path
        d="M24 46 C14 38 12 32 17 27 C21 23.5 24 27 24 30 C24 27 27 23.5 31 27 C36 32 34 38 24 46 Z"
        fill="#FF7A9E"
      />
    </svg>
  );
}

function DecorChip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="#8DEB68" stroke="#218C2B" strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="12" fill="#62D943" />
      <g stroke="#218C2B" strokeWidth="3" strokeLinecap="round">
        <path d="M32 5 V14" />
        <path d="M32 50 V59" />
        <path d="M5 32 H14" />
        <path d="M50 32 H59" />
      </g>
    </svg>
  );
}

function DecorCrown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mgh-decor-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="55%" stopColor="#FFC83D" />
          <stop offset="100%" stopColor="#E0A82C" />
        </linearGradient>
      </defs>
      <path
        d="M6 44 L12 16 L26 30 L40 10 L54 30 L68 16 L74 44 Z"
        fill="url(#mgh-decor-crown)"
        stroke="#C78A1F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="6" y="42" width="68" height="8" rx="3" fill="#FFC83D" stroke="#C78A1F" strokeWidth="2.5" />
      <circle cx="18" cy="26" r="3" fill="#FF7A9E" />
      <circle cx="40" cy="19" r="3.5" fill="#7DD3FC" />
      <circle cx="62" cy="26" r="3" fill="#86EFAC" />
    </svg>
  );
}

function DecorStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 4 L29.5 18 L44 19.5 L33 29 L36.5 43.5 L24 35.5 L11.5 43.5 L15 29 L4 19.5 L18.5 18 Z"
        fill="#FFC83D"
        stroke="#E0A82C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecorClover({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g fill="#62D943" stroke="#218C2B" strokeWidth="2.5">
        <circle cx="24" cy="13" r="9" />
        <circle cx="35" cy="24" r="9" />
        <circle cx="24" cy="35" r="9" />
        <circle cx="13" cy="24" r="9" />
      </g>
      <path d="M24 24 Q26 34 30 44" fill="none" stroke="#218C2B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DecorSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 2 C17 11 21 15 30 16 C21 17 17 21 16 30 C15 21 11 17 2 16 C11 15 15 11 16 2 Z"
        fill="#FFE58A"
        stroke="#FFC83D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecorGift({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <rect x="6" y="20" width="44" height="30" rx="6" fill="#8DEB68" stroke="#218C2B" strokeWidth="3" />
      <rect x="4" y="14" width="48" height="12" rx="5" fill="#62D943" stroke="#218C2B" strokeWidth="3" />
      <rect x="24" y="14" width="8" height="36" fill="#FFC83D" stroke="#E0A82C" strokeWidth="2" />
      <path d="M28 14 C20 6 10 8 14 16 C16 19 22 16 28 14 Z" fill="#FF7A9E" stroke="#E0A82C" strokeWidth="2" />
      <path d="M28 14 C36 6 46 8 42 16 C40 19 34 16 28 14 Z" fill="#FF7A9E" stroke="#E0A82C" strokeWidth="2" />
    </svg>
  );
}

/** Mảng lá trang trí ở góc màn hình. */
function CornerLeaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g fill="#CFF3BD" opacity="0.85">
        <path d="M0 0 C60 10 96 40 110 96 C70 92 30 66 0 20 Z" />
        <path d="M0 0 C40 8 70 30 84 66 C56 60 26 42 0 12 Z" fill="#B6EFA0" />
      </g>
    </svg>
  );
}

interface DecorItem {
  node: ReactNode;
  /** Vị trí theo % viewport. */
  style: CSSProperties;
  /** Ẩn trên màn hình nhỏ để không che nội dung. */
  smallHidden?: boolean;
  animation?: string;
}

/**
 * Lớp trang trí bay xung quanh form. Các vật phẩm được định vị theo phần trăm màn hình;
 * phần lớn ẩn trên mobile để không che input và không gây tràn ngang.
 */
export function AuthDecorations() {
  const items: DecorItem[] = [
    { node: <DecorCard className="h-full w-full" />, style: { top: '16%', left: '8%', width: '52px', height: '70px' }, animation: 'animate-float-y' },
    { node: <DecorChip className="h-full w-full" />, style: { top: '62%', left: '12%', width: '56px', height: '56px' }, smallHidden: true, animation: 'animate-drift' },
    { node: <DecorCrown className="h-full w-full" />, style: { top: '11%', right: '10%', width: '64px', height: '46px' }, animation: 'animate-bob' },
    { node: <DecorStar className="h-full w-full" />, style: { top: '70%', right: '11%', width: '44px', height: '44px' }, animation: 'animate-drift' },
    { node: <DecorClover className="h-full w-full" />, style: { top: '40%', left: '5%', width: '46px', height: '46px' }, smallHidden: true, animation: 'animate-float-y' },
    { node: <DecorGift className="h-full w-full" />, style: { bottom: '10%', right: '14%', width: '54px', height: '54px' }, smallHidden: true, animation: 'animate-bob' },
    { node: <DecorCard className="h-full w-full rotate-12" />, style: { bottom: '14%', left: '20%', width: '44px', height: '60px' }, smallHidden: true, animation: 'animate-drift' },
    { node: <DecorSparkle className="h-full w-full" />, style: { top: '22%', left: '24%', width: '24px', height: '24px' }, smallHidden: true, animation: 'animate-sparkle' },
    { node: <DecorSparkle className="h-full w-full" />, style: { top: '58%', right: '24%', width: '28px', height: '28px' }, smallHidden: true, animation: 'animate-sparkle' },
    { node: <DecorSparkle className="h-full w-full" />, style: { top: '8%', left: '46%', width: '20px', height: '20px' }, smallHidden: true, animation: 'animate-sparkle' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Mảng lá ở hai góc */}
      <CornerLeaves className="absolute -left-6 -top-6 h-40 w-40 opacity-70 sm:h-56 sm:w-56" />
      <CornerLeaves className="absolute -bottom-10 -right-8 h-40 w-40 rotate-180 opacity-70 sm:h-56 sm:w-56" />

      {/* Vầng sáng nền */}
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/40 blur-3xl" />

      {items.map((item, index) => (
        <span
          key={index}
          style={item.style}
          className={cn('absolute', item.smallHidden && 'hidden sm:block', item.animation)}
        >
          {item.node}
        </span>
      ))}
    </div>
  );
}
