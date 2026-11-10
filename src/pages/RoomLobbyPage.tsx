import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Coins,
  Crown,
  DoorOpen,
  KeyRound,
  Lock,
  LogOut,
  Play,
  Settings2,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { REALTIME_EVENTS, minCoinsToPlay, summarizeConfig, type Room } from '@/types';
import { gameService } from '@/services/GameService';
import { onlineEnabled } from '@/services/backend';
import { socketService } from '@/services/SocketService';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/contexts/RoomsContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  FullPageLoader,
  Input,
  Modal,
  SectionHeader,
  Surface,
} from '@/components/ui';
import { NoticeBanner } from '@/components/common/NoticeBanner';
import { PlayerProfileButton } from '@/components/social/PlayerProfileButton';
import { RoomChat } from '@/components/game/RoomChat';
import { ChatBubble } from '@/components/game/ChatBubble';
import { useRoomChat } from '@/contexts/RoomChatContext';
import { cn } from '@/utils/cn';

const STATUS_LABEL: Record<Room['status'], string> = {
  waiting: 'Đang chờ',
  playing: 'Đang chơi',
  closed: 'Đã đóng',
};

const STATUS_TONE: Record<Room['status'], 'green' | 'amber' | 'neutral'> = {
  waiting: 'green',
  playing: 'amber',
  closed: 'neutral',
};

/**
 * Phòng chờ (Lobby) — hiển thị thành viên trong phòng và cho chủ phòng bắt đầu ván.
 * GIAI ĐOẠN HIỆN TẠI: phòng hoàn toàn cục bộ. Khi bắt đầu, 3 ghế còn lại do AI cục bộ đảm nhiệm;
 * chưa có kết nối nhiều người chơi qua Internet.
 */
export function RoomLobbyPage() {
  const { roomId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const {
    getRoom,
    joinRoom,
    leaveRoom,
    transferHost,
    addBot,
    removeBot,
    setStatus,
    startMatch,
    rooms,
  } = useRooms();
  const { bubbleFor } = useRoomChat();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [busyBot, setBusyBot] = useState(false);
  const [hostLeaveOpen, setHostLeaveOpen] = useState(false);
  const [successorId, setSuccessorId] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const roomRef = useRef<Room | null>(null);
  roomRef.current = room;
  /** Chỉ điều hướng vào bàn một lần, tránh vừa REST vừa sự kiện realtime cùng chuyển trang. */
  const navigatedRef = useRef(false);

  const loadRoom = useCallback(async () => {
    setLoading(true);
    const found = await getRoom(roomId);
    setRoom(found);
    setLoading(false);
  }, [getRoom, roomId]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  /** Đồng bộ lại khi danh sách phòng thay đổi (tạo/join/rời phòng ở nơi khác). */
  useEffect(() => {
    const next = rooms.find((r) => r.id === roomId);
    if (next) setRoom(next);
  }, [rooms, roomId]);

  const currentUserId = user?.id ?? 'guest';
  const joined = useMemo(
    () => Boolean(room?.players.some((p) => p.id === currentUserId)),
    [room, currentUserId],
  );
  const isHost = useMemo(
    () => Boolean(room?.players.some((p) => p.id === currentUserId && p.isHost)),
    [room, currentUserId],
  );

  useEffect(() => {
    const state = location.state as { promptHostLeave?: boolean } | null;
    if (!state?.promptHostLeave || !joined || !isHost) return;
    const firstSuccessor = room?.players.find((player) => !player.isBot && player.id !== currentUserId);
    if (firstSuccessor) {
      setSuccessorId(firstSuccessor.id);
      setHostLeaveOpen(true);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [currentUserId, isHost, joined, location.pathname, location.state, navigate, room]);

  /** Chuyển sang bàn chơi. Trực tuyến: kèm mã phòng để bàn chơi nối Socket.IO. */
  const goToBoard = useCallback(() => {
    const current = roomRef.current;
    if (!current || navigatedRef.current) return;
    navigatedRef.current = true;
    const me = user?.id ?? 'guest';
    const ordered = [
      ...current.players.filter((p) => p.id === me),
      ...current.players.filter((p) => p.id !== me),
    ];
    navigate(`/play/${current.gameId}`, {
      state: {
        config: current.config,
        seats: ordered.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isBot: p.isBot,
          isHost: p.isHost,
          coins: p.coins,
        })),
        roomId: onlineEnabled ? current.id : undefined,
      },
    });
  }, [navigate, user?.id]);

  /** Trực tuyến: vào kênh phòng qua Socket.IO để nhận cập nhật và lệnh bắt đầu ván. */
  useEffect(() => {
    if (!onlineEnabled || !joined) return;
    void socketService.joinRoom(roomId);
  }, [joined, roomId]);

  /** Trực tuyến: khi chủ phòng bắt đầu ván, mọi người trong phòng cùng vào bàn. */
  useEffect(() => {
    if (!onlineEnabled) return;
    return socketService.on(REALTIME_EVENTS.matchStarted, () => goToBoard());
  }, [goToBoard]);

  const playable = room ? gameService.isPlayable(room.gameId) : false;
  const gameMeta = room ? gameService.getGame(room.gameId) : undefined;

  const emptySeats = room ? Math.max(0, room.maxPlayers - room.players.length) : 0;

  /** Số người tối thiểu theo loại trò chơi — chưa đủ thì chưa được bắt đầu. */
  const minPlayers = gameMeta?.minPlayers ?? 2;
  const missingPlayers = room ? Math.max(0, minPlayers - room.players.length) : 0;
  const enoughPlayers = missingPlayers === 0;
  const canStart = playable && enoughPlayers;
  const roomFull = room ? room.players.length >= room.maxPlayers : false;

  const handleStart = async () => {
    if (!room) return;
    if (!playable) {
      toast.error('Trò chơi này chưa thể chơi', `${gameMeta?.name ?? room.gameId} đang được phát triển.`);
      return;
    }
    if (!enoughPlayers) {
      toast.error(
        'Chưa đủ người chơi',
        `Cần thêm ${missingPlayers} người nữa để bắt đầu ván.`,
      );
      return;
    }
    setStarting(true);
    if (onlineEnabled) {
      // Máy chủ khởi tạo ván và phát `match:started` cho mọi người trong phòng.
      const result = await startMatch(room.id);
      setStarting(false);
      if (!result.ok) {
        toast.error('Không thể bắt đầu ván', result.error);
        return;
      }
      goToBoard();
      return;
    }
    await setStatus(room.id, 'playing');
    setStarting(false);
    goToBoard();
  };

  const leaveAsMember = async () => {
    if (!room) return;
    setLeaving(true);
    const result = await leaveRoom(room.id);
    setLeaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info(`Đã rời phòng "${room.name}"`);
    navigate('/rooms');
  };

  const handleLeave = () => {
    if (!isHost) {
      void leaveAsMember();
      return;
    }
    const firstSuccessor = room?.players.find((player) => !player.isBot && player.id !== currentUserId);
    // Không còn người thật khác để nhận quyền: rời luôn, phòng tự xoá nếu không còn ai.
    if (!firstSuccessor) {
      void leaveAsMember();
      return;
    }
    setSuccessorId(firstSuccessor.id);
    setHostLeaveOpen(true);
  };

  const confirmHostLeave = async () => {
    if (!room) return;
    if (!successorId) {
      toast.error('Hãy chọn người nhận quyền chủ phòng.');
      return;
    }

    setLeaving(true);
    const ownership = await transferHost(room.id, successorId);
    if (!ownership.ok) {
      setLeaving(false);
      toast.error('Không thể chuyển quyền chủ phòng', ownership.error);
      return;
    }
    setRoom(ownership.data);
    const result = await leaveRoom(room.id);
    setLeaving(false);
    if (!result.ok) {
      toast.error('Đã chuyển quyền nhưng chưa thể rời phòng', result.error);
      setHostLeaveOpen(false);
      return;
    }
    setHostLeaveOpen(false);
    toast.info(`Đã chuyển quyền phòng "${room.name}" và rời phòng.`);
    navigate('/rooms');
  };

  const handleJoin = async () => {
    if (!room) return;
    if (room.gameId === 'tien-len') {
      const required = minCoinsToPlay(room.config);
      const balance = user?.coins ?? 0;
      if (balance < required) {
        toast.error(
          'Không thể tham gia phòng',
          `Bạn cần tối thiểu ${required.toLocaleString('vi-VN')} xu để vào bàn này (đủ chịu một ván thua nặng, kể cả bị chặt/thối Heo). Số dư hiện tại: ${balance.toLocaleString('vi-VN')} xu.`,
        );
        return;
      }
    }
    setJoining(true);
    const result = await joinRoom(room.id, passwordInput.trim() || undefined);
    setJoining(false);
    if (!result.ok) {
      toast.error('Không thể tham gia phòng', result.error);
      return;
    }
    setRoom(result.data);
    setPasswordInput('');
    toast.success(`Đã tham gia phòng "${result.data.name}"`);
  };

  const handleAddBot = async () => {
    if (!room) return;
    setBusyBot(true);
    const result = await addBot(room.id);
    setBusyBot(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRoom(result.data);
  };

  const handleRemoveBot = async (botId: string) => {
    if (!room) return;
    setBusyBot(true);
    const result = await removeBot(room.id, botId);
    setBusyBot(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRoom(result.data);
  };

  if (loading) {
    return <FullPageLoader label="Đang tải phòng…" />;
  }

  if (!room) {
    return (
      <EmptyState
        icon={<XCircle className="h-6 w-6" />}
        title="Không tìm thấy phòng"
        description="Phòng có thể đã bị đóng hoặc không còn tồn tại trên thiết bị này."
        action={
          <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/rooms')}>
            Về danh sách phòng
          </Button>
        }
      />
    );
  }

  const isPrivate = room.visibility === 'private';

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title={room.name}
        subtitle={`${room.gameName} · chủ phòng: ${room.hostName}`}
        icon={<Users className="h-5 w-5" />}
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => (joined ? handleLeave() : navigate('/rooms'))}
          >
          {joined ? 'Rời phòng' : 'Danh sách'}
          </Button>
        }
      />

      {onlineEnabled ? (
        <NoticeBanner variant="info" title="Phòng chơi trực tuyến">
          Phòng nằm trên máy chủ, mọi người chơi qua Internet cùng vào một bàn. Khi chủ phòng bắt
          đầu, cả phòng được đưa vào ván đấu đồng bộ theo thời gian thực.
        </NoticeBanner>
      ) : (
        <NoticeBanner variant="info" title="Phòng chơi cục bộ (Demo)">
          Phòng chỉ tồn tại trên thiết bị này. Khi bắt đầu ván, các ghế còn trống sẽ do AI cục bộ đảm
          nhiệm — chưa có kết nối nhiều người chơi qua Internet.
        </NoticeBanner>
      )}

      {/* Thông tin phòng */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={STATUS_TONE[room.status]}>{STATUS_LABEL[room.status]}</Badge>
        <Badge tone={isPrivate ? 'amber' : 'cyan'} icon={isPrivate ? <Lock className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}>
          {isPrivate ? 'Riêng tư' : 'Công khai'}
        </Badge>
        <Badge tone="neutral" icon={<Users className="h-3 w-3" />}>
          {room.players.length}/{room.maxPlayers} người
        </Badge>
        {room.password && isHost && (
          <Badge tone="purple" icon={<KeyRound className="h-3 w-3" />}>
            Mật khẩu: {room.password}
          </Badge>
        )}
      </div>

      {/* Danh sách chỗ ngồi */}
      {room.gameId === 'tien-len' && (
        <Surface className="flex flex-col gap-1.5 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Settings2 className="h-4 w-4 text-neon-cyan" />
            Cấu hình bàn chơi
          </p>
          <p className="text-xs text-slate-300">{summarizeConfig(room.config)}</p>
        </Surface>
      )}

      <Surface className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Thành viên trong phòng
          </p>
          <span
            className={cn(
              'text-[11px] font-semibold',
              enoughPlayers ? 'text-emerald-300' : 'text-amber-300',
            )}
          >
            {enoughPlayers
              ? 'Đã đủ người để bắt đầu'
              : `${gameMeta?.name ?? 'Trò chơi'} cần ${minPlayers} người (còn thiếu ${missingPlayers})`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {room.players.map((player) => {
            const bubble = onlineEnabled ? bubbleFor(player.id) : null;
            return (
            <div
              key={player.id}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center',
                player.isHost ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-base-900/60',
              )}
            >
              {isHost && player.isBot && (
                <button
                  type="button"
                  title="Xoá người máy"
                  disabled={busyBot}
                  onClick={() => void handleRemoveBot(player.id)}
                  className="absolute right-1.5 top-1.5 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-300 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="relative inline-flex">
                <PlayerProfileButton
                  contact={{ id: player.id, displayName: player.name, avatar: player.avatar }}
                  summary={`${player.isBot ? 'Người máy' : player.isHost ? 'Chủ phòng' : 'Người chơi'} · ${player.coins.toLocaleString('vi-VN')} xu`}
                  disableSocial={player.isBot}
                >
                  <Avatar src={player.avatar} name={player.name} size="md" ring={player.isHost} />
                </PlayerProfileButton>
                {bubble && (
                  <ChatBubble
                    type={bubble.type}
                    text={bubble.text}
                    stickerId={bubble.stickerId}
                  />
                )}
              </div>
              <p className="flex w-full items-center justify-center gap-1 truncate text-xs font-semibold text-slate-200">
                {player.isHost && <Crown className="h-3 w-3 shrink-0 text-amber-400" />}
                <span className="truncate">{player.name}</span>
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                {player.isBot ? (
                  <>
                    <Bot className="h-3 w-3" /> AI
                  </>
                ) : player.isHost ? (
                  'Chủ phòng'
                ) : (
                  'Người chơi'
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                <Coins className="h-3 w-3" />
                {player.coins.toLocaleString('vi-VN')} xu
              </span>
            </div>
            );
          })}

          {Array.from({ length: emptySeats }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-3 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-white/15 text-slate-600">
                <Users className="h-5 w-5" />
              </span>
              <span className="text-[10px] text-slate-600">Ghế trống</span>
            </div>
          ))}
        </div>
      </Surface>

      {/* Trò chuyện với mọi người trong phòng (chỉ khi trực tuyến). */}
      {onlineEnabled && joined && (
        <RoomChat roomId={room.id} className="h-[22rem]" />
      )}

      {/* Hành động */}
      <Surface className="flex flex-col gap-3 p-4">
        {!joined ? (
          <>
            <p className="text-xs text-slate-400">
              Bạn chưa ở trong phòng này. Hãy tham gia để bắt đầu.
            </p>
            {isPrivate && (
              <Input
                label="Mật khẩu phòng"
                type="password"
                icon={<KeyRound className="h-4 w-4" />}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                hint="Mật khẩu chỉ dùng cho luồng demo cục bộ."
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                loading={joining}
                icon={<DoorOpen className="h-4 w-4" />}
                disabled={room.players.length >= room.maxPlayers}
                onClick={() => void handleJoin()}
              >
                {room.players.length >= room.maxPlayers ? 'Phòng đã đầy' : 'Tham gia phòng'}
              </Button>
            </div>
          </>
        ) : isHost ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<Play className="h-4 w-4" />}
                loading={starting}
                disabled={!canStart}
                onClick={() => void handleStart()}
              >
                Bắt đầu ván đấu
              </Button>
              <Button
                variant="secondary"
                icon={<UserPlus className="h-4 w-4" />}
                loading={busyBot}
                disabled={roomFull}
                onClick={() => void handleAddBot()}
              >
                {roomFull ? 'Đã đủ ghế' : 'Thêm người máy'}
              </Button>
              <Button
                variant="outline"
                icon={<LogOut className="h-4 w-4" />}
                loading={leaving}
                onClick={handleLeave}
              >
                Rời phòng
              </Button>
            </div>
            {!playable ? (
              <p className="text-[11px] text-amber-300">
                Trò chơi “{gameMeta?.name ?? room.gameId}” chưa thể chơi nên chưa mở được ván.
              </p>
            ) : missingPlayers > 0 ? (
              <p className="text-[11px] text-amber-300">
                Cần thêm {missingPlayers} người nữa để bắt đầu — mời bạn bè hoặc bấm “Thêm người máy”.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-300">
                Đã đủ {room.players.length}/{room.maxPlayers} người — sẵn sàng bắt đầu.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
              Đang chờ chủ phòng bắt đầu ván đấu…
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                icon={<LogOut className="h-4 w-4" />}
                loading={leaving}
                onClick={handleLeave}
              >
                Rời phòng
              </Button>
            </div>
          </>
        )}
      </Surface>

      <Modal
        open={hostLeaveOpen}
        onClose={() => setHostLeaveOpen(false)}
        title="Rời phòng với tư cách chủ phòng"
        description="Chọn người nhận quyền chủ phòng trước khi rời đi."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setHostLeaveOpen(false)}>
              Ở lại
            </Button>
            <Button
              icon={<Crown className="h-4 w-4" />}
              loading={leaving}
              onClick={() => void confirmHostLeave()}
            >
              Chuyển chủ và rời
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-neon-cyan/50 bg-neon-cyan/5 p-3">
          <p className="text-sm font-semibold text-slate-100">Chuyển chủ phòng rồi rời</p>
          <p className="mt-1 text-xs text-slate-400">
            Giữ phòng hoạt động và chọn một người chơi thật đang ở trong phòng làm chủ mới.
          </p>
          <select
            value={successorId}
            onChange={(event) => setSuccessorId(event.target.value)}
            aria-label="Chọn chủ phòng mới"
            className="mt-3 h-10 w-full rounded-xl border border-white/10 bg-base-900 px-3 text-sm text-slate-100 outline-none focus:border-neon-cyan/60"
          >
            <option value="">Chọn người nhận quyền</option>
            {room.players
              .filter((player) => !player.isBot && player.id !== currentUserId)
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
