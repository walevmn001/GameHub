import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { REALTIME_EVENTS, type ChatMessage } from '@/types';
import { socketService } from '@/services/SocketService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Số tin nhắn tối đa giữ trong phiên (máy chủ không lưu lịch sử chat phòng). */
const MAX_MESSAGES = 100;
const MAX_LENGTH = 200;

/**
 * Khung trò chuyện chung của phòng: mọi người đang ở trong phòng/bàn đều nhận được tin.
 * Dùng chung cho phòng chờ và bàn chơi trực tuyến.
 */
export function RoomChat({
  roomId,
  className,
  title = 'Trò chuyện trong phòng',
  onClose,
}: {
  roomId: string;
  className?: string;
  title?: string;
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Nhận tin nhắn của đúng phòng này; reset khi đổi phòng.
  useEffect(() => {
    setMessages([]);
    if (!roomId) return;
    return socketService.on(REALTIME_EVENTS.chatMessage, (message) => {
      if (message.roomId !== roomId) return;
      setMessages((prev) => [...prev, message].slice(-MAX_MESSAGES));
    });
  }, [roomId]);

  // Cuộn xuống tin nhắn mới nhất.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    const result = await socketService.sendChat(text);
    setSending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDraft('');
  };

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-base-900/80',
        className,
      )}
    >
      {/* Tiêu đề */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-base-800/70 px-3 py-2.5">
        <MessageSquare className="h-4 w-4 text-neon-cyan" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">{title}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Đóng trò chuyện"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Danh sách tin nhắn */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="mt-6 text-center text-xs text-slate-500">
            Chưa có tin nhắn. Hãy gửi lời chào tới mọi người trong phòng!
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.fromId === user?.id;
            return (
              <div key={`${message.at}-${message.fromId}-${message.text}`} className={cn('flex gap-2', mine && 'flex-row-reverse')}>
                <Avatar src="" name={message.from} size="xs" />
                <div className={cn('min-w-0 max-w-[80%]', mine && 'text-right')}>
                  {!mine && (
                    <p className="mb-0.5 truncate text-[10px] font-semibold text-slate-400">
                      {message.from}
                    </p>
                  )}
                  <div
                    className={cn(
                      'inline-block rounded-2xl px-3 py-1.5 text-sm',
                      mine ? 'bg-neon-purple/25 text-slate-100' : 'bg-white/5 text-slate-200',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-left">{message.text}</p>
                    <p className={cn('mt-0.5 text-[10px] text-slate-500', mine ? 'text-right' : 'text-left')}>
                      {formatRelativeTime(message.at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ô nhập */}
      <div className="flex items-center gap-2 border-t border-white/5 p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Nhập tin nhắn…"
          maxLength={MAX_LENGTH}
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-base-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-neon-purple/70"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || draft.trim().length === 0}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-violet text-white transition-opacity disabled:opacity-40"
          aria-label="Gửi"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
