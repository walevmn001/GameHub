import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Gamepad2, KeyRound, User as UserIcon, UserPlus } from 'lucide-react';
import { Button, Input, Surface } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export function RegisterPage() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setLoading(true);
    const result = await register({
      username: form.username,
      displayName: form.displayName,
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success('Tạo tài khoản thành công!');
    navigate('/profile', { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white text-brand-600 shadow-soft">
          <Gamepad2 className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-extrabold text-slate-100">Tạo tài khoản</h1>
        <p className="mt-1 text-sm text-slate-400">
          Bắt đầu hành trình của bạn trên Mini Game Hub.
        </p>
      </div>

      <Surface className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            placeholder="3–20 ký tự, chữ/số/gạch dưới"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <Input
            label="Tên hiển thị"
            name="displayName"
            placeholder="Tên hiển thị với người chơi khác"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            hint="Để trống sẽ dùng tên đăng nhập."
          />
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            icon={<KeyRound className="h-4 w-4" />}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <Input
            label="Nhập lại mật khẩu"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            icon={<KeyRound className="h-4 w-4" />}
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            error={error || undefined}
            required
          />

          <Button type="submit" fullWidth loading={loading} icon={<UserPlus className="h-4 w-4" />}>
            Tạo tài khoản
          </Button>
        </form>
      </Surface>

      <p className="text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-neon-cyan hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
