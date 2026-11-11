import { cn } from '@/utils/cn';

/**
 * Tiêu đề trang xác thực dạng cartoon: vương miện + chữ xanh lá có viền trắng và bóng
 * đậm cho cảm giác nổi. KHÔNG dùng WebkitTextStroke (bị vỡ nét với tiếng Việt); thay
 * vào dùng nhiều lớp text-shadow để tạo viền trắng + bóng xanh mềm mại.
 */
export function AuthTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Vương miện */}
      <div className="mb-1.5 animate-wiggle">
        <svg
          viewBox="0 0 80 48"
          className="h-9 w-14 drop-shadow-sm"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="auth-crown-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE58A" />
              <stop offset="50%" stopColor="#FFC83D" />
              <stop offset="100%" stopColor="#E0A82C" />
            </linearGradient>
          </defs>
          <path
            d="M8 38 L14 12 L26 26 L40 8 L54 26 L66 12 L72 38 Z"
            fill="url(#auth-crown-gold)"
            stroke="#C78A1F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="8" y="36" width="64" height="8" rx="3" fill="#FFC83D" stroke="#C78A1F" strokeWidth="2.5" />
          <circle cx="18" cy="22" r="3" fill="#FF7A9E" />
          <circle cx="40" cy="16" r="3.5" fill="#7DD3FC" />
          <circle cx="62" cy="22" r="3" fill="#86EFAC" />
        </svg>
      </div>

      {/* Chữ cartoon: gradient xanh lá, viền trắng 4 hướng + bóng đậm để nổi */}
      <h1
        className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl"
        style={{
          backgroundImage: 'linear-gradient(180deg, #8DEB68 0%, #62D943 45%, #218C2B 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow:
            '-2.5px -2.5px 0 #FFFFFF, 2.5px -2.5px 0 #FFFFFF, -2.5px 2.5px 0 #FFFFFF, 2.5px 2.5px 0 #FFFFFF, 0 3px 0 #1B6F23, 0 7px 14px rgba(33,140,43,0.28)',
        }}
      >
        {text}
      </h1>

      {/* Đốm trang trí 2 bên */}
      <span className="pointer-events-none absolute -left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-pastel-pink" />
      <span className="pointer-events-none absolute -right-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-pastel-blue" />
    </div>
  );
}
