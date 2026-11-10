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
import { useLocation, useNavigate } from 'react-router-dom';
import { fail, type Room, type RoomStatus, type ServiceResult, type CreateRoomInput } from '@/types';
import { REALTIME_EVENTS } from '@/types';
import { roomService } from '@/services/RoomService';
import { socketService } from '@/services/SocketService';
import { onlineEnabled } from '@/services/backend';
import { activityService } from '@/services/ActivityService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface RoomsContextValue {
  rooms: Room[];
  loading: boolean;
  refresh: () => Promise<void>;
  createRoom: (
    input: Omit<CreateRoomInput, 'hostName' | 'hostAvatar' | 'hostCoins'>,
  ) => Promise<ServiceResult<Room>>;
  joinRoom: (roomId: string, password?: string) => Promise<ServiceResult<Room>>;
  leaveRoom: (roomId: string) => Promise<ServiceResult<Room | null>>;
  transferHost: (roomId: string, nextHostId: string) => Promise<ServiceResult<Room>>;
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
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
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
   * Rời phòng tự động khi người chơi điều hướng ra khỏi trang phòng chờ/bàn chơi
   * mà không bấm "Rời phòng" (ví dụ nút quay lại, nút "Danh sách", trình duyệt back).
   * Nhờ vậy những người chơi khác không còn thấy người đã rời trong phòng.
   */
  const previousPathRef = useRef(location.pathname);
  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = location.pathname;

    if (!onlineEnabled) return;
    const roomId = socketService.currentRoomId;
    if (!roomId) return;

    const roomPath = `/rooms/${roomId}`;
    const path = location.pathname;
    // Đang ở trong phòng hoặc bàn chơi của phòng đó thì vẫn thuộc phòng.
    if (path === roomPath || path.startsWith('/play')) return;
    // Chỉ rời khi trước đó thực sự đang ở trang phòng/bàn để tránh rời nhầm.
    const wasInRoom = previousPath === roomPath || previousPath.startsWith('/play');
    if (!wasInRoom) return;

    void socketService.leaveRoom(roomId).then(() => refresh());
  }, [location.pathname, refresh]);

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
    const offClosed = socketService.on(REALTIME_EVENTS.roomClosed, ({ roomId, reason }) => {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      if (socketService.currentRoomId === roomId) {
        void socketService.leaveRoom(roomId);
        toast.info(reason === 'admin' ? 'Phòng đã bị admin xóa.' : 'Chủ phòng đã xóa phòng.');
        navigate('/rooms', { replace: true });
      }
    });
    return () => {
      offUpdated();
      offClosed();
    };
  }, [navigate, toast]);

  const createRoom = useCallback<RoomsContextValue['createRoom']>(
    async (input) => {
      if (!user) {
        const message = 'Bạn cần đăng nhập hoặc tạo tài khoản để tạo phòng.';
        toast.info('Bạn cần đăng nhập', message);
        return fail(message);
      }
      const name = user.displayName;
      const avatar = user.avatar;
      const result = await roomService.createRoom(
        { ...input, hostName: name, hostAvatar: avatar, hostCoins: user.coins },
        user.id,
      );
      if (result.ok) {
        await activityService.log('room', `Tạo phòng "${result.data.name}".`);
        await refresh();
      }
      return result;
    },
    [user, refresh, toast],
  );

  const joinRoom = useCallback<RoomsContextValue['joinRoom']>(
    async (roomId, password) => {
      if (!user) {
        const message = 'Bạn cần đăng nhập hoặc tạo tài khoản để vào phòng.';
        toast.info('Bạn cần đăng nhập', message);
        return fail(message);
      }
      const result = await roomService.joinRoom(
        roomId,
        {
          id: user.id,
          name: user.displayName,
          avatar: user.avatar,
          coins: user.coins,
        },
        password,
      );
      if (result.ok) {
        await activityService.log('room', `Tham gia phòng "${result.data.name}".`);
        await refresh();
      }
      return result;
    },
    [user, refresh, toast],
  );

  const leaveRoom = useCallback<RoomsContextValue['leaveRoom']>(
    async (roomId) => {
      const result = await roomService.leaveRoom(roomId, user?.id ?? 'guest');
      // Dọn kênh Socket.IO để máy chủ xoá hẳn thành viên và dừng ván (nếu có).
      if (onlineEnabled) void socketService.leaveRoom(roomId);
      if (result.ok) await refresh();
      return result;
    },
    [user, refresh],
  );

  const deleteRoom = useCallback<RoomsContextValue['deleteRoom']>(
    async (roomId) => {
      const result = await roomService.deleteRoom(roomId);
      if (result.ok) {
        if (onlineEnabled && socketService.currentRoomId === roomId) {
          await socketService.leaveRoom(roomId);
        }
        await refresh();
      }
      return result;
    },
    [refresh],
  );

  const transferHost = useCallback<RoomsContextValue['transferHost']>(
    async (roomId, nextHostId) => {
      const result = await roomService.transferHost(roomId, user?.id ?? 'guest', nextHostId);
      if (result.ok) await refresh();
      return result;
    },
    [user?.id, refresh],
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
      transferHost,
      startMatch,
      addBot,
      removeBot,
      deleteRoom,
      setStatus,
      getRoom,
    }),
    [rooms, loading, refresh, createRoom, joinRoom, leaveRoom, transferHost, startMatch, addBot, removeBot, deleteRoom, setStatus, getRoom],
  );

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms phải được dùng bên trong RoomsProvider.');
  return ctx;
}
