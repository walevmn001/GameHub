import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/10 bg-base-900/40 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/5 text-neon-cyan">
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
