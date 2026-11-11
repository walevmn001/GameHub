import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  AuthCard,
  AuthCheckbox,
  AuthFooter,
  AuthHeader,
  AuthInput,
  AuthMascot,
  ErrorMessage,
  PasswordInput,
  PrimaryButton,
  SuccessPopup,
} from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export function LoginPage() {
  const { user, login, loginAsGuest } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Chờ hiệu ứng chúc mừng kết thúc rồi mới điều hướng, nên tạm bỏ qua khi `success`.
  if (user && !success) return <Navigate to="/profile" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? '/profile';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.username.trim()) {
      setError('Hãy nhập tên đăng nhập.');
      return;
    }
    if (!form.password) {
      setError('Hãy nhập mật khẩu.');
      return;
    }
    setLoading(true);
    const result = await login(form.username, form.password, remember);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    window.setTimeout(() => navigate(from, { replace: true }), 900);
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    const result = await loginAsGuest();
    setGuestLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info('Bạn đang chơi với tư cách khách.');
    navigate('/');
  };

  const handleForgotPassword = () => {
    toast.info('Tính năng khôi phục mật khẩu sẽ sớm được bổ sung. Vui lòng liên hệ quản trị viên.');
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Mascot nhô lên phía trên form */}
      <div className="relative z-10 -mb-8 flex justify-center">
        <AuthMascot className="h-28 w-28 sm:h-36 sm:w-36" />
      </div>

      <AuthCard className="animate-fade-in pt-9">
        <AuthHeader title="Đăng Nhập" subtitle="Chào mừng bạn quay trở lại!" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <ErrorMessage>{error}</ErrorMessage>

          <AuthInput
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            placeholder="ví dụ: player01"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />

          <PasswordInput
            label="Mật khẩu"
            name="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu của bạn"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />

          <div className="flex items-center justify-between gap-3">
            <AuthCheckbox id="remember" checked={remember} onChange={setRemember}>
              Ghi nhớ đăng nhập
            </AuthCheckbox>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="shrink-0 text-xs font-extrabold text-brand-600 underline-offset-4 transition hover:text-brand-700 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <PrimaryButton type="submit" loading={loading} icon={<LogIn className="h-5 w-5" />}>
            ĐĂNG NHẬP
          </PrimaryButton>

          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
            <span className="h-px flex-1 bg-cute-inputBorder" />
            HOẶC
            <span className="h-px flex-1 bg-cute-inputBorder" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            loading={guestLoading}
            icon={<Sparkles className="h-4 w-4" />}
            onClick={handleGuest}
          >
            Chơi ngay với tư cách khách
          </Button>
        </form>
      </AuthCard>

      <AuthFooter prompt="Chưa có tài khoản?" linkLabel="Đăng Kí ngay" to="/register" />

      <SuccessPopup
        show={success}
        title="Đăng nhập thành công!"
        message="Đang đưa bạn vào sảnh game…"
      />
    </div>
  );
}
