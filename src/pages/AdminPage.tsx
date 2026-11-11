import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Coins,
  DoorOpen,
  Gift,
  Home,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  FullPageLoader,
  Input,
  Modal,
  SectionHeader,
  StatTile,
  Surface,
} from '@/components/ui';
import { NoticeBanner } from '@/components/common/NoticeBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { adminService } from '@/services/AdminService';
import { formatCoins, formatDateTime } from '@/utils/format';
import type { AdminStats, AdminUser, Room } from '@/types';

/** Bảng quản trị: số liệu, tặng xu, đổi quyền và xoá tài khoản. */
export function AdminPage() {
  const { user, initializing } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'users' | null>(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [roomQuery, setRoomQuery] = useState('');
  const [debouncedRoomQuery, setDebouncedRoomQuery] = useState('');
  const [giftTarget, setGiftTarget] = useState<AdminUser | null>(null);
  const [giftAmount, setGiftAmount] = useState('1000');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRoomQuery(roomQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [roomQuery]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(debouncedRoomQuery) ||
      room.id.toLowerCase().includes(debouncedRoomQuery),
  );

  const load = useCallback(async () => {
    if (!isAdmin || !adminService.enabled) return;
    setLoading(true);
    const [statsResult, usersResult, roomsResult] = await Promise.all([
      adminService.stats(),
      adminService.users(debounced),
      adminService.rooms(),
    ]);
    if (statsResult.ok) setStats(statsResult.data);
    if (usersResult.ok) setUsers(usersResult.data);
    if (roomsResult.ok) setRooms(roomsResult.data);
    setLoading(false);
  }, [debounced, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  if (initializing) return <FullPageLoader label="Đang tải…" />;
  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-6 w-6" />}
        title="Không có quyền truy cập"
        description="Khu vực này chỉ dành cho tài khoản quản trị viên."
        action={
          <Button icon={<Home className="h-4 w-4" />} onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  const replaceUser = (updated: AdminUser) =>
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

  const handleGift = async () => {
    if (!giftTarget) return;
    const delta = Math.trunc(Number(giftAmount));
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error('Số xu không hợp lệ', 'Hãy nhập một số nguyên khác 0 (dương để tặng, âm để trừ).');
      return;
    }
    setBusyId(giftTarget.id);
    const result = await adminService.giftCoins(giftTarget.id, delta);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    replaceUser(result.data.user);
    setGiftTarget(null);
    void adminService.stats().then((r) => r.ok && setStats(r.data));
    toast.success(
      delta > 0 ? 'Đã tặng xu' : 'Đã trừ xu',
      `${formatCoins(Math.abs(result.data.applied))} xu cho ${result.data.user.displayName}.`,
    );
  };

  const handleToggleRole = async (target: AdminUser) => {
    setBusyId(target.id);
    const result = await adminService.setRole(target.id, target.role === 'admin' ? 'user' : 'admin');
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    replaceUser(result.data);
    void adminService.stats().then((r) => r.ok && setStats(r.data));
    toast.success(
      result.data.role === 'admin' ? 'Đã cấp quyền quản trị' : 'Đã thu hồi quyền quản trị',
      result.data.displayName,
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const result = await adminService.deleteUser(deleteTarget.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    void adminService.stats().then((r) => r.ok && setStats(r.data));
    toast.info('Đã xoá tài khoản.');
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoomTarget) return;
    setBusyRoomId(deleteRoomTarget.id);
    const result = await adminService.deleteRoom(deleteRoomTarget.id);
    setBusyRoomId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRooms((prev) => prev.filter((room) => room.id !== deleteRoomTarget.id));
    toast.success('Đã xoá phòng', 'Người chơi trong phòng đã được đưa ra ngoài.');
    setDeleteRoomTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Bảng quản trị"
        subtitle="Quản lý người dùng, tặng xu và phân quyền"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      {!adminService.enabled && (
        <NoticeBanner variant="warning" title="Cần backend trực tuyến">
          Bảng quản trị cần máy chủ trực tuyến. Hãy cấu hình biến môi trường
          <code className="mx-1 rounded bg-ink/10 px-1">VITE_API_URL</code>.
        </NoticeBanner>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Tổng người dùng"
            value={stats.totalUsers}
            icon={<Users className="h-4 w-4" />}
          />
          <StatTile
            label="Đang trực tuyến"
            value={stats.online}
            tone="green"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <StatTile label="Quản trị viên" value={stats.admins} tone="cyan" />
          <StatTile label="Tài khoản khách" value={stats.guests} />
          <StatTile
            label="Tổng xu"
            value={formatCoins(stats.totalCoins)}
            tone="cyan"
            icon={<Coins className="h-4 w-4" />}
          />
          <StatTile label="Tổng số trận" value={formatCoins(stats.totalMatches)} />
          <StatTile label="Tài khoản mới (24h)" value={stats.newUsersToday} tone="green" />
          <StatTile label="Kết quả hiển thị" value={users.length} hint={loading ? 'Đang tải…' : undefined} />
        </div>
      )}

      <div
        role="tablist"
        aria-label="Danh sách quản trị"
        className="inline-flex w-full gap-1 rounded-xl border border-ink/10 bg-base-900/70 p-1 sm:w-fit"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'rooms'}
          aria-controls="admin-rooms-panel"
          onClick={() => setActiveTab((current) => (current === 'rooms' ? null : 'rooms'))}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
            activeTab === 'rooms'
              ? 'bg-neon-purple/20 text-neon-purple ring-1 ring-neon-purple/40'
              : 'text-slate-400 hover:bg-ink/5 hover:text-slate-200'
          }`}
        >
          <DoorOpen className="h-4 w-4" />
          Phòng ({rooms.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-controls="admin-users-panel"
          onClick={() => setActiveTab((current) => (current === 'users' ? null : 'users'))}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
            activeTab === 'users'
              ? 'bg-neon-purple/20 text-neon-purple ring-1 ring-neon-purple/40'
              : 'text-slate-400 hover:bg-ink/5 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Người dùng ({users.length})
        </button>
      </div>

      {activeTab === null && (
        <p className="text-xs text-slate-500">Chọn Phòng hoặc Người dùng để mở danh sách.</p>
      )}

      {activeTab === 'rooms' && (
        <section id="admin-rooms-panel" role="tabpanel">
          <SectionHeader
            title="Quản lý phòng"
            subtitle="Tìm theo tên hoặc ID. Xoá phòng sẽ đưa tất cả người chơi ra ngoài."
            icon={<DoorOpen className="h-5 w-5" />}
          />
          <Input
            placeholder="Tìm phòng theo tên hoặc ID…"
            icon={<Search className="h-4 w-4" />}
            value={roomQuery}
            onChange={(event) => setRoomQuery(event.target.value)}
          />
          <div className="mt-3 flex flex-col gap-2">
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-500">Hiện không có phòng đang hoạt động.</p>
            ) : filteredRooms.length === 0 ? (
              <p className="text-xs text-slate-500">Không tìm thấy phòng phù hợp.</p>
            ) : (
              filteredRooms.map((room) => (
                <Surface key={room.id} className="flex flex-wrap items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{room.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {room.gameName} · chủ phòng: {room.hostName} · {room.players.length}/{room.maxPlayers} người
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
                      ID: {room.id}
                    </p>
                  </div>
                  <Badge tone={room.status === 'playing' ? 'amber' : 'green'}>
                    {room.status === 'playing' ? 'Đang chơi' : 'Đang chờ'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="h-4 w-4" />}
                    loading={busyRoomId === room.id}
                    onClick={() => setDeleteRoomTarget(room)}
                  >
                    Xoá phòng
                  </Button>
                </Surface>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section id="admin-users-panel" role="tabpanel">
          <Input
            placeholder="Tìm theo tên đăng nhập hoặc tên hiển thị…"
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="mt-3 flex flex-col gap-2">
            {users.length === 0 && !loading && (
              <p className="text-xs text-slate-500">Không tìm thấy người dùng phù hợp.</p>
            )}
            {users.map((item) => (
              <Surface key={item.id} className="flex flex-wrap items-center gap-3 p-3">
                <Avatar
                  src={item.avatar}
                  name={item.displayName}
                  size="sm"
                  status={item.online ? 'online' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-100">
                    {item.displayName}
                    {item.role === 'admin' && <Badge tone="purple">Quản trị</Badge>}
                    {item.isGuest && <Badge tone="neutral">Khách</Badge>}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    @{item.username} · {item.matches} trận · tham gia{' '}
                    {formatDateTime(item.createdAt).split(' ')[0]}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Coins className="h-4 w-4" />
                  {formatCoins(item.coins)}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Gift className="h-4 w-4" />}
                    disabled={busyId === item.id}
                    onClick={() => {
                      setGiftTarget(item);
                      setGiftAmount('1000');
                    }}
                  >
                    <span className="hidden sm:inline">Tặng xu</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<UserCog className="h-4 w-4" />}
                    loading={busyId === item.id}
                    disabled={item.id === user.id}
                    onClick={() => void handleToggleRole(item)}
                  >
                    <span className="hidden sm:inline">
                      {item.role === 'admin' ? 'Thu quyền' : 'Cấp quyền'}
                    </span>
                  </Button>
                  <button
                    type="button"
                    disabled={item.id === user.id}
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Xoá tài khoản"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Surface>
            ))}
          </div>
        </section>
      )}

      {/* Tặng / trừ xu */}
      <Modal
        open={Boolean(giftTarget)}
        onClose={() => setGiftTarget(null)}
        title="Tặng xu"
        description={giftTarget ? `Điều chỉnh số xu của ${giftTarget.displayName}.` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGiftTarget(null)}>
              Huỷ
            </Button>
            <Button
              icon={<Gift className="h-4 w-4" />}
              loading={busyId === giftTarget?.id}
              onClick={() => void handleGift()}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <Input
          label="Số xu (dương = tặng, âm = trừ)"
          type="number"
          value={giftAmount}
          onChange={(e) => setGiftAmount(e.target.value)}
          hint="Ví dụ: 1000 để tặng, -500 để trừ."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[500, 1000, 5000, -1000].map((value) => (
            <Button key={value} size="sm" variant="ghost" onClick={() => setGiftAmount(String(value))}>
              {value > 0 ? `+${formatCoins(value)}` : `-${formatCoins(Math.abs(value))}`}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Xoá tài khoản */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xoá tài khoản?"
        description={
          deleteTarget
            ? `Tài khoản "${deleteTarget.displayName}" và toàn bộ dữ liệu liên quan sẽ bị xoá vĩnh viễn.`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              loading={busyId === deleteTarget?.id}
              onClick={() => void handleDelete()}
            >
              Xoá vĩnh viễn
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Admin xoá phòng */}
      <Modal
        open={Boolean(deleteRoomTarget)}
        onClose={() => setDeleteRoomTarget(null)}
        title="Xoá phòng?"
        description={
          deleteRoomTarget
            ? `Phòng "${deleteRoomTarget.name}" sẽ bị xoá. Tất cả người chơi trong phòng sẽ bị đưa ra ngoài.`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteRoomTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              loading={busyRoomId === deleteRoomTarget?.id}
              onClick={() => void handleDeleteRoom()}
            >
              Xoá phòng
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          Người chơi đang ở phòng sẽ nhận thông báo “Phòng đã bị admin xóa” và được chuyển về danh sách phòng.
        </p>
      </Modal>
    </div>
  );
}
