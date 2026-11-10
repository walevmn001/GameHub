import type { MessageType } from '@/types';
import { StickerImage } from '@/components/chat/StickerImage';
import { cn } from '@/utils/cn';

/**
 * Bong bóng thoại hiển thị tin nhắn chat phòng phía trên avatar người gửi.
 * Đặt bên trong một phần tử `relative` (thường là khung bao quanh avatar).
 * Hỗ trợ hai loại nội dung: văn bản (`text`) và nhãn dán (`stickerId`).
 */
export function ChatBubble({
  type,
  text,
  stickerId,
  className,
}: {
  type: MessageType;
  text: string;
  stickerId: string | null;
  className?: string;
}) {
  const wrapper = cn(
    'pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 animate-fade-in',
    className,
  );

  // Nhãn dán: hiển thị thẳng hình, không cần khung bong bóng.
  if (type === 'sticker' && stickerId) {
    return (
      <div className={wrapper}>
        <StickerImage stickerId={stickerId} size={112} className="drop-shadow-lg" />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <div className="relative max-w-[9rem] rounded-xl bg-slate-100 px-2.5 py-1 shadow-soft">
        <p className="line-clamp-2 break-words text-center text-[11px] font-medium leading-snug text-slate-900">
          {text}
        </p>
        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-100" />
      </div>
    </div>
  );
}
