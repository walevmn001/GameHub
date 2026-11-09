import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'purple' | 'cyan' | 'green' | 'amber' | 'rose';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-white/5 text-slate-300 ring-white/10',
  purple: 'bg-neon-purple/15 text-neon-purple ring-neon-purple/30',
  cyan: 'bg-neon-cyan/15 text-neon-cyan ring-neon-cyan/30',
  green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
