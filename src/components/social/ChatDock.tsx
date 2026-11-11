import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Layers,
  MessageSquare,
  Search,
  Send,
  Smile,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Avatar, Badge, Button, SegmentedControl } from '@/components/ui';
import { StickerImage } from '@/components/chat/StickerImage';
import { StickerPicker } from '@/components/chat/StickerPicker';
import { PlayCard, type CardSize } from '@/components/game/PlayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { useShop } from '@/contexts/ShopContext';
import { useIsPortrait } from '@/hooks/useMediaQuery';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import { itemsOfKind } from '@/data/shopCatalog';
import type { Card } from '@/types';

type PanelTab = 'friends' | 'requests' | 'closet';

/** Nút nổi mở menu cá nhân: bạn bè, lời mời kết bạn và kho đồ. */
export function ChatDock({ landscape = false }: { landscape?: boolean }) {
  const { user } = useAuth();
  const social = useSocial();
  const isPortrait = useIsPortrait();
  const isLandscape = landscape || !isPortrait;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('friends');

  // Khi có cuộc trò chuyện đang mở (từ ngoài, v.d. nút "Nhắn tin" trong phòng),
  // tự mở panel và chuyển sang tab bạn bè để hiện cuộc trò chuyện.
  useEffect(() => {
    if (social.activeChatId) {
      setOpen(true);
      setActiveTab('friends');
    }
  }, [social.activeChatId]);

  if (!social.enabled || !user) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan text-white shadow-glow"
          aria-label="Mở menu cá nhân"
        >
          <UserRound className="h-5 w-5" />
          {(social.unreadTotal > 0 || social.incoming.length > 0) && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {social.incoming.length > 0 ? social.incoming.length : social.unreadTotal > 9 ? '9+' : social.unreadTotal}
            </span>
          )}
        </button>
      )}
      {open && (
        <SocialPanel
          onClose={() => setOpen(false)}
          landscape={isLandscape}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </>
  );
}

/** Panel chính: tiêu đề, đóng và nội dung theo tab (hoặc màn hình chat khi đã chọn bạn). */
function SocialPanel({
  onClose,
  landscape,
  activeTab,
  onTabChange,
}: {
  onClose: () => void;
  landscape: boolean;
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}) {
  const social = useSocial();
  const chatting = Boolean(social.activeChatId);

  return (
    <div
      className={cn(
        'fixed z-40 flex flex-col overflow-hidden border border-white/10 bg-base-850/95 shadow-soft backdrop-blur-md',
        landscape
          ? 'inset-y-4 right-4 max-w-[28rem] rounded-2xl'
          : 'bottom-0 right-0 h-[72vh] max-h-[34rem] w-full sm:bottom-4 sm:right-4 sm:w-96 sm:rounded-2xl',
      )}
      style={landscape ? { width: 'min(28rem, calc(100% - 2rem))' } : undefined}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-base-800/80 px-3 py-2.5">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-slate-100">
          <UserRound className="h-4 w-4 text-neon-cyan" /> Trang cá nhân
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {chatting ? (
        <ChatConversation />
      ) : (
        <>
          <div className="border-b border-white/5 p-2">
            <SegmentedControl
              size="sm"
              value={activeTab}
              onChange={onTabChange}
              className="w-full"
              options={[
                { value: 'friends', label: 'Bạn bè', icon: <Users className="h-3.5 w-3.5" /> },
                {
                  value: 'requests',
                  label: 'Lời mời',
                  icon: <MessageSquare className="h-3.5 w-3.5" />,
                },
                { value: 'closet', label: 'Kho đồ', icon: <Layers className="h-3.5 w-3.5" /> },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTab === 'friends' && <FriendsTab />}
            {activeTab === 'requests' && <RequestsTab />}
            {activeTab === 'closet' && <ClosetTab />}
          </div>
        </>
      )}
    </div>
  );
}

/** Tab Bạn bè: tìm kiếm + danh sách bạn bè, nhấn để mở trò chuyện. */
function FriendsTab() {
  const social = useSocial();
  const [query, setQuery] = useState('');

  const orderedFriends = useMemo(() => {
    const lastAt = new Map(social.conversations.map((c) => [c.friend.id, c.lastMessage?.at ?? 0]));
    return [...social.friends]
      .filter((friend) => friend.displayName.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (lastAt.get(b.id) ?? 0) - (lastAt.get(a.id) ?? 0));
  }, [social.friends, social.conversations, query]);

  return (
    <>
      <div className="border-b border-white/5 p-2.5">
        <div className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-base-900/70 px-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm bạn bè…"
            className="h-full w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>
      <div className="p-1.5">
        {orderedFriends.length === 0 ? (
          <p className="mt-6 px-4 text-center text-xs text-slate-500">
            {social.friends.length === 0
              ? 'Bạn chưa có bạn bè. Hãy kết bạn để bắt đầu trò chuyện.'
              : 'Không tìm thấy bạn bè phù hợp.'}
          </p>
        ) : (
          orderedFriends.map((friend) => {
            const conversation = social.conversations.find((item) => item.friend.id === friend.id);
            const unreadCount = social.unreadOf(friend.id);
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() =>
                  social.openChat({
                    id: friend.id,
                    displayName: friend.displayName,
                    avatar: friend.avatar,
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-white/5"
              >
                <Avatar
                  src={friend.avatar}
                  name={friend.displayName}
                  size="sm"
                  status={friend.online ? 'online' : 'offline'}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-200">
                      {friend.displayName}
                    </span>
                    {unreadCount > 0 && <Badge tone="rose">{unreadCount}</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                    {conversation?.lastMessage
                      ? conversation.lastMessage.type === 'sticker'
                        ? 'Đã gửi nhãn dán'
                        : conversation.lastMessage.text
                      : 'Chưa có tin nhắn'}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

/** Tab Lời mời: lời mời đến (chấp nhận/từ chối) và lời mời đã gửi. */
function RequestsTab() {
  const social = useSocial();
  const hasIncoming = social.incoming.length > 0;
  const hasOutgoing = social.outgoing.length > 0;

  if (!hasIncoming && !hasOutgoing) {
    return (
      <p className="mt-6 px-4 text-center text-xs text-slate-500">
        Chưa có lời mời kết bạn nào.
      </p>
    );
  }

  return (
    <div className="space-y-4 p-2.5">
      {hasIncoming && (
        <section>
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Lời mời đến ({social.incoming.length})
          </p>
          <div className="space-y-1.5">
            {social.incoming.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-base-900/40 p-2.5"
              >
                <Avatar
                  src={request.user.avatar}
                  name={request.user.displayName}
                  size="sm"
                  status={request.user.online ? 'online' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {request.user.displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">@{request.user.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  icon={<Check className="h-3.5 w-3.5" />}
                  onClick={() => void social.acceptRequest(request.id)}
                  aria-label="Chấp nhận"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void social.rejectRequest(request.id)}
                  aria-label="Từ chối"
                  className="text-slate-400 hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasOutgoing && (
        <section>
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Đã gửi ({social.outgoing.length})
          </p>
          <div className="space-y-1.5">
            {social.outgoing.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-base-900/40 p-2.5"
              >
                <Avatar src={request.user.avatar} name={request.user.displayName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {request.user.displayName}
                  </p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" /> Đang chờ chấp nhận…
                  </p>
                </div>
                <Badge tone="neutral">Đã gửi</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Tab Kho đồ: quản lý skin bộ bài đang sở hữu và trang bị. */
function ClosetTab() {
  const { loadout, equip, isOwned, loading } = useShop();
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const cardSkinItems = useMemo(() => itemsOfKind('cardSkin'), []);
  const ownedSkins = useMemo(
    () => cardSkinItems.filter((item) => isOwned(item.id)),
    [cardSkinItems, isOwned],
  );
  const activeSkinId = loadout.cardSkin ?? null;

  const choices = useMemo(
    () => [
      { id: null, name: 'Bộ tiêu chuẩn', description: 'Giao diện bài cổ điển, luôn có sẵn.' },
      ...ownedSkins.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
      })),
    ],
    [ownedSkins],
  );

  const handleEquip = async (itemId: string | null) => {
    const actionId = itemId ?? 'default';
    setEquippingId(actionId);
    try {
      await equip('cardSkin', itemId);
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <div className="space-y-3 p-2.5">
      <div className="rounded-xl border border-neon-cyan/15 bg-gradient-to-br from-neon-cyan/10 via-base-900 to-neon-purple/10 p-3">
        <div className="flex items-center gap-3">
          <CardStackPreview skinId={activeSkinId} size="xs" />
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
              <Check className="h-2.5 w-2.5" /> Đang dùng
            </span>
            <p className="mt-1 truncate text-sm font-bold text-white">
              {ownedSkins.find((s) => s.id === activeSkinId)?.name ?? 'Bộ tiêu chuẩn'}
            </p>
          </div>
        </div>
      </div>

      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Chọn bộ bài ({ownedSkins.length} đã mở khoá)
      </p>

      <div className="space-y-2">
        {choices.map((choice) => {
          const selected = activeSkinId === choice.id;
          const actionId = choice.id ?? 'default';
          const equipping = equippingId === actionId;
          return (
            <div
              key={choice.id ?? 'default'}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-2.5 transition',
                selected
                  ? 'border-neon-cyan/50 bg-neon-cyan/5 shadow-glow'
                  : 'border-white/5 bg-base-900/40 hover:border-white/15',
              )}
            >
              <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-base-950/70">
                <CardStackPreview skinId={choice.id} size="xs" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-100">
                  {choice.name}
                  {selected && <Check className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />}
                </p>
                <p className="line-clamp-1 text-[11px] text-slate-500">{choice.description}</p>
              </div>
              <Button
                size="sm"
                variant={selected ? 'secondary' : 'outline'}
                disabled={loading || selected || equippingId !== null}
                loading={equipping}
                onClick={() => void handleEquip(choice.id)}
              >
                {selected ? 'Đang mặc' : 'Mặc'}
              </Button>
            </div>
          );
        })}
      </div>

      {ownedSkins.length === 0 && (
        <p className="px-1 text-center text-[11px] text-slate-500">
          Chưa có skin nào. Mở khoá trong cửa hàng để làm mới bộ bài của bạn.
        </p>
      )}
    </div>
  );
}

/** Màn hình trò chuyện với một bạn bè. */
function ChatConversation() {
  const { user } = useAuth();
  const social = useSocial();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = social.activeChatId ? social.findUser(social.activeChatId) ?? null : null;
  const messages = active ? social.messagesOf(active.id) : [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, social.activeChatId]);

  const sendText = async () => {
    const text = draft.trim();
    if (!active || sending || !text) return;
    setSending(true);
    try {
      const result = await social.sendMessage(active.id, { text });
      if (result.ok) setDraft('');
    } finally {
      setSending(false);
    }
  };

  const sendSticker = async (stickerId: string) => {
    if (!active || sending) return;
    setSending(true);
    try {
      const result = await social.sendMessage(active.id, { stickerId });
      if (result.ok) setShowStickers(false);
    } finally {
      setSending(false);
    }
  };

  if (!active) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-slate-500">
        Không tìm thấy cuộc trò chuyện.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-white/5 bg-base-800/60 px-2 py-2">
        <button
          type="button"
          onClick={() => social.setActiveChat(null)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label="Quay lại danh sách bạn bè"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar
          src={active.avatar}
          name={active.displayName}
          size="xs"
          status={active.online ? 'online' : 'offline'}
        />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
          {active.displayName}
        </p>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="mt-6 text-center text-xs text-slate-500">Chưa có tin nhắn. Hãy gửi lời chào!</p>
        ) : (
          messages.map((message) => {
            const mine = message.fromId === user?.id;
            const isSticker = message.type === 'sticker' && Boolean(message.stickerId);
            return (
              <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                {isSticker ? (
                  <div className={cn('flex flex-col gap-0.5', mine ? 'items-end' : 'items-start')}>
                    <StickerImage stickerId={message.stickerId!} size={96} />
                    <p className="text-[10px] text-slate-500">{formatRelativeTime(message.at)}</p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3 py-1.5 text-sm',
                      mine
                        ? 'bg-neon-purple/25 text-slate-100'
                        : 'bg-white/5 text-slate-200',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="mt-0.5 text-right text-[10px] text-slate-500">
                      {formatRelativeTime(message.at)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showStickers && <StickerPicker onPick={(id) => void sendSticker(id)} />}

      <div className="flex items-center gap-2 border-t border-white/5 p-2">
        <button
          type="button"
          onClick={() => setShowStickers((value) => !value)}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10',
            showStickers && 'bg-white/10 text-neon-cyan',
          )}
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
              void sendText();
            }
          }}
          placeholder="Nhập tin nhắn…"
          maxLength={500}
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-base-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-neon-purple/70"
        />
        <button
          type="button"
          onClick={() => void sendText()}
          disabled={sending || draft.trim().length === 0}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-violet text-white disabled:opacity-40"
          aria-label="Gửi"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

const PREVIEW_CARDS: Card[] = [
  { id: 'preview-spade-3', suit: 'spade', rank: 3 },
  { id: 'preview-heart-7', suit: 'heart', rank: 7 },
  { id: 'preview-club-king', suit: 'club', rank: 13 },
];

/** Xem trước chồng bài theo skin (rút gọn cho panel). */
function CardStackPreview({ skinId, size }: { skinId: string | null; size: CardSize }) {
  const step = size === 'xs' ? 12 : 18;
  return (
    <div className={cn('relative shrink-0', size === 'xs' ? 'h-12 w-20' : 'h-16 w-28')}>
      {PREVIEW_CARDS.map((card, index) => (
        <div
          key={card.id}
          className="absolute top-0"
          style={{
            left: index * step,
            zIndex: index,
            transform: `rotate(${(index - 1) * 6}deg)`,
          }}
        >
          <PlayCard card={card} skinId={skinId} size={size} />
        </div>
      ))}
    </div>
  );
}
