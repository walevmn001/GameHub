import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Checkbox tùy biến (ghi nhớ đăng nhập / đồng ý điều khoản) với ô vuông bo tròn
 * và dấu tích xanh lá khi được chọn.
 */
export function AuthCheckbox({
  id,
  checked,
  onChange,
  children,
  className,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-start gap-2.5 text-xs font-semibold text-slate-500', className)}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25',
          checked
            ? 'border-brand-600 bg-gradient-to-b from-cute-greenLight to-cute-green text-white'
            : 'border-cute-inputBorder bg-white',
        )}
      >
        <svg viewBox="0 0 16 16" className={cn('h-3.5 w-3.5 transition-opacity', checked ? 'opacity-100' : 'opacity-0')}>
          <path
            d="M3 8.5 L6.5 12 L13 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}
