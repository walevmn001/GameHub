import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'purple' | 'cyan' | 'green' | 'amber' | 'rose';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-base-800 text-slate-400 ring-base-600',
  purple: 'bg-pastel-blue text-sky-700 ring-sky-200',
  cyan: 'bg-brand-100 text-brand-700 ring-brand-200',
  green: 'bg-brand-50 text-brand-600 ring-brand-200',
  amber: 'bg-pastel-yellow text-amber-800 ring-amber-200',
  rose: 'bg-pastel-pink text-rose-700 ring-rose-200',
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
