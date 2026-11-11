import { cn } from '@/utils/cn';

/**
 * Tiêu đề trang xác thực dạng "text art" có vương miện, bóng mềm và hiệu ứng
 * lắc nhẹ. Dùng chung cho trang Đăng nhập và Tạo tài khoản.
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
      <div className="mb-1 animate-wiggle">
        <svg
          viewBox="0 0 80 48"
          className="h-9 w-14 drop-shadow-sm"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="auth-crown-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE58A" />
              <stop offset="50%" stopColor="#FFC94F" />
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
          <rect x="8" y="36" width="64" height="8" rx="3" fill="#FFC94F" stroke="#C78A1F" strokeWidth="2.5" />
          <circle cx="18" cy="22" r="3" fill="#FF7A9E" />
          <circle cx="40" cy="16" r="3.5" fill="#7DD3FC" />
          <circle cx="62" cy="22" r="3" fill="#86EFAC" />
        </svg>
      </div>

      {/* Chữ có gradient + outline mềm */}
      <h1 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="bg-gradient-to-b from-brand-500 to-brand-700 bg-clip-text text-transparent drop-shadow-[0_2px_0_rgba(255,255,255,0.9)]">
          {text}
        </span>
        {/* Viền ngoài mềm */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 font-display text-3xl font-extrabold tracking-tight text-brand-700/15 blur-[1px] sm:text-4xl"
        >
          {text}
        </span>
      </h1>

      {/* Đốm trang trí 2 bên */}
      <span className="pointer-events-none absolute -left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-pastel-pink" />
      <span className="pointer-events-none absolute -right-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-pastel-blue" />
    </div>
  );
}
