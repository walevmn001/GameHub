import { cn } from '@/utils/cn';

/**
 * Mascot mèo trắng đeo tai nghe gaming xanh lá — nhận diện thương hiệu của hệ thống
 * xác thực. Vẽ bằng SVG nội tuyến (không phụ thuộc ảnh ngoài, nhẹ và sắc nét mọi
 * kích thước). Component này được DÙNG LẠI NGUYÊN VẸN ở cả trang Đăng nhập và Đăng ký
 * để mascot giữ nguyên thiết kế, màu sắc và phong cách giữa hai trang.
 */
export function AuthMascot({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <svg
        viewBox="0 0 220 210"
        className="h-full w-full animate-float-y drop-shadow-[0_18px_26px_rgba(33,140,43,0.24)]"
        role="img"
        aria-label="Mascot mèo trắng đeo tai nghe gaming màu xanh lá"
      >
        <defs>
          <linearGradient id="mgh-mascot-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EFFBEA" />
          </linearGradient>
          <linearGradient id="mgh-mascot-cup" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8DEB68" />
            <stop offset="100%" stopColor="#62D943" />
          </linearGradient>
          <linearGradient id="mgh-mascot-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8DEB68" />
            <stop offset="100%" stopColor="#62D943" />
          </linearGradient>
        </defs>

        {/* Tai (nằm sau đầu) */}
        <path d="M62 68 L46 16 L98 46 Z" fill="#FFFFFF" stroke="#CFEBC0" strokeWidth="3" strokeLinejoin="round" />
        <path d="M158 68 L174 16 L122 46 Z" fill="#FFFFFF" stroke="#CFEBC0" strokeWidth="3" strokeLinejoin="round" />
        <path d="M66 60 L57 32 L86 48 Z" fill="#FFD3E1" />
        <path d="M154 60 L163 32 L134 48 Z" fill="#FFD3E1" />

        {/* Đầu */}
        <ellipse cx="110" cy="114" rx="74" ry="66" fill="url(#mgh-mascot-head)" stroke="#CFEBC0" strokeWidth="3" />

        {/* Vành tai nghe (headband) */}
        <path
          d="M42 116 A72 72 0 0 1 178 116"
          fill="none"
          stroke="url(#mgh-mascot-band)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M42 116 A72 72 0 0 1 178 116"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Chụp tai */}
        <circle cx="42" cy="122" r="27" fill="url(#mgh-mascot-cup)" stroke="#218C2B" strokeWidth="3" />
        <circle cx="42" cy="122" r="14" fill="#218C2B" opacity="0.22" />
        <circle cx="178" cy="122" r="27" fill="url(#mgh-mascot-cup)" stroke="#218C2B" strokeWidth="3" />
        <circle cx="178" cy="122" r="14" fill="#218C2B" opacity="0.22" />

        {/* Mic gắn bên chụp trái */}
        <path d="M42 146 C46 178 68 192 94 194" fill="none" stroke="#1B6F23" strokeWidth="6" strokeLinecap="round" />
        <circle cx="96" cy="194" r="8" fill="#218C2B" stroke="#164820" strokeWidth="2" />

        {/* Mắt long lanh */}
        <ellipse cx="86" cy="120" rx="11.5" ry="13.5" fill="#24402A" />
        <ellipse cx="134" cy="120" rx="11.5" ry="13.5" fill="#24402A" />
        <circle cx="82" cy="114" r="4.2" fill="#FFFFFF" />
        <circle cx="130" cy="114" r="4.2" fill="#FFFFFF" />
        <circle cx="90" cy="125" r="2.2" fill="#FFFFFF" opacity="0.85" />
        <circle cx="138" cy="125" r="2.2" fill="#FFFFFF" opacity="0.85" />

        {/* Má hồng */}
        <ellipse cx="66" cy="146" rx="13" ry="9" fill="#FFC2D6" opacity="0.85" />
        <ellipse cx="154" cy="146" rx="13" ry="9" fill="#FFC2D6" opacity="0.85" />

        {/* Mũi + miệng */}
        <path d="M103 132 h14 l-7 7 z" fill="#FF9EC1" />
        <path d="M110 141 q-8 9 -16 1" fill="none" stroke="#24402A" strokeWidth="3" strokeLinecap="round" />
        <path d="M110 141 q8 9 16 1" fill="none" stroke="#24402A" strokeWidth="3" strokeLinecap="round" />

        {/* Râu */}
        <g stroke="#CFEBC0" strokeWidth="2.5" strokeLinecap="round">
          <path d="M58 130 L28 124" />
          <path d="M58 138 L26 138" />
          <path d="M58 146 L28 152" />
          <path d="M162 130 L192 124" />
          <path d="M162 138 L194 138" />
          <path d="M162 146 L192 152" />
        </g>
      </svg>
    </div>
  );
}
