import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  fail,
  ok,
  REALTIME_EVENTS,
  type ConversationSummary,
  type DirectMessage,
  type DirectoryUser,
  type FriendRelation,
  type FriendRequestInfo,
  type OutgoingMessage,
  type ServiceResult,
  type SocialNotification,
  type SocialOverview,
} from '@/types';
import { socialService } from '@/services/SocialService';
import { socketService } from '@/services/SocketService';
import { onlineEnabled } from '@/services/backend';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

/** Liên hệ tối thiểu để mở khung chat (không bắt buộc phải nằm trong danh sách bạn bè đã tải). */
export interface ChatContact {
  id: string;
  displayName: string;
  avatar: string;
}

interface SocialContextValue {
  /** true khi tính năng xã hội khả dụng (đã cấu hình backend + đã đăng nhập). */
  enabled: boolean;
  loading: boolean;
  friends: DirectoryUser[];
  incoming: FriendRequestInfo[];
  outgoing: FriendRequestInfo[];
  conversations: ConversationSummary[];
  unreadTotal: number;
  searchResults: DirectoryUser[];
  searching: boolean;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  refresh: () => Promise<void>;
  sendRequest: (userId: string) => Promise<ServiceResult<true>>;
  acceptRequest: (requestId: string) => Promise<ServiceResult<true>>;
  rejectRequest: (requestId: string) => Promise<ServiceResult<true>>;
  unfriend: (userId: string) => Promise<ServiceResult<true>>;
  relationTo: (userId: string) => FriendRelation;
  findUser: (userId: string) => DirectoryUser | undefined;
  // Khung chat nổi
  openChats: ChatContact[];
  activeChatId: string | null;
  messagesOf: (userId: string) => DirectMessage[];
  unreadOf: (userId: string) => number;
  openChat: (contact: ChatContact) => void;
  closeChat: (userId: string) => void;
  setActiveChat: (userId: string | null) => void;
  sendMessage: (userId: string, input: OutgoingMessage) => Promise<ServiceResult<DirectMessage>>;
}

const SocialContext = createContext<SocialContextValue | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const enabled = onlineEnabled && Boolean(user);
  const myId = user?.id ?? null;

  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<DirectoryUser[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestInfo[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestInfo[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchResults, setSearchResults] = useState<DirectoryUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<Record<string, DirectMessage[]>>({});
  const [openChats, setOpenChats] = useState<ChatContact[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});

  const activeRef = useRef<string | null>(null);
  activeRef.current = activeChatId;

  const applyOverview = useCallback((overview: SocialOverview) => {
    setFriends(overview.friends);
    setIncoming(overview.incoming);
    setOutgoing(overview.outgoing);
  }, []);

  const refresh = useCallback(async () => {
    if (!onlineEnabled || !myId) return;
    setLoading(true);
    const [overview, convs] = await Promise.all([
      socialService.overview(),
      socialService.conversations(),
    ]);
    if (overview.ok) applyOverview(overview.data);
    if (convs.ok) {
      setConversations(convs.data);
      setUnread((prev) => {
        const next = { ...prev };
        for (const item of convs.data) next[item.friend.id] = item.unread;
        return next;
      });
    }
    setLoading(false);
  }, [applyOverview, myId]);

  /** Gộp nhiều sự kiện realtime liên tiếp thành một lần tải lại. */
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refresh(), 350);
  }, [refresh]);
  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  /** Đăng nhập/đăng xuất: nạp lại hoặc xoá sạch dữ liệu xã hội. */
  useEffect(() => {
    if (!enabled) {
      setFriends([]);
      setIncoming([]);
      setOutgoing([]);
      setConversations([]);
      setSearchResults([]);
      setMessages({});
      setOpenChats([]);
      setActiveChatIdState(null);
      setUnread({});
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  /** Lắng nghe sự kiện realtime từ máy chủ. */
  useEffect(() => {
    if (!onlineEnabled) return;

    const offSocial = socketService.on(REALTIME_EVENTS.socialUpdate, () => scheduleRefresh());
    const offPresence = socketService.on(REALTIME_EVENTS.presenceUpdate, () => scheduleRefresh());

    const offDm = socketService.on(REALTIME_EVENTS.dmMessage, (message) => {
      if (!myId) return;
      const otherId = message.fromId === myId ? message.toId : message.fromId;
      setMessages((prev) => {
        const list = prev[otherId] ?? [];
        if (list.some((m) => m.id === message.id)) return prev;
        return { ...prev, [otherId]: [...list, message] };
      });
      setConversations((prev) =>
        prev.map((item) =>
          item.friend.id === otherId ? { ...item, lastMessage: message } : item,
        ),
      );
      if (message.toId === myId && activeRef.current !== otherId) {
        setUnread((prev) => ({ ...prev, [otherId]: (prev[otherId] ?? 0) + 1 }));
      }
    });

    const offNotif = socketService.on(REALTIME_EVENTS.socialNotification, (n: SocialNotification) => {
      if (n.kind === 'friend-request') {
        toast.info('Lời mời kết bạn', `${n.fromName} muốn kết bạn với bạn.`);
      } else {
        toast.success('Đã trở thành bạn bè', `${n.fromName} đã chấp nhận lời mời của bạn.`);
      }
    });

    return () => {
      offSocial();
      offPresence();
      offDm();
      offNotif();
    };
  }, [myId, scheduleRefresh, toast]);

  /** Nạp lịch sử tin nhắn + đánh dấu đã đọc khi mở một cuộc trò chuyện. */
  useEffect(() => {
    if (!activeChatId || !enabled) return;
    let cancelled = false;
    const friendId = activeChatId;
    void (async () => {
      const result = await socialService.messages(friendId);
      if (!cancelled && result.ok) {
        setMessages((prev) => {
          const map = new Map((prev[friendId] ?? []).map((m) => [m.id, m]));
          for (const m of result.data) map.set(m.id, m);
          return { ...prev, [friendId]: [...map.values()].sort((a, b) => a.at - b.at) };
        });
      }
    })();
    void socialService.markRead(friendId).then((result) => {
      if (result.ok) setUnread((prev) => ({ ...prev, [friendId]: 0 }));
    });
    return () => {
      cancelled = true;
    };
  }, [activeChatId, enabled]);

  const search = useCallback(async (query: string) => {
    if (!onlineEnabled) return;
    setSearching(true);
    const result = await socialService.search(query);
    setSearching(false);
    setSearchResults(result.ok ? result.data : []);
  }, []);

  const clearSearch = useCallback(() => setSearchResults([]), []);

  const sendRequest = useCallback<SocialContextValue['sendRequest']>(
    async (userId) => {
      const result = await socialService.sendRequest(userId);
      if (result.ok) {
        toast.success('Đã gửi lời mời kết bạn.');
        void refresh();
        return ok(true);
      }
      toast.error(result.error);
      return result;
    },
    [refresh, toast],
  );

  const acceptRequest = useCallback<SocialContextValue['acceptRequest']>(
    async (requestId) => {
      const result = await socialService.acceptRequest(requestId);
      if (result.ok) {
        applyOverview(result.data);
        toast.success('Hai bạn đã trở thành bạn bè.');
        void refresh();
        return ok(true);
      }
      toast.error(result.error);
      return fail(result.error);
    },
    [applyOverview, refresh, toast],
  );

  const rejectRequest = useCallback<SocialContextValue['rejectRequest']>(
    async (requestId) => {
      const result = await socialService.rejectRequest(requestId);
      if (result.ok) {
        applyOverview(result.data);
        return ok(true);
      }
      toast.error(result.error);
      return fail(result.error);
    },
    [applyOverview, toast],
  );

  const unfriend = useCallback<SocialContextValue['unfriend']>(
    async (userId) => {
      const result = await socialService.unfriend(userId);
      if (result.ok) {
        applyOverview(result.data);
        setOpenChats((prev) => prev.filter((c) => c.id !== userId));
        toast.info('Đã huỷ kết bạn.');
        void refresh();
        return ok(true);
      }
      toast.error(result.error);
      return fail(result.error);
    },
    [applyOverview, refresh, toast],
  );

  const relationTo = useCallback<SocialContextValue['relationTo']>(
    (userId) => {
      if (userId === myId) return 'self';
      if (friends.some((f) => f.id === userId)) return 'friend';
      if (outgoing.some((r) => r.user.id === userId)) return 'outgoing';
      if (incoming.some((r) => r.user.id === userId)) return 'incoming';
      return 'none';
    },
    [friends, incoming, outgoing, myId],
  );

  const directory = useMemo(() => {
    const map = new Map<string, DirectoryUser>();
    for (const f of friends) map.set(f.id, f);
    for (const r of incoming) map.set(r.user.id, r.user);
    for (const r of outgoing) map.set(r.user.id, r.user);
    for (const f of conversations.map((c) => c.friend)) map.set(f.id, f);
    for (const u of searchResults) map.set(u.id, u);
    return map;
  }, [friends, incoming, outgoing, conversations, searchResults]);

  const findUser = useCallback((userId: string) => directory.get(userId), [directory]);

  const openChat = useCallback<SocialContextValue['openChat']>((contact) => {
    setOpenChats((prev) => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev.map((c) => (c.id === contact.id ? { ...c, ...contact } : c));
      }
      return [...prev, contact].slice(-3);
    });
    setActiveChatIdState(contact.id);
  }, []);

  const closeChat = useCallback<SocialContextValue['closeChat']>((userId) => {
    setOpenChats((prev) => {
      const next = prev.filter((c) => c.id !== userId);
      setActiveChatIdState((active) => (active === userId ? next[next.length - 1]?.id ?? null : active));
      return next;
    });
  }, []);

  const setActiveChat = useCallback<SocialContextValue['setActiveChat']>((userId) => {
    setActiveChatIdState(userId);
  }, []);

  const sendMessage = useCallback<SocialContextValue['sendMessage']>(
    async (userId, input) => {
      const result = await socialService.sendMessage(userId, input);
      if (result.ok) {
        const message = result.data;
        setMessages((prev) => {
          const list = prev[userId] ?? [];
          if (list.some((m) => m.id === message.id)) return prev;
          return { ...prev, [userId]: [...list, message] };
        });
        setConversations((prev) =>
          prev.map((item) =>
            item.friend.id === userId ? { ...item, lastMessage: message } : item,
          ),
        );
      } else {
        toast.error(result.error);
      }
      return result;
    },
    [toast],
  );

  const messagesOf = useCallback((userId: string) => messages[userId] ?? [], [messages]);
  const unreadOf = useCallback((userId: string) => unread[userId] ?? 0, [unread]);

  const unreadTotal = useMemo(
    () => Object.values(unread).reduce((sum, n) => sum + n, 0),
    [unread],
  );

  const value = useMemo<SocialContextValue>(
    () => ({
      enabled,
      loading,
      friends,
      incoming,
      outgoing,
      conversations,
      unreadTotal,
      searchResults,
      searching,
      search,
      clearSearch,
      refresh,
      sendRequest,
      acceptRequest,
      rejectRequest,
      unfriend,
      relationTo,
      findUser,
      openChats,
      activeChatId,
      messagesOf,
      unreadOf,
      openChat,
      closeChat,
      setActiveChat,
      sendMessage,
    }),
    [
      enabled,
      loading,
      friends,
      incoming,
      outgoing,
      conversations,
      unreadTotal,
      searchResults,
      searching,
      search,
      clearSearch,
      refresh,
      sendRequest,
      acceptRequest,
      rejectRequest,
      unfriend,
      relationTo,
      findUser,
      openChats,
      activeChatId,
      messagesOf,
      unreadOf,
      openChat,
      closeChat,
      setActiveChat,
      sendMessage,
    ],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial(): SocialContextValue {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial phải được dùng bên trong SocialProvider.');
  return ctx;
}
