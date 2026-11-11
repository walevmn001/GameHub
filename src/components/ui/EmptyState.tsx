import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { GameHubMascot } from '@/components/illustrations/GameHubMascot';

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
        'flex flex-col items-center justify-center gap-3 rounded-xl3 border border-dashed border-brand-200 bg-base-900/70 px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          {icon}
        </span>
      ) : (
        <GameHubMascot uid="empty" className="h-20 w-20 animate-bob" wink />
      )}
      <div>
        <p className="text-sm font-bold text-slate-200">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
