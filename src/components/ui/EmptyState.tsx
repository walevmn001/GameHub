import type { ReactNode } from 'react';
import { Gamepad2 } from 'lucide-react';
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
        'flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-brand-200 bg-white/90 px-6 py-10 text-center shadow-soft',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft ring-1 ring-brand-200">
        {icon ?? <Gamepad2 className="h-6 w-6" />}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-200">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
