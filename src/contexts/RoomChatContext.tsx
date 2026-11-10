import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { REALTIME_EVENTS, type ChatMessage } from '@/types';
import { socketService } from '@/services/SocketService';
import { onlineEnabled } from '@/services/backend';
import { useAuth } from './AuthContext';

/** Thời gian hiển thị bong bóng chat phía trên avatar (ms). */
const BUBBLE_MS = 5000;

interface RoomChatContextValue {
  /** Tin nhắn phòng mới nhất của một người gửi (để hiện bong bóng trên avatar); null nếu không có. */
  bubbleFor: (userId: string) => ChatMessage | null;
}

const RoomChatContext = createContext<RoomChatContextValue | null>(null);

/**
 * Theo dõi tin nhắn chat phòng để hiển thị bong bóng thoại phía trên avatar
 * của người vừa nhắn, dùng chung cho phòng chờ và bàn đấu trực tuyến.
 */
export function RoomChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bubbles, setBubbles] = useState<Record<string, ChatMessage>>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (!user || !onlineEnabled) return undefined;
    const off = socketService.on(REALTIME_EVENTS.chatMessage, (message) => {
      setBubbles((prev) => ({ ...prev, [message.fromId]: message }));
      const existing = timers.current.get(message.fromId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        timers.current.delete(message.fromId);
        setBubbles((prev) => {
          if (prev[message.fromId]?.at !== message.at) return prev;
          const next = { ...prev };
          delete next[message.fromId];
          return next;
        });
      }, BUBBLE_MS);
      timers.current.set(message.fromId, timer);
    });
    const active = timers.current;
    return () => {
      off();
      for (const timer of active.values()) clearTimeout(timer);
      active.clear();
      setBubbles({});
    };
  }, [user]);

  const bubbleFor = useCallback((userId: string) => bubbles[userId] ?? null, [bubbles]);

  return <RoomChatContext.Provider value={{ bubbleFor }}>{children}</RoomChatContext.Provider>;
}

export function useRoomChat(): RoomChatContextValue {
  const ctx = useContext(RoomChatContext);
  if (!ctx) throw new Error('useRoomChat phải được dùng bên trong RoomChatProvider');
  return ctx;
}
