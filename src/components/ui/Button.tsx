import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant =
  | 'primary'
  | 'secondary'
  | 'special'
  | 'icon'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  // CTA dạng viên xanh 3D với highlight trắng.
  primary:
    'btn-shine border border-brand-700/20 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-white drop-shadow-[0_1px_1px_rgba(22,72,32,0.28)] shadow-pop hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-btn-hover active:translate-y-0.5 active:shadow-none',
  secondary:
    'border border-brand-300 bg-gradient-to-b from-white to-brand-50 text-brand-700 shadow-soft hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-card active:translate-y-0 active:scale-[0.97]',
  special:
    'btn-shine border border-amber-400/70 bg-gradient-to-b from-amber-200 via-amber-300 to-orange-400 text-amber-950 shadow-reward hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-card-hover active:translate-y-0.5 active:shadow-none',
  icon:
    'border border-brand-200 bg-gradient-to-b from-white to-brand-50 text-brand-600 shadow-soft hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-700 hover:shadow-card active:translate-y-0.5 active:shadow-none',
  ghost: 'text-slate-500 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.97]',
  outline:
    'border border-brand-300 bg-white text-brand-700 shadow-soft hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50 hover:shadow-card active:translate-y-0 active:scale-[0.97]',
  danger:
    'btn-shine bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-pop hover:-translate-y-0.5 hover:brightness-[1.05] hover:shadow-btn-hover active:translate-y-0 active:scale-[0.97]',
  success:
    'btn-shine border border-brand-700/20 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-white shadow-pop hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-btn-hover active:translate-y-0.5 active:shadow-none',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs gap-1.5 rounded-full',
  md: 'h-11 px-5 text-sm gap-2 rounded-full',
  lg: 'h-12 px-6 text-base gap-2 rounded-full',
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
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:brightness-100 disabled:active:translate-y-0 disabled:active:scale-100',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        variant === 'icon' && 'aspect-square !px-0',
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
