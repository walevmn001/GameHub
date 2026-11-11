import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: ReactNode;
}

/**
 * Nút CTA chính dạng pill: gradient xanh lá, cao 56px, chữ trắng đậm, shadow 3D.
 * Hover nâng lên 2px, khi nhấn lún xuống 2px; hiện spinner khi đang gửi dữ liệu.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(function PrimaryButton(
  { loading = false, icon, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'btn-shine inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full',
        'border border-brand-700/25 bg-gradient-to-b from-cute-greenLight via-cute-green to-brand-600',
        'text-base font-extrabold tracking-wide text-white',
        'shadow-[inset_0_2px_0_rgba(255,255,255,0.55),0_6px_0_-1px_rgba(33,140,43,0.5),0_16px_28px_-12px_rgba(33,140,43,0.5)]',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:brightness-[1.05]',
        'active:translate-y-0.5 active:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_2px_0_-1px_rgba(33,140,43,0.5)]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {children}
    </button>
  );
});
