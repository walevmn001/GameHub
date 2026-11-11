import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'purple' | 'cyan' | 'green' | 'amber' | 'rose';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-base-800 text-slate-400 ring-base-600',
  purple: 'bg-brand-50 text-brand-700 ring-brand-200',
  cyan: 'bg-brand-100/70 text-brand-600 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  rose: 'bg-rose-50 text-rose-600 ring-rose-200',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

export function Badge({ children, tone = 'neutral', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
