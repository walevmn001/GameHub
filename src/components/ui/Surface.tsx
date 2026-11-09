import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

/** Khung nội dung nền tối dùng thống nhất toàn ứng dụng. */
export function Surface({ children, interactive = false, className, ...rest }: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/5 bg-base-850/70 shadow-soft backdrop-blur-sm',
        interactive && 'transition-all duration-200 hover:border-white/10 hover:bg-base-800/80',
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
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100 sm:text-xl">
          {icon && <span className="text-neon-cyan">{icon}</span>}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
