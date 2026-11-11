import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Icon chuyên nghiệp (lucide) hiển thị bên trái input. */
  icon?: ReactNode;
  error?: string;
  hint?: string;
  /** Nội dung thêm bên phải input (ví dụ nút hiện/ẩn mật khẩu). */
  trailing?: ReactNode;
}

/**
 * Ô nhập liệu cho trang xác thực: cao ~54px, bo góc mềm, nền #F7FFF4, viền #D5F0CA,
 * chuyển viền + vòng focus sang xanh lá khi được chọn.
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon, error, hint, trailing, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-[54px] items-center gap-2.5 rounded-2xl border bg-cute-inputBg px-4 shadow-inner-soft',
          'transition-all duration-200 ease-out',
          error
            ? 'border-rose-400 ring-2 ring-rose-200'
            : 'border-cute-inputBorder focus-within:border-cute-green focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/15',
        )}
      >
        {icon && (
          <span className={cn('shrink-0 transition-colors', error ? 'text-rose-400' : 'text-brand-600')}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-full w-full bg-transparent py-3 text-sm font-semibold text-slate-100 outline-none',
            'placeholder:font-medium placeholder:text-slate-600',
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      {(error || hint) && (
        <p className={cn('mt-1.5 text-xs font-semibold', error ? 'text-rose-500' : 'text-slate-500')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
