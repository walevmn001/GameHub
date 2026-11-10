import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LogIn, Sparkles, User as UserIcon } from 'lucide-react';
import { Button, Input, Surface } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export function LoginPage() {
  const { user, login, loginAsGuest } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? '/profile';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(`Chào mừng trở lại, ${result.data.displayName}!`);
    navigate(from, { replace: true });
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

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-100">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tiếp tục với tài khoản của bạn.
        </p>
      </div>

      <Surface className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            placeholder="ví dụ: player01"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Tối thiểu 6 ký tự"
            icon={<KeyRound className="h-4 w-4" />}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={error || undefined}
            required
          />

          <Button type="submit" fullWidth loading={loading} icon={<LogIn className="h-4 w-4" />}>
            Đăng nhập
          </Button>

          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="h-px flex-1 bg-white/5" />
            hoặc
            <span className="h-px flex-1 bg-white/5" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            loading={guestLoading}
            icon={<Sparkles className="h-4 w-4" />}
            onClick={handleGuest}
          >
            Chơi ngay với tư cách khách
          </Button>
        </form>
      </Surface>

      <p className="text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-neon-cyan hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
