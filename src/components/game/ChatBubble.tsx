import { cn } from '@/utils/cn';

/**
 * Bong bóng thoại hiển thị tin nhắn chat phòng phía trên avatar người gửi.
 * Đặt bên trong một phần tử `relative` (thường là khung bao quanh avatar).
 */
export function ChatBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 animate-fade-in',
        className,
      )}
    >
      <div className="relative max-w-[9rem] rounded-xl bg-slate-100 px-2.5 py-1 shadow-soft">
        <p className="line-clamp-2 break-words text-center text-[11px] font-medium leading-snug text-slate-900">
          {text}
        </p>
        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-100" />
      </div>
    </div>
  );
}
