import { cn } from '@/utils/cn';

type Variant = 'login' | 'register' | 'navbar';

const VARIANT_SIZES: Record<Variant, { wrapper: string; art: string }> = {
  login: {
    wrapper: 'h-44 w-44 sm:h-52 sm:w-52',
    art: 'h-40 w-40 sm:h-48 sm:w-48',
  },
  register: {
    wrapper: 'h-44 w-44 sm:h-52 sm:w-52',
    art: 'h-40 w-40 sm:h-48 sm:w-48',
  },
  navbar: {
    wrapper: 'h-10 w-10',
    art: 'h-10 w-10',
  },
};

/**
 * Minh họa nân bài "A K Q J" dễ thương trên nền xanh mint, dùng cho trang đăng
 * nhập, đăng ký và logo navbar. Mỗi biến thể có cách bày trí và hiệu ứng nhẹ
 * riêng; dùng SVG inline nên không phụ thuộc ảnh ngoài.
 */
export function GameCardArt({
  variant = 'login',
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const sizes = VARIANT_SIZES[variant];
  const showDecor = variant !== 'navbar';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizes.wrapper,
        className,
      )}
    >
      {showDecor && (
        <>
          {/* Vầng sáng nền */}
          <div className="absolute inset-2 rounded-full bg-brand-200/40 blur-2xl" />
          {/* Nền tròn pastel */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand-50 via-base-900 to-pastel-blue/60 shadow-soft" />
        </>
      )}

      <div
        className={cn('relative', sizes.art, showDecor && 'animate-bob')}
        style={{ animationDuration: variant === 'navbar' ? '0s' : undefined }}
      >
        <svg
          viewBox="0 0 200 180"
          className="h-full w-full drop-shadow-sm"
          role="img"
          aria-label="Bộ bài A K Q J"
        >
          {variant !== 'navbar' ? (
            <FullArt variant={variant} />
          ) : (
            <CompactArt />
          )}
        </svg>
      </div>

      {showDecor && <FloatingDecor variant={variant} />}
    </div>
  );
}

function FullArt({ variant }: { variant: Variant }) {
  // Register nghiêng nhẹ khác login cho đa dạng
  const tilt = variant === 'register' ? -2 : 0;
  return (
    <g transform={`translate(0 ${tilt})`}>
      {/* Bớt nền xanh nhẹ phía sau */}
      <rect x="40" y="56" width="120" height="96" rx="22" fill="#E8F6E0" opacity="0.85" />
      <ellipse cx="150" cy="70" rx="26" ry="22" fill="#D9F1FF" opacity="0.7" />
      <ellipse cx="58" cy="120" rx="22" ry="18" fill="#CFF3BD" opacity="0.6" />

      {/* Card A */}
      <g transform="translate(34 58) rotate(-14 28 42)">
        <rect width="56" height="74" rx="10" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="9" y="22" fill="#269B35" fontSize="16" fontWeight="900">A</text>
        <path d="M28 36c-7-11-18 2 0 15 18-13 7-26 0-15Z" fill="#62D943" />
      </g>

      {/* Card K */}
      <g transform="translate(72 52) rotate(-4 28 42)">
        <rect width="56" height="74" rx="10" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="9" y="22" fill="#E56875" fontSize="16" fontWeight="900">K</text>
        <path d="M28 36c-7-11-18 2 0 15 18-13 7-26 0-15Z" fill="#E56875" />
      </g>

      {/* Card Q */}
      <g transform="translate(108 50) rotate(6 28 42)">
        <rect width="56" height="74" rx="10" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="9" y="22" fill="#5898D5" fontSize="16" fontWeight="900">Q</text>
        <path d="M28 36c-7-11-18 2 0 15 18-13 7-26 0-15Z" fill="#5898D5" />
      </g>

      {/* Card J */}
      <g transform="translate(142 54) rotate(16 26 40)">
        <rect width="52" height="70" rx="10" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
        <text x="8" y="21" fill="#A583DB" fontSize="15" fontWeight="900">J</text>
        <path d="M14 36h20M17 42h14" stroke="#A583DB" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

function CompactArt() {
  return (
    <>
      {/* Icon nhỏ cho navbar: chỉ 2 lá bài xếp chéo */}
      <rect x="56" y="58" width="40" height="54" rx="8" fill="#FFF" stroke="#269B35" strokeWidth="2.5" transform="rotate(-12 76 85)" />
      <text x="62" y="74" fill="#269B35" fontSize="13" fontWeight="900" transform="rotate(-12 76 85)">A</text>
      <path d="M72 84c-4-6-10 1 0 8 10-7 4-14 0-8Z" fill="#62D943" transform="rotate(-12 76 85)" />

      <rect x="96" y="62" width="40" height="54" rx="8" fill="#FFF" stroke="#269B35" strokeWidth="2.5" transform="rotate(14 116 89)" />
      <text x="102" y="78" fill="#E56875" fontSize="13" fontWeight="900" transform="rotate(14 116 89)">K</text>
      <path d="M112 88c-4-6-10 1 0 8 10-7 4-14 0-8Z" fill="#E56875" transform="rotate(14 116 89)" />

      {/* Vầng xanh viền logo */}
      <circle cx="100" cy="90" r="86" fill="none" stroke="#8DEB68" strokeWidth="4" opacity="0.35" />
    </>
  );
}

function FloatingDecor({ variant }: { variant: Variant }) {
  const floatClass = 'animate-float-y absolute';
  const delayA = variant === 'register' ? '0.1s' : '0.3s';
  const delayB = variant === 'register' ? '0.6s' : '0.8s';
  const delayC = variant === 'register' ? '0.4s' : '0.5s';

  return (
    <>
      {/* Lá bài nhỏ trái tim (trái trên) */}
      <div className={floatClass} style={{ left: '4%', top: '6%', animationDelay: delayA }}>
        <svg viewBox="0 0 40 52" className="h-9 w-7 rotate-[-12deg]" aria-hidden="true">
          <rect width="40" height="52" rx="7" fill="#FFF" stroke="#E4E4E4" strokeWidth="1.5" />
          <path d="M20 18c-4-6-11 1 0 7 11-6 4-13 0-7Z" fill="#E56875" />
        </svg>
      </div>

      {/* Xúc xắc (phải trên) */}
      <div className={floatClass} style={{ right: '4%', top: '8%', animationDelay: delayB }}>
        <svg viewBox="0 0 48 48" className="h-10 w-10 rotate-[10deg]" aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="11" fill="#FFF" stroke="#D6E8CF" strokeWidth="2" />
          <circle cx="15" cy="15" r="3.5" fill="#269B35" />
          <circle cx="33" cy="15" r="3.5" fill="#269B35" />
          <circle cx="24" cy="24" r="3.5" fill="#62D943" />
          <circle cx="15" cy="33" r="3.5" fill="#269B35" />
          <circle cx="33" cy="33" r="3.5" fill="#269B35" />
        </svg>
      </div>

      {/* Ngôi sao vàng (góc phải) */}
      <div className={floatClass} style={{ right: '10%', top: '0%', animationDelay: delayC }}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M12 2l2.6 6.8 7.2.6-5.5 4.7 1.8 7L12 17.8 5.9 21l1.8-7L2.2 9.4l7.2-.6z" fill="#FFD66B" />
        </svg>
      </div>

      {/* Xu vàng (dưới trái) */}
      <div className={floatClass} style={{ left: '6%', bottom: '8%', animationDelay: delayB }}>
        <svg viewBox="0 0 44 44" className="h-10 w-10" aria-hidden="true">
          <circle cx="22" cy="22" r="20" fill="#FFC94F" stroke="#D99A27" strokeWidth="2.5" />
          <circle cx="22" cy="22" r="13" fill="none" stroke="#E4A52D" strokeWidth="2" />
          <path d="M22 14v16M16 20h12M17 26h10" stroke="#D99A27" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Cỏ 4 lá (dưới phải) */}
      <div className={floatClass} style={{ right: '6%', bottom: '10%', animationDelay: delayA }}>
        <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
          <path d="M24 24C12 24 12 12 20 10c5-1 9 4 9 9 0-8 7-13 12-7 5 6 1 13-7 13 8 1 11 8 6 11-6 3-10-1-10-7-1 9-10 10-13 4-3-6 2-10 12-9Z" fill="#62D943" stroke="#269B35" strokeWidth="2" />
          <circle cx="24" cy="24" r="2.5" fill="#D8FFBE" />
        </svg>
      </div>
    </>
  );
}
