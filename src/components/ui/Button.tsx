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
  // Nút chính: xanh lá đậm, bo tròn, nâng nhẹ khi hover (phong cách game casual)
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-pop hover:from-brand-400 hover:to-brand-500 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none',
  secondary:
    'bg-base-800 text-brand-700 border border-brand-200 hover:bg-base-700 hover:border-brand-300',
  ghost: 'bg-transparent text-slate-400 hover:bg-brand-50 hover:text-brand-600',
  outline:
    'bg-base-900 text-brand-700 border border-brand-300 hover:bg-brand-50 hover:border-brand-500',
  danger: 'bg-rose-500 text-white shadow-pop hover:bg-rose-400 hover:-translate-y-0.5 active:translate-y-0',
  success: 'bg-emerald-500 text-white shadow-pop hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0',
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
        'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0',
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
