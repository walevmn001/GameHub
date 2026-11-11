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
        'flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-brand-200 bg-white/90 px-6 py-10 text-center shadow-soft',
        className,
      )}
    >
      <GameHubMascot uid="empty" pose="wave" className={icon ? 'h-16 w-16' : 'h-20 w-20 animate-bob'} />
      {icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel-yellow text-amber-700 shadow-soft">
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-bold text-slate-200">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
