import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, DoorOpen, Filter, KeyRound, Plus, Settings2, Users } from 'lucide-react';
import {
  AI_DIFFICULTY_LABEL,
  BET_OPTIONS,
  DEFAULT_TIEN_LEN_CONFIG,
  PAYOUT_MODE_LABEL,
  ROUNDS_OPTIONS,
  TURN_TIME_OPTIONS,
  minCoinsToPlay,
  type AiDifficulty,
  type PayoutMode,
  type Room,
  type RoomVisibility,
  type TienLenConfig,
  type TienLenRounds,
} from '@/types';
import { gameService } from '@/services/GameService';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/contexts/RoomsContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  SectionHeader,
  SegmentedControl,
  Switch,
} from '@/components/ui';
import { RoomCard } from '@/components/game/RoomCard';
import { NoticeBanner } from '@/components/common/NoticeBanner';
import type { SegmentOption } from '@/components/ui/SegmentedControl';

type RoomFilter = 'all' | 'public' | 'private' | 'mine';

export function RoomsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { rooms, createRoom, joinRoom, leaveRoom } = useRooms();

  const [filter, setFilter] = useState<RoomFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<Room | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const games = useMemo(() => gameService.listAllGames(), []);
  const [form, setForm] = useState({
    name: '',
    gameId: 'tien-len',
    visibility: 'public' as RoomVisibility,
    maxPlayers: 4,
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [config, setConfig] = useState<TienLenConfig>(() => ({
    ...DEFAULT_TIEN_LEN_CONFIG,
    cutRates: { ...DEFAULT_TIEN_LEN_CONFIG.cutRates },
  }));

  const patchConfig = (patch: Partial<TienLenConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const selectedGame = useMemo(
    () => games.find((g) => g.id === form.gameId),
    [games, form.gameId],
  );
  /** Số người hợp lệ theo loại trò chơi đang chọn. */
  const playerOptions = useMemo(() => {
    const min = selectedGame?.minPlayers ?? 2;
    const max = selectedGame?.maxPlayers ?? 4;
    const values: number[] = [];
    for (let n = min; n <= max; n += 1) values.push(n);
    return values;
  }, [selectedGame]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'public':
        return rooms.filter((r) => r.visibility === 'public');
      case 'private':
        return rooms.filter((r) => r.visibility === 'private');
      case 'mine':
        return user ? rooms.filter((r) => r.players.some((p) => p.id === user.id)) : [];
      default:
        return rooms;
    }
  }, [rooms, filter, user]);

  const options: SegmentOption<RoomFilter>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'public', label: 'Công khai' },
    { value: 'private', label: 'Riêng tư' },
    { value: 'mine', label: 'Của tôi' },
  ];

  const openCreate = () => {
    setForm({
      name: `Phòng của ${user?.displayName ?? 'Khách'}`,
      gameId: 'tien-len',
      visibility: 'public',
      maxPlayers: 4,
      password: '',
    });
    setFormError('');
    setConfig({ ...DEFAULT_TIEN_LEN_CONFIG, cutRates: { ...DEFAULT_TIEN_LEN_CONFIG.cutRates } });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setFormError('Hãy nhập tên phòng.');
      return;
    }
    if (form.visibility === 'private' && !form.password.trim()) {
      setFormError('Phòng riêng cần mật khẩu.');
      return;
    }
    if (form.gameId === 'tien-len') {
      const required = minCoinsToPlay(config);
      const balance = user?.coins ?? 0;
      if (balance < required) {
        setFormError(
          `Bạn cần tối thiểu ${required.toLocaleString('vi-VN')} xu để tạo bàn này (đủ chịu một ván thua nặng, kể cả bị chặt/thối Heo). Số dư hiện tại: ${balance.toLocaleString('vi-VN')} xu.`,
        );
        return;
      }
    }
    const game = games.find((g) => g.id === form.gameId);
    setCreating(true);
    const result = await createRoom({
      name: form.name,
      gameId: form.gameId,
      gameName: game?.name ?? form.gameId,
      visibility: form.visibility,
      maxPlayers: form.maxPlayers,
      password: form.visibility === 'private' ? form.password : undefined,
      config: form.gameId === 'tien-len' ? config : undefined,
    });
    setCreating(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setCreateOpen(false);
    toast.success(`Đã tạo phòng "${result.data.name}"`);
    navigate(`/rooms/${result.data.id}`);
  };

  const handleJoin = (room: Room) => {
    if (room.visibility === 'private') {
      setPasswordInput('');
      setPasswordFor(room);
      return;
    }
    void doJoin(room.id);
  };

  const doJoin = async (roomId: string, password?: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room?.gameId === 'tien-len') {
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
    const result = await joinRoom(roomId, password);
    setJoining(false);
    if (!result.ok) {
      toast.error('Không thể tham gia phòng', result.error);
      return;
    }
    setPasswordFor(null);
    toast.success(`Đã tham gia phòng "${result.data.name}"`);
    navigate(`/rooms/${result.data.id}`);
  };

  const handleLeave = async (room: Room) => {
    const result = await leaveRoom(room.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info(`Đã rời phòng "${room.name}"`);
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Phòng chơi"
        subtitle="Tạo và tham gia phòng thử nghiệm"
        icon={<Users className="h-5 w-5" />}
        action={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tạo phòng
          </Button>
        }
      />

      <NoticeBanner variant="info" title="Phòng chơi hoạt động cục bộ">
        Phòng chỉ tồn tại trong dữ liệu thử nghiệm trên thiết bị này. Chưa thể kết nối nhiều người
        chơi qua Internet cho tới khi có backend realtime.
      </NoticeBanner>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Filter className="h-4 w-4 shrink-0 text-slate-500" />
        <SegmentedControl options={options} value={filter} onChange={setFilter} size="sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="h-6 w-6" />}
          title="Chưa có phòng nào"
          description="Hãy tạo phòng mới hoặc đổi bộ lọc để xem các phòng khác."
          action={
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Tạo phòng
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentUserId={user?.id}
              onJoin={handleJoin}
              onLeave={(r) => void handleLeave(r)}
              onOpen={(r) => navigate(`/rooms/${r.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal tạo phòng */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo phòng mới"
        description="Phòng được lưu cục bộ trên thiết bị này."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Huỷ
            </Button>
            <Button loading={creating} onClick={() => void handleCreate()}>
              Tạo phòng
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên phòng"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            maxLength={32}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Trò chơi</label>
            <select
              value={form.gameId}
              onChange={(e) => {
                const gameId = e.target.value;
                const game = games.find((g) => g.id === gameId);
                setForm((f) => ({ ...f, gameId, maxPlayers: game?.maxPlayers ?? f.maxPlayers }));
              }}
              className="h-11 w-full rounded-xl border border-white/10 bg-base-900/70 px-3 text-sm text-slate-100 outline-none focus:border-neon-purple/70"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                  {game.status !== 'available' ? ' (chưa mở)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Số người chơi
            </label>
            {playerOptions.length > 1 ? (
              <SegmentedControl
                options={playerOptions.map((n) => ({ value: String(n), label: `${n} người` }))}
                value={String(form.maxPlayers)}
                onChange={(v) => setForm((f) => ({ ...f, maxPlayers: Number(v) }))}
                size="sm"
              />
            ) : (
              <p className="text-sm text-slate-300">
                Cố định {form.maxPlayers} người cho {selectedGame?.name ?? 'trò chơi này'}.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Chế độ phòng
            </label>
            <SegmentedControl
              options={[
                { value: 'public', label: 'Công khai' },
                { value: 'private', label: 'Riêng tư' },
              ]}
              value={form.visibility}
              onChange={(v) => setForm((f) => ({ ...f, visibility: v as RoomVisibility }))}
              size="sm"
            />
          </div>

          {form.visibility === 'private' && (
            <Input
              label="Mật khẩu phòng"
              type="text"
              icon={<KeyRound className="h-4 w-4" />}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              hint="Mật khẩu chỉ dùng cho luồng demo cục bộ."
            />
          )}

          {form.gameId === 'tien-len' && (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-base-900/40 p-3.5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Settings2 className="h-4 w-4 text-neon-cyan" />
                Cấu hình bàn Tiến Lên
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Mức cược cơ bản
                </label>
                <SegmentedControl
                  options={BET_OPTIONS.map((bet) => ({
                    value: String(bet),
                    label: `${bet.toLocaleString('vi-VN')}`,
                  }))}
                  value={String(config.baseBet)}
                  onChange={(v) => patchConfig({ baseBet: Number(v) })}
                  size="sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Chế độ tính tiền
                </label>
                <SegmentedControl
                  options={
                    (['winner-takes-all', 'top-two'] as PayoutMode[]).map((mode) => ({
                      value: mode,
                      label: PAYOUT_MODE_LABEL[mode],
                    })) as SegmentOption<PayoutMode>[]
                  }
                  value={config.payoutMode}
                  onChange={(v) => patchConfig({ payoutMode: v })}
                  size="sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Chế độ chơi
                </label>
                <SegmentedControl
                  options={ROUNDS_OPTIONS.map((rounds) => ({
                    value: String(rounds),
                    label: rounds === 'free' ? 'Tự do' : `${rounds} ván`,
                  }))}
                  value={String(config.rounds)}
                  onChange={(v) =>
                    patchConfig({ rounds: (v === 'free' ? 'free' : Number(v)) as TienLenRounds })
                  }
                  size="sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Thời gian mỗi lượt
                </label>
                <SegmentedControl
                  options={TURN_TIME_OPTIONS.map((ms) => ({
                    value: String(ms),
                    label: `${ms / 1000}s`,
                  }))}
                  value={String(config.turnMs)}
                  onChange={(v) => patchConfig({ turnMs: Number(v) })}
                  size="sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Chế độ AI bot
                </label>
                <SegmentedControl
                  options={
                    (['easy', 'medium', 'hard'] as AiDifficulty[]).map((level) => ({
                      value: level,
                      label: AI_DIFFICULTY_LABEL[level],
                    })) as SegmentOption<AiDifficulty>[]
                  }
                  value={config.aiDifficulty}
                  onChange={(v) => patchConfig({ aiDifficulty: v })}
                  size="sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Switch
                  label="Ăn trắng"
                  description="Báo thắng ngay khi chia bài (sảnh rồng, tứ quý heo, 5–6 đôi…)"
                  checked={config.enableWhiteWin}
                  onChange={(v) => patchConfig({ enableWhiteWin: v })}
                />
                <Switch
                  label="Phạt thối"
                  description="Người về bét còn Heo/tứ quý/đôi thông sẽ bị phạt"
                  checked={config.enableThoiPenalty}
                  onChange={(v) => patchConfig({ enableThoiPenalty: v })}
                />
                <Switch
                  label="Chặt cộng dồn"
                  description="Người bị chặt cuối cùng chịu toàn bộ tổng tiền chặt"
                  checked={config.enableStackedCut}
                  onChange={(v) => patchConfig({ enableStackedCut: v })}
                />
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Coins className="h-3.5 w-3.5 text-amber-300" />
                Số dư của bạn: {(user?.coins ?? 0).toLocaleString('vi-VN')} xu
              </p>
            </div>
          )}

          {formError && <p className="text-xs text-rose-400">{formError}</p>}
        </div>
      </Modal>

      {/* Modal nhập mật khẩu */}
      <Modal
        open={passwordFor !== null}
        onClose={() => setPasswordFor(null)}
        title="Phòng riêng tư"
        description={passwordFor ? `Nhập mật khẩu để vào "${passwordFor.name}".` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPasswordFor(null)}>
              Huỷ
            </Button>
            <Button
              loading={joining}
              onClick={() => passwordFor && void doJoin(passwordFor.id, passwordInput)}
            >
              Vào phòng
            </Button>
          </>
        }
      >
        <Input
          label="Mật khẩu phòng"
          type="password"
          icon={<KeyRound className="h-4 w-4" />}
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          autoFocus
        />
      </Modal>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <Badge tone="neutral">Tổng {rooms.length} phòng</Badge>
        <button
          type="button"
          onClick={() => navigate('/games')}
          className="font-semibold text-neon-cyan hover:underline"
        >
          Khám phá trò chơi khác
        </button>
      </div>
    </div>
  );
}
