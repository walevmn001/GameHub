import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  // Nút chính: gradient xanh neon, chữ xanh đậm để tương phản cao, vệt sáng chạy khi hover + nhấn lún nhẹ
  primary:
    'btn-shine bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-brand-900 shadow-pop hover:-translate-y-0.5 hover:shadow-btn-hover hover:brightness-[1.03] active:translate-y-0 active:scale-[0.97]',
  secondary:
    'border border-brand-200 bg-gradient-to-b from-base-850 to-base-800 text-brand-700 shadow-soft hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card active:translate-y-0 active:scale-[0.97]',
  ghost: 'text-slate-500 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.97]',
  outline:
    'border border-brand-300 bg-base-900 text-brand-700 shadow-soft hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50 hover:shadow-card active:translate-y-0 active:scale-[0.97]',
  danger:
    'btn-shine bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-pop hover:-translate-y-0.5 hover:brightness-[1.05] hover:shadow-btn-hover active:translate-y-0 active:scale-[0.97]',
  success:
    'btn-shine bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-pop hover:-translate-y-0.5 hover:brightness-[1.05] hover:shadow-btn-hover active:translate-y-0 active:scale-[0.97]',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl2',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 ease-out select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:brightness-100 disabled:active:scale-100',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});
