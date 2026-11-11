import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function StatTile({
  label,
  value,
  icon,
  tone = 'default',
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'green' | 'rose' | 'cyan';
  hint?: string;
}) {
  const toneClass = {
    default: 'text-slate-100',
    green: 'text-emerald-600',
    rose: 'text-rose-500',
    cyan: 'text-brand-600',
  }[tone];

  const iconClass = {
    default: 'bg-base-800 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-500',
    cyan: 'bg-brand-50 text-brand-600',
  }[tone];

  return (
    <div className="rounded-xl3 border border-base-700 bg-base-900 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconClass)}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn('mt-2 text-2xl font-extrabold tracking-tight', toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
