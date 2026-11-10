import { useEffect, useState, type ChangeEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Coins,
  Gamepad2,
  LogOut,
  Pencil,
  RefreshCw,
  Swords,
  Trophy,
  Upload,
  UserRound,
} from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, Input, Modal, SectionHeader, StatTile, Surface } from '@/components/ui';
import { NoticeBanner } from '@/components/common/NoticeBanner';
import { FullPageLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LOCAL_ACCOUNT_NOTICE } from '@/utils/constants';
import { formatCoins, formatDateTime, formatDuration } from '@/utils/format';
import { getPresetAvatars, makeAvatarDataUri } from '@/utils/avatar';
import { cn } from '@/utils/cn';

export function ProfilePage() {
  const { user, initializing, updateProfile, logout, clearHistory } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setAvatar(user.avatar);
    }
  }, [user]);

  if (initializing) return <FullPageLoader label="Đang tải hồ sơ…" />;
  if (!user) return <Navigate to="/login" replace />;

  const winRate = user.stats.matches > 0 ? (user.stats.wins / user.stats.matches) * 100 : 0;
  const presets = getPresetAvatars([user.displayName, 'Lucky', 'Ace', 'Hero', 'Star', 'Ninja']);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ displayName, avatar });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setEditOpen(false);
    toast.success('Đã cập nhật hồ sơ.');
  };

  /** Kích thước tối đa cho ảnh đại diện tải lên (giữ chuỗi data URI trong giới hạn máy chủ). */
  const AVATAR_MAX_BYTES = 256 * 1024;

  const handleAvatarFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Tệp không hợp lệ', 'Hãy chọn một tệp ảnh (PNG, JPG, GIF…).');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Ảnh quá lớn', 'Vui lòng chọn ảnh nhỏ hơn 256 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result);
    };
    reader.onerror = () => toast.error('Không đọc được tệp ảnh.');
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Đã đăng xuất.');
    navigate('/');
  };

  const handleClearHistory = async () => {
    const result = await clearHistory();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info('Đã xoá lịch sử chơi thử.');
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Hồ sơ người chơi"
        subtitle="Thông tin tài khoản lưu cục bộ trên thiết bị"
        icon={<UserRound className="h-5 w-5" />}
        action={
          <Button variant="secondary" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditOpen(true)}>
            Chỉnh sửa
          </Button>
        }
      />

      <NoticeBanner variant="warning" title="Tài khoản Local">
        {LOCAL_ACCOUNT_NOTICE}
      </NoticeBanner>

      {/* Thẻ hồ sơ */}
      <Surface className="p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar src={user.avatar} name={user.displayName} size="lg" ring />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-100">{user.displayName}</h2>
            <p className="text-xs text-slate-500">@{user.username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="amber" icon={<Coins className="h-3 w-3" />}>
                {formatCoins(user.coins)} xu thử nghiệm
              </Badge>
              <Badge tone="neutral">Tham gia {formatDateTime(user.createdAt).split(' ')[0]}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={<LogOut className="h-3.5 w-3.5" />} onClick={() => void handleLogout()}>
            Đăng xuất
          </Button>
        </div>
      </Surface>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Số trận" value={user.stats.matches} icon={<Swords className="h-4 w-4" />} />
        <StatTile
          label="Thắng"
          value={user.stats.wins}
          tone="green"
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatTile label="Thua" value={user.stats.losses} tone="rose" />
        <StatTile
          label="Tỉ lệ thắng"
          value={`${winRate.toFixed(0)}%`}
          tone="cyan"
          icon={<Gamepad2 className="h-4 w-4" />}
        />
      </div>

      {/* Lịch sử */}
      <section>
        <SectionHeader
          title="Lịch sử chơi thử"
          subtitle="Tối đa 50 ván gần nhất — lưu trên thiết bị này"
          action={
            user.history.length > 0 ? (
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => void handleClearHistory()}>
                Xoá lịch sử
              </Button>
            ) : undefined
          }
        />
        <Surface className="overflow-hidden">
          {user.history.length === 0 ? (
            <EmptyState
              icon={<Gamepad2 className="h-6 w-6" />}
              title="Chưa có trận đấu nào"
              description="Chơi một ván Tiến Lên để bắt đầu ghi lại thành tích."
              action={
                <Button size="sm" onClick={() => navigate('/play/tien-len')}>
                  Chơi Tiến Lên
                </Button>
              }
              className="border-0 bg-transparent"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-xs">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Trò chơi</th>
                    <th className="px-4 py-2.5 font-semibold">Kết quả</th>
                    <th className="px-4 py-2.5 font-semibold">Vị trí</th>
                    <th className="px-4 py-2.5 font-semibold">Thời lượng</th>
                    <th className="px-4 py-2.5 font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {user.history.map((match) => (
                    <tr key={match.id} className="text-slate-300">
                      <td className="px-4 py-2.5 font-medium text-slate-200">{match.gameName}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={match.win ? 'green' : 'rose'}>
                          {match.win ? 'Thắng' : 'Thua'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {match.placement}/{match.totalPlayers}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {formatDuration(match.durationMs)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {formatDateTime(match.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Surface>
      </section>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Chỉnh sửa hồ sơ"
        description="Thay đổi tên hiển thị và ảnh đại diện."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Huỷ
            </Button>
            <Button loading={saving} onClick={() => void handleSave()}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên hiển thị"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={24}
            hint="2–24 ký tự, hiển thị với người chơi khác."
          />

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">Ảnh đại diện</p>
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-base-900/50 p-3">
              <Avatar src={avatar} name={displayName || 'Player'} size="lg" ring />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">
                  Tải ảnh của bạn lên (PNG, JPG, GIF — tối đa 256 KB).
                </p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-xs font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20">
                  <Upload className="h-3.5 w-3.5" />
                  Tải ảnh lên
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={cn(
                    'rounded-full p-0.5 transition-all',
                    avatar === preset ? 'ring-2 ring-neon-cyan' : 'ring-1 ring-white/10',
                  )}
                >
                  <Avatar src={preset} name={`A${index}`} size="md" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAvatar(makeAvatarDataUri(displayName || 'Player'))}
                className="flex h-11 items-center rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-300 hover:border-neon-cyan/50"
              >
                Tạo từ tên
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
