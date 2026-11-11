import { cn } from '@/utils/cn';

/**
 * Tiêu đề trang xác thực dạng cartoon: chữ gradient xanh lá nổi bằng drop-shadow xanh đậm,
 * KHÔNG dùng viền trắng (trên nền trắng sẽ bị mờ) và không có vương miện (vương miện
 * chỉ giữ trong lớp trang trí nền).
 */
export function AuthTitle({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <h1
        className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl"
        style={{
          backgroundImage: 'linear-gradient(180deg, #8DEB68 0%, #62D943 45%, #218C2B 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter:
            'drop-shadow(0 2.5px 0 #1B6F23) drop-shadow(0 6px 10px rgba(33,140,43,0.28))',
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
