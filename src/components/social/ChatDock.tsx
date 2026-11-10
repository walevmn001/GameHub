import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageSquare, Search, Send, Smile, X } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

// First-party sticker pack: no third-party API, key, CORS or backend proxy required.
const STICKERS = [
  { emoji: '😂', label: 'Cười lớn' },
  { emoji: '😍', label: 'Yêu thích' },
  { emoji: '🥳', label: 'Ăn mừng' },
  { emoji: '😎', label: 'Ngầu' },
  { emoji: '😭', label: 'Khóc' },
  { emoji: '😡', label: 'Tức giận' },
  { emoji: '🤔', label: 'Suy nghĩ' },
  { emoji: '👋', label: 'Xin chào' },
  { emoji: '👍', label: 'Đồng ý' },
  { emoji: '❤️', label: 'Trái tim' },
  { emoji: '🔥', label: 'Tuyệt vời' },
  { emoji: '🎉', label: 'Chúc mừng' },
  { emoji: '🥺', label: 'Đáng yêu' },
  { emoji: '🤝', label: 'Bắt tay' },
  { emoji: '💯', label: '100 điểm' },
];

function isSticker(text: string): boolean {
  return STICKERS.some((sticker) => sticker.emoji === text);
}

export function ChatDock() {
  const { user } = useAuth();
  const social = useSocial();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (social.activeChatId) setOpen(true);
  }, [social.activeChatId]);

  if (!social.enabled || !user) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan text-white shadow-glow transition-transform hover:scale-105"
          aria-label="Mở trò chuyện"
        >
          <MessageSquare className="h-5 w-5" />
          {social.unreadTotal > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {social.unreadTotal > 9 ? '9+' : social.unreadTotal}
            </span>
          )}
        </button>
      )}
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const social = useSocial();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = social.activeChatId ? social.findUser(social.activeChatId) ?? null : null;
  const messages = active ? social.messagesOf(active.id) : [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, social.activeChatId]);

  const orderedFriends = useMemo(() => {
    const lastAt = new Map(social.conversations.map((c) => [c.friend.id, c.lastMessage?.at ?? 0]));
    return [...social.friends]
      .filter((friend) => friend.displayName.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (lastAt.get(b.id) ?? 0) - (lastAt.get(a.id) ?? 0));
  }, [social.friends, social.conversations, query]);

  const send = async (text: string) => {
    if (!active || sending) return;
    setSending(true);
    try {
      const result = await social.sendMessage(active.id, text);
      if (result.ok) {
        if (text === draft.trim()) setDraft('');
        setShowStickers(false);
      }
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    const text = draft.trim();
    if (text) void send(text);
  };

  return (
    <div className="fixed bottom-0 right-0 z-40 flex h-[70vh] max-h-[32rem] w-full flex-col overflow-hidden border border-white/10 bg-base-850/95 shadow-soft backdrop-blur-md sm:bottom-4 sm:right-4 sm:w-96 sm:rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 bg-base-800/80 px-3 py-2.5">
        {active ? (
          <>
            <button type="button" onClick={() => social.setActiveChat(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Danh sách trò chuyện">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Avatar src={active.avatar} name={active.displayName} size="xs" status={active.online ? 'online' : 'offline'} />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">{active.displayName}</p>
          </>
        ) : (
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-slate-100">
            <MessageSquare className="h-4 w-4 text-neon-cyan" /> Trò chuyện
          </p>
        )}
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Đóng">
          <X className="h-4 w-4" />
        </button>
      </div>

      {active ? (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="mt-6 text-center text-xs text-slate-500">Chưa có tin nhắn. Hãy gửi lời chào!</p>
            ) : messages.map((message) => {
              const mine = message.fromId === user?.id;
              const sticker = isSticker(message.text);
              return (
                <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[80%] rounded-2xl px-3 py-1.5 text-sm', mine ? 'bg-neon-purple/25 text-slate-100' : 'bg-white/5 text-slate-200')}>
                    {sticker ? (
                      <span role="img" aria-label="Sticker" className="block text-5xl leading-tight">{message.text}</span>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    )}
                    <p className="mt-0.5 text-right text-[10px] text-slate-500">{formatRelativeTime(message.at)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {showStickers && (
            <div className="max-h-48 overflow-y-auto border-t border-white/5 bg-base-900/80 p-2">
              <div className="grid grid-cols-5 gap-1">
                {STICKERS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => void send(emoji)}
                    disabled={sending}
                    className="rounded-lg p-2 text-3xl transition-colors hover:bg-white/10 disabled:opacity-50"
                    aria-label={`Gửi sticker: ${label}`}
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-center text-[10px] text-slate-500">Sticker GameHub</p>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-white/5 p-2">
            <button
              type="button"
              onClick={() => setShowStickers((value) => !value)}
              className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10', showStickers && 'bg-white/10 text-neon-cyan')}
              aria-label="Chọn nhãn dán"
              title="Chọn nhãn dán"
            >
              <Smile className="h-5 w-5" />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập tin nhắn…"
              maxLength={500}
              className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-base-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-neon-purple/70"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || draft.trim().length === 0}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-violet text-white disabled:opacity-40"
              aria-label="Gửi"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="border-b border-white/5 p-2.5">
            <div className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-base-900/70 px-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm bạn bè…" className="h-full w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none" />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {orderedFriends.length === 0 ? (
              <p className="mt-6 px-4 text-center text-xs text-slate-500">
                {social.friends.length === 0 ? 'Bạn chưa có bạn bè. Hãy kết bạn để bắt đầu trò chuyện.' : 'Không tìm thấy bạn bè phù hợp.'}
              </p>
            ) : orderedFriends.map((friend) => {
              const conversation = social.conversations.find((item) => item.friend.id === friend.id);
              const unreadCount = social.unreadOf(friend.id);
              return (
                <button key={friend.id} type="button" onClick={() => social.openChat({ id: friend.id, displayName: friend.displayName, avatar: friend.avatar })} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-white/5">
                  <Avatar src={friend.avatar} name={friend.displayName} size="sm" status={friend.online ? 'online' : 'offline'} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-200">{friend.displayName}</span>
                      {unreadCount > 0 && <Badge tone="rose">{unreadCount}</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {conversation?.lastMessage ? (isSticker(conversation.lastMessage.text) ? 'Đã gửi nhãn dán' : conversation.lastMessage.text) : 'Chưa có tin nhắn'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
