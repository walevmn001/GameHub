import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

/** Khung nội dung nền trắng bo tròn dùng thống nhất toàn ứng dụng. */
export function Surface({ children, interactive = false, className, ...rest }: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl3 border border-base-700 bg-white shadow-card',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-600/25 bg-gradient-to-b from-brand-400 to-brand-500 text-brand-900 shadow-pop">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-100 sm:text-xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
