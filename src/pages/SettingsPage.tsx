import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { KeyRound, MonitorSmartphone, Settings as SettingsIcon, ShieldAlert, Volume2, Wand2 } from 'lucide-react';
import { Button, Input, SectionHeader, Surface } from '@/components/ui';
import { Switch } from '@/components/ui/Switch';
import { FullPageLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { APP_NAME, APP_VERSION } from '@/utils/constants';

export function SettingsPage() {
  const { user, initializing, updatePreferences, changePassword, eraseDeviceData } = useAuth();
  const toast = useToast();

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');
  const [eraseBusy, setEraseBusy] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);

  if (initializing) return <FullPageLoader label="Đang tải cài đặt…" />;
  if (!user) return <Navigate to="/login" replace />;

  const handleChangePassword = async () => {
    setPwError('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Mật khẩu mới nhập lại không khớp.');
      return;
    }
    setPwBusy(true);
    const result = await changePassword(pwForm.current, pwForm.next);
    setPwBusy(false);
    if (!result.ok) {
      setPwError(result.error);
      return;
    }
    setPwForm({ current: '', next: '', confirm: '' });
    toast.success('Đã đổi mật khẩu.');
  };

  const handleErase = async () => {
    setEraseBusy(true);
    await eraseDeviceData();
    setEraseBusy(false);
    toast.info('Đã xoá toàn bộ dữ liệu tài khoản trên thiết bị này.');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <SectionHeader
        title="Cài đặt tài khoản"
        subtitle="Tuỳ chỉnh trải nghiệm và bảo mật tài khoản"
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      {/* Tuỳ chọn trải nghiệm */}
      <Surface className="p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <Wand2 className="h-4 w-4 text-neon-cyan" /> Trải nghiệm
        </h3>
        <div className="flex flex-col gap-2.5">
          <Switch
            label="Âm thanh trò chơi"
            description="Bật hiệu ứng âm thanh khi chia bài, đánh bài."
            checked={user.preferences.sound}
            onChange={(v) => void updatePreferences({ sound: v })}
          />
          <Switch
            label="Hiệu ứng chuyển động"
            description="Bật animation cho lá bài và giao diện."
            checked={user.preferences.animations}
            onChange={(v) => void updatePreferences({ animations: v })}
          />
          <Switch
            label="Ưu tiên bàn chơi nằm ngang"
            description="Tự động gợi ý chế độ ngang khi mở bàn chơi trên điện thoại."
            checked={user.preferences.preferLandscape}
            onChange={(v) => void updatePreferences({ preferLandscape: v })}
          />
        </div>
      </Surface>

      {/* Đổi mật khẩu */}
      <Surface className="p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <KeyRound className="h-4 w-4 text-neon-cyan" /> Đổi mật khẩu
        </h3>
        <div className="flex flex-col gap-3">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Mật khẩu mới"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
            />
            <Input
              label="Nhập lại mật khẩu mới"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              error={pwError || undefined}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => void handleChangePassword()}
            loading={pwBusy}
            className="self-start"
          >
            Cập nhật mật khẩu
          </Button>
        </div>
      </Surface>

      {/* Vùng nguy hiểm */}
      <Surface className="border-rose-500/20 p-4 sm:p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-600">
          <ShieldAlert className="h-4 w-4" /> Vùng nguy hiểm
        </h3>
        <p className="text-xs leading-relaxed text-slate-400">
          Thao tác này xoá toàn bộ tài khoản cục bộ, lịch sử trận đấu và nhật ký hoạt động trên
          thiết bị này. Không thể hoàn tác.
        </p>
        {!confirmErase ? (
          <Button variant="danger" className="mt-3" onClick={() => setConfirmErase(true)}>
            Xoá dữ liệu trên thiết bị
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <Button variant="danger" loading={eraseBusy} onClick={() => void handleErase()}>
              Xác nhận xoá
            </Button>
            <Button variant="ghost" onClick={() => setConfirmErase(false)}>
              Huỷ
            </Button>
          </div>
        )}
      </Surface>

      {/* Thông tin ứng dụng */}
      <Surface className="p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <MonitorSmartphone className="h-4 w-4 text-neon-cyan" /> Về ứng dụng
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-slate-500">Tên ứng dụng</dt>
            <dd className="mt-0.5 font-medium text-slate-200">{APP_NAME}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phiên bản</dt>
            <dd className="mt-0.5 font-medium text-slate-200">{APP_VERSION}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Chế độ</dt>
            <dd className="mt-0.5 font-medium text-slate-200">Local / Demo</dd>
          </div>
          <div>
            <dt className="text-slate-500">Lưu trữ</dt>
            <dd className="mt-0.5 font-medium text-slate-200">Thiết bị (LocalStorage)</dd>
          </div>
        </dl>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Volume2 className="h-3.5 w-3.5" /> Tính năng âm thanh sẽ được bổ sung ở phiên bản sau.
        </p>
      </Surface>
    </div>
  );
}
