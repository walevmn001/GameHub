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
    green: 'text-brand-600',
    rose: 'text-rose-500',
    cyan: 'text-brand-600',
  }[tone];

  const iconClass = {
    default: 'bg-pastel-blue text-sky-700',
    green: 'bg-brand-50 text-brand-600',
    rose: 'bg-pastel-pink text-rose-600',
    cyan: 'bg-pastel-yellow text-amber-700',
  }[tone];

  return (
    <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/70 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', iconClass)}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn('mt-2 text-2xl font-extrabold tracking-tight', toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
