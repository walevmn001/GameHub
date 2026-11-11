import { cn } from '@/utils/cn';

/**
 * Mascot thương hiệu GameHub — chú slime xanh lá dễ thương.
 * Thuần SVG, hoạt động offline, không cần tài nguyên ngoài.
 *
 * `uid` dùng để tạo id gradient duy nhất khi có nhiều mascot trên cùng trang
 * (tránh trùng id SVG gây lỗi hiển thị).
 */
export function GameHubMascot({
  className,
  uid = 'mascot',
  wink = false,
}: {
  className?: string;
  uid?: string;
  wink?: boolean;
}) {
  const body = `slime-body-${uid}`;
  const cheek = `slime-cheek-${uid}`;
  const shine = `slime-shine-${uid}`;

  return (
    <svg viewBox="0 0 200 200" className={cn('drop-shadow-xl', className)} aria-hidden="true">
      <defs>
        <radialGradient id={body} cx="40%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#A8DDB5" />
          <stop offset="55%" stopColor="#75C98A" />
          <stop offset="100%" stopColor="#238B50" />
        </radialGradient>
        <radialGradient id={cheek} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB3C1" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFB3C1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shine} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bóng đổ dưới chân */}
      <ellipse cx="100" cy="178" rx="46" ry="10" fill="#238B50" opacity="0.14" />

      {/* Thân slime */}
      <path
        d="M100 26 C56 26 30 62 30 104 C30 148 60 174 100 174 C140 174 170 148 170 104 C170 62 144 26 100 26 Z"
        fill={`url(#${body})`}
      />
      {/* Viền sáng trên đỉnh */}
      <path
        d="M100 30 C62 30 40 58 36 92 C52 66 76 54 100 54 C124 54 148 66 164 92 C160 58 138 30 100 30 Z"
        fill="#FFFFFF"
        opacity="0.18"
      />
      {/* Đốm sáng */}
      <ellipse cx="76" cy="60" rx="20" ry="13" fill={`url(#${shine})`} />
      <circle cx="60" cy="84" r="7" fill="#FFFFFF" opacity="0.4" />

      {/* Mắt */}
      {wink ? (
        <>
          <path d="M70 100 Q80 92 90 100" fill="none" stroke="#1A2B20" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="122" cy="100" rx="9" ry="11" fill="#1A2B20" />
          <circle cx="125" cy="96" r="3" fill="#FFFFFF" />
        </>
      ) : (
        <>
          <ellipse cx="80" cy="100" rx="9.5" ry="11.5" fill="#1A2B20" />
          <ellipse cx="120" cy="100" rx="9.5" ry="11.5" fill="#1A2B20" />
          <circle cx="83.5" cy="95.5" r="3.2" fill="#FFFFFF" />
          <circle cx="123.5" cy="95.5" r="3.2" fill="#FFFFFF" />
        </>
      )}

      {/* Má hồng */}
      <ellipse cx="64" cy="118" rx="11" ry="7.5" fill={`url(#${cheek})`} />
      <ellipse cx="136" cy="118" rx="11" ry="7.5" fill={`url(#${cheek})`} />

      {/* Miệng cười */}
      <path
        d="M86 128 Q100 143 114 128"
        fill="none"
        stroke="#1A2B20"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
