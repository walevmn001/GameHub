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
    green: 'text-emerald-400',
    rose: 'text-rose-400',
    cyan: 'text-neon-cyan',
  }[tone];

  return (
    <div className="rounded-2xl border border-white/5 bg-base-900/60 p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <p className={cn('mt-1.5 text-xl font-bold', toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
