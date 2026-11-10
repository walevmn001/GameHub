import type { MessageType } from '@/types';
import { StickerImage } from '@/components/chat/StickerImage';
import { cn } from '@/utils/cn';

/**
 * Bong bóng thoại hiển thị tin nhắn chat phòng.
 *
 * Mặc định (`floating = true`): phủ giữa một phần tử `relative` (thường là avatar).
 * Dùng `floating = false` để hiển thị trong luồng bình thường, canh giữa tự động.
 * Hỗ trợ hai loại nội dung: văn bản (`text`) và nhãn dán (`stickerId`).
 */
export function ChatBubble({
  type,
  text,
  stickerId,
  className,
  floating = true,
}: {
  type: MessageType;
  text: string;
  stickerId: string | null;
  className?: string;
  floating?: boolean;
}) {
  const wrapper = floating
    ? cn(
        'pointer-events-none absolute inset-0 z-30 flex items-center justify-center animate-fade-in',
        className,
      )
    : cn(
        'pointer-events-none flex justify-center animate-fade-in',
        className,
      );

  // Nhãn dán: hiển thị thẳng hình, không cần khung bong bóng.
  if (type === 'sticker' && stickerId) {
    return (
      <div className={wrapper}>
        <StickerImage stickerId={stickerId} size={40} className="drop-shadow-lg" />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <div className="relative max-w-[9rem] rounded-xl bg-slate-100 px-2.5 py-1 shadow-soft">
        <p className="line-clamp-2 break-words text-center text-[11px] font-medium leading-snug text-slate-900">
          {text}
        </p>
      </div>
    </div>
  );
}
