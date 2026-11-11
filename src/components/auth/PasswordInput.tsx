import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { AuthInput, type AuthInputProps } from './AuthInput';

/**
 * Ô nhập mật khẩu dựa trên AuthInput, kèm nút hiện/ẩn mật khẩu và icon khoá mặc định.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<AuthInputProps, 'type' | 'trailing'>>(
  function PasswordInput({ icon, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <AuthInput
        ref={ref}
        type={visible ? 'text' : 'password'}
        icon={icon ?? <Lock className="h-4 w-4" />}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={visible}
            className="shrink-0 rounded-full p-1.5 text-slate-500 transition hover:bg-brand-50 hover:text-brand-600 active:scale-90"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...rest}
      />
    );
  },
);
