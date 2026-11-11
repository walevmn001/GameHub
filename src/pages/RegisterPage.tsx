import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User as UserIcon, UserPlus, Smile } from 'lucide-react';
import {
  AuthCard,
  AuthCheckbox,
  AuthFooter,
  AuthHeader,
  AuthInput,
  AuthMascot,
  ErrorMessage,
  PasswordInput,
  PasswordStrength,
  PrimaryButton,
  SuccessPopup,
} from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

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
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Chờ hiệu ứng chúc mừng kết thúc rồi mới điều hướng, nên tạm bỏ qua khi `success`.
  if (user && !success) return <Navigate to="/profile" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setConfirmError('');

    if (!USERNAME_RE.test(form.username.trim())) {
      setError('Tên đăng nhập 3–20 ký tự, chỉ gồm chữ, số và dấu gạch dưới.');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (form.password !== form.confirm) {
      setConfirmError('Mật khẩu nhập lại không khớp.');
      return;
    }
    if (!agreed) {
      setError('Bạn cần đồng ý với điều khoản sử dụng để tiếp tục.');
      return;
    }

    setLoading(true);
    const result = await register({
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(`Chào mừng ${result.data.displayName}!`);
    setSuccess(true);
    window.setTimeout(() => navigate('/profile', { replace: true }), 1000);
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Mascot nhô lên phía trên form — giữ nguyên thiết kế như trang Đăng nhập */}
      <div className="relative z-10 -mb-8 flex justify-center">
        <AuthMascot className="h-28 w-28 sm:h-36 sm:w-36" />
      </div>

      <AuthCard className="animate-fade-in pt-9">
        <AuthHeader title="Đăng Kí" subtitle="Tạo tài khoản để tham gia thế giới mini game!" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <ErrorMessage>{error}</ErrorMessage>

          <AuthInput
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            placeholder="3–20 ký tự, chữ/số/gạch dưới"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />

          <AuthInput
            label="Tên hiển thị"
            name="displayName"
            autoComplete="nickname"
            placeholder="Tên hiển thị với người chơi khác"
            icon={<Smile className="h-4 w-4" />}
            hint="Để trống sẽ dùng tên đăng nhập."
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />

          <div>
            <PasswordInput
              label="Mật khẩu"
              name="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <PasswordStrength password={form.password} />
          </div>

          <PasswordInput
            label="Nhập lại mật khẩu"
            name="confirm"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            error={confirmError || undefined}
            required
          />

          <AuthCheckbox id="terms" checked={agreed} onChange={setAgreed}>
            Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Mini Game Hub.
          </AuthCheckbox>

          <PrimaryButton type="submit" loading={loading} icon={<UserPlus className="h-5 w-5" />}>
            TẠO TÀI KHOẢN
          </PrimaryButton>
        </form>
      </AuthCard>

      <AuthFooter prompt="Đã có tài khoản?" linkLabel="Đăng nhập" to="/login" />

      <SuccessPopup
        show={success}
        title="Tạo tài khoản thành công!"
        message="Chúc bạn chơi game vui vẻ!"
      />
    </div>
  );
}
