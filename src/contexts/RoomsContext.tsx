import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Room, RoomStatus, ServiceResult, CreateRoomInput } from '@/types';
import { REALTIME_EVENTS } from '@/types';
import { roomService } from '@/services/RoomService';
import { socketService } from '@/services/SocketService';
import { activityService } from '@/services/ActivityService';
import { useAuth } from './AuthContext';

interface RoomsContextValue {
  rooms: Room[];
  loading: boolean;
  refresh: () => Promise<void>;
  createRoom: (
    input: Omit<CreateRoomInput, 'hostName' | 'hostAvatar' | 'hostCoins'>,
  ) => Promise<ServiceResult<Room>>;
  joinRoom: (roomId: string, password?: string) => Promise<ServiceResult<Room>>;
  leaveRoom: (roomId: string) => Promise<ServiceResult<Room | null>>;
  startMatch: (roomId: string) => Promise<ServiceResult<Room>>;
  addBot: (roomId: string) => Promise<ServiceResult<Room>>;
  removeBot: (roomId: string, botId: string) => Promise<ServiceResult<Room>>;
  deleteRoom: (roomId: string) => Promise<ServiceResult<true>>;
  setStatus: (roomId: string, status: RoomStatus) => Promise<ServiceResult<Room>>;
  getRoom: (roomId: string) => Promise<Room | null>;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await roomService.listRooms();
    setRooms(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Đồng bộ danh sách phòng theo thời gian thực: khi máy chủ phát `room:updated`
   * hoặc `room:closed`, cập nhật ngay mà không cần tải lại toàn bộ danh sách.
   */
  useEffect(() => {
    const offUpdated = socketService.on(REALTIME_EVENTS.roomUpdated, (updated) => {
      setRooms((prev) => {
        const index = prev.findIndex((r) => r.id === updated.id);
        if (index === -1) return [updated, ...prev];
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    });
    const offClosed = socketService.on(REALTIME_EVENTS.roomClosed, ({ roomId }) => {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    });
    return () => {
      offUpdated();
      offClosed();
    };
  }, []);

  const createRoom = useCallback<RoomsContextValue['createRoom']>(
    async (input) => {
      const name = user?.displayName ?? 'Khách';
      const avatar = user?.avatar ?? '';
      const result = await roomService.createRoom(
        { ...input, hostName: name, hostAvatar: avatar, hostCoins: user?.coins },
        user?.id ?? 'guest',
      );
      if (result.ok) {
        await activityService.log('room', `Tạo phòng "${result.data.name}".`);
        await refresh();
      }
      return result;
    },
    [user, refresh],
  );

  const joinRoom = useCallback<RoomsContextValue['joinRoom']>(
    async (roomId, password) => {
      const result = await roomService.joinRoom(
        roomId,
        {
          id: user?.id ?? 'guest',
          name: user?.displayName ?? 'Khách',
          avatar: user?.avatar ?? '',
          coins: user?.coins,
        },
        password,
      );
      if (result.ok) {
        await activityService.log('room', `Tham gia phòng "${result.data.name}".`);
        await refresh();
      }
      return result;
    },
    [user, refresh],
  );

  const leaveRoom = useCallback<RoomsContextValue['leaveRoom']>(
    async (roomId) => {
      const result = await roomService.leaveRoom(roomId, user?.id ?? 'guest');
      if (result.ok) await refresh();
      return result;
    },
    [user, refresh],
  );

  const deleteRoom = useCallback<RoomsContextValue['deleteRoom']>(
    async (roomId) => {
      const result = await roomService.deleteRoom(roomId);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  const addBot = useCallback<RoomsContextValue['addBot']>(
    async (roomId) => {
      const result = await roomService.addBot(roomId);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  const removeBot = useCallback<RoomsContextValue['removeBot']>(
    async (roomId, botId) => {
      const result = await roomService.removeBot(roomId, botId);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  const getRoom = useCallback((roomId: string) => roomService.getRoom(roomId), []);

  const setStatus = useCallback<RoomsContextValue['setStatus']>(
    async (roomId, status) => {
      const result = await roomService.setStatus(roomId, status);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  /** Chủ phòng bắt đầu ván đấu. Trực tuyến: máy chủ khởi tạo ván và phát qua Socket.IO. */
  const startMatch = useCallback<RoomsContextValue['startMatch']>(
    async (roomId) => {
      const result = await roomService.startMatch(roomId);
      if (result.ok) await refresh();
      return result;
    },
    [refresh],
  );

  const value = useMemo<RoomsContextValue>(
    () => ({
      rooms,
      loading,
      refresh,
      createRoom,
      joinRoom,
      leaveRoom,
      startMatch,
      addBot,
      removeBot,
      deleteRoom,
      setStatus,
      getRoom,
    }),
    [rooms, loading, refresh, createRoom, joinRoom, leaveRoom, startMatch, addBot, removeBot, deleteRoom, setStatus, getRoom],
  );

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms phải được dùng bên trong RoomsProvider.');
  return ctx;
}
